'use client';

import { useTimeTracking, useEngagementTracking, useOutboundTracking } from '@/lib/tracking';

export default function AnalyticsInitializer() {
    // This hook will set up the event listeners for beforeunload and visibilitychange
    // and track time on site for whichever visitId is active.
    useTimeTracking();
    
    // Tracks heartbeat pings for accurate time-on-page and discrete scroll milestones
    useEngagementTracking();

    // Tracks outbound link clicks and resume downloads
    useOutboundTracking();

    return null; // This component doesn't render anything
}
