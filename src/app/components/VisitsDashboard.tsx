'use client';

import { useState, useEffect } from 'react';
import { Visit, VisitAnalytics } from '@/lib/supabase';
import { ChevronDown, ChevronRight, Activity, Clock, MousePointerClick } from 'lucide-react';

interface VisitsData {
    visits: Visit[];
    analytics: VisitAnalytics[];
    summary: {
        totalVisits: number;
        uniqueCompanies: number;
        recentVisits: Visit[];
    };
}

const calculateScore = (visit: Visit) => {
    let score = 10; // Base score for visiting
    if (!visit.visit_events || visit.visit_events.length === 0) return score;

    visit.visit_events.forEach(event => {
        if (event.event_type === 'click') {
            if (event.event_name === 'resume_download') score += 50;
            else if (['github', 'linkedin'].includes(event.event_name)) score += 20;
            else if (event.event_name === 'email') score += 20;
            else score += 10; // general link clicking (e.g., projects)
        } else if (event.event_type === 'scroll') {
            score += 5; // Section view
        } else if (event.event_type === 'unload' || event.event_type === 'visibility') {
            const duration = event.metadata?.duration_seconds || 0;
            if (duration >= 120) score += 20;
            else if (duration >= 30) score += 10;
            else if (duration >= 10) score += 5;
        }
    });

    return score;
};

const getEventIcon = (type: string) => {
    switch (type) {
        case 'click': return <MousePointerClick size={14} className="text-green" />;
        case 'unload':
        case 'visibility': return <Clock size={14} className="text-blue-400" />;
        case 'scroll': return <Activity size={14} className="text-purple-400" />;
        default: return <div className="w-1.5 h-1.5 rounded-full bg-slate" />;
    }
};

