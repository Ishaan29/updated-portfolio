'use client';

import { useCallback, useEffect, useState } from 'react';
import { Panel } from './primitives/Panel';
import { Sparkline } from './primitives/Sparkline';

interface ProjectClick {
    clicked_at: string;
    company_id: string | null;
    device_type: string | null;
    city: string | null;
    country: string | null;
    referrer: string | null;
}

interface ProjectRow {
    slug: string;
    target_url: string;
    title: string | null;
    active: boolean;
    created_at: string;
    clickCount: number;
    lastClicked: string | null;
    clicks7d: number;
    dailySeries: number[];
    companies: string[];
    recentClicks: ProjectClick[];
}

function fmtWhen(iso: string) {
    const d = new Date(iso);
    return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}, ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
}

function fmtDay(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function shortTarget(url: string) {
    return url.replace(/^https?:\/\/(www\.)?/, '');
}

const th = 'py-2 px-3 text-[10px] font-normal text-slate uppercase tracking-widest';

export function ProjectsTab({ accessToken }: { accessToken: string }) {
    const [projects, setProjects] = useState<ProjectRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [tagCompany, setTagCompany] = useState('');

    const [slug, setSlug] = useState('');
    const [targetUrl, setTargetUrl] = useState('');
    const [title, setTitle] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [createdUrl, setCreatedUrl] = useState('');

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const authHeaders = { Authorization: `Bearer ${accessToken}` };

    const fetchProjects = useCallback(async () => {
        try {
            const res = await fetch('/api/projects', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (res.ok) {
                const data = await res.json();
                setProjects(data.projects ?? []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const create = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;
        setSaving(true);
        setError('');
        setCreatedUrl('');
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { ...authHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, targetUrl, title }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to create link');
                return;
            }
            setCreatedUrl(`${origin}${data.url}`);
            setSlug('');
            setTargetUrl('');
            setTitle('');
            fetchProjects();
        } catch {
            setError('Failed to create link');
        } finally {
            setSaving(false);
        }
    };

    const copy = (key: string, text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(key);
            setTimeout(() => setCopied(null), 1500);
        });
    };

    const toggleActive = async (p: ProjectRow) => {
        const res = await fetch(`/api/projects/${p.slug}`, {
            method: 'PATCH',
            headers: { ...authHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ active: !p.active }),
        });
        if (res.ok) fetchProjects();
    };

    const remove = async (p: ProjectRow) => {
        if (!window.confirm(`Delete /project/${p.slug}? The link and its click history are removed permanently.`)) return;
        const res = await fetch(`/api/projects/${p.slug}`, {
            method: 'DELETE',
            headers: authHeaders,
        });
        if (res.ok) fetchProjects();
    };

    const totalClicks = projects.reduce((s, p) => s + p.clickCount, 0);
    const clicks7d = projects.reduce((s, p) => s + p.clicks7d, 0);
    const activeCount = projects.filter((p) => p.active).length;
    const topProject = [...projects].sort((a, b) => b.clickCount - a.clickCount)[0];

    return (
        <div className="flex flex-col gap-4 animate-in fade-in duration-500">
            <div className="kpis">
                <div className="kpi">
                    <div className="label">Project links</div>
                    <div className="value">{projects.length}</div>
                    <div className="sub">{activeCount} active · {projects.length - activeCount} off</div>
                </div>
                <div className="kpi">
                    <div className="label">Total clicks</div>
                    <div className="value">{totalClicks}</div>
                    <div className="sub">all links, all time</div>
                </div>
                <div className={`kpi${clicks7d > 0 ? ' hot' : ''}`}>
                    <div className="label">Clicks · 7d</div>
                    <div className="value">{clicks7d}</div>
                    <div className="sub">opens this week</div>
                </div>
                <div className="kpi">
                    <div className="label">Most opened</div>
                    <div className="value" style={{ fontSize: 18 }}>
                        {topProject && topProject.clickCount > 0 ? `/${topProject.slug}` : '—'}
                    </div>
                    <div className="sub">
                        {topProject && topProject.clickCount > 0 ? `${topProject.clickCount} clicks` : 'no clicks yet'}
                    </div>
                </div>
            </div>

            <Panel title="NEW PROJECT LINK" meta="eshaanbajpai.dev/project/<slug> → anywhere">
                <form onSubmit={create}>
                    <div className="field-set">
                        <div>
                            <label>Slug</label>
                            <input
                                type="text"
                                placeholder="vectorDB"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label>Title</label>
                            <input
                                type="text"
                                placeholder="Distributed Vector Database"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <label>Target URL</label>
                            <input
                                type="url"
                                placeholder="https://github.com/Ishaan29/vectorDB"
                                value={targetUrl}
                                onChange={(e) => setTargetUrl(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="mint" disabled={saving || !slug.trim() || !targetUrl.trim()}>
                            {saving ? 'Saving…' : '+ Create link'}
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
                            className={`copy${copied === 'new' ? ' done' : ''}`}
                            onClick={() => copy('new', createdUrl)}
                        >
                            {copied === 'new' ? '✓ Copied' : 'Copy'}
                        </button>
                    </div>
                )}
            </Panel>

            <Panel
                title="LINKS"
                meta={`${projects.length} live · click a row for its click log`}
                flush
                className="flex-1"
            >
                {loading ? (
                    <div className="p-8 text-center text-amber animate-pulse font-mono text-xs tracking-widest uppercase">
                        Querying project links...
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-grid-line-soft">
                                    <th className={th}>Status</th>
                                    <th className={th}>Link</th>
                                    <th className={th}>Title</th>
                                    <th className={th}>Target</th>
                                    <th className={`${th} text-right`}>Clicks</th>
                                    <th className={th}>14d trend</th>
                                    <th className={th}>Last click</th>
                                    <th className={`${th} text-right`}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-grid-line-soft">
                                {projects.map((p) => {
                                    const url = `${origin}/project/${p.slug}`;
                                    const isOpen = expanded === p.slug;
                                    return [
                                        <tr
                                            key={p.slug}
                                            className={`hover:bg-row-hover transition-colors cursor-pointer ${isOpen ? 'bg-row-hover' : ''} ${!p.active ? 'opacity-50' : ''}`}
                                            onClick={() => {
                                                setExpanded(isOpen ? null : p.slug);
                                                setTagCompany('');
                                            }}
                                        >
                                            <td className="py-2.5 px-3">
                                                {p.active ? (
                                                    <span className="text-[9px] uppercase tracking-wider text-signal border border-signal/30 bg-signal/10 px-1.5 py-0.5 rounded-[2px] inline-flex items-center gap-1">
                                                        <span className="w-1 h-1 rounded-full bg-signal" /> LIVE
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] uppercase tracking-wider text-slate border border-grid-line-soft px-1.5 py-0.5 rounded-[2px]">
                                                        OFF
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-3 font-mono text-[12px] text-white whitespace-nowrap">
                                                /project/{p.slug}
                                                <button
                                                    className="ml-2"
                                                    style={{
                                                        background: copied === p.slug ? 'var(--signal)' : 'transparent',
                                                        color: copied === p.slug ? 'oklch(0.16 0.02 160)' : 'var(--accent)',
                                                        border: '1px solid var(--border)',
                                                        padding: '2px 7px',
                                                        borderRadius: 3,
                                                        fontSize: 10,
                                                        cursor: 'pointer',
                                                        textTransform: 'uppercase',
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        copy(p.slug, url);
                                                    }}
                                                >
                                                    {copied === p.slug ? '✓' : 'Copy'}
                                                </button>
                                            </td>
                                            <td className="py-2.5 px-3 text-slate text-[11px]">{p.title || '—'}</td>
                                            <td className="py-2.5 px-3 text-slate text-[11px] max-w-[220px] truncate">
                                                {shortTarget(p.target_url)}
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-mono text-[12px] text-white">
                                                {p.clickCount}
                                                {p.clicks7d > 0 && <span className="text-signal text-[10px]"> +{p.clicks7d}</span>}
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <Sparkline data={p.dailySeries} />
                                            </td>
                                            <td className="py-2.5 px-3 text-slate text-[11px] whitespace-nowrap">{fmtDay(p.lastClicked)}</td>
                                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                                <button
                                                    className="text-[10px] uppercase tracking-wider text-slate border border-grid-line-soft hover:text-white px-1.5 py-0.5 rounded-[2px] mr-1.5 cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleActive(p);
                                                    }}
                                                    title={p.active ? 'Turn off — the URL stops redirecting' : 'Turn the link back on'}
                                                >
                                                    {p.active ? 'Disable' : 'Enable'}
                                                </button>
                                                <button
                                                    className="text-[10px] uppercase tracking-wider border border-grid-line-soft px-1.5 py-0.5 rounded-[2px] cursor-pointer"
                                                    style={{ color: 'var(--danger)' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        remove(p);
                                                    }}
                                                    title="Delete the link and its click history"
                                                >
                                                    ✕
                                                </button>
                                            </td>
                                        </tr>,
                                        isOpen && (
                                            <tr key={`${p.slug}-detail`}>
                                                <td colSpan={8} className="px-3 pb-3 pt-1" style={{ background: 'oklch(0.15 0.006 70)' }}>
                                                    <div className="flex flex-wrap items-end gap-3 py-2">
                                                        <div>
                                                            <label className="block text-[10px] uppercase tracking-widest text-slate mb-1.5">
                                                                Tag this link for a company
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="stripe"
                                                                value={tagCompany}
                                                                onChange={(e) => setTagCompany(e.target.value)}
                                                                onClick={(e) => e.stopPropagation()}
                                                                style={{
                                                                    background: 'oklch(0.18 0.006 70)',
                                                                    border: '1px solid var(--border)',
                                                                    color: 'var(--fg)',
                                                                    fontFamily: 'var(--mono)',
                                                                    fontSize: 12,
                                                                    padding: '6px 9px',
                                                                    borderRadius: 4,
                                                                    width: 160,
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="preview-url" style={{ flex: 1, minWidth: 260, padding: '8px 12px', fontSize: 12 }}>
                                                            <span>{url}{tagCompany.trim() ? `?c=${tagCompany.trim().toLowerCase()}` : ''}</span>
                                                            <button
                                                                className={`copy${copied === `${p.slug}-tag` ? ' done' : ''}`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    copy(`${p.slug}-tag`, `${url}${tagCompany.trim() ? `?c=${tagCompany.trim().toLowerCase()}` : ''}`);
                                                                }}
                                                            >
                                                                {copied === `${p.slug}-tag` ? '✓ Copied' : 'Copy'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="text-[10px] uppercase tracking-widest text-slate py-2">
                                                        Click log · {p.clickCount} total
                                                        {p.companies.length > 0 && ` · tagged: ${p.companies.join(', ')}`}
                                                    </div>
                                                    {p.recentClicks.length === 0 ? (
                                                        <div className="font-mono text-[11px] text-slate pb-2">No clicks yet.</div>
                                                    ) : (
                                                        <table className="w-full text-left border-collapse">
                                                            <thead>
                                                                <tr className="border-b border-grid-line-soft">
                                                                    <th className={th}>When</th>
                                                                    <th className={th}>Company</th>
                                                                    <th className={th}>Location</th>
                                                                    <th className={th}>Device</th>
                                                                    <th className={th}>Referrer</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-grid-line-soft">
                                                                {p.recentClicks.map((c, i) => (
                                                                    <tr key={i}>
                                                                        <td className="py-1.5 px-3 font-mono text-[11px] text-white whitespace-nowrap">{fmtWhen(c.clicked_at)}</td>
                                                                        <td className="py-1.5 px-3 text-[11px] capitalize" style={{ color: c.company_id ? 'var(--accent)' : 'var(--fg-dim)' }}>
                                                                            {c.company_id || '—'}
                                                                        </td>
                                                                        <td className="py-1.5 px-3 text-slate text-[11px]">
                                                                            {c.city ? `${decodeURIComponent(c.city)}, ${c.country}` : c.country || 'Unknown'}
                                                                        </td>
                                                                        <td className="py-1.5 px-3 text-slate text-[11px]">{c.device_type || '—'}</td>
                                                                        <td className="py-1.5 px-3 text-slate text-[11px] max-w-[220px] truncate">{c.referrer || 'direct'}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    )}
                                                    {p.clickCount > p.recentClicks.length && (
                                                        <div className="font-mono text-[10px] text-slate pt-2">
                                                            showing latest {p.recentClicks.length} of {p.clickCount}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ),
                                    ];
                                })}
                                {projects.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="py-8 text-center text-slate text-xs uppercase tracking-widest">
                                            No project links yet — create one above
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
