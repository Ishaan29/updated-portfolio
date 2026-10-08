import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getSessionStats } from '@/lib/sessionStats';

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const adminToken = process.env.ADMIN_ACCESS_TOKEN;

    if (!adminToken || token !== adminToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '300', 10);
    const channel = searchParams.get('channel');
    const engaged = searchParams.get('engaged');
    const search = searchParams.get('search');

    const supabase = createServerSupabaseClient();
    
    let query = supabase.from('visits').select('*, visit_events(*)').order('visited_at', { ascending: false }).limit(limit * 3); 

    if (channel) query = query.eq('channel', channel);

    const { data: visits, error } = await query;

    if (error) {
        console.error('Sessions API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    let sessions = (visits || []).map(v => {
        v.sessionStats = getSessionStats(v.visit_events);
        return v;
    });

    if (engaged === 'true') {
        sessions = sessions.filter(s => s.sessionStats.isEngaged);
    }
    
    if (search) {
        const s = search.toLowerCase();
        sessions = sessions.filter(v => v.company_id?.toLowerCase().includes(s) || v.city?.toLowerCase().includes(s) || v.country?.toLowerCase().includes(s));
    }

    return NextResponse.json({ success: true, data: sessions.slice(0, limit) });
}
