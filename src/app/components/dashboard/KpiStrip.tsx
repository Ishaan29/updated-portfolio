import { DashboardData } from './lib/types';
import { fmtNum, fmtPct } from './lib/format';

export function KpiStrip({ data }: { data: DashboardData }) {
    const { summary, funnel } = data;

    return (
        <div className="kpis">
            <div className="kpi">
                <span className="label">Visits · 60d</span>
                <span className="value num">{fmtNum(summary.totalVisits)}</span>
                <span className="sub">
                    <span className="delta up">+new</span>
                    <span className="text-dim">vs prior 60d</span>
                </span>
            </div>
            <div className="kpi">
                <span className="label">Companies</span>
                <span className="value num">{fmtNum(summary.uniqueCompanies)}</span>
                <span className="sub text-dim">{data.companies.length} total tracked</span>
            </div>
            <div className="kpi">
                <span className="label">Click rate</span>
                <span className="value num">{fmtPct(summary.clickRate * 100)}</span>
                <span className="sub text-dim">{funnel.clicked}/{funnel.outreach} clicked</span>
            </div>
            <div className="kpi">
                <span className="label">Engage rate</span>
                <span className="value num">{fmtPct(summary.engageRate * 100)}</span>
                <span className="sub text-dim">read ≥50% of page</span>
            </div>
            <div className="kpi hot">
                <span className="label">Reply rate</span>
                <span className="value num">{fmtPct(summary.replyRate * 100)}</span>
                <span className="sub text-dim">engaged → reply</span>
            </div>
            <div className="kpi">
                <span className="label">Resume / GH / LI</span>
                <span className="value num" style={{ fontSize: 22 }}>
                    {summary.resumeDLs}
                    <span style={{ color: 'var(--fg-dim)' }}> / </span>
                    {summary.githubClicks}
                    <span style={{ color: 'var(--fg-dim)' }}> / </span>
                    {summary.linkedinClicks}
                </span>
                <span className="sub text-dim">conversion events</span>
            </div>
        </div>
    );
}
