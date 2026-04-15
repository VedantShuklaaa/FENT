'use client';
import { motion } from 'framer-motion';
import { tokens, TokenMeta, TokenId } from '@/lib/chartData/chartData';

interface TokenSelectorProps {
    activeId: TokenId;
    onChange: (id: TokenId) => void;
}

function TokenTab({
    token,
    active,
    onClick,
}: {
    token: TokenMeta;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            aria-pressed={active}
            className="
        token-tab relative flex items-center gap-[7px] bg-none px-[18px] py-[11px]
        font-[family-name:var(--font-sans)] text-[12px] font-medium tracking-[-0.01em]
        text-[var(--color-text-tertiary)] transition-colors duration-150
        hover:text-[var(--color-text-primary)]
        aria-pressed:text-[var(--color-text-primary)]
      "
        >
            <span
                className="h-[6px] w-[6px] shrink-0 rounded-full"
                style={{ background: token.color }}
                aria-hidden
            />
            <span className="font-[family-name:var(--font-mono)] text-[11px]">
                {token.id}
            </span>

            {active && (
                <motion.span
                    layoutId="token-underline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-[2px]"
                    style={{ background: token.color }}
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                />
            )}
        </button>
    );
}

export default function TokenSelector({ activeId, onChange }: TokenSelectorProps) {
    return (
        <div className="flex [border-bottom:var(--border)] [background:var(--color-bg-surface)]">
            {tokens.map((t: any) => (
                <TokenTab
                    key={t.id}
                    token={t}
                    active={t.id === activeId}
                    onClick={() => onChange(t.id)}
                />
            ))}
        </div>
    );
}