import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isValidTargetUrl } from '@/lib/supabase';

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

// PATCH /api/projects/[slug] — toggle active, or edit the target/title
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    if (!isAuthenticated(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { slug } = await params;
        const body = await request.json();
        const update: Record<string, unknown> = {};

        if (typeof body.active === 'boolean') update.active = body.active;
        if (typeof body.title === 'string') update.title = body.title.trim() || null;
        if (typeof body.targetUrl === 'string') {
            if (!isValidTargetUrl(body.targetUrl.trim())) {
                return NextResponse.json(
                    { error: 'Target must be a valid http(s) URL' },
                    { status: 400 }
                );
            }
            update.target_url = body.targetUrl.trim();
        }

        if (Object.keys(update).length === 0) {
            return NextResponse.json(
                { error: 'Nothing to update' },
                { status: 400 }
            );
        }

        const supabase = createServerSupabaseClient();
        const { data: project, error } = await supabase
            .from('project_links')
            .update(update)
            .eq('slug', slug)
            .select()
            .single();

        if (error || !project) {
            return NextResponse.json(
                { error: 'Project link not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ project });
    } catch (error) {
        console.error('Project PATCH error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/projects/[slug] — remove the link and its click history
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    if (!isAuthenticated(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { slug } = await params;
        const supabase = createServerSupabaseClient();

        const { error } = await supabase
            .from('project_links')
            .delete()
            .eq('slug', slug);

        if (error) {
            console.error('Project delete error:', error);
            return NextResponse.json(
                { error: 'Failed to delete project link' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Project DELETE error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
