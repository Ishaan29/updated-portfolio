'use client';

import { useState, useEffect } from 'react';
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

    const fetchDashboard = async () => {
        if (!isAuthenticated) return;
        try {
            const res = await fetch('/api/visits', { headers: { Authorization: `Bearer ${accessToken}` } });
            if (res.ok) {
                const result = await res.json();
                setData(result.data);
            }
        } catch {
            console.error('Failed to refresh data');
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            const interval = setInterval(fetchDashboard, 30000);
            return () => clearInterval(interval);
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
        <Shell activeTab={activeTab} onTabChange={changeTab} onLogout={() => { setIsAuthenticated(false); setData(null); }} data={data}>
            {activeTab === 'Overview' && <OverviewTab data={data} onOpenLead={openLead} />}
            {activeTab === 'Leads' && (
                <LeadsTab
                    data={data}
                    accessToken={accessToken}
                    openLeadId={openLeadId}
                    onOpenLead={openLead}
                    onCloseLead={() => setOpenLeadId(null)}
                />
            )}
            {activeTab === 'Channels' && <ChannelsTab data={data} />}
            {activeTab === 'Sessions' && <SessionsTab accessToken={accessToken} />}
            {activeTab === 'Resumes' && <ResumesTab accessToken={accessToken} />}
            {activeTab === 'Projects' && <ProjectsTab accessToken={accessToken} />}
        </Shell>
    );
}
