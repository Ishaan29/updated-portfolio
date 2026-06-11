/* Shared formatting helpers for the operator console (ported from the design mock). */

export const fmtNum = (n: number | null | undefined) =>
    n == null ? '—' : Number(n).toLocaleString('en-US');

export const fmtPct = (n: number | null | undefined) =>
    n == null ? '—' : `${Math.round(n)}%`;

export const fmtDur = (s: number | null | undefined) => {
    if (s == null) return '—';
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const r = Math.round(s % 60);
    return r ? `${m}m ${r}s` : `${m}m`;
};

export const fmtDate = (d: string | Date | null | undefined) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const fmtDateTime = (d: string | number | Date | null | undefined) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

/** Relative time from a past date to now, e.g. "3h ago". */
export const fmtRelative = (d: string | Date | null | undefined) => {
    if (!d) return '—';
    const ms = Date.now() - new Date(d).getTime();
    if (ms < 0) return '—';
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
    if (s < 86400 * 30) return `${Math.floor(s / (86400 * 7))}w ago`;
    return `${Math.floor(s / (86400 * 30))}mo ago`;
};

/* NOTE: deliberately NOT `h-90` etc. — those collide with Tailwind height utilities. */
export const heatClass = (h: number) => {
    if (h >= 80) return 'hl-90';
    if (h >= 60) return 'hl-70';
    if (h >= 40) return 'hl-50';
    if (h >= 20) return 'hl-30';
    return 'hl-00';
};
