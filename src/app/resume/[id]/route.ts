import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// Short link ids as minted by /api/resumes: 10 chars of base62
const ID_REGEX = /^[A-Za-z0-9]{10}$/;

// Anything that isn't a live, active resume link falls back to the home page
// so a revoked or mistyped URL still lands somewhere useful.
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const home = new URL('/', request.url);

    if (!ID_REGEX.test(id)) {
        return NextResponse.redirect(home);
    }

    try {
        const supabase = createServerSupabaseClient();

        const { data: resume, error } = await supabase
            .from('resumes')
            .select('*')
            .eq('id', id)
            .eq('active', true)
            .single();

        if (error || !resume) {
            return NextResponse.redirect(home);
        }

        // Log the view first; a failed log should never block the resume itself
        const userAgent = request.headers.get('user-agent') || null;
        let deviceType = 'desktop';
        if (userAgent) {
            const ua = userAgent.toLowerCase();
            if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
                deviceType = 'tablet';
            } else if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
                deviceType = 'mobile';
            }
        }

        const ipAddress =
            request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') ||
            'unknown';

        const { error: viewError } = await supabase.from('resume_views').insert({
            resume_id: resume.id,
            company_id: resume.company_id,
            user_agent: userAgent,
            referrer: request.headers.get('referer') || 'direct',
            ip_address: ipAddress,
            device_type: deviceType,
            city: request.headers.get('x-vercel-ip-city') || null,
            region: request.headers.get('x-vercel-ip-country-region') || null,
            country: request.headers.get('x-vercel-ip-country') || null,
        });

        if (viewError) {
            console.error('Failed to log resume view:', viewError);
        }

        const { data: file, error: storageError } = await supabase.storage
            .from('resumes')
            .download(resume.storage_path);

        if (storageError || !file) {
            console.error('Resume storage download error:', storageError);
            return NextResponse.redirect(home);
        }

        return new NextResponse(file, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline; filename="Eshaan_Bajpai_Resume.pdf"',
                // no-store keeps every open hitting this route, so views are never
                // hidden from tracking by a browser or CDN cache
                'Cache-Control': 'private, no-store',
                'X-Robots-Tag': 'noindex, nofollow',
            },
        });
    } catch (error) {
        console.error('Resume route error:', error);
        return NextResponse.redirect(home);
    }
}
