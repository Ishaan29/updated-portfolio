'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sanitizeCompanyId } from '@/lib/supabase';
import { setVisitId } from '@/lib/tracking';

// Known channels are matched first so multi-dash channels like 'gh-cold' parse correctly
const CHANNELS = ['apollo', 'linkedin', 'app', 'gh-cold', 'referral', 'organic'];

export default function TrackableLinkPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const router = useRouter();

    useEffect(() => {
        const trackVisit = async () => {
            try {
                // Unwrap params promise
                const unwrappedParams = await params;
                let rawSlug = unwrappedParams.slug || '';
                try {
                    rawSlug = decodeURIComponent(rawSlug);
                } catch {
                    // Malformed percent-encoding in a user-typed URL; use as-is
                }
                
                // Extract channel and company
                let channel = 'organic';
                let companyStr = rawSlug;
                let matchedKnown = false;
                
                for (const ch of CHANNELS) {
                    if (rawSlug === ch) {
                        channel = ch;
                        companyStr = 'unknown'; // Visited just the channel link
                        matchedKnown = true;
                        break;
                    }
                    if (rawSlug.startsWith(ch + '-')) {
                        channel = ch;
                        companyStr = rawSlug.substring(ch.length + 1);
                        matchedKnown = true;
                        break;
                    }
                }
                
                // Arbitrary channels: split on the last dash so multi-word channels
                // work, e.g. 'test-application-google' -> channel 'test-application',
                // company 'google'. Slugs without a dash keep the legacy behavior
                // (treated as a company visited organically).
                if (!matchedKnown) {
                    const lastDash = rawSlug.lastIndexOf('-');
                    if (lastDash > 0 && lastDash < rawSlug.length - 1) {
                        channel = sanitizeCompanyId(rawSlug.substring(0, lastDash)) || 'organic';
                        companyStr = rawSlug.substring(lastDash + 1);
                    }
                }
                
                const companyId = sanitizeCompanyId(companyStr);

                // Log the visit
                const response = await fetch('/api/track', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        companyId,
                        channel,
                        userAgent: navigator.userAgent,
                        referrer: document.referrer || 'direct',
                    }),
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.visitId) {
                        setVisitId(data.visitId);
                    }
                }
            } catch (error) {
                console.error('Failed to track visit:', error);
            } finally {
                // Redirect to homepage regardless of tracking success
                router.replace('/');
            }
        };

        trackVisit();
    }, [params, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-transparent">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#64ffda]"></div>
                <p className="mt-4 text-[#8892b0]">Setting things up...</p>
            </div>
        </div>
    );
}
