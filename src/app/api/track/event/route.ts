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

        // Section dwell: the tracker flushes incremental chunks (e.g. 10s at a time),
        // so the stored value must ACCUMULATE, not be overwritten.
        if (eventType === 'section_dwell' && metadata?.seconds > 0) {
            const { data: existing } = await supabase
                .from('section_dwell')
                .select('seconds')
                .eq('visit_id', visitId)
                .eq('section', eventName)
                .maybeSingle();

            const { error: dwellError } = await supabase
                .from('section_dwell')
                .upsert(
                    {
                        visit_id: visitId,
                        section: eventName,
                        seconds: (existing?.seconds || 0) + Math.round(metadata.seconds),
                        updated_at: new Date().toISOString()
                    },
                    { onConflict: 'visit_id,section' }
                );
            if (dwellError) console.error('Supabase section_dwell upsert error:', dwellError);
        }

        // Check if this is a click event to insert into click_path table
        // 'eventName' in outbound tracking is kind (e.g. 'outbound', 'github_click', etc)
        // For section jump, it's 'section_jump'
        const isClick = eventType === 'engagement' && 
                        ['outbound', 'github_click', 'linkedin_click', 'resume_download', 'section_jump', 'cta_click'].includes(eventName);
        
        if (isClick) {
            // Get current max seq for this visit
            const { data: maxSeqData } = await supabase
                .from('click_path')
                .select('seq')
                .eq('visit_id', visitId)
                .order('seq', { ascending: false })
                .limit(1);
            
            const nextSeq = maxSeqData && maxSeqData.length > 0 ? maxSeqData[0].seq + 1 : 0;
            
            const { error: clickError } = await supabase
                .from('click_path')
                .insert({
                    visit_id: visitId,
                    seq: nextSeq,
                    target: metadata?.href || metadata?.action || 'unknown',
                    kind: eventName,
                    at: new Date().toISOString()
                });
            if (clickError) console.error('Supabase click_path insert error:', clickError);
        }

        // Insert event record (we still keep the raw event in visit_events as well)
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
