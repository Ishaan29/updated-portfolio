import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

function getSessionStats(visit: any) {
    let isEngaged = false;
    let sessionDuration = 0;
    let maxScroll = 0;
    const viewedSections = new Set<string>();

    for (const e of (visit.visit_events || [])) {
        if (e.event_type === 'unload' || e.event_type === 'visibility') {
            const duration = e.metadata?.duration_seconds || 0;
            sessionDuration = Math.max(sessionDuration, duration);
        }
        if (e.event_type === 'engagement' && e.event_name === 'heartbeat') {
            sessionDuration += e.metadata?.interval || 30;
        }
        if (e.event_type === 'engagement' && e.event_name === 'scroll_depth') {
            maxScroll = Math.max(maxScroll, e.metadata?.depth || 0);
        }
        if (e.event_type === 'scroll' && e.event_name) {
            viewedSections.add(e.event_name);
        }
    }

    if (sessionDuration > 30 && maxScroll >= 25) {
        isEngaged = true;
    }

    return { 
        duration: sessionDuration, 
        maxScroll, 
        sections: Array.from(viewedSections), 
        isEngaged 
    };
}

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
        v.sessionStats = getSessionStats(v);
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
