export function StatusChip({ status }: { status: string }) {
    const stage = (status || 'sent').toLowerCase();
    return (
        <span className={`stat ${stage}`}>
            <span className="pip" />
            {stage}
        </span>
    );
}
