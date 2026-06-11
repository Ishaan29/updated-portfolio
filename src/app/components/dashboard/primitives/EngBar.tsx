export function EngBar({ engaged, total }: { engaged: number; total: number }) {
    const pct = total ? Math.round((engaged / total) * 100) : 0;
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontVariantNumeric: 'tabular-nums' }}>
            <span className="num" style={{ color: 'var(--fg)', minWidth: 36, textAlign: 'right' }}>
                {engaged}/{total}
            </span>
            <span className="engbar">
                <i style={{ width: `${pct}%` }} />
            </span>
        </span>
    );
}
