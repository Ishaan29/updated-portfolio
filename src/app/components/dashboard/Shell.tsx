'use client';

import { ReactNode, useEffect, useState } from 'react';
import { DashboardData } from './lib/types';
import { LinkGenerator } from './LinkGenerator';
import './ops.css';

const CRUMBS: Record<string, [string, string]> = {
    Overview: ['signals', 'overview'],
    Leads: ['pipeline', 'leads'],
    Channels: ['attribution', 'channels'],
    Sessions: ['raw', 'session stream'],
};

function exportCsv(data: DashboardData) {
    const headers = ['company', 'channel', 'heat', 'stage', 'visits', 'engaged', 'last_visit', 'last_outreach'];
    const rows = data.companies.map((c) =>
        [c.companyId, c.channel, c.heatScore, c.stage, c.totalVisits, c.engagedVisits, c.lastVisit, c.lastOutreach ?? '']
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(',')
    );
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
}

export function Shell({
    children,
    activeTab,
    onTabChange,
    onLogout,
    data,
}: {
    children: ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout: () => void;
    data: DashboardData | null;
}) {
    const [showLinkGen, setShowLinkGen] = useState(false);
    const [clock, setClock] = useState('');

    useEffect(() => {
        const tick = () =>
            setClock(new Date().toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    const channelCount = data ? Object.values(data.byChannel).filter((v) => v.sent > 0 || v.clicks > 0).length : null;
    const tabs: Array<{ k: string; count: number | null }> = [
        { k: 'Overview', count: null },
        { k: 'Leads', count: data?.companies.length ?? null },
        { k: 'Channels', count: channelCount },
        { k: 'Sessions', count: data?.summary.totalVisits ?? null },
    ];

    const visits7d = data?.dailySeries?.slice(-7).reduce((s, d) => s + d.visits, 0) ?? 0;
    const crumb = CRUMBS[activeTab] ?? CRUMBS.Overview;

    return (
        <div className="ops ops-body">
            <div className="ops-shell">
                <header className="ops-topbar">
                    <div className="ops-brand">
                        <span className="dot" />
                        <span className="path">eshaanbajpai.dev / <b>admin / visits</b></span>
                    </div>
                    <nav className="tabs">
                        {tabs.map((t) => (
                            <button
                                key={t.k}
                                className="tab"
                                aria-current={activeTab === t.k}
                                onClick={() => onTabChange(t.k)}
                            >
                                {t.k}
                                {t.count != null && <span className="count">{t.count}</span>}
                            </button>
                        ))}
                    </nav>
                    <div className="right">
                        <span className="cell">
                            <span className="live" />
                            live
                        </span>
                        <span className="cell">
                            7d <b className="num">{visits7d}</b> visits
                        </span>
                        <span className="cell">
                            <span className="text-dim">{clock}</span>
                        </span>
                        <button className="cell" onClick={onLogout}>
                            logout ↗
                        </button>
                    </div>
                </header>

                <div className="ops-toolbar">
                    <span className="crumb">
                        {crumb[0]} / <b>{crumb[1]}</b>
                    </span>
                    <span className="spacer" />
                    <button className="tool primary" onClick={() => setShowLinkGen(true)}>
                        ◫ Generate tracking link
                    </button>
                    <button className="tool" onClick={() => data && exportCsv(data)}>
                        ↓ Export CSV
                    </button>
                </div>

                <main className="ops-main">{children}</main>
            </div>

            {showLinkGen && <LinkGenerator onClose={() => setShowLinkGen(false)} />}
        </div>
    );
}
