import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { DailySeries } from './lib/types';
import { Panel } from './primitives/Panel';
import { fmtDate } from './lib/format';

type Metric = 'visits' | 'engaged' | 'pageViews' | 'bounces';

const METRICS: Record<Metric, { label: string; color: string }> = {
    visits: { label: 'Visits', color: 'var(--accent)' },
    engaged: { label: 'Engaged', color: 'var(--signal)' },
    pageViews: { label: 'Page views', color: 'var(--accent)' },
    bounces: { label: 'Bounces', color: 'var(--danger)' },
};

export function TimelineChart({ data }: { data: DailySeries[] }) {
    const [metric, setMetric] = useState<Metric>('visits');
    const color = METRICS[metric].color;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null;
        return (
            <div
                style={{
                    background: 'oklch(0.13 0.006 70)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 4,
                    padding: '6px 10px',
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    color: 'var(--fg)',
                }}
            >
                <div style={{ color: 'var(--fg-dim)', fontSize: 10 }}>{fmtDate(label)}</div>
                <div style={{ fontVariantNumeric: 'tabular-nums' }}>
                    <span style={{ color }}>● </span>
                    {metric}: <b>{payload[0].value}</b>
                </div>
            </div>
        );
    };

    return (
        <Panel
            title="Traffic timeline"
            meta={`${data.length} days · ${metric}`}
            right={
                <div className="seg">
                    {(Object.keys(METRICS) as Metric[]).map((m) => (
                        <button key={m} className="opt" aria-pressed={metric === m} onClick={() => setMetric(m)}>
                            {METRICS[m].label}
                        </button>
                    ))}
                </div>
            }
        >
            <div style={{ height: 240, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 12, right: 14, left: -16, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`ops-grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity={0.45} />
                                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="var(--grid-line-soft)" strokeDasharray="2 4" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--fg-dim)', fontSize: 10, fontFamily: 'var(--mono)' }}
                            minTickGap={40}
                            tickFormatter={(val) => fmtDate(val)}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--fg-dim)', fontSize: 10, fontFamily: 'var(--mono)' }}
                            allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--accent)', strokeDasharray: '2 3', strokeOpacity: 0.5 }} />
                        <Area
                            type="monotone"
                            dataKey={metric}
                            stroke={color}
                            strokeWidth={1.6}
                            fill={`url(#ops-grad-${metric})`}
                            activeDot={{ r: 3.5, fill: color, stroke: 'var(--bg)', strokeWidth: 1.5 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Panel>
    );
}
