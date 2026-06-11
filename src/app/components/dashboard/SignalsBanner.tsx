import { ReactNode } from 'react';
import { DashboardData } from './lib/types';
import { Panel } from './primitives/Panel';

/** Render the alert message with the company name highlighted, mock-style (`.co`). */
function highlightLead(msg: string, leadId?: string): ReactNode {
    if (!leadId) return msg;
    const idx = msg.toLowerCase().indexOf(leadId.toLowerCase());
    if (idx === -1) return msg;
    return (
        <>
            {msg.slice(0, idx)}
            <span className="co">{msg.slice(idx, idx + leadId.length)}</span>
            {msg.slice(idx + leadId.length)}
        </>
    );
}

export function SignalsBanner({
    alerts,
    onOpenLead,
}: {
    alerts: DashboardData['alerts'];
    onOpenLead?: (companyId: string) => void;
}) {
    if (!alerts || alerts.length === 0) return null;

    return (
        <Panel title="◉ Live signals" meta={`${alerts.length} active`} flush>
            <div className="alerts">
                {alerts.map((a, i) => (
                    <div key={i} className={`alert ${a.kind}`}>
                        <span className="ic">{a.kind === 'hot' ? '!' : a.kind === 'warm' ? '▲' : 'i'}</span>
                        <span className="when">{a.when || '—'}</span>
                        <span className="msg">{highlightLead(a.msg, a.leadId)}</span>
                        <button
                            className="act"
                            onClick={() => a.leadId && onOpenLead?.(a.leadId)}
                        >
                            {a.leadId ? 'open lead →' : 'review'}
                        </button>
                    </div>
                ))}
            </div>
        </Panel>
    );
}