const VisitRow = ({ visit, score }: { visit: Visit, score: number }) => {
    const [expanded, setExpanded] = useState(false);
    const events = visit.visit_events || [];

    // Sort events chronically
    const sortedEvents = [...events].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return (
        <>
            <tr className="border-b border-slate/5 hover:bg-navy/50 transition-colors cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                        {events.length > 0 ? (
                            expanded ? <ChevronDown size={16} className="text-slate" /> : <ChevronRight size={16} className="text-slate" />
                        ) : (
                            <div className="w-4" /> // spacer
                        )}
                        <span className="text-white font-medium">{visit.company_id}</span>
                    </div>
                </td>
                <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green/10 text-green border border-green/20">
                        {score}
                    </span>
                </td>
                <td className="py-3 px-4 text-slate text-sm">
                    {new Date(visit.visited_at).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-slate text-sm max-w-xs truncate" title={visit.user_agent || ''}>
                    {visit.user_agent || 'N/A'}
                </td>
            </tr>
            {expanded && events.length > 0 && (
                <tr className="bg-navy-light/50">
                    <td colSpan={4} className="px-10 py-4 border-b border-slate/5">
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate mb-3">Interaction Timeline</div>
                        <div className="space-y-3 relative before:absolute before:inset-0 before:ml-[7px] before:w-0.5 before:-translate-x-px before:bg-slate/10">
                            {sortedEvents.map(event => (
                                <div key={event.id} className="relative flex items-start gap-4 text-sm">
                                    <div className="relative z-10 bg-navy-light p-1 rounded-full border border-slate/20 mt-0.5">
                                        {getEventIcon(event.event_type)}
                                    </div>
                                    <div className="flex-1 pb-1">
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-medium text-light-slate">{event.event_name.replace('_', ' ')}</span>
                                            <span className="text-xs text-slate/60">
                                                {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        </div>
                                        {event.metadata && Object.keys(event.metadata).length > 0 && (
                                            <div className="mt-1 text-slate/70 text-xs font-mono bg-navy px-2 py-1 rounded inline-block">
                                                {JSON.stringify(event.metadata)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

export default function VisitsDashboard({ accessToken }: { accessToken: string }) {
    const [data, setData] = useState<VisitsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState({
        company: '',
        startDate: '',
        endDate: '',
    });

    const fetchVisits = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filter.company) params.append('company', filter.company);
            if (filter.startDate) params.append('startDate', filter.startDate);
            if (filter.endDate) params.append('endDate', filter.endDate);

            const response = await fetch(`/api/visits?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch visits');
            }

            const result = await response.json();
            setData(result.data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVisits();
        const interval = setInterval(fetchVisits, 30000);
        return () => clearInterval(interval);
    }, [filter]);

    const exportToCSV = () => {
        if (!data?.visits) return;

        const headers = ['Company', 'Visited At', 'User Agent', 'Referrer', 'IP Address', 'Interest Score', 'Events Count'];
        const rows = data.visits.map(v => [
            v.company_id,
            new Date(v.visited_at).toLocaleString(),
            `"${(v.user_agent || '').replace(/"/g, '""')}"`,
            `"${(v.referrer || '').replace(/"/g, '""')}"`,
            v.ip_address || 'N/A',
            calculateScore(v),
            v.visit_events?.length || 0
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `visits-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green"></div>
                    <p className="mt-4 text-slate">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
                <p className="text-red-500">Error: {error}</p>
            </div>
        );
    }

    // Sort visits by score
    const scoredVisits = data?.visits
        .map(v => ({ visit: v, score: calculateScore(v) }))
        .sort((a, b) => b.score - a.score) || [];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-navy-light border border-slate/10 rounded-lg p-6">
                    <h3 className="text-sm font-medium text-slate mb-2">Total Visits</h3>
                    <p className="text-3xl font-bold text-white">{data?.summary.totalVisits || 0}</p>
                </div>
                <div className="bg-navy-light border border-slate/10 rounded-lg p-6">
                    <h3 className="text-sm font-medium text-slate mb-2">Unique Companies</h3>
                    <p className="text-3xl font-bold text-white">{data?.summary.uniqueCompanies || 0}</p>
                </div>
                <div className="bg-navy-light border border-slate/10 rounded-lg p-6">
                    <h3 className="text-sm font-medium text-slate mb-2">Avg Interest Score</h3>
                    <p className="text-3xl font-bold text-green">
                        {scoredVisits.length > 0
                            ? Math.round(scoredVisits.reduce((acc, curr) => acc + curr.score, 0) / scoredVisits.length)
                            : 0}
                    </p>
                </div>
            </div>

            <div className="bg-navy-light border border-slate/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Company name..."
                        value={filter.company}
                        onChange={(e) => setFilter({ ...filter, company: e.target.value })}
                        className="bg-navy border border-slate/20 rounded-lg px-4 py-2 text-white placeholder:text-slate/50 focus:outline-none focus:border-green"
                    />
                    <input
                        type="date"
                        value={filter.startDate}
                        onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                        className="bg-navy border border-slate/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green"
                    />
                    <input
                        type="date"
                        value={filter.endDate}
                        onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                        className="bg-navy border border-slate/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green"
                    />
                    <button
                        onClick={exportToCSV}
                        className="bg-green text-navy font-medium rounded-lg px-4 py-2 hover:bg-green/90 transition-colors"
                    >
                        Export CSV
                    </button>
                </div>
            </div>

            {data?.analytics && data.analytics.length > 0 && (
                <div className="bg-navy-light border border-slate/10 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Company Analytics</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate/10">
                                    <th className="py-3 px-4 text-sm font-medium text-slate">Company</th>
                                    <th className="py-3 px-4 text-sm font-medium text-slate">Total Visits</th>
                                    <th className="py-3 px-4 text-sm font-medium text-slate">First Visit</th>
                                    <th className="py-3 px-4 text-sm font-medium text-slate">Last Visit</th>
                                    <th className="py-3 px-4 text-sm font-medium text-slate">Unique Days</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.analytics.map((item) => (
                                    <tr key={item.company_id} className="border-b border-slate/5 hover:bg-navy/50">
                                        <td className="py-3 px-4 text-white font-medium">{item.company_id}</td>
                                        <td className="py-3 px-4 text-green">{item.total_visits}</td>
                                        <td className="py-3 px-4 text-slate text-sm">
                                            {new Date(item.first_visit).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4 text-slate text-sm">
                                            {new Date(item.last_visit).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4 text-slate text-sm">{item.unique_days}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="bg-navy-light border border-slate/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Detailed Visit Logs</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate/10">
                                <th className="py-3 px-4 text-sm font-medium text-slate">Company</th>
                                <th className="py-3 px-4 text-sm font-medium text-slate">Interest Score</th>
                                <th className="py-3 px-4 text-sm font-medium text-slate">Visit Time</th>
                                <th className="py-3 px-4 text-sm font-medium text-slate">Device / Browser</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scoredVisits.length > 0 ? (
                                scoredVisits.map(({ visit, score }) => (
                                    <VisitRow key={visit.id} visit={visit} score={score} />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-slate">
                                        No visits found matching criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
