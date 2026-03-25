'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Activity, Clock, MousePointerClick, Copy, Plus, ExternalLink, ArrowRight, User } from 'lucide-react';
import DailyVisitsChart from './DailyVisitsChart';

// Types
interface SessionStats {
    duration: number;
    maxScroll: number;
    sections: string[];
    isEngaged: boolean;
}

interface Visit {
    id: string;
    company_id: string;
    channel: string;
    visited_at: string;
    device_type: string | null;
    city: string | null;
    region: string | null;
    country: string | null;
    sessionStats?: SessionStats;
    visit_events?: any[];
}

interface CompanyLead {
    companyId: string;
    channel: string;
    heatScore: number;
    heatTier: 'Hot' | 'Warm' | 'Cool' | 'New';
    lastVisit: string;
    totalVisits: number;
    engagedVisits: number;
    visits: Visit[];
}

interface OutreachLog {
    id: string;
    company_id: string;
    channel: string;
    action_type: string;
    contact_name: string | null;
    notes: string | null;
    action_date: string;
}

interface DashboardData {
    companies: CompanyLead[];
    outreachLogs: OutreachLog[];
    summary: { totalVisits: number; uniqueCompanies: number };
}

// Subcomponents

const HeatBadge = ({ score, tier }: { score: number, tier: string }) => {
    let color = 'bg-slate/10 text-slate border-slate/20';
    if (tier === 'Hot') color = 'bg-red-500/10 text-red-500 border-red-500/20';
    else if (tier === 'Warm') color = 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    else if (tier === 'New') color = 'bg-green/10 text-green border-green/20';

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${color}`}>
            {tier !== 'New' ? score : 'NEW'}
        </span>
    );
};

export default function VisitsDashboard({ accessToken }: { accessToken: string }) {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // UI State
    const [activeTab, setActiveTab] = useState<'Leads' | 'Channels'>('Leads');
    const [selectedCompany, setSelectedCompany] = useState<CompanyLead | null>(null);
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);
    const [isLoggingOutreach, setIsLoggingOutreach] = useState(false);

    // Form State for Trackable Link
    const [linkCompany, setLinkCompany] = useState('');
    const [linkChannel, setLinkChannel] = useState('linkedin');
    const [generatedUrl, setGeneratedUrl] = useState('');
    const [statusText, setStatusText] = useState('');

    // Form State for Outreach Log
    const [outreachForm, setOutreachForm] = useState({ companyId: '', channel: 'linkedin', actionType: 'initial_message', contactName: '', notes: '', actionDate: new Date().toISOString().split('T')[0] });

    const fetchDashboard = async () => {
        try {
            const res = await fetch('/api/visits', { headers: { Authorization: `Bearer ${accessToken}` } });
            if (!res.ok) throw new Error('Refresh failed');
            const result = await res.json();
            setData(result.data);
            
            // Update selected company if it was open
            if (selectedCompany) {
                const updated = result.data.companies.find((c: any) => c.companyId === selectedCompany.companyId);
                if (updated) setSelectedCompany(updated);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
        const interval = setInterval(fetchDashboard, 30000);
        return () => clearInterval(interval);
    }, [accessToken]); // Exclude selectedCompany from deps to avoid re-triggering, handled inside fetch

    const handleGenerateLink = () => {
        if (!linkCompany) return;
        const url = `https://eshaanbajpai.dev/c/${linkChannel}-${linkCompany.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-')}`;
        setGeneratedUrl(url);
        navigator.clipboard.writeText(url);
        setStatusText('Copied!');
        setTimeout(() => setStatusText(''), 2000);
    };

    const handleLogOutreach = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/outreach', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                body: JSON.stringify(outreachForm)
            });
            if (res.ok) {
                setIsLoggingOutreach(false);
                fetchDashboard();
            }
        } catch (err) {
            console.error('Failed to log outreach');
        }
    };

    if (loading && !data) return <div className="p-8 text-center text-green animate-pulse">Loading Intelligence Data...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

    const topChannel = data?.companies.reduce((acc, curr) => {
        acc[curr.channel] = (acc[curr.channel] || 0) + curr.engagedVisits;
        return acc;
    }, {} as Record<string, number>);
    const bestChannel = Object.entries(topChannel || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    
    const hottestLead = data?.companies[0];

    return (
        <div className="space-y-6">
            {/* Top Bar - Pulse Check */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-navy-light border border-slate/10 rounded-lg p-5">
                    <p className="text-xs text-slate uppercase tracking-wider mb-1">Total Tracked Visits</p>
                    <p className="text-2xl font-bold text-white">{data?.summary.totalVisits}</p>
                </div>
                <div className="bg-navy-light border border-slate/10 rounded-lg p-5">
                    <p className="text-xs text-slate uppercase tracking-wider mb-1">Unique Companies</p>
                    <p className="text-2xl font-bold text-white">{data?.summary.uniqueCompanies}</p>
                </div>
                <div className="bg-navy-light border-l-4 border-l-red-500 border-y border-r border-slate/10 rounded-lg p-5 flex flex-col justify-center">
                    <p className="text-xs text-slate uppercase tracking-wider mb-1">Hottest Lead</p>
                    <div className="flex items-center justify-between">
                        <p className="text-xl font-bold text-white capitalize">{hottestLead?.companyId || 'None'}</p>
                        {hottestLead && <HeatBadge score={hottestLead.heatScore} tier={hottestLead.heatTier} />}
                    </div>
                </div>
                <div className="bg-navy-light border border-slate/10 rounded-lg p-5">
                    <p className="text-xs text-slate uppercase tracking-wider mb-1">Top Channel (Engaged)</p>
                    <p className="text-2xl font-bold text-green capitalize">{bestChannel}</p>
                </div>
            </div>

            <DailyVisitsChart visits={data?.companies.flatMap(c => c.visits) || []} />

            {/* Admin Action Buttons */}
            <div className="flex gap-4 mb-4">
                <button onClick={() => setIsGeneratingLink(!isGeneratingLink)} className="bg-green/10 text-green border border-green/20 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green/20 flex items-center gap-2">
                    <Copy size={16} /> Generate Trackable Link
                </button>
                <button onClick={() => setIsLoggingOutreach(!isLoggingOutreach)} className="bg-slate/10 text-light-slate border border-slate/20 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate/20 flex items-center gap-2">
                    <Plus size={16} /> Log Outreach Action
                </button>
            </div>

            {/* Collapsible Action Panels */}
            {isGeneratingLink && (
                <div className="bg-navy-light border border-slate/20 rounded-lg p-6 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                        <label className="text-xs text-slate mb-1 block">Target Company</label>
                        <input type="text" value={linkCompany} onChange={e => setLinkCompany(e.target.value)} placeholder="e.g. Google" className="w-full bg-navy border border-slate/30 rounded p-2 text-white" />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs text-slate mb-1 block">Source Channel</label>
                        <select value={linkChannel} onChange={e => setLinkChannel(e.target.value)} className="w-full bg-navy border border-slate/30 rounded p-2 text-white">
                            <option value="linkedin">LinkedIn</option>
                            <option value="apollo">Apollo Cold Email</option>
                            <option value="app">Job Application</option>
                            <option value="gh-cold">GitHub Cold DM</option>
                            <option value="referral">Referral</option>
                        </select>
                    </div>
                    <button onClick={handleGenerateLink} className="bg-green text-navy px-6 py-2 rounded font-medium hover:bg-green/90 mb-px">Generate & Copy</button>
                    {statusText && <span className="text-green text-sm pb-2">{statusText}</span>}
                </div>
            )}

            {isLoggingOutreach && (
                <form onSubmit={handleLogOutreach} className="bg-navy-light border border-slate/20 rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="col-span-1">
                        <label className="text-xs text-slate mb-1 block">Company ID</label>
                        <input type="text" value={outreachForm.companyId} onChange={e => setOutreachForm({...outreachForm, companyId: e.target.value})} required className="w-full bg-navy border border-slate/30 rounded p-2 text-white" />
                    </div>
                    <div className="col-span-1">
                        <label className="text-xs text-slate mb-1 block">Channel</label>
                        <select value={outreachForm.channel} onChange={e => setOutreachForm({...outreachForm, channel: e.target.value})} className="w-full bg-navy border border-slate/30 rounded p-2 text-white">
                            <option value="linkedin">LinkedIn</option>
                            <option value="apollo">Apollo</option>
                            <option value="app">Application</option>
                        </select>
                    </div>
                    <div className="col-span-1">
                        <label className="text-xs text-slate mb-1 block">Action Type</label>
                        <input type="text" value={outreachForm.actionType} onChange={e => setOutreachForm({...outreachForm, actionType: e.target.value})} placeholder="e.g. Initial Message" required className="w-full bg-navy border border-slate/30 rounded p-2 text-white" />
                    </div>
                    <div className="col-span-1 md:col-span-3">
                        <label className="text-xs text-slate mb-1 block">Notes (Optional)</label>
                        <input type="text" value={outreachForm.notes} onChange={e => setOutreachForm({...outreachForm, notes: e.target.value})} className="w-full bg-navy border border-slate/30 rounded p-2 text-white" />
                    </div>
                    <div className="col-span-1 md:col-span-3 flex justify-end">
                        <button type="submit" className="bg-green text-navy px-6 py-2 rounded font-medium hover:bg-green/90">Save Log</button>
                    </div>
                </form>
            )}

            {/* Main Content Area */}
            {!selectedCompany ? (
                <div className="bg-navy-light border border-slate/10 rounded-lg overflow-hidden">
                    <div className="flex border-b border-slate/10 px-4">
                        <button onClick={() => setActiveTab('Leads')} className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'Leads' ? 'border-green text-green' : 'border-transparent text-slate hover:text-light-slate'}`}>
                            Lead Prioritization List
                        </button>
                        <button onClick={() => setActiveTab('Channels')} className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'Channels' ? 'border-green text-green' : 'border-transparent text-slate hover:text-light-slate'}`}>
                            Channel Performance
                        </button>
                    </div>

                    {activeTab === 'Leads' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-navy/50">
                                    <tr>
                                        <th className="py-3 px-4 text-xs font-semibold text-slate uppercase tracking-wider">Company</th>
                                        <th className="py-3 px-4 text-xs font-semibold text-slate uppercase tracking-wider">Heat Score</th>
                                        <th className="py-3 px-4 text-xs font-semibold text-slate uppercase tracking-wider">Last Seen</th>
                                        <th className="py-3 px-4 text-xs font-semibold text-slate uppercase tracking-wider">Primary Channel</th>
                                        <th className="py-3 px-4 text-xs font-semibold text-slate uppercase tracking-wider">Engaged Visits</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate/5">
                                    {data?.companies.map(c => (
                                        <tr key={c.companyId} onClick={() => setSelectedCompany(c)} className="hover:bg-slate/5 cursor-pointer transition">
                                            <td className="py-3 px-4 font-medium text-white capitalize">{c.companyId}</td>
                                            <td className="py-3 px-4"><HeatBadge score={c.heatScore} tier={c.heatTier} /></td>
                                            <td className="py-3 px-4 text-sm text-slate">{new Date(c.lastVisit).toLocaleDateString()}</td>
                                            <td className="py-3 px-4 text-sm text-slate capitalize">{c.channel.replace('-', ' ')}</td>
                                            <td className="py-3 px-4 text-sm text-green">{c.engagedVisits} / {c.totalVisits}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'Channels' && (
                        <div className="p-6">
                            <p className="text-slate mb-6">Aggregate performance by acquisition channel.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {Object.entries(topChannel || {}).map(([channel, engagedCount]) => {
                                    const totalForChannel = data?.companies.reduce((acc, c) => c.channel === channel ? acc + c.totalVisits : acc, 0) || 0;
                                    return (
                                        <div key={channel} className="bg-navy border border-slate/10 p-5 rounded-lg border-t-4 border-t-green">
                                            <h3 className="text-white font-bold capitalize mb-2">{channel.replace('-', ' ')}</h3>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate">Total Visits:</span>
                                                <span className="text-light-slate">{totalForChannel}</span>
                                            </div>
                                            <div className="flex justify-between text-sm mt-1">
                                                <span className="text-slate">Engaged Visits:</span>
                                                <span className="text-green font-medium">{engagedCount}</span>
                                            </div>
                                            <div className="mt-4 w-full bg-slate/10 rounded-full h-1.5">
                                                <div className="bg-green h-1.5 rounded-full" style={{ width: `${Math.min((engagedCount / Math.max(totalForChannel, 1)) * 100, 100)}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-navy-light border border-slate/10 rounded-lg overflow-hidden flex flex-col">
                    {/* Deep Dive Header */}
                    <div className="bg-navy px-6 py-4 flex justify-between items-center border-b border-slate/10">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSelectedCompany(null)} className="text-slate hover:text-white pb-1 border-b border-transparent hover:border-white transition-all text-sm">
                                ← Back to Leads
                            </button>
                            <h2 className="text-2xl font-bold text-white capitalize">{selectedCompany.companyId}</h2>
                            <HeatBadge score={selectedCompany.heatScore} tier={selectedCompany.heatTier} />
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate uppercase tracking-widest">Acquired Via</p>
                            <p className="text-sm font-medium text-green capitalize">{selectedCompany.channel.replace('-', ' ')}</p>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left split: Summary & Sessions */}
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Activity size={18} /> Sessions ({selectedCompany.totalVisits})</h3>
                            <div className="space-y-4">
                                {selectedCompany.visits.map(v => (
                                    <div key={v.id} className={`p-4 rounded-lg border ${v.sessionStats?.isEngaged ? 'bg-green/5 border-green/20' : 'bg-navy border-slate/10'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="text-sm font-medium text-light-slate">{new Date(v.visited_at).toLocaleString()}</div>
                                            {v.sessionStats?.isEngaged && <span className="text-xs bg-green/20 text-green px-2 py-0.5 rounded">Engaged</span>}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs text-slate mb-3">
                                            <div><span className="opacity-70">Duration:</span> {v.sessionStats?.duration || 0}s</div>
                                            <div><span className="opacity-70">Scroll Depth:</span> {v.sessionStats?.maxScroll || 0}%</div>
                                            {v.city && <div className="col-span-2"><span className="opacity-70">Location:</span> {v.city}, {v.region}</div>}
                                        </div>
                                        {/* Show CTA clicks directly inside session card if any exist */}
                                        {v.visit_events?.filter((e: any) => e.event_type === 'engagement' && e.event_name === 'cta_click').map((e: any) => (
                                            <div key={e.id} className="text-xs text-green mt-1 flex items-center gap-1">
                                                <MousePointerClick size={12}/> Clicked: {e.metadata?.action || 'Link'}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right split: Outreach Timeline */}
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><User size={18} /> Outreach Timeline</h3>
                            <div className="relative border-l-2 border-slate/10 ml-3 pl-6 space-y-6">
                                {/* Intertwine Outreach and Visits based on date */}
                                {(() => {
                                    const eventsList: any[] = [];
                                    
                                    // Add Visits
                                    selectedCompany.visits.forEach(v => {
                                        eventsList.push({ type: 'visit', date: new Date(v.visited_at).getTime(), label: 'Site Visit', obj: v });
                                    });

                                    // Add Outreach Logs for this company
                                    data?.outreachLogs.filter(log => log.company_id === selectedCompany.companyId).forEach(log => {
                                        eventsList.push({ type: 'outreach', date: new Date(log.action_date).getTime(), label: `Outreach: ${log.action_type}`, obj: log });
                                    });

                                    eventsList.sort((a, b) => b.date - a.date); // descending

                                    if (eventsList.length === 0) return <p className="text-sm text-slate">No timeline events.</p>;

                                    return eventsList.map((ev, i) => (
                                        <div key={i} className="relative">
                                            {/* node dot */}
                                            <div className={`absolute -left-[29px] w-3 h-3 rounded-full border-2 border-navy ${ev.type === 'visit' ? 'bg-green' : 'bg-blue-400'}`}></div>
                                            <div className="text-xs text-slate mb-1">{new Date(ev.date).toLocaleString()}</div>
                                            <div className={`p-3 rounded-lg border ${ev.type === 'visit' ? 'bg-navy/50 border-green/10 text-light-slate' : 'bg-blue-900/10 border-blue-500/20 text-blue-100'}`}>
                                                <p className="font-semibold text-sm">{ev.label}</p>
                                                {ev.type === 'outreach' && ev.obj.notes && <p className="text-xs text-slate mt-1 italic">"{ev.obj.notes}"</p>}
                                                {ev.type === 'visit' && ev.obj.sessionStats?.isEngaged && <p className="text-xs text-green mt-1 flex items-center gap-1"><ArrowRight size={12}/> Yielded an Engaged Session</p>}
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
