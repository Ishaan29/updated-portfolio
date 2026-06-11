export function Sparkline({
    data,
    width = 84,
    height = 18,
    color = 'var(--accent)',
}: {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
}) {
    if (!data || data.length === 0) return <svg width={width} height={height} className="sparkcell" />;

    const max = Math.max(1, ...data);
    const stepX = width / (data.length - 1 || 1);
    const points = data.map((v, i) => {
        const x = i * stepX;
        const y = height - (v / max) * (height - 2) - 1;
        return [x, y] as const;
    });
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
    const fillPath = `${path} L${width},${height} L0,${height} Z`;
    const last = points[points.length - 1];

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="sparkcell">
            <path d={fillPath} fill={color} opacity="0.18" />
            <path d={path} fill="none" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={last[0]} cy={last[1]} r="1.6" fill={color} />
        </svg>
    );
}
