'use client';

import { useState, useEffect } from 'react';
import { Visit, VisitAnalytics } from '@/lib/supabase';

interface VisitsData {
    visits: Visit[];
    analytics: VisitAnalytics[];
    summary: {
        totalVisits: number;
        uniqueCompanies: number;
        recentVisits: Visit[];
    };
}

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
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchVisits, 30000);
        return () => clearInterval(interval);
    }, [filter]);

    const exportToCSV = () => {
        if (!data?.visits) return;

        const headers = ['Company', 'Visited At', 'User Agent', 'Referrer', 'IP Address'];
        const rows = data.visits.map(v => [
            v.company_id,
            new Date(v.visited_at).toLocaleString(),
            v.user_agent || 'N/A',
            v.referrer || 'N/A',
            v.ip_address || 'N/A',
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

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
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
                    <h3 className="text-sm font-medium text-slate mb-2">Recent Visits</h3>
                    <p className="text-3xl font-bold text-white">{data?.summary.recentVisits.length || 0}</p>
                </div>
            </div>

            {/* Filters */}
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

            {/* Company Analytics Table */}
            {data?.analytics && data.analytics.length > 0 && (
                <div className="bg-navy-light border border-slate/10 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Company Analytics</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate/10">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate">Company</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate">Total Visits</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate">First Visit</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate">Last Visit</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate">Unique Days</th>
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
                                        <td className="py-3 px-4 text-slate">{item.unique_days}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Recent Visits Table */}
            <div className="bg-navy-light border border-slate/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Visits</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate/10">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate">Company</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate">Timestamp</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate">User Agent</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate">Referrer</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.visits.slice(0, 20).map((visit) => (
                                <tr key={visit.id} className="border-b border-slate/5 hover:bg-navy/50">
                                    <td className="py-3 px-4 text-white font-medium">{visit.company_id}</td>
                                    <td className="py-3 px-4 text-slate text-sm">
                                        {new Date(visit.visited_at).toLocaleString()}
                                    </td>
                                    <td className="py-3 px-4 text-slate text-sm max-w-xs truncate">
                                        {visit.user_agent || 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 text-slate text-sm max-w-xs truncate">
                                        {visit.referrer || 'Direct'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
