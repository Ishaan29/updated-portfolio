import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

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

// PATCH /api/resumes/[id] — toggle a link on/off (revoke / restore)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!isAuthenticated(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();

        if (typeof body.active !== 'boolean') {
            return NextResponse.json(
                { error: 'Expected { active: boolean }' },
                { status: 400 }
            );
        }

        const supabase = createServerSupabaseClient();
        const { data: resume, error } = await supabase
            .from('resumes')
            .update({ active: body.active })
            .eq('id', id)
            .select()
            .single();

        if (error || !resume) {
            return NextResponse.json(
                { error: 'Resume not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ resume });
    } catch (error) {
        console.error('Resume PATCH error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/resumes/[id] — remove the link, its views, and the stored PDF
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!isAuthenticated(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const supabase = createServerSupabaseClient();

        const { data: resume, error: fetchError } = await supabase
            .from('resumes')
            .select('storage_path')
            .eq('id', id)
            .single();

        if (fetchError || !resume) {
            return NextResponse.json(
                { error: 'Resume not found' },
                { status: 404 }
            );
        }

        const { error: storageError } = await supabase.storage
            .from('resumes')
            .remove([resume.storage_path]);
        if (storageError) {
            // The row delete still proceeds; an orphaned file is better than a live link
            console.error('Resume storage delete error:', storageError);
        }

        const { error: deleteError } = await supabase
            .from('resumes')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Resume delete error:', deleteError);
            return NextResponse.json(
                { error: 'Failed to delete resume' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Resume DELETE error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
