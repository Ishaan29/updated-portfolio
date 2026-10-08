import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getSessionStats } from '@/lib/sessionStats';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const adminToken = process.env.ADMIN_ACCESS_TOKEN;

    if (!adminToken || token !== adminToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const companyId = resolvedParams.id;
    const supabase = createServerSupabaseClient();

    const visitsPromise = supabase.from('visits').select('*, visit_events(*)').eq('company_id', companyId).order('visited_at', { ascending: false });
    const outreachPromise = supabase.from('outreach_logs').select('*').eq('company_id', companyId).order('action_date', { ascending: false });
    
    // We need visit IDs for the next queries
    const { data: visitsIdData } = await supabase.from('visits').select('id').eq('company_id', companyId);
    const visitIds = (visitsIdData || []).map(v => v.id);

    let clickPathPromise = Promise.resolve({ data: [] as any[], error: null });
    let dwellPromise = Promise.resolve({ data: [] as any[], error: null });

    if (visitIds.length > 0) {
        clickPathPromise = supabase.from('click_path').select('*').in('visit_id', visitIds).order('at', { ascending: true }) as unknown as Promise<any>;
        dwellPromise = supabase.from('section_dwell').select('*').in('visit_id', visitIds) as unknown as Promise<any>;
    }

    const [visitsRes, outreachRes, clickPathRes, dwellRes] = await Promise.all([
        visitsPromise,
        outreachPromise,
        clickPathPromise,
        dwellPromise
    ]);

    if (visitsRes.error) {
        console.error('Leads API Error:', visitsRes.error);
        return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 });
    }

    const visits = (visitsRes.data || []).map(v => {
        v.sessionStats = getSessionStats(v.visit_events);
        return v;
    });

    const dwellMap = new Map<string, number>();
    for (const d of (dwellRes.data || [])) {
        dwellMap.set(d.section, (dwellMap.get(d.section) || 0) + d.seconds);
    }
    const sectionDwell = Array.from(dwellMap.entries()).map(([name, seconds]) => ({ name, seconds })).sort((a, b) => b.seconds - a.seconds);

    return NextResponse.json({
        success: true,
        data: {
            companyId,
            visits,
            outreachLogs: outreachRes.data || [],
            clickPath: clickPathRes.data || [],
            sectionDwell
        }
    });
}
