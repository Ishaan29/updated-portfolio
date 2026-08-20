import { NextRequest, NextResponse } from 'next/server';
import {
    createServerSupabaseClient,
    isValidProjectSlug,
    sanitizeCompanyId,
} from '@/lib/supabase';

// /project/<slug> → the project's real home (GitHub, a live demo, anywhere).
// The redirect is issued server-side so it is instant and works for crawlers
// and link previews that never run JavaScript. Anything unknown, disabled, or
// malformed falls back to the home page rather than a dead end.
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug: rawSlug } = await params;
    const home = new URL('/', request.url);

    let slug = rawSlug;
    try {
        slug = decodeURIComponent(slug);
    } catch {
        // Malformed percent-encoding in a hand-typed URL; use as-is
    }

    if (!isValidProjectSlug(slug)) {
        return NextResponse.redirect(home);
    }

    try {
        const supabase = createServerSupabaseClient();

        // ILIKE with no wildcards is case-insensitive equality, so /project/vectordb
        // and /project/vectorDB both resolve. isValidProjectSlug has already
        // excluded '_' and '%', so the slug cannot smuggle a pattern in.
        const { data: link } = await supabase
            .from('project_links')
            .select('slug, target_url, active')
            .ilike('slug', slug)
            .eq('active', true)
            .maybeSingle();

        if (!link) {
            return NextResponse.redirect(home);
        }

        // Optional ?c=<company> attribution, for links dropped into a
        // company-specific resume or outreach message
        const rawCompany = request.nextUrl.searchParams.get('c');
        const companyId = rawCompany ? sanitizeCompanyId(rawCompany) : null;

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

        const { error } = await supabase.from('project_clicks').insert({
            slug: link.slug,
            company_id: companyId || null,
            user_agent: userAgent,
            referrer: request.headers.get('referer') || 'direct',
            ip_address:
                request.headers.get('x-forwarded-for')?.split(',')[0] ||
                request.headers.get('x-real-ip') ||
                'unknown',
            device_type: deviceType,
            city: request.headers.get('x-vercel-ip-city') || null,
            region: request.headers.get('x-vercel-ip-country-region') || null,
            country: request.headers.get('x-vercel-ip-country') || null,
        });

        if (error) {
            // A failed log should never block the visitor
            console.error('Failed to log project click:', error);
        }

        return NextResponse.redirect(link.target_url);
    } catch (error) {
        console.error('Project link resolution error:', error);
        return NextResponse.redirect(home);
    }
}
