import { heatClass } from '../lib/format';

export function HeatBadge({ score }: { score: number }) {
    return <span className={`heat ${heatClass(score)}`}>{score > 0 ? score : '—'}</span>;
}
