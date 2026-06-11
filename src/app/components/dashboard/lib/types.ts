export interface SessionStats {
    duration: number;
    maxScroll: number;
    sections: string[];
    isEngaged: boolean;
}

export interface VisitEvent {
    id: string;
    event_type: string;
    event_name: string;
    metadata: any;
    created_at: string;
}

export interface Visit {
    id: string;
    company_id: string;
    channel: string;
    visited_at: string;
    device_type: string | null;
    city: string | null;
    region: string | null;
    country: string | null;
    sessionStats?: SessionStats;
    visit_events?: VisitEvent[];
}

export interface CompanyLead {
    companyId: string;
    channel: string;
    heatScore: number;
    heatTier: 'Hot' | 'Warm' | 'Cool' | 'New';
    role: string;
    tier: string;
    stage: string;
    lastVisit: string;
    lastOutreach: string | null;
    totalVisits: number;
    engagedVisits: number;
    trend: number[]; // e.g. last 30 days daily visits
    visits: Visit[];
}

export interface OutreachLog {
    id: string;
    company_id: string;
    channel: string;
    action_type: string;
    stage?: string;
    contact_name: string | null;
    notes: string | null;
    action_date: string;
}

export interface DashboardSummary {
    totalVisits: number;
    uniqueCompanies: number;
    clickRate: number;
    engageRate: number;
    replyRate: number;
    resumeDLs: number;
    githubClicks: number;
    linkedinClicks: number;
}

export interface DashboardFunnel {
    outreach: number;
    clicked: number;
    engaged: number;
    replied: number;
    screen: number;
    onsite: number;
    offer: number;
}

export interface DailySeries {
    date: string;
    visits: number;
    engaged: number;
    pageViews: number;
    bounces: number;
}

export interface DashboardData {
    companies: CompanyLead[];
    outreachLogs: OutreachLog[];
    summary: DashboardSummary;
    funnel: DashboardFunnel;
    byChannel: Record<string, { sent: number; clicks: number; engaged: number; replied: number }>;
    byDevice: { desktop: number; mobile: number; tablet: number };
    heatmap: number[][];
    sectionDwell: Array<{ name: string; avg: number; visits: number }>;
    dailySeries: DailySeries[];
    alerts: Array<{ kind: 'hot'|'warm'|'info'; when: string; msg: string; leadId?: string }>;
    referrers: Array<{ name: string; count: number }>;
    topCompaniesByChannel: Record<string, Array<{ companyId: string; visits: number; heatScore: number }>>;
}
