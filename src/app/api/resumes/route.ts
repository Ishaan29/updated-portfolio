import { NextRequest, NextResponse } from 'next/server';
import {
    createServerSupabaseClient,
    isValidCompanyId,
    sanitizeCompanyId,
} from '@/lib/supabase';

const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10MB

// Short link ids: 10 chars of base62 ≈ 59 bits of randomness — unguessable,
// but tidier in an email than a 36-char UUID.
const ID_ALPHABET =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const ID_LENGTH = 10;

function generateShortId(): string {
    const out: string[] = [];
    while (out.length < ID_LENGTH) {
        const bytes = crypto.getRandomValues(new Uint8Array(ID_LENGTH * 2));
        for (const b of bytes) {
            if (out.length === ID_LENGTH) break;
            // Reject 248-255 so every alphabet char stays equally likely
            if (b < ID_ALPHABET.length * 4) out.push(ID_ALPHABET[b % ID_ALPHABET.length]);
        }
    }
    return out.join('');
}

function isAuthenticated(request: NextRequest): boolean {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const adminToken = process.env.ADMIN_ACCESS_TOKEN;

    if (!adminToken) {
        console.error('ADMIN_ACCESS_TOKEN not set in environment variables');
        return false;
    }

    return token === adminToken;
}

// GET /api/resumes — list all resume links with view stats
export async function GET(request: NextRequest) {
    if (!isAuthenticated(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const supabase = createServerSupabaseClient();

        const [{ data: resumes, error }, { data: views, error: viewsError }] =
            await Promise.all([
                supabase
                    .from('resumes')
                    .select('*')
                    .order('created_at', { ascending: false }),
                supabase
                    .from('resume_views')
                    .select('resume_id, viewed_at, device_type, city, region, country, referrer')
                    .order('viewed_at', { ascending: false }),
            ]);

        if (error || viewsError) {
            console.error('Failed to fetch resumes:', error || viewsError);
            return NextResponse.json(
                { error: 'Failed to fetch resumes' },
                { status: 500 }
            );
        }

        const DAY = 86_400_000;
        const now = Date.now();
        interface Stat {
            count: number;
            last: string;
            views7d: number;
            daily: number[]; // views per day, oldest → today, last 14 days
            recent: Array<Record<string, unknown>>;
        }
        const stats = new Map<string, Stat>();
        for (const v of views || []) {
            let s = stats.get(v.resume_id);
            if (!s) {
                s = { count: 0, last: v.viewed_at, views7d: 0, daily: new Array(14).fill(0), recent: [] };
                stats.set(v.resume_id, s);
            }
            s.count += 1;
            const age = now - new Date(v.viewed_at).getTime();
            if (age < 7 * DAY) s.views7d += 1;
            const dayIdx = 13 - Math.floor(age / DAY);
            if (dayIdx >= 0 && dayIdx <= 13) s.daily[dayIdx] += 1;
            // views arrive newest-first, so the first 25 are the most recent
            if (s.recent.length < 25) {
                s.recent.push({
                    viewed_at: v.viewed_at,
                    device_type: v.device_type,
                    city: v.city,
                    country: v.country,
                    referrer: v.referrer,
                });
            }
        }

        return NextResponse.json({
            resumes: (resumes || []).map((r) => {
                const s = stats.get(r.id);
                return {
                    ...r,
                    viewCount: s?.count ?? 0,
                    lastViewed: s?.last ?? null,
                    views7d: s?.views7d ?? 0,
                    dailySeries: s?.daily ?? new Array(14).fill(0),
                    recentViews: s?.recent ?? [],
                };
            }),
        });
    } catch (error) {
        console.error('Resumes API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/resumes — upload a PDF for a company+role, mint the link
export async function POST(request: NextRequest) {
    if (!isAuthenticated(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const company = sanitizeCompanyId(String(formData.get('company') ?? ''));
        const role = String(formData.get('role') ?? '').trim();

        if (!isValidCompanyId(company)) {
            return NextResponse.json(
                { error: 'Invalid company ID format' },
                { status: 400 }
            );
        }
        if (!(file instanceof File) || file.size === 0) {
            return NextResponse.json(
                { error: 'Missing PDF file' },
                { status: 400 }
            );
        }
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            return NextResponse.json(
                { error: 'Only PDF files are accepted' },
                { status: 400 }
            );
        }
        if (file.size > MAX_PDF_BYTES) {
            return NextResponse.json(
                { error: 'File too large (max 10MB)' },
                { status: 400 }
            );
        }

        const supabase = createServerSupabaseClient();

        // The row id is minted here so the storage path and public URL share it
        const id = generateShortId();
        const storagePath = `${company}/${id}.pdf`;

        const { error: uploadError } = await supabase.storage
            .from('resumes')
            .upload(storagePath, file, {
                contentType: 'application/pdf',
                upsert: false,
            });

        if (uploadError) {
            console.error('Resume upload error:', uploadError);
            return NextResponse.json(
                { error: 'Failed to upload file' },
                { status: 500 }
            );
        }

        const { data: resume, error: insertError } = await supabase
            .from('resumes')
            .insert({
                id,
                company_id: company,
                role: role || null,
                storage_path: storagePath,
                filename: file.name,
            })
            .select()
            .single();

        if (insertError) {
            console.error('Resume insert error:', insertError);
            // Don't leave an orphaned file behind
            await supabase.storage.from('resumes').remove([storagePath]);
            return NextResponse.json(
                { error: 'Failed to create resume link' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { resume, url: `/resume/${id}` },
            { status: 201 }
        );
    } catch (error) {
        console.error('Resumes API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
