'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Panel } from './primitives/Panel';
import { Sparkline } from './primitives/Sparkline';

interface ResumeView {
    viewed_at: string;
    device_type: string | null;
    city: string | null;
    country: string | null;
    referrer: string | null;
}

interface ResumeRow {
    id: string;
    company_id: string;
    role: string | null;
    filename: string | null;
    active: boolean;
    created_at: string;
    viewCount: number;
    lastViewed: string | null;
    views7d: number;
    dailySeries: number[];
    recentViews: ResumeView[];
}

function fmtWhen(iso: string) {
    const d = new Date(iso);
    return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}, ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
}

function fmtDay(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const th = 'py-2 px-3 text-[10px] font-normal text-slate uppercase tracking-widest';

export function ResumesTab({ accessToken }: { accessToken: string }) {
    const [resumes, setResumes] = useState<ResumeRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [createdUrl, setCreatedUrl] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    const fetchResumes = useCallback(async () => {
        try {
            const res = await fetch('/api/resumes', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (res.ok) {
                const data = await res.json();
                setResumes(data.resumes ?? []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        fetchResumes();
    }, [fetchResumes]);

    const upload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || uploading) return;
        setUploading(true);
        setError('');
        setCreatedUrl('');
        try {
            const form = new FormData();
            form.append('company', company);
            form.append('role', role);
            form.append('file', file);
            const res = await fetch('/api/resumes', {
                method: 'POST',
                headers: { Authorization: `Bearer ${accessToken}` },
                body: form,
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Upload failed');
                return;
            }
            setCreatedUrl(`${origin}${data.url}`);
            setCompany('');
            setRole('');
            setFile(null);
            if (fileRef.current) fileRef.current.value = '';
            fetchResumes();
        } catch {
            setError('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const copyLink = (id: string, url: string) => {
        navigator.clipboard.writeText(url).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 1500);
        });
    };

    const toggleActive = async (r: ResumeRow) => {
        const res = await fetch(`/api/resumes/${r.id}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ active: !r.active }),
        });
        if (res.ok) fetchResumes();
    };

    const remove = async (r: ResumeRow) => {
        if (!window.confirm(`Delete the ${r.company_id} resume link? The URL and its view history are removed permanently.`)) return;
        const res = await fetch(`/api/resumes/${r.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) fetchResumes();
    };

    const totalViews = resumes.reduce((s, r) => s + r.viewCount, 0);
    const views7d = resumes.reduce((s, r) => s + r.views7d, 0);
    const activeCount = resumes.filter((r) => r.active).length;

    return (
        <div className="flex flex-col gap-4 animate-in fade-in duration-500">
            <div className="kpis">
                <div className="kpi">
                    <div className="label">Resume links</div>
                    <div className="value">{resumes.length}</div>
                    <div className="sub">{activeCount} active · {resumes.length - activeCount} revoked</div>
                </div>
                <div className="kpi">
                    <div className="label">Total views</div>
                    <div className="value">{totalViews}</div>
                    <div className="sub">all links, all time</div>
                </div>
                <div className={`kpi${views7d > 0 ? ' hot' : ''}`}>
                    <div className="label">Views · 7d</div>
                    <div className="value">{views7d}</div>
                    <div className="sub">opens this week</div>
                </div>
                <div className="kpi">
                    <div className="label">Last open</div>
                    <div className="value" style={{ fontSize: 18 }}>
                        {fmtDay(resumes.map((r) => r.lastViewed).filter(Boolean).sort().pop() ?? null)}
                    </div>
                    <div className="sub">most recent across links</div>
                </div>
            </div>

            <Panel title="MINT A RESUME LINK" meta="per company · per role">
                <form onSubmit={upload}>
                    <div className="field-set">
                        <div>
                            <label>Company</label>
                            <input
                                type="text"
                                placeholder="e.g. stripe, anthropic"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label>Role</label>
                            <input
                                type="text"
                                placeholder="e.g. SWE, New Grad"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            />
                        </div>
                        <div>
                            <label>Resume PDF</label>
                            <input
                                ref={fileRef}
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                                required
                            />
                        </div>
                        <button type="submit" className="mint" disabled={uploading || !file || !company.trim()}>
                            {uploading ? 'Uploading…' : '↑ Upload & mint'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div style={{ color: 'var(--danger)', fontFamily: 'var(--mono)', fontSize: 12, marginTop: 10 }}>
                        ERR: {error}
                    </div>
                )}

                {createdUrl && (
                    <div className="preview-url" style={{ marginTop: 12 }}>
                        <span style={{ color: 'var(--fg-dim)' }}>↗</span>
                        <span>{createdUrl}</span>
                        <button
                            className={`copy${copiedId === 'new' ? ' done' : ''}`}
                            onClick={() => copyLink('new', createdUrl)}
                        >
                            {copiedId === 'new' ? '✓ Copied' : 'Copy'}
                        </button>
                    </div>
                )}
            </Panel>

            <Panel
                title="LINKS"
                meta={`${resumes.length} minted · click a row for its view log`}
                flush
                className="flex-1"
            >
                {loading ? (
                    <div className="p-8 text-center text-amber animate-pulse font-mono text-xs tracking-widest uppercase">
                        Querying resume links...
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-grid-line-soft">
                                    <th className={th}>Status</th>
                                    <th className={th}>Company</th>
                                    <th className={th}>Role</th>
                                    <th className={th}>Link</th>
                                    <th className={`${th} text-right`}>Views</th>
                                    <th className={th}>14d trend</th>
                                    <th className={th}>Last viewed</th>
                                    <th className={th}>Created</th>
                                    <th className={`${th} text-right`}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-grid-line-soft">
                                {resumes.map((r) => {
                                    const url = `${origin}/resume/${r.id}`;
                                    const isOpen = expanded === r.id;
                                    return [
                                        <tr
                                            key={r.id}
                                            className={`hover:bg-row-hover transition-colors cursor-pointer ${isOpen ? 'bg-row-hover' : ''} ${!r.active ? 'opacity-50' : ''}`}
                                            onClick={() => setExpanded(isOpen ? null : r.id)}
                                        >
                                            <td className="py-2.5 px-3">
                                                {r.active ? (
                                                    <span className="text-[9px] uppercase tracking-wider text-signal border border-signal/30 bg-signal/10 px-1.5 py-0.5 rounded-[2px] inline-flex items-center gap-1">
                                                        <span className="w-1 h-1 rounded-full bg-signal" /> ACTIVE
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] uppercase tracking-wider text-slate border border-grid-line-soft px-1.5 py-0.5 rounded-[2px]">
                                                        REVOKED
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-3 font-bold text-white capitalize">{r.company_id}</td>
                                            <td className="py-2.5 px-3 text-slate text-[11px]">{r.role || '—'}</td>
                                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate whitespace-nowrap">
                                                /resume/{r.id}
                                                <button
                                                    className={`copy ml-2${copiedId === r.id ? ' done' : ''}`}
                                                    style={{
                                                        background: copiedId === r.id ? 'var(--signal)' : 'transparent',
                                                        color: copiedId === r.id ? 'oklch(0.16 0.02 160)' : 'var(--accent)',
                                                        border: '1px solid var(--border)',
                                                        padding: '2px 7px',
                                                        borderRadius: 3,
                                                        fontSize: 10,
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        copyLink(r.id, url);
                                                    }}
                                                >
                                                    {copiedId === r.id ? '✓' : 'Copy'}
                                                </button>
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-mono text-[12px] text-white">
                                                {r.viewCount}
                                                {r.views7d > 0 && <span className="text-signal text-[10px]"> +{r.views7d}</span>}
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <Sparkline data={r.dailySeries} />
                                            </td>
                                            <td className="py-2.5 px-3 text-slate text-[11px] whitespace-nowrap">{fmtDay(r.lastViewed)}</td>
                                            <td className="py-2.5 px-3 text-slate text-[11px] whitespace-nowrap">{fmtDay(r.created_at)}</td>
                                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                                <button
                                                    className="text-[10px] uppercase tracking-wider text-slate border border-grid-line-soft hover:text-white px-1.5 py-0.5 rounded-[2px] mr-1.5 cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleActive(r);
                                                    }}
                                                    title={r.active ? 'Revoke — URL redirects home' : 'Restore the link'}
                                                >
                                                    {r.active ? 'Revoke' : 'Restore'}
                                                </button>
                                                <button
                                                    className="text-[10px] uppercase tracking-wider border border-grid-line-soft px-1.5 py-0.5 rounded-[2px] cursor-pointer"
                                                    style={{ color: 'var(--danger)' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        remove(r);
                                                    }}
                                                    title="Delete the link, its view history, and the stored PDF"
                                                >
                                                    ✕
                                                </button>
                                            </td>
                                        </tr>,
                                        isOpen && (
                                            <tr key={`${r.id}-detail`}>
                                                <td colSpan={9} className="px-3 pb-3 pt-1" style={{ background: 'oklch(0.15 0.006 70)' }}>
                                                    <div className="text-[10px] uppercase tracking-widest text-slate py-2">
                                                        View log · {r.viewCount} total{r.filename ? ` · ${r.filename}` : ''}
                                                    </div>
                                                    {r.recentViews.length === 0 ? (
                                                        <div className="font-mono text-[11px] text-slate pb-2">No views yet.</div>
                                                    ) : (
                                                        <table className="w-full text-left border-collapse">
                                                            <thead>
                                                                <tr className="border-b border-grid-line-soft">
                                                                    <th className={th}>When</th>
                                                                    <th className={th}>Location</th>
                                                                    <th className={th}>Device</th>
                                                                    <th className={th}>Referrer</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-grid-line-soft">
                                                                {r.recentViews.map((v, i) => (
                                                                    <tr key={i}>
                                                                        <td className="py-1.5 px-3 font-mono text-[11px] text-white whitespace-nowrap">{fmtWhen(v.viewed_at)}</td>
                                                                        <td className="py-1.5 px-3 text-slate text-[11px]">
                                                                            {v.city ? `${decodeURIComponent(v.city)}, ${v.country}` : v.country || 'Unknown'}
                                                                        </td>
                                                                        <td className="py-1.5 px-3 text-slate text-[11px]">{v.device_type || '—'}</td>
                                                                        <td className="py-1.5 px-3 text-slate text-[11px] max-w-[240px] truncate">{v.referrer || 'direct'}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    )}
                                                    {r.viewCount > r.recentViews.length && (
                                                        <div className="font-mono text-[10px] text-slate pt-2">
                                                            showing latest {r.recentViews.length} of {r.viewCount}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ),
                                    ];
                                })}
                                {resumes.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="py-8 text-center text-slate text-xs uppercase tracking-widest">
                                            No resume links yet — mint one above
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
