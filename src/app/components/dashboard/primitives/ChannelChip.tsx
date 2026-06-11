export function ChannelChip({ channel }: { channel: string }) {
    if (!channel) return null;
    return <span className={`ch ${channel}`}>{channel}</span>;
}
