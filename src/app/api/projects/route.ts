import { NextRequest, NextResponse } from 'next/server';
import {
    createServerSupabaseClient,
    isValidProjectSlug,
    isValidTargetUrl,
} from '@/lib/supabase';

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

// GET /api/projects — list every project link with its click analytics
export async function GET(request: NextRequest) {
    if (!isAuthenticated(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const supabase = createServerSupabaseClient();

        const [{ data: links, error }, { data: clicks, error: clicksError }] =
            await Promise.all([
                supabase
                    .from('project_links')
                    .select('*')
                    .order('created_at', { ascending: false }),
                supabase
                    .from('project_clicks')
                    .select('slug, clicked_at, company_id, device_type, city, country, referrer')
                    .order('clicked_at', { ascending: false }),
            ]);

        if (error || clicksError) {
            console.error('Failed to fetch project links:', error || clicksError);
            return NextResponse.json(
                { error: 'Failed to fetch project links' },
                { status: 500 }
            );
        }

        const DAY = 86_400_000;
        const now = Date.now();
        interface Stat {
            count: number;
            last: string;
            clicks7d: number;
            daily: number[];
            companies: Set<string>;
            recent: Array<Record<string, unknown>>;
        }
        const stats = new Map<string, Stat>();

        for (const c of clicks || []) {
            let s = stats.get(c.slug);
            if (!s) {
                s = {
                    count: 0,
                    last: c.clicked_at,
                    clicks7d: 0,
                    daily: new Array(14).fill(0),
                    companies: new Set<string>(),
                    recent: [],
                };
                stats.set(c.slug, s);
            }
            s.count += 1;
            if (c.company_id) s.companies.add(c.company_id);
            const age = now - new Date(c.clicked_at).getTime();
            if (age < 7 * DAY) s.clicks7d += 1;
            const dayIdx = 13 - Math.floor(age / DAY);
            if (dayIdx >= 0 && dayIdx <= 13) s.daily[dayIdx] += 1;
            // clicks arrive newest-first, so the first 25 are the most recent
            if (s.recent.length < 25) {
                s.recent.push({
                    clicked_at: c.clicked_at,
                    company_id: c.company_id,
                    device_type: c.device_type,
                    city: c.city,
                    country: c.country,
                    referrer: c.referrer,
                });
            }
        }

        return NextResponse.json({
            projects: (links || []).map((l) => {
                const s = stats.get(l.slug);
                return {
                    ...l,
                    clickCount: s?.count ?? 0,
                    lastClicked: s?.last ?? null,
                    clicks7d: s?.clicks7d ?? 0,
                    dailySeries: s?.daily ?? new Array(14).fill(0),
                    companies: s ? Array.from(s.companies) : [],
                    recentClicks: s?.recent ?? [],
                };
            }),
        });
    } catch (error) {
        console.error('Projects API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/projects — create a short link
export async function POST(request: NextRequest) {
    if (!isAuthenticated(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const slug = String(body.slug ?? '').trim();
        const targetUrl = String(body.targetUrl ?? '').trim();
        const title = String(body.title ?? '').trim();

        if (!isValidProjectSlug(slug)) {
            return NextResponse.json(
                { error: 'Slug must be 2-39 chars: letters, numbers, hyphens' },
                { status: 400 }
            );
        }
        if (!isValidTargetUrl(targetUrl)) {
            return NextResponse.json(
                { error: 'Target must be a valid http(s) URL' },
                { status: 400 }
            );
        }

        const supabase = createServerSupabaseClient();
        const { data: project, error } = await supabase
            .from('project_links')
            .insert({
                slug,
                target_url: targetUrl,
                title: title || null,
            })
            .select()
            .single();

        if (error) {
            // 23505 = unique violation, i.e. the slug (or its lowercase form) exists
            if (error.code === '23505') {
                return NextResponse.json(
                    { error: `"${slug}" is already taken` },
                    { status: 409 }
                );
            }
            console.error('Project link insert error:', error);
            return NextResponse.json(
                { error: 'Failed to create project link' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { project, url: `/project/${project.slug}` },
            { status: 201 }
        );
    } catch (error) {
        console.error('Projects API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
