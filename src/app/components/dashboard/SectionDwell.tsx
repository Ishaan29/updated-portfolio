import { Panel } from './primitives/Panel';
import { DashboardData } from './lib/types';
import { fmtDur } from './lib/format';

export function DwellBars({ data }: { data: Array<{ name: string; avg: number }> }) {
    const max = Math.max(1, ...data.map((d) => d.avg));
    return (
        <div className="dwell">
            {data.map((d) => (
                <div className="drow" key={d.name}>
                    <span className="label">{d.name}</span>
                    <span className="bar">
                        <i style={{ width: `${(d.avg / max) * 100}%` }} />
                    </span>
                    <span className="v">{fmtDur(Math.round(d.avg))}</span>
                </div>
            ))}
            {data.length === 0 && <div className="text-dim" style={{ fontSize: 11.5 }}>No dwell data yet</div>}
        </div>
    );
}

export function SectionDwell({ dwell }: { dwell: DashboardData['sectionDwell'] }) {
    if (!dwell) return null;
    return (
        <Panel title="Section dwell time" meta="avg seconds per engaged session">
            <DwellBars data={dwell} />
        </Panel>
    );
}
