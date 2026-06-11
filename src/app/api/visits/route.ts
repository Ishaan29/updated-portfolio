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
            
            // Compute 30-day trend from actual daily visit counts
            const now = new Date();
            const trend: number[] = [];
            for (let d = 29; d >= 0; d--) {
                const day = new Date(now);
                day.setDate(day.getDate() - d);
                const dayStr = day.toISOString().split('T')[0];
                const count = c.visits.filter((v: any) => v.visited_at.startsWith(dayStr)).length;
                trend.push(count);
            }

            return {
                companyId: c.companyId,
                channel: c.channel,
                heatScore: score,
                heatTier: tier,
                role: '',     // populated after outreach logs are fetched
                tier: '',     // populated after outreach logs are fetched
                stage: '',    // populated after outreach logs are fetched
                trend,
                lastVisit: c.visits[0].visited_at,
                lastOutreach: null as string | null,
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
        
        let resumeDLs = 0;
        let githubClicks = 0;
        let linkedinClicks = 0;
        
        const funnel = {
            outreach: 0, clicked: 0, engaged: 0, replied: 0, screen: 0, onsite: 0, offer: 0
        };

        const byChannel: Record<string, { sent: number; clicks: number; engaged: number; replied: number }> = {
            apollo: { sent: 0, clicks: 0, engaged: 0, replied: 0 },
            linkedin: { sent: 0, clicks: 0, engaged: 0, replied: 0 },
            app: { sent: 0, clicks: 0, engaged: 0, replied: 0 },
            'gh-cold': { sent: 0, clicks: 0, engaged: 0, replied: 0 },
            referral: { sent: 0, clicks: 0, engaged: 0, replied: 0 },
            organic: { sent: 0, clicks: 0, engaged: 0, replied: 0 },
        };
        
        const byDevice = { desktop: 0, mobile: 0, tablet: 0 };
        const heatmap = Array.from({ length: 7 }, () => Array(24).fill(0));
        const dailySeriesMap = new Map<string, { date: string; visits: number; engaged: number; pageViews: number; bounces: number }>();
        const alerts: Array<{ kind: 'hot'|'warm'|'info'; when: string; msg: string; leadId?: string }> = [];
        const referrerMap = new Map<string, number>();
        const companyByChannelMap = new Map<string, Map<string, { visits: number; heatScore: number }>>();
        
        const outreachByCompany = new Map<string, any[]>();
        for (const log of (outreachLogs || [])) {
            if (!outreachByCompany.has(log.company_id)) outreachByCompany.set(log.company_id, []);
            outreachByCompany.get(log.company_id)!.push(log);
        }

        // Populate lastOutreach, stage, and channel metadata for companies
        for (const c of activeCompanies) {
            const logs = outreachByCompany.get(c.companyId);
            if (logs && logs.length > 0) {
                logs.sort((a, b) => new Date(b.action_date).getTime() - new Date(a.action_date).getTime());
                c.lastOutreach = logs[0].action_date;
                
                // Derive stage from outreach logs
                const actionTypes = logs.map((l: any) => (l.action_type || '').toLowerCase());
                const stages = logs.map((l: any) => (l.stage || '').toLowerCase()).filter(Boolean);
                
                if (stages.includes('offer')) c.stage = 'OFFER';
                else if (stages.includes('onsite')) c.stage = 'ONSITE';
                else if (stages.includes('screen')) c.stage = 'SCREEN';
                else if (stages.includes('replied') || actionTypes.includes('replied')) c.stage = 'REPLIED';
                else if (stages.includes('rejected') || actionTypes.includes('rejected')) c.stage = 'REJECTED';
                else if (c.engagedVisits > 0) c.stage = 'ENGAGED';
                else if (c.totalVisits > 0) c.stage = 'CLICKED';
                else c.stage = 'SENT';
                
                // Use outreach channel as primary channel
                c.channel = logs[0].channel || c.channel;
            } else {
                // No outreach logs — derive stage from visit behavior
                if (c.engagedVisits > 0) c.stage = 'ENGAGED';
                else if (c.totalVisits > 0) c.stage = 'CLICKED';
                else c.stage = 'NEW';
            }
        }

        let ghostedCount = 0;

        // Process Companies for Alerts, Device, Heatmap, DailySeries, and Event Clicks
        for (const company of companies) { // Process all companies to ensure complete metrics
            // Device Donut
            for (const visit of company.visits) {
                if (visit.device_type === 'mobile' || visit.device_type === 'Mobile') byDevice.mobile++;
                else if (visit.device_type === 'tablet' || visit.device_type === 'Tablet') byDevice.tablet++;
                else byDevice.desktop++; // default to desktop
                
                // Referrer aggregation
                const rawRef = visit.referrer || '';
                let refLabel = 'Direct';
                if (rawRef.includes('mail.google')) refLabel = 'Gmail (Web)';
                else if (rawRef.includes('gmail') || rawRef.includes('mail.apple')) refLabel = 'Gmail (Apple Mail)';
                else if (rawRef.includes('outlook') || rawRef.includes('office')) refLabel = 'Outlook';
                else if (rawRef.includes('linkedin')) refLabel = 'LinkedIn';
                else if (rawRef.includes('twitter') || rawRef.includes('x.com')) refLabel = 'Twitter / X';
                else if (rawRef.includes('slack')) refLabel = 'Slack';
                else if (rawRef.includes('github')) refLabel = 'GitHub';
                else if (rawRef && rawRef !== '') refLabel = rawRef.split('/')[2] || rawRef;
                referrerMap.set(refLabel, (referrerMap.get(refLabel) || 0) + 1);
                
                // Heatmap
                const date = new Date(visit.visited_at);
                const day = date.getUTCDay();
                const hour = date.getUTCHours();
                heatmap[day][hour]++;
                
                // Daily series
                const dateStr = date.toISOString().split('T')[0];
                if (!dailySeriesMap.has(dateStr)) dailySeriesMap.set(dateStr, { date: dateStr, visits: 0, engaged: 0, pageViews: 0, bounces: 0 });
                const daily = dailySeriesMap.get(dateStr)!;
                daily.visits++;
                if (visit.sessionStats?.isEngaged) daily.engaged++;
                // pageViews count from visit_events?
                const pageViewEvents = visit.visit_events?.filter((e: any) => e.event_type === 'pageview') || [];
                daily.pageViews += Math.max(pageViewEvents.length, 1);
                if (visit.sessionStats?.duration < 10 && visit.sessionStats?.maxScroll < 10) daily.bounces++;
                
                // events (downloads, github, linkedin)
                for (const e of visit.visit_events || []) {
                    if (e.event_name === 'resume_download') resumeDLs++;
                    if (e.event_name === 'github_click') githubClicks++;
                    if (e.event_name === 'linkedin_click') linkedinClicks++;
                }
            }
            
            // Track companies by channel for top-company-per-channel
            const chan = company.channel || 'organic';
            if (!companyByChannelMap.has(chan)) companyByChannelMap.set(chan, new Map());
            const chanMap = companyByChannelMap.get(chan)!;
            chanMap.set(company.companyId, { visits: company.totalVisits, heatScore: company.heatScore });
            
            // Alerts
            if (company.heatScore >= 80) {
                alerts.push({ kind: 'hot', when: 'recently', msg: `Heat score ${company.heatScore} — ${company.companyId} visited ${company.totalVisits}x`, leadId: company.companyId });
            }
            
            // Warm alert if >= 3 visits in last 48h
            const recentVisits = company.visits.filter((v: any) => (Date.now() - new Date(v.visited_at).getTime()) / (1000 * 3600) <= 48);
            if (recentVisits.length >= 3) {
                 alerts.push({ kind: 'warm', when: 'last 48h', msg: `${company.companyId} — ${recentVisits.length} visits in the last 48h`, leadId: company.companyId });
            }
            
            // Warm alert if resume download in last 7d
            const recentResume = company.visits.some((v: any) => 
                (Date.now() - new Date(v.visited_at).getTime()) / (1000 * 3600 * 24) <= 7 &&
                v.visit_events?.some((e: any) => e.event_name === 'resume_download')
            );
            if (recentResume) {
                alerts.push({ kind: 'warm', when: 'last 7d', msg: `${company.companyId} downloaded resume`, leadId: company.companyId });
            }
        }

        // Funnel & Channel Metrics
        for (const [companyId, logs] of Array.from(outreachByCompany.entries())) {
            funnel.outreach++;
            logs.sort((a, b) => new Date(a.action_date).getTime() - new Date(b.action_date).getTime());
            const firstLog = logs[0];
            const chan = firstLog.channel || 'organic';
            if (!byChannel[chan]) byChannel[chan] = { sent: 0, clicks: 0, engaged: 0, replied: 0 };
            byChannel[chan].sent++;
            
            const companyData = companies.find(c => c.companyId === companyId);
            const hasVisits = companyData && companyData.visits.length > 0;
            const hasEngaged = companyData && companyData.engagedVisits > 0;
            
            if (hasVisits) {
                funnel.clicked++;
                byChannel[chan].clicks++;
            }
            if (hasEngaged) {
                funnel.engaged++;
                byChannel[chan].engaged++;
            }
            
            const stages = logs.map(l => l.stage).filter(Boolean);
            const isReplied = stages.some(s => ['replied', 'screen', 'onsite', 'offer', 'rejected'].includes(s));
            const isScreen = stages.some(s => ['screen', 'onsite', 'offer', 'rejected'].includes(s));
            const isOnsite = stages.some(s => ['onsite', 'offer', 'rejected'].includes(s));
            const isOffer = stages.some(s => s === 'offer');
            
            if (isReplied) {
                funnel.replied++;
                byChannel[chan].replied++;
            }
            if (isScreen) funnel.screen++;
            if (isOnsite) funnel.onsite++;
            if (isOffer) funnel.offer++;
            
            if (!hasVisits) {
                 const daysSince = (Date.now() - new Date(firstLog.action_date).getTime()) / (1000 * 3600 * 24);
                 if (daysSince > 10) {
                     ghostedCount++;
                 }
            }
        }
        
        // Count visit activity for companies with no outreach log so visits from
        // arbitrary /c/{channel}-{company} links still surface in channel analytics
        for (const c of companies) {
            if (outreachByCompany.has(c.companyId)) continue;
            const chan = c.channel || 'organic';
            if (!byChannel[chan]) byChannel[chan] = { sent: 0, clicks: 0, engaged: 0, replied: 0 };
            if (c.totalVisits > 0) byChannel[chan].clicks++;
            if (c.engagedVisits > 0) byChannel[chan].engaged++;
        }

        if (ghostedCount > 0) {
            alerts.push({ kind: 'info', when: 'now', msg: `Ghost watchlist: ${ghostedCount} companies with no click after 10+ days — consider re-pinging` });
        }

        const clickRate = funnel.outreach > 0 ? funnel.clicked / funnel.outreach : 0;
        const engageRate = funnel.clicked > 0 ? funnel.engaged / funnel.clicked : 0;
        const replyRate = funnel.engaged > 0 ? funnel.replied / funnel.engaged : 0;
        
        // Fetch Section Dwell
        const { data: sectionDwellData } = await supabase.from('section_dwell').select('*');
        const sectionDwellMap = new Map<string, { totalSeconds: number; count: number }>();
        for (const row of (sectionDwellData || [])) {
            if (!sectionDwellMap.has(row.section)) sectionDwellMap.set(row.section, { totalSeconds: 0, count: 0 });
            const s = sectionDwellMap.get(row.section)!;
            s.totalSeconds += row.seconds;
            s.count++;
        }
        const sectionDwell = Array.from(sectionDwellMap.entries()).map(([name, stats]) => ({
            name,
            avg: Math.round(stats.totalSeconds / stats.count),
            visits: stats.count
        })).sort((a, b) => b.avg - a.avg);

        const dailySeries = Array.from(dailySeriesMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        // Build referrer list sorted by count
        const referrers = Array.from(referrerMap.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
        
        // Build top companies per channel
        const topCompaniesByChannel: Record<string, Array<{ companyId: string; visits: number; heatScore: number }>> = {};
        for (const [chan, map] of Array.from(companyByChannelMap.entries())) {
            topCompaniesByChannel[chan] = Array.from(map.entries())
                .map(([companyId, stats]) => ({ companyId, ...stats }))
                .sort((a, b) => b.heatScore - a.heatScore)
                .slice(0, 5);
        }

        return NextResponse.json({
            success: true,
            data: {
                companies: activeCompanies,
                outreachLogs: outreachLogs || [],
                summary: {
                    totalVisits,
                    uniqueCompanies,
                    clickRate,
                    engageRate,
                    replyRate,
                    resumeDLs,
                    githubClicks,
                    linkedinClicks
                },
                funnel,
                byChannel,
                byDevice,
                heatmap,
                sectionDwell,
                dailySeries,
                alerts,
                referrers,
                topCompaniesByChannel
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
