'use client';

import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Visit {
    visited_at: string;
    sessionStats?: {
        isEngaged: boolean;
        sections: string[];
        maxScroll: number;
    };
    visit_events?: any[];
}

interface DailyVisitsChartProps {
    visits: Visit[];
}

export default function DailyVisitsChart({ visits }: DailyVisitsChartProps) {
    const [activeMetric, setActiveMetric] = useState<'Visitors' | 'PageViews' | 'BounceRate'>('Visitors');

    const { chartData, totals, todayTotals, yesterdayTotals } = useMemo(() => {
        const daysMap = new Map<string, { Visitors: number, PageViews: number, Bounces: number }>();
        
        // Populate the last 30 days to ensure a continuous line graph
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);
        
        const startOfToday = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            daysMap.set(dateStr, { Visitors: 0, PageViews: 0, Bounces: 0 });
        }

        let totalV = 0;
        let totalPV = 0;
        let totalBounces = 0;
        
        let todayV = 0;
        let todayPV = 0;
        let todayBounces = 0;

        let yesterdayV = 0;
        let yesterdayPV = 0;
        let yesterdayBounces = 0;

        visits.forEach(v => {
            const visitDate = new Date(v.visited_at);
            
            // Track globally requested today vs yesterday stats for daily percent change
            if (visitDate >= startOfToday) {
                todayV++;
                todayPV += 1 + (v.sessionStats?.sections.length || 0);
                if (!v.sessionStats?.isEngaged && (v.sessionStats?.maxScroll || 0) < 25) todayBounces++;
            } else if (visitDate >= startOfYesterday && visitDate < startOfToday) {
                yesterdayV++;
                yesterdayPV += 1 + (v.sessionStats?.sections.length || 0);
                if (!v.sessionStats?.isEngaged && (v.sessionStats?.maxScroll || 0) < 25) yesterdayBounces++;
            }

            if (visitDate < startDate) return; // Skip older

            const dateStr = visitDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!daysMap.has(dateStr)) return; // Failsafe
            
            const stats = daysMap.get(dateStr)!;
            
            // 1 visit = 1 visitor
            stats.Visitors += 1;
            totalV += 1;
            
            // Page views = 1 (initial load) + distinct sections explicitly scrolled to
            const pv = 1 + (v.sessionStats?.sections.length || 0);
            stats.PageViews += pv;
            totalPV += pv;
            
            // Bounce = scroll < 25% and time < 10s (i.e. not engaged at all, almost zero events)
            const isBounce = !v.sessionStats?.isEngaged && (v.sessionStats?.maxScroll || 0) < 25;
            if (isBounce) {
                stats.Bounces += 1;
                totalBounces += 1;
            }
        });

        const sortedData = Array.from(daysMap.entries()).map(([date, stats]) => ({
            date,
            Visitors: stats.Visitors,
            PageViews: stats.PageViews,
            BounceRate: stats.Visitors > 0 ? Math.round((stats.Bounces / stats.Visitors) * 100) : 0
        }));

        const globalBounceRate = totalV > 0 ? Math.round((totalBounces / totalV) * 100) : 0;
        
        const todayBounceRate = todayV > 0 ? Math.round((todayBounces / todayV) * 100) : 0;
        const yesterdayBounceRate = yesterdayV > 0 ? Math.round((yesterdayBounces / yesterdayV) * 100) : 0;

        return { 
            chartData: sortedData, 
            totals: { Visitors: totalV, PageViews: totalPV, BounceRate: globalBounceRate },
            todayTotals: { Visitors: todayV, PageViews: todayPV, BounceRate: todayBounceRate },
            yesterdayTotals: { Visitors: yesterdayV, PageViews: yesterdayPV, BounceRate: yesterdayBounceRate }
        };
    }, [visits]);

    // Percentage pill component matching Vercel's style
    const PercentPill = ({ current, previous, inverseGood = false }: { current: number, previous: number, inverseGood?: boolean }) => {
        if (previous === 0 && current === 0) return null;
        
        let diff = current - previous;
        let percentChange = previous > 0 ? Math.round((Math.abs(diff) / previous) * 100) : 100;
        
        // For bounce rate, the "difference" might just be absolute points, but Vercel shows relative % change.
        const isPositive = diff > 0;
        const isNegative = diff < 0;
        
        if (diff === 0) {
            return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate/10 text-slate">0%</span>;
        }

        let isGood = isPositive;
        if (inverseGood) {
            isGood = isNegative; // for bounce rate, dropping is good
        }

        const colorClass = isGood ? 'bg-green/10 text-green' : 'bg-red-500/10 text-red-500';
        const sign = isPositive ? '+' : '-';

        return <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${colorClass}`}>{sign}{percentChange}%</span>;
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-navy-light border border-slate/20 p-3 rounded-md shadow-xl">
                    <p className="text-slate text-xs mb-2">{label}</p>
                    {payload.map((entry: any) => (
                        <div key={entry.name} className="flex items-center gap-2 text-sm font-medium">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                            <span className="text-light-slate">{entry.name}:</span>
                            <span className="text-white">{entry.value}{entry.name === 'BounceRate' ? '%' : ''}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-[#0a0a0a] border border-slate/10 rounded-lg overflow-hidden flex flex-col mt-6">
            {/* KPI Headers styled like Vercel */}
            <div className="flex border-b border-slate/10 divide-x divide-slate/10">
                <div 
                    onClick={() => setActiveMetric('Visitors')}
                    className={`p-5 flex-1 cursor-pointer hover:bg-white/5 transition border-t-2 ${activeMetric === 'Visitors' ? 'border-t-white bg-white/5' : 'border-t-transparent'}`}
                >
                    <p className={`text-xs font-medium mb-1 ${activeMetric === 'Visitors' ? 'text-white' : 'text-slate'}`}>Visitors</p>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{totals.Visitors}</span>
                        <PercentPill current={todayTotals.Visitors} previous={yesterdayTotals.Visitors} />
                    </div>
                </div>
                <div 
                    onClick={() => setActiveMetric('PageViews')}
                    className={`p-5 flex-1 cursor-pointer hover:bg-white/5 transition border-t-2 ${activeMetric === 'PageViews' ? 'border-t-white bg-white/5' : 'border-t-transparent'}`}
                >
                    <p className={`text-xs font-medium mb-1 ${activeMetric === 'PageViews' ? 'text-white' : 'text-slate'}`}>Page Views</p>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{totals.PageViews}</span>
                        <PercentPill current={todayTotals.PageViews} previous={yesterdayTotals.PageViews} />
                    </div>
                </div>
                <div 
                    onClick={() => setActiveMetric('BounceRate')}
                    className={`p-5 flex-1 cursor-pointer hover:bg-white/5 transition border-t-2 ${activeMetric === 'BounceRate' ? 'border-t-white bg-white/5' : 'border-t-transparent'}`}
                >
                    <p className={`text-xs font-medium mb-1 ${activeMetric === 'BounceRate' ? 'text-white' : 'text-slate'}`}>Bounce Rate</p>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{totals.BounceRate}%</span>
                        <PercentPill current={todayTotals.BounceRate} previous={yesterdayTotals.BounceRate} inverseGood={true} />
                    </div>
                </div>
                <div className="p-5 flex-[2] hidden md:block border-t-2 border-transparent"></div>
            </div>

            {/* Chart Area */}
            <div className="p-6 h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0070f3" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#0070f3" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#888', fontSize: 12 }} 
                            minTickGap={30} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#888', fontSize: 12 }} 
                            allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#444', strokeWidth: 1, strokeDasharray: '5 5' }} />
                        <Area 
                            type="monotone" 
                            dataKey={activeMetric} 
                            stroke="#0070f3" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorMetric)" 
                            activeDot={{ r: 4, fill: '#0070f3', stroke: '#fff', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
