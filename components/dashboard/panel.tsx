'use client';
import React from 'react';

interface PanelAction {
    label: string;
    onClick: () => void;
}

interface PanelProps {
    title: string;
    action?: PanelAction;
    children: React.ReactNode;
}

export default function Panel({
    title,
    action,
    children,
}: PanelProps) {
    return (
        <section className={`bg-(--color-bg-surface) border [border:var(--border)] rounded-lg overflow-hidden`} aria-label={title}>
            <div className={`flex items-center justify-between border-b-(--border) px-4 pt-[12px] pb-[11px]`}>
                <h2 className={`text-[11px] font-medium uppercase tracking-[0.07em] text-(--color-text-secondary)`}>{title}</h2>
                {action && (
                    <button
                        onClick={action.onClick}
                        aria-label={action.label}
                        className={`hover:text-(--color-accent-text)! text-decoration-line bg-transparent border-none p-0 text-[11px] font-(--font-sans) tracking-[0.01em] text-(--color-accent) cursor-pointer hover:text-(--color-accent-hover) transition-colors duration-[100ms]`}
                    >
                        {action.label}
                    </button>
                )}
            </div>
            <div>{children}</div>
        </section>
    );
}

