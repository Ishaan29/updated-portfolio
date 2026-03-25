import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { visitId, eventType, eventName, metadata } = body;

        // Validate basic required fields
        if (!visitId || !eventType || !eventName) {
            return NextResponse.json(
                { error: 'Missing required fields: visitId, eventType, eventName' },
                { status: 400 }
            );
        }

        // Create Supabase client
        const supabase = createServerSupabaseClient();

        // Insert event record
        const { error } = await supabase
            .from('visit_events')
            .insert({
                visit_id: visitId,
                event_type: eventType,
                event_name: eventName,
                metadata: metadata || {},
                created_at: new Date().toISOString(),
            });

        if (error) {
            console.error('Supabase event insert error:', error);
            return NextResponse.json(
                { error: 'Failed to log event' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true },
            { status: 201 }
        );
    } catch (error) {
        console.error('Track Event API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
