import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Database types
export interface Visit {
    id: string;
    company_id: string;
    visited_at: string;
    user_agent: string | null;
    referrer: string | null;
    ip_address: string | null;
    created_at: string;
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
