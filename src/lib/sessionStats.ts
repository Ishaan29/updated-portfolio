// Per-visit engagement stats derived from its visit_events rows.
//
// Duration counts only time the tab was visible: heartbeats sent while a
// `visibility hidden` event was in effect are ignored, and a visit is capped
// at 30 minutes. The client applies the same rules when it sends heartbeats
// (see useEngagementTracking in tracking.ts), so visits recorded before that
// change score the same as new ones.

export const HEARTBEAT_SECONDS = 30;
export const MAX_SESSION_SECONDS = 30 * 60;

export interface SessionStats {
    duration: number;
    maxScroll: number;
    sections: string[];
    isEngaged: boolean;
}

export function getSessionStats(events: any[] | null | undefined): SessionStats {
    const sorted = [...(events || [])].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    let heartbeatSeconds = 0;
    let reportedSeconds = 0;
    let hidden = false;
    let maxScroll = 0;
    const sections = new Set<string>();

    for (const e of sorted) {
        if (e.event_type === 'visibility') {
            hidden = e.event_name === 'hidden';
        }
        if (e.event_type === 'unload' || e.event_type === 'visibility') {
            reportedSeconds = Math.max(reportedSeconds, e.metadata?.duration_seconds || 0);
        }
        if (e.event_type === 'engagement' && e.event_name === 'heartbeat' && !hidden) {
            heartbeatSeconds += e.metadata?.interval || HEARTBEAT_SECONDS;
        }
        if (e.event_type === 'engagement' && e.event_name === 'scroll_depth') {
            maxScroll = Math.max(maxScroll, e.metadata?.depth || 0);
        }
        if (e.event_type === 'scroll' && e.event_name) {
            sections.add(e.event_name);
        }
    }

    // Heartbeats are the reliable signal; the page-reported duration only
    // covers visits too short to have sent one
    const duration = Math.min(heartbeatSeconds || reportedSeconds, MAX_SESSION_SECONDS);

    return {
        duration,
        maxScroll,
        sections: Array.from(sections),
        isEngaged: duration > HEARTBEAT_SECONDS && maxScroll >= 25,
    };
}
