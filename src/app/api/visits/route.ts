import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// Simple authentication middleware
function isAuthenticated(request: NextRequest): boolean {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const adminToken = process.env.ADMIN_ACCESS_TOKEN;

    if (!adminToken) {
        console.error('ADMIN_ACCESS_TOKEN not set in environment variables');
        return false;
    }

    return token === adminToken;
}

export async function GET(request: NextRequest) {
    try {
        // Check authentication
        if (!isAuthenticated(request)) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get query parameters for filtering
        const { searchParams } = new URL(request.url);
        const companyId = searchParams.get('company');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const limit = parseInt(searchParams.get('limit') || '100');

        // Create Supabase client
        const supabase = createServerSupabaseClient();

        // Build query
        let query = supabase
            .from('visits')
            .select('*')
            .order('visited_at', { ascending: false })
            .limit(limit);

        // Apply filters
        if (companyId) {
            query = query.eq('company_id', companyId);
        }
        if (startDate) {
            query = query.gte('visited_at', startDate);
        }
        if (endDate) {
            query = query.lte('visited_at', endDate);
        }

        const { data: visits, error } = await query;

        if (error) {
            console.error('Supabase query error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch visits' },
                { status: 500 }
            );
        }

        // Get analytics summary
        const { data: analytics } = await supabase
            .from('visit_analytics')
            .select('*');

        // Calculate summary statistics
        const totalVisits = visits?.length || 0;
        const uniqueCompanies = new Set(visits?.map(v => v.company_id)).size;
        const recentVisits = visits?.slice(0, 10) || [];

        return NextResponse.json({
            success: true,
            data: {
                visits: visits || [],
                analytics: analytics || [],
                summary: {
                    totalVisits,
                    uniqueCompanies,
                    recentVisits,
                },
            },
        });
    } catch (error) {
        console.error('Visits API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
