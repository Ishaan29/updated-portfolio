import { useMemo, useState } from 'react';
import { DashboardData, CompanyLead } from './lib/types';
import { Panel } from './primitives/Panel';
import { HeatBadge } from './primitives/HeatBadge';
import { ChannelChip } from './primitives/ChannelChip';
import { StatusChip } from './primitives/StatusChip';
import { Sparkline } from './primitives/Sparkline';
import { EngBar } from './primitives/EngBar';
import { LeadDetail } from './LeadDetail';
import { fmtRelative } from './lib/format';

type SortKey = 'heat' | 'company' | 'channel' | 'stage' | 'visits' | 'engaged' | 'lastSeen' | 'outreach';
type Filter = 'all' | 'hot' | 'engaged' | 'replied' | 'ghosted';

const FILTERS: Array<[Filter, string]> = [
    ['all', 'All'],
    ['hot', 'Hot ≥60'],
    ['engaged', 'Engaged'],
    ['replied', 'Replied+'],
    ['ghosted', 'Ghosted'],
];

export function LeadsTab({
    data,
    accessToken,
    openLeadId,
    onOpenLead,
    onCloseLead,
}: {
    data: DashboardData | null;
    accessToken: string;
    openLeadId: string | null;
    onOpenLead: (companyId: string) => void;
    onCloseLead: () => void;
}) {
    const [sortKey, setSortKey] = useState<SortKey>('heat');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [filter, setFilter] = useState<Filter>('all');
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!data) return [];
        let list = data.companies;
        if (filter === 'hot') list = list.filter((l) => l.heatScore >= 60);
        else if (filter === 'engaged') list = list.filter((l) => l.engagedVisits > 0);
        else if (filter === 'ghosted') list = list.filter((l) => l.stage === 'ghosted');
        else if (filter === 'replied') list = list.filter((l) => !['sent', 'clicked', 'engaged', 'ghosted'].includes(l.stage));
        if (search) {
            const s = search.toLowerCase();
            list = list.filter((l) => l.companyId.toLowerCase().includes(s) || l.channel.toLowerCase().includes(s));
        }
        const get = (l: CompanyLead): string | number => {
            switch (sortKey) {
                case 'heat': return l.heatScore;
                case 'company': return l.companyId;
                case 'channel': return l.channel;
                case 'stage': return l.stage;
                case 'visits': return l.totalVisits;
                case 'engaged': return l.engagedVisits;
                case 'lastSeen': return l.lastVisit ? +new Date(l.lastVisit) : 0;
                case 'outreach': return l.lastOutreach ? +new Date(l.lastOutreach) : 0;
            }
        };
        return [...list].sort((a, b) => {
            const va = get(a);
            const vb = get(b);
            if (va < vb) return sortDir === 'asc' ? -1 : 1;
            if (va > vb) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortKey, sortDir, filter, search]);

    if (!data) return <div className="loading-msg">Awaiting telemetry…</div>;

    const openLead = openLeadId ? data.companies.find((c) => c.companyId === openLeadId) : null;
    if (openLead) {
        return <LeadDetail lead={openLead} onBack={onCloseLead} accessToken={accessToken} />;
    }

    const flip = (k: SortKey) => {
        if (sortKey === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else {
            setSortKey(k);
            setSortDir(k === 'company' || k === 'channel' ? 'asc' : 'desc');
        }
    };

    const headerCell = (k: SortKey, label: string, align?: 'right') => (
        <th
            className={`sortable${align === 'right' ? ' num' : ''}`}
            aria-sort={sortKey === k ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
            onClick={() => flip(k)}
        >
            {label}
            <span className="arr">{sortKey === k ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</span>
        </th>
    );

    return (
        <Panel
            title="Lead prioritization"
            meta={`${filtered.length} of ${data.companies.length} companies`}
            flush
            right={
                <div className="seg" style={{ alignItems: 'center' }}>
                    {FILTERS.map(([k, l]) => (
                        <button key={k} className="opt" aria-pressed={filter === k} onClick={() => setFilter(k)}>
                            {l}
                        </button>
                    ))}
                    <input
                        type="text"
                        placeholder="filter…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            }
        >
            <div style={{ overflowX: 'auto' }}>
                <table className="t">
                    <thead>
                        <tr>
                            {headerCell('heat', 'Heat', 'right')}
                            {headerCell('company', 'Company')}
                            <th>Role · tier</th>
                            {headerCell('channel', 'Channel')}
                            {headerCell('stage', 'Stage')}
                            {headerCell('visits', 'Visits', 'right')}
                            <th className="num">Engaged</th>
                            <th>30-day trend</th>
                            {headerCell('lastSeen', 'Last seen', 'right')}
                            {headerCell('outreach', 'Outreach', 'right')}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((l) => (
                            <tr
                                key={l.companyId}
                                className={`clickable${l.heatScore >= 80 ? ' hot' : ''}`}
                                onClick={() => onOpenLead(l.companyId)}
                            >
                                <td className="num"><HeatBadge score={l.heatScore} /></td>
                                <td>
                                    <span style={{ color: 'var(--fg)', fontWeight: 600, textTransform: 'capitalize' }}>{l.companyId}</span>
                                </td>
                                <td className="dim">
                                    {l.role || l.tier ? (
                                        <>
                                            <span style={{ color: 'var(--fg-muted)' }}>{l.role || '—'}</span>
                                            {l.tier && <span style={{ color: 'var(--fg-dim)' }}> · {l.tier}</span>}
                                        </>
                                    ) : (
                                        <span style={{ color: 'var(--fg-dim)' }}>—</span>
                                    )}
                                </td>
                                <td><ChannelChip channel={l.channel} /></td>
                                <td><StatusChip status={l.stage} /></td>
                                <td className="num">{l.totalVisits}</td>
                                <td className="num"><EngBar engaged={l.engagedVisits} total={l.totalVisits} /></td>
                                <td>
                                    <Sparkline
                                        data={l.trend || []}
                                        width={84}
                                        height={18}
                                        color={l.heatScore >= 80 ? 'var(--danger)' : l.heatScore >= 60 ? 'var(--accent)' : 'var(--fg-muted)'}
                                    />
                                </td>
                                <td className="num dim">{fmtRelative(l.lastVisit)}</td>
                                <td className="num dim">{fmtRelative(l.lastOutreach)}</td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={10} className="dim" style={{ padding: 30, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    No leads found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Panel>
    );
}
