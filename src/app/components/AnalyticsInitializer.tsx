'use client';

import { useTimeTracking } from '@/lib/tracking';

export default function AnalyticsInitializer() {
    // This hook will set up the event listeners for beforeunload and visibilitychange
    // and track time on site for whichever visitId is active.
    useTimeTracking();

    return null; // This component doesn't render anything
}
