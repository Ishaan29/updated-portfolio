import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isValidCompanyId } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { companyId, userAgent, referrer } = body;

        // Validate company ID
        if (!companyId || !isValidCompanyId(companyId)) {
            return NextResponse.json(
                { error: 'Invalid company ID format' },
                { status: 400 }
            );
        }

        // Get IP address from request headers
        const ipAddress =
            request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // Create Supabase client
        const supabase = createServerSupabaseClient();

        // Insert visit record
        const { data, error } = await supabase
            .from('visits')
            .insert({
                company_id: companyId,
                visited_at: new Date().toISOString(),
                user_agent: userAgent || null,
                referrer: referrer || null,
                ip_address: ipAddress,
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            return NextResponse.json(
                { error: 'Failed to log visit' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true, visitId: data.id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Track API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
