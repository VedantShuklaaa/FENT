'use client';
import Panel from '@/components/dashboard/panel';

interface Action {
    label: string;
    sub: string;
    primary?: boolean;
    href?: string;
}

const ACTIONS: Action[] = [
    {
        label: 'Split Position',
        sub: 'Separate LST into PT + YT',
        primary: true,
    },
    {
        label: 'Buy PT',
        sub: 'Fixed yield, principal protected',
    },
    {
        label: 'Buy YT',
        sub: 'Leveraged yield exposure',
    },
    {
        label: 'Redeem',
        sub: 'Claim matured PT or accrued YT',
    },
];

export default function QuickActions() {
    return (
        <Panel title="Actions">
            <div className="flex flex-col gap-[6px] px-[14px] py-3">
                {ACTIONS.map((a) => (
                    <button
                        key={a.label}
                        aria-label={a.label}
                        className={
                            a.primary
                                ? "flex flex-col items-start gap-[2px] rounded-[var(--radius-md)] bg-[var(--color-accent)] px-3 py-[9px] text-left transition-[background] duration-[120ms] hover:bg-[#236650] cursor-pointer"
                                : "flex flex-col items-start gap-[2px] rounded-[var(--radius-md)] [border:var(--border-md)] bg-[var(--color-bg-surface)] px-3 py-[9px] text-left transition-[background,border-color] duration-[120ms] hover:bg-[var(--color-bg-subtle)] hover:border-[var(--color-border-medium)] cursor-pointer"
                        }
                    >
                        <span
                            className={
                                a.primary
                                    ? "font-[var(--font-sans)] text-[12px] font-medium leading-none text-[#E8F5F0]"
                                    : "font-[var(--font-sans)] text-[12px] font-medium leading-none text-[var(--color-text-primary)]"
                            }
                        >
                            {a.label}
                        </span>

                        <span
                            className={
                                a.primary
                                    ? "font-[var(--font-sans)] text-[10px] leading-[1.4] text-[rgba(232,245,240,0.65)]"
                                    : "font-[var(--font-sans)] text-[10px] leading-[1.4] text-[var(--color-text-tertiary)]"
                            }
                        >
                            {a.sub}
                        </span>
                    </button>
                ))}
            </div>
        </Panel>
    );
}