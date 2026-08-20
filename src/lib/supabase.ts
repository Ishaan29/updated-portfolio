import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Database types
export interface VisitEvent {
    id: string;
    visit_id: string;
    event_type: string;
    event_name: string;
    metadata: Record<string, any>;
    created_at: string;
}

export interface Visit {
    id: string;
    company_id: string;
    visited_at: string;
    user_agent: string | null;
    referrer: string | null;
    ip_address: string | null;
    channel?: string;
    device_type?: string | null;
    city?: string | null;
    region?: string | null;
    country?: string | null;
    created_at: string;
    visit_events?: VisitEvent[];
}

export interface OutreachLog {
    id: string;
    company_id: string;
    channel: string;
    action_type: string;
    contact_name?: string | null;
    notes?: string | null;
    action_date: string;
    created_at: string;
}

export interface Resume {
    id: string;
    company_id: string;
    role: string | null;
    storage_path: string;
    filename: string | null;
    active: boolean;
    created_at: string;
}

export interface ResumeView {
    id: string;
    resume_id: string;
    company_id: string;
    user_agent: string | null;
    referrer: string | null;
    ip_address: string | null;
    device_type: string | null;
    city: string | null;
    region: string | null;
    country: string | null;
    viewed_at: string;
}

export interface ProjectLink {
    slug: string;
    target_url: string;
    title: string | null;
    active: boolean;
    created_at: string;
}

export interface ProjectClick {
    id: string;
    slug: string;
    company_id: string | null;
    user_agent: string | null;
    referrer: string | null;
    ip_address: string | null;
    device_type: string | null;
    city: string | null;
    region: string | null;
    country: string | null;
    clicked_at: string;
}

export interface VisitAnalytics {
    company_id: string;
    total_visits: number;
    last_visit: string;
    first_visit: string;
    unique_days: number;
}

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            visits: {
                Row: Visit;
                Insert: Partial<Visit>;
                Update: Partial<Visit>;
                Relationships: [];
            };
            outreach_logs: {
                Row: OutreachLog;
                Insert: Partial<OutreachLog>;
                Update: Partial<OutreachLog>;
                Relationships: [];
            };
        };
        Views: {
            visit_analytics: {
                Row: VisitAnalytics;
                Relationships: [];
            };
        };
        Functions: {};
        Enums: {};
        CompositeTypes: {};
    };
}

// Create Supabase client for server-side operations
// This uses the SERVICE_ROLE_KEY which has full database access
// NEVER expose this client to the browser!
export function createServerSupabaseClient(): SupabaseClient<any> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error(
            'Missing Supabase environment variables. Please check your .env.local file.'
        );
    }

    // Cast to unknown first to avoid type overlap issues
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }) as unknown as SupabaseClient<any>;
}

// Helper function to validate company ID format
export function isValidCompanyId(companyId: string): boolean {
    // Allow lowercase letters, numbers, and hyphens
    // Must be between 2 and 50 characters
    const regex = /^[a-z0-9-]{2,50}$/;
    return regex.test(companyId);
}

// Helper function to sanitize company ID
export function sanitizeCompanyId(companyId: string): string {
    if (!companyId) return '';
    return companyId.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
}

// Project slugs live under /project/, so they cannot shadow a real route.
// They are matched case-insensitively with ILIKE, so the charset deliberately
// excludes '_' and '%' — both are LIKE wildcards.
export function isValidProjectSlug(slug: string): boolean {
    return /^[A-Za-z0-9][A-Za-z0-9-]{1,38}$/.test(slug);
}

// Only real web destinations — never javascript:, data: or similar
export function isValidTargetUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
        return false;
    }
}
