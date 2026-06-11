import { CSSProperties, ReactNode } from 'react';

export function Panel({
    title,
    meta,
    right,
    flush = false,
    children,
    className = '',
    style,
}: {
    title?: ReactNode;
    meta?: ReactNode;
    right?: ReactNode;
    flush?: boolean;
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
}) {
    return (
        <section className={`panel ${className}`} style={style}>
            {(title || meta || right) && (
                <header className="panel-head">
                    <h3>{title}</h3>
                    <span className="spacer" />
                    {meta && <span className="meta">{meta}</span>}
                    {right}
                </header>
            )}
            <div className={`panel-body${flush ? ' flush' : ''}`}>{children}</div>
        </section>
    );
}
