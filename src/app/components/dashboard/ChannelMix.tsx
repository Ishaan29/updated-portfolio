import { Panel } from './primitives/Panel';
import { DashboardData } from './lib/types';
import { fmtPct } from './lib/format';

export const CHANNEL_COLORS: Record<string, string> = {
    apollo: 'var(--accent)',
    linkedin: 'var(--info)',
    app: 'var(--signal)',
    'gh-cold': 'oklch(0.78 0.18 290)',
    referral: 'oklch(0.78 0.16 320)',
    organic: 'var(--fg-dim)',
};

export function Donut({ slices, size = 110, thickness = 14 }: { slices: Array<{ value: number; color: string }>; size?: number; thickness?: number }) {
    const total = slices.reduce((s, x) => s + x.value, 0) || 1;
    const r = (size - thickness) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const circ = 2 * Math.PI * r;
    let offset = 0;
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="oklch(0.24 0.008 70)" strokeWidth={thickness} />
            {slices.map((s, i) => {
                const len = (s.value / total) * circ;
                const el = (
                    <circle
                        key={i}
                        cx={cx} cy={cy} r={r} fill="none"
                        stroke={s.color} strokeWidth={thickness}
                        strokeDasharray={`${len} ${circ - len}`}
                        strokeDashoffset={-offset}
                        transform={`rotate(-90 ${cx} ${cy})`}
                        strokeLinecap="butt"
                    />
                );
                offset += len;
                return el;
            })}
        </svg>
    );
}

export function ChannelMix({ byChannel }: { byChannel: DashboardData['byChannel'] }) {
    if (!byChannel) return null;

    const channels = Object.entries(byChannel)
        .filter(([, stats]) => stats.sent > 0 || stats.clicks > 0)
        .sort(([, a], [, b]) => (b.sent || b.clicks) - (a.sent || a.clicks));

    const slices = channels.map(([name, stats]) => ({
        value: Math.max(stats.sent, stats.clicks),
        color: CHANNEL_COLORS[name] || CHANNEL_COLORS.organic,
    }));

    return (
        <Panel title="Channel mix" meta="outreach by source">
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '6px 4px' }}>
                <Donut slices={slices} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    {channels.map(([name, stats]) => {
                        const ctr = stats.sent > 0 ? (stats.clicks / stats.sent) * 100 : stats.clicks > 0 ? 100 : 0;
                        return (
                            <div
                                key={name}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '12px minmax(70px, 110px) auto auto auto',
                                    gap: 14,
                                    alignItems: 'center',
                                    padding: '7px 0',
                                    borderBottom: '1px solid var(--grid-line-soft)',
                                    fontSize: 11.5,
                                }}
                            >
                                <span style={{ width: 10, height: 10, borderRadius: 2, background: CHANNEL_COLORS[name] || CHANNEL_COLORS.organic }} />
                                <span style={{ color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
                                <span style={{ color: 'var(--fg-muted)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{stats.sent} sent</span>
                                <span style={{ color: 'var(--fg-muted)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{stats.clicks} clicks</span>
                                <span style={{ color: 'var(--accent)', fontVariantNumeric: 'tabular-nums', minWidth: 44, textAlign: 'right' }}>
                                    {fmtPct(Math.min(ctr, 100))}
                                </span>
                            </div>
                        );
                    })}
                    {channels.length === 0 && <div className="text-dim" style={{ fontSize: 11.5 }}>No channel data yet</div>}
                    <div style={{ marginTop: 10, fontSize: 10.5, color: 'var(--fg-dim)', letterSpacing: '0.04em' }}>
                        CTR = unique companies that clicked / outreach sent
                    </div>
                </div>
            </div>
        </Panel>
    );
}
