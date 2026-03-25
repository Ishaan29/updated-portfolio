import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

function isAuthenticated(request: NextRequest): boolean {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const adminToken = process.env.ADMIN_ACCESS_TOKEN;
    return Boolean(adminToken && token === adminToken);
}

export async function POST(request: NextRequest) {
    try {
        if (!isAuthenticated(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { companyId, channel, actionType, contactName, notes, actionDate } = body;

        if (!companyId || !channel || !actionType || !actionDate) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const supabase = createServerSupabaseClient();

        const { data, error } = await supabase
            .from('outreach_logs')
            .insert({
                company_id: companyId,
                channel,
                action_type: actionType,
                contact_name: contactName || null,
                notes: notes || null,
                action_date: actionDate,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error [outreach_logs]:', error);
            return NextResponse.json({ error: 'Failed to log outreach' }, { status: 500 });
        }

        return NextResponse.json({ success: true, log: data }, { status: 201 });
    } catch (error) {
        console.error('Outreach API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
