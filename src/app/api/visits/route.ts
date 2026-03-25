import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// Simple authentication middleware
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

// Helper to calculate heat score out of 100
function calculateHeatScore(visits: any[]) {
    if (!visits.length) return { score: 0, tier: 'New', engagedVisits: 0 };

    const now = Date.now();
    let recencyScore = 0;
    
    // Sort visits by date descending
    visits.sort((a, b) => new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime());
    
    // Recency (35%)
    const lastVisitDate = new Date(visits[0].visited_at).getTime();
    const hoursSinceLast = (now - lastVisitDate) / (1000 * 60 * 60);
    if (hoursSinceLast <= 24) recencyScore = 35;
    else if (hoursSinceLast <= 336) { // 14 days decay
        recencyScore = 35 * (1 - (hoursSinceLast / 336));
    }

    // Frequency (25%)
    const uniqueDays = new Set(visits.map(v => v.visited_at.split('T')[0])).size;
    const frequencyScore = Math.min((uniqueDays / 3) * 25, 25); // cap at 3 unique days

    // Engagement (25%) & Depth (15%)
    let maxDepthScore = 0;
    let maxEngagementScore = 0;
    let engagedCount = 0;

    for (const v of visits) {
        let isEngaged = false;
        let sessionDuration = 0;
        let maxScroll = 0;
        const viewedSections = new Set<string>();

        for (const e of (v.visit_events || [])) {
            // Calculate time metrics
            if (e.event_type === 'unload' || e.event_type === 'visibility') {
                const duration = e.metadata?.duration_seconds || 0;
                sessionDuration = Math.max(sessionDuration, duration);
            }
            if (e.event_type === 'engagement' && e.event_name === 'heartbeat') {
                // Approximate total duration by counting heartbeats x 30s
                sessionDuration += e.metadata?.interval || 30; // Every heartbeat adds ~30s
            }
            
            // Calculate scroll and depth
            if (e.event_type === 'engagement' && e.event_name === 'scroll_depth') {
                maxScroll = Math.max(maxScroll, e.metadata?.depth || 0);
            }
            if (e.event_type === 'scroll' && e.event_name) {
                viewedSections.add(e.event_name);
            }
            
            // Major boost for CTA clicks
            if (e.event_type === 'engagement' && e.event_name === 'cta_click') {
                maxEngagementScore = 25;
            }
        }

        // Check if Engaged Visit (>30s AND >25% scroll)
        if (sessionDuration > 30 && maxScroll >= 25) {
            isEngaged = true;
            engagedCount++;
        }

        const currentEngagement = isEngaged ? 25 : Math.min((sessionDuration / 30) * 12.5 + (maxScroll / 100) * 12.5, 25);
        maxEngagementScore = Math.max(maxEngagementScore, currentEngagement);

        const currentDepth = Math.min((viewedSections.size / 4) * 15, 15);
        maxDepthScore = Math.max(maxDepthScore, currentDepth);
        
        // Attach processed session stats to the visit object for frontend
        v.sessionStats = { 
            duration: sessionDuration, 
            maxScroll, 
            sections: Array.from(viewedSections), 
            isEngaged 
        };
    }

    const totalScore = Math.round(recencyScore + frequencyScore + maxEngagementScore + maxDepthScore);
    
    let tier = 'Cool';
    if (totalScore >= 75) tier = 'Hot';
    else if (totalScore >= 40) tier = 'Warm';

    if (visits.length === 1 && hoursSinceLast < 24) tier = 'New'; // newly discovered lead

    return { score: Math.max(0, Math.min(totalScore, 100)), tier, engagedVisits: engagedCount };
}

export async function GET(request: NextRequest) {
    try {
        // Check authentication
        if (!isAuthenticated(request)) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get query parameters for filtering
        const { searchParams } = new URL(request.url);
        const companyIdFilter = searchParams.get('company');

        // Create Supabase client
        const supabase = createServerSupabaseClient();

        // Build query to fetch all visits and events
        let query = supabase
            .from('visits')
            .select('*, visit_events(*)')
            .order('visited_at', { ascending: false });

        if (companyIdFilter) {
            query = query.eq('company_id', companyIdFilter);
        }

        const { data: visitsData, error: visitsError } = await query;

        if (visitsError) {
            console.error('Supabase query error:', visitsError);
            return NextResponse.json(
                { error: 'Failed to fetch visits' },
                { status: 500 }
            );
        }

        // Aggregate by company
        const companyMap = new Map<string, any>();
        
        for (const visit of (visitsData || [])) {
            if (!companyMap.has(visit.company_id)) {
                companyMap.set(visit.company_id, {
                    companyId: visit.company_id,
                    visits: [],
                    channel: visit.channel || 'organic' // Default channel of most recent visit
                });
            }
            companyMap.get(visit.company_id).visits.push(visit);
        }

        // Calculate scores per company
        const companies = Array.from(companyMap.values()).map(c => {
            const { score, tier, engagedVisits } = calculateHeatScore(c.visits);
            return {
                companyId: c.companyId,
                channel: c.channel,
                heatScore: score,
                heatTier: tier,
                lastVisit: c.visits[0].visited_at,
                totalVisits: c.visits.length,
                engagedVisits,
                visits: c.visits
            };
        });

        // Filter out zero-score unless new
        const activeCompanies = companies.filter(c => c.heatScore > 0 || c.heatTier === 'New');

        // Sort by heat score descending
        activeCompanies.sort((a, b) => b.heatScore - a.heatScore);
        
        // Fetch outreach logs
        let outreachQuery = supabase.from('outreach_logs').select('*').order('action_date', { ascending: false });
        if (companyIdFilter) outreachQuery = outreachQuery.eq('company_id', companyIdFilter);
        const { data: outreachLogs } = await outreachQuery;

        // Collect global summary metrics
        const totalVisits = visitsData?.length || 0;
        const uniqueCompanies = activeCompanies.length;
        
        return NextResponse.json({
            success: true,
            data: {
                companies: activeCompanies,
                outreachLogs: outreachLogs || [],
                summary: {
                    totalVisits,
                    uniqueCompanies,
                },
            },
        });
    } catch (error) {
        console.error('Visits API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
