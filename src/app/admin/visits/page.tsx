'use client';

import { useState } from 'react';
import VisitsDashboard from '@/app/components/VisitsDashboard';

export default function AdminVisitsPage() {
    const [accessToken, setAccessToken] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        // Test authentication by making a request
        try {
            const response = await fetch('/api/visits?limit=1', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                setIsAuthenticated(true);
                setError('');
            } else {
                setError('Invalid access token');
            }
        } catch (err) {
            setError('Authentication failed');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-navy flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-navy-light border border-slate/10 rounded-lg p-8">
                        <h1 className="text-2xl font-bold text-white mb-6">Admin Access</h1>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label htmlFor="token" className="block text-sm font-medium text-slate mb-2">
                                    Access Token
                                </label>
                                <input
                                    type="password"
                                    id="token"
                                    value={accessToken}
                                    onChange={(e) => setAccessToken(e.target.value)}
                                    placeholder="Enter your access token"
                                    className="w-full bg-navy border border-slate/20 rounded-lg px-4 py-2 text-white placeholder:text-slate/50 focus:outline-none focus:border-green"
                                    required
                                />
                            </div>
                            {error && (
                                <p className="text-red-500 text-sm">{error}</p>
                            )}
                            <button
                                type="submit"
                                className="w-full bg-green text-navy font-medium rounded-lg px-4 py-2 hover:bg-green/90 transition-colors"
                            >
                                Access Dashboard
                            </button>
                        </form>

                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-navy p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-white">Visit Analytics Dashboard</h1>
                    <button
                        onClick={() => setIsAuthenticated(false)}
                        className="text-slate hover:text-white transition-colors"
                    >
                        Logout
                    </button>
                </div>
                <VisitsDashboard accessToken={accessToken} />
            </div>
        </div>
    );
}
