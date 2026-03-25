'use client';

import { useEffect, useRef } from 'react';

// Store visit ID in sessionStorage so we can attribute events to the same visit
export const setVisitId = (id: string) => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('portfolio_visit_id', id);
        // Also log a 'visitor_landed' event once the ID is set
        trackEvent('pageview', 'landed', { path: window.location.pathname });
    }
};

export const getVisitId = (): string | null => {
    if (typeof window !== 'undefined') {
        return sessionStorage.getItem('portfolio_visit_id');
    }
    return null;
};

// Generic event tracker
export const trackEvent = async (
    eventType: string,
    eventName: string,
    metadata: Record<string, any> = {}
) => {
    const visitId = getVisitId();
    if (!visitId) return; // Silent return if not visiting via a tracked link

    try {
        await fetch('/api/track/event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Use keepalive for unload events
            keepalive: eventType === 'unload',
            body: JSON.stringify({
                visitId,
                eventType,
                eventName,
                metadata,
            }),
        });
    } catch (error) {
        console.error('Failed to track event:', error);
    }
};

// Hook to track time spent and page unload
export const useTimeTracking = () => {
    const startTimeRef = useRef<number>(Date.now());

    useEffect(() => {
        const handleUnload = () => {
            const timeSpentSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
            trackEvent('unload', 'page_leave', { duration_seconds: timeSpentSeconds });
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                const timeSpentSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
                trackEvent('visibility', 'hidden', { duration_seconds: timeSpentSeconds });
            } else {
                // Reset start time when coming back
                startTimeRef.current = Date.now();
                trackEvent('visibility', 'visible', {});
            }
        };

        window.addEventListener('beforeunload', handleUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('beforeunload', handleUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);
};

// Hook to track when sections come into view
export const useSectionTracking = (sectionName: string) => {
    const ref = useRef<HTMLElement | null>(null);
    const hasTrackedRef = useRef(false);

    useEffect(() => {
        const currentRef = ref.current;
        if (!currentRef) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && !hasTrackedRef.current) {
                    trackEvent('scroll', sectionName, { action: 'viewed' });
                    hasTrackedRef.current = true;
                }
            },
            { threshold: 0.3 }
        );

        observer.observe(currentRef);

        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [sectionName]);

    return ref;
};

// Global hook for 30s heartbeat and scroll milestones (25%, 50%, 75%, 100%)
export const useEngagementTracking = () => {
    const trackedMilestones = useRef(new Set<number>());

    useEffect(() => {
        // 1. Heartbeat (every 30s)
        const heartbeatInterval = setInterval(() => {
            trackEvent('engagement', 'heartbeat', { 
                action: 'ping',
                interval: 30
            });
        }, 30000);

        // 2. Scroll Milestones
        const handleScroll = () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight - windowHeight;
            
            if (documentHeight <= 0) return;
            
            const scrollPercent = (window.scrollY / documentHeight) * 100;
            const milestones = [25, 50, 75, 100];
            
            for (const milestone of milestones) {
                if (scrollPercent >= milestone && !trackedMilestones.current.has(milestone)) {
                    trackedMilestones.current.add(milestone);
                    trackEvent('engagement', 'scroll_depth', { depth: milestone });
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            clearInterval(heartbeatInterval);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
};

export const trackCtaClick = (ctaName: string) => {
    trackEvent('engagement', 'cta_click', { action: ctaName });
};
