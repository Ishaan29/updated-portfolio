import { DashboardData } from './lib/types';
import { KpiStrip } from './KpiStrip';
import { SignalsBanner } from './SignalsBanner';
import { TimelineChart } from './TimelineChart';
import { FunnelChart } from './FunnelChart';
import { Heatmap } from './Heatmap';
import { ChannelMix } from './ChannelMix';
import { SectionDwell } from './SectionDwell';

export function OverviewTab({
    data,
    onOpenLead,
}: {
    data: DashboardData | null;
    onOpenLead?: (companyId: string) => void;
}) {
    if (!data) return <div className="loading-msg">Awaiting telemetry…</div>;

    return (
        <>
            <KpiStrip data={data} />
            <SignalsBanner alerts={data.alerts} onOpenLead={onOpenLead} />
            <TimelineChart data={data.dailySeries} />

            <div className="row r-1-1">
                <FunnelChart funnel={data.funnel} />
                <Heatmap data={data.heatmap} />
            </div>

            <div className="row r-1-2">
                <ChannelMix byChannel={data.byChannel} />
                <SectionDwell dwell={data.sectionDwell} />
            </div>
        </>
    );
}
