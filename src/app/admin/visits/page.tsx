'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Shell } from '@/app/components/dashboard/Shell';
import { OverviewTab } from '@/app/components/dashboard/OverviewTab';
import { LeadsTab } from '@/app/components/dashboard/LeadsTab';
import { ChannelsTab } from '@/app/components/dashboard/ChannelsTab';
import { SessionsTab } from '@/app/components/dashboard/SessionsTab';
import { ResumesTab } from '@/app/components/dashboard/ResumesTab';
import { ProjectsTab } from '@/app/components/dashboard/ProjectsTab';
import { DashboardData } from '@/app/components/dashboard/lib/types';
import '@/app/components/dashboard/ops.css';

export default function AdminVisitsPage() {
    const [accessToken, setAccessToken] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('Overview');
    const [openLeadId, setOpenLeadId] = useState<string | null>(null);

    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    // Bumped on manual refresh so tabs that load their own data refetch too
    const [refreshKey, setRefreshKey] = useState(0);
    // Each dashboard fetch pulls every visit, so never run two at once
    const inFlight = useRef<Promise<void> | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/visits', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (res.ok) {
                const result = await res.json();
                setData(result.data);
                setLastUpdated(new Date());
                setIsAuthenticated(true);
                setError('');
            } else {
                setError('ERR: invalid access token');
            }
        } catch {
            setError('ERR: authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const fetchDashboard = () => {
        if (!isAuthenticated) return Promise.resolve();
        if (inFlight.current) return inFlight.current;
        inFlight.current = loadDashboard().finally(() => { inFlight.current = null; });
        return inFlight.current;
    };

    const loadDashboard = async () => {
        try {
            const res = await fetch('/api/visits', { headers: { Authorization: `Bearer ${accessToken}` } });
            if (res.ok) {
                const result = await res.json();
                setData(result.data);
                setLastUpdated(new Date());
            }
        } catch {
            console.error('Failed to refresh data');
        }
    };

    // Tabs that load their own data report back through onTabLoaded so the
    // button stays disabled until every request for this refresh has finished
    const pendingTabLoads = useRef(0);
    const refreshAll = async () => {
        if (refreshing) return;
        setRefreshing(true);
        setRefreshKey((k) => k + 1);
        await fetchDashboard();
        if (pendingTabLoads.current === 0) setRefreshing(false);
    };
    const onTabLoading = useCallback(() => { pendingTabLoads.current++; }, []);
    const onTabLoaded = useCallback(() => {
        pendingTabLoads.current = Math.max(0, pendingTabLoads.current - 1);
        if (pendingTabLoads.current === 0 && !inFlight.current) setRefreshing(false);
    }, []);

    // Every refresh pulls all visits + events from Supabase, so poll slowly and
    // only while the tab is visible; catch up as soon as it is focused again.
    useEffect(() => {
        if (isAuthenticated) {
            const interval = setInterval(() => {
                if (document.visibilityState === 'visible') fetchDashboard();
            }, 5 * 60 * 1000);
            const onVisible = () => {
                if (document.visibilityState === 'visible') fetchDashboard();
            };
            document.addEventListener('visibilitychange', onVisible);
            return () => {
                clearInterval(interval);
                document.removeEventListener('visibilitychange', onVisible);
            };
        }
    }, [isAuthenticated, accessToken]);

    const openLead = (companyId: string) => {
        setOpenLeadId(companyId);
        setActiveTab('Leads');
        window.scrollTo({ top: 0 });
    };

    const changeTab = (tab: string) => {
        setOpenLeadId(null);
        setActiveTab(tab);
    };

    if (!isAuthenticated) {
        return (
            <div className="ops">
                <div className="gate-wrap">
                    <form className="gate" onSubmit={handleLogin}>
                        <div className="head">
                            <span className="pulse-dot" />
                            /admin/visits · restricted
                        </div>
                        <h1>Who&apos;s there?</h1>
                        <p>This dashboard is private. Authorized access only — outreach signals, lead heat scores, and session-level visitor data live here.</p>
                        <input
                            type="password"
                            value={accessToken}
                            onChange={(e) => setAccessToken(e.target.value)}
                            placeholder="passphrase"
                            autoFocus
                            required
                        />
                        {error && <div className="err">{error}</div>}
                        <div className="actions">
                            <button type="submit" className="submit" disabled={loading}>
                                {loading ? 'Authenticating…' : 'Unlock →'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <Shell activeTab={activeTab} onTabChange={changeTab} onLogout={() => { setIsAuthenticated(false); setData(null); }} onRefresh={refreshAll} refreshing={refreshing} lastUpdated={lastUpdated} data={data}>
            {activeTab === 'Overview' && <OverviewTab data={data} onOpenLead={openLead} />}
            {activeTab === 'Leads' && (
                <LeadsTab
                    data={data}
                    accessToken={accessToken}
                    openLeadId={openLeadId}
                    onOpenLead={openLead}
                    onCloseLead={() => setOpenLeadId(null)}
                    refreshKey={refreshKey}
                    onTabLoading={onTabLoading}
                    onTabLoaded={onTabLoaded}
                />
            )}
            {activeTab === 'Channels' && <ChannelsTab data={data} />}
            {activeTab === 'Sessions' && <SessionsTab accessToken={accessToken} refreshKey={refreshKey} onTabLoading={onTabLoading} onTabLoaded={onTabLoaded} />}
            {activeTab === 'Resumes' && <ResumesTab accessToken={accessToken} refreshKey={refreshKey} onTabLoading={onTabLoading} onTabLoaded={onTabLoaded} />}
            {activeTab === 'Projects' && <ProjectsTab accessToken={accessToken} refreshKey={refreshKey} onTabLoading={onTabLoading} onTabLoaded={onTabLoaded} />}
        </Shell>
    );
}
