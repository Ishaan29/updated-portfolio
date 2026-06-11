import { useState, useEffect } from 'react';
import { Panel } from './primitives/Panel';
import { ChannelChip } from './primitives/ChannelChip';

export function SessionsTab({ accessToken }: { accessToken: string }) {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await fetch(`/api/visits/sessions?limit=100`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                if (res.ok) {
                    const result = await res.json();
                    setSessions(result.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, [accessToken]);

    const filters = ['ENGAGED ONLY', 'ALL', 'COLDAPP', 'COLDOUTREACH', 'HMOUTREACH', 'ORGANIC'];

    return (
        <div className="flex flex-col gap-4 animate-in fade-in duration-500 h-full">
            <Panel 
                title={
                    <div className="flex w-full justify-between items-center">
                        <span>SESSION STREAM</span>
                        <div className="flex items-center gap-4">
                            <span className="text-slate lowercase hidden sm:inline">300 most recent</span>
                            <div className="flex gap-2 text-[10px] tracking-widest uppercase">
                                {filters.map(f => (
                                    <span 
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-1 cursor-pointer transition-colors ${filter === f ? 'text-amber border-b border-amber' : 'text-slate hover:text-white'}`}
                                    >
                                        {f}
                                    </span>
                                ))}
                                <span className="text-slate px-1">filter...</span>
                            </div>
                        </div>
                    </div>
                }
                className="flex-1"
            >
                {loading ? (
                    <div className="p-8 text-center text-amber animate-pulse font-mono text-xs tracking-widest uppercase mt-20">Querying Sessions...</div>
                ) : (
                    <div className="w-full overflow-x-auto mt-2">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-grid-line-soft">
                                    <th className="py-2 px-3 text-[10px] font-normal text-slate uppercase tracking-widest">When</th>
                                    <th className="py-2 px-3 text-[10px] font-normal text-slate uppercase tracking-widest">Company</th>
                                    <th className="py-2 px-3 text-[10px] font-normal text-slate uppercase tracking-widest">Channel</th>
                                    <th className="py-2 px-3 text-[10px] font-normal text-slate uppercase tracking-widest">Location</th>
                                    <th className="py-2 px-3 text-[10px] font-normal text-slate uppercase tracking-widest">Device</th>
                                    <th className="py-2 px-3 text-[10px] font-normal text-slate uppercase tracking-widest">Referrer</th>
                                    <th className="py-2 px-3 text-[10px] font-normal text-slate uppercase tracking-widest text-right">Dur</th>
                                    <th className="py-2 px-3 text-[10px] font-normal text-slate uppercase tracking-widest text-right">Scroll</th>
                                    <th className="py-2 px-3 text-[10px] font-normal text-slate uppercase tracking-widest text-center">Events</th>
                                    <th className="py-2 px-3 text-[10px] font-normal text-slate uppercase tracking-widest text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-grid-line-soft">
                                {sessions.map((s, i) => (
                                    <tr key={s.id} className={`hover:bg-row-hover transition-colors ${i === 3 ? 'border-l-2 border-l-amber bg-amber/5' : ''}`}>
                                        <td className="py-2.5 px-3 text-slate text-[11px] font-mono whitespace-nowrap">
                                            {(() => {
                                                const d = new Date(s.visited_at);
                                                return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}, ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
                                            })()}
                                        </td>
                                        <td className="py-2.5 px-3 font-bold text-white capitalize">{s.company_id || '- anonymous -'}</td>
                                        <td className="py-2.5 px-3">
                                            <ChannelChip channel={s.channel} />
                                        </td>
                                        <td className="py-2.5 px-3 text-slate text-[11px]">
                                            {s.city ? `${s.city}, ${s.country}` : 'Unknown'}
                                        </td>
                                        <td className="py-2.5 px-3 text-slate text-[11px]">
                                            {s.device_type}
                                        </td>
                                        <td className="py-2.5 px-3 text-slate text-[11px]">
                                            Direct
                                        </td>
                                        <td className="py-2.5 px-3 text-right text-slate text-[11px] font-mono">
                                            {s.sessionStats?.duration > 60 ? `${Math.floor(s.sessionStats?.duration / 60)}m ${s.sessionStats?.duration % 60}s` : `${s.sessionStats?.duration || 0}s`}
                                        </td>
                                        <td className="py-2.5 px-3 text-right text-slate text-[11px] font-mono">
                                            {s.sessionStats?.maxScroll || 0}%
                                        </td>
                                        <td className="py-2.5 px-3 text-center">
                                            {s.visit_events?.some((e:any) => e.event_name === 'github_click') && <span className="bg-info-blue text-white text-[9px] px-1 ml-1 rounded-[1px] font-bold">GH</span>}
                                            {s.visit_events?.some((e:any) => e.event_name === 'linkedin_click') && <span className="bg-info-blue text-white text-[9px] px-1 ml-1 rounded-[1px] font-bold">LI</span>}
                                            {s.visit_events?.some((e:any) => e.event_name === 'resume_download') && <span className="bg-signal text-white text-[9px] px-1 ml-1 rounded-[1px] font-bold">DL</span>}
                                            {(!s.visit_events || s.visit_events.length === 0) && <span className="text-slate opacity-50">—</span>}
                                        </td>
                                        <td className="py-2.5 px-3 text-right">
                                            {s.sessionStats?.isEngaged ? (
                                                <span className="text-[9px] uppercase tracking-wider text-signal border border-signal/30 bg-signal/10 px-1.5 py-0.5 rounded-[2px] inline-flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-signal" /> ENGAGED</span>
                                            ) : (
                                                <span className="text-[9px] uppercase tracking-wider text-info-blue border border-info-blue/30 bg-info-blue/10 px-1.5 py-0.5 rounded-[2px] inline-flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-info-blue" /> CLICKED</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {sessions.length === 0 && (
                                    <tr>
                                        <td colSpan={10} className="py-8 text-center text-slate text-xs uppercase tracking-widest">
                                            No sessions found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Panel>
        </div>
    );
}
