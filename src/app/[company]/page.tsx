'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sanitizeCompanyId } from '@/lib/supabase';

export default function CompanyTrackingPage({
    params,
}: {
    params: Promise<{ company: string }>;
}) {
    const router = useRouter();

    useEffect(() => {
        const trackVisit = async () => {
            try {
                // Unwrap params promise
                const unwrappedParams = await params;
                const companyId = sanitizeCompanyId(unwrappedParams.company);

                // Log the visit
                await fetch('/api/track', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        companyId,
                        userAgent: navigator.userAgent,
                        referrer: document.referrer || 'direct',
                    }),
                });
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
        <div className="min-h-screen flex items-center justify-center bg-navy">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green"></div>
                <p className="mt-4 text-slate">Redirecting...</p>
            </div>
        </div>
    );
}
