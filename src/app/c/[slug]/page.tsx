'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sanitizeCompanyId } from '@/lib/supabase';
import { setVisitId } from '@/lib/tracking';

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
                const rawSlug = unwrappedParams.slug || '';
                
                // Extract channel and company
                let channel = 'organic';
                let companyStr = rawSlug;
                
                for (const ch of CHANNELS) {
                    if (rawSlug === ch) {
                        channel = ch;
                        companyStr = 'unknown'; // Visited just the channel link
                        break;
                    }
                    if (rawSlug.startsWith(ch + '-')) {
                        channel = ch;
                        companyStr = rawSlug.substring(ch.length + 1);
                        break;
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
