'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RedeemableItem } from '@/lib/redeemData/redeemData';

interface RedeemCardProps {
    item: RedeemableItem;
    index: number;
}

type CardState = 'idle' | 'confirming' | 'success';

// ─── Success checkmark ─────────────────────────────────────────

function SuccessState({
    item
}: {
    item: RedeemableItem
}) {
    return (
        <motion.div
            className="flex min-h-[180px] flex-col items-center justify-center gap-[10px] px-6 py-[36px]"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            <motion.div
                className="mb-[4px] flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent)]"
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.08, duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
            >
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#E8F5F0" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </motion.div>
            <p className="font-[var(--font-sans)] text-[14px] font-medium text-[var(--color-text-primary)]">
                Redeemed
            </p>
            <p className="text-center font-[var(--font-mono)] text-[11px] leading-[1.5] text-[var(--color-text-tertiary)]">
                {item.receiveAmount.toFixed(2)} {item.receiveToken} sent to your wallet
            </p>
        </motion.div>
    );
}

// ─── Confirm overlay ───────────────────────────────────────────

function ConfirmModal({
    item,
    onConfirm,
    onCancel,
}: {
    item: RedeemableItem;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <motion.div
            className="absolute inset-0 z-10 flex items-center justify-center bg-[rgba(245,244,241,0.88)] p-4 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
        >
            <motion.div
                className="w-full rounded-[var(--radius-lg)] border-[var(--border-md)] bg-[var(--color-bg-surface)] px-5 py-[18px]"
                initial={{ scale: 0.95, opacity: 0, y: 6 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 6 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
            >
                <p className="mb-[2px] text-[13px] font-medium text-[var(--color-text-primary)]">
                    Confirm redemption
                </p>
                <p className="mb-[14px] text-[11px] text-[var(--color-text-tertiary)]">
                    This action is irreversible on-chain.
                </p>

                <div className="mb-2 flex items-baseline justify-between">
                    <span className="text-[10px] tracking-[0.04em] text-[var(--color-text-tertiary)]">
                        You redeem
                    </span>
                    <span className="font-[var(--font-mono)] text-[12px] tabular-nums text-[var(--color-text-primary)]">
                        {item.amount.toFixed(2)} {item.type} · {item.underlying}
                    </span>
                </div>

                <div className="mb-2 flex items-baseline justify-between">
                    <span className="text-[10px] tracking-[0.04em] text-[var(--color-text-tertiary)]">
                        You receive
                    </span>
                    <span className="font-[var(--font-mono)] text-[12px] tabular-nums text-[var(--color-positive)]">
                        {item.receiveAmount.toFixed(2)} {item.receiveToken}
                    </span>
                </div>

                <div className="mt-4 flex gap-2">
                    <button
                        className="flex-1 rounded-[var(--radius-md)] border-[var(--border-md)] bg-[var(--color-bg-subtle)] px-0 py-[8px] font-[var(--font-sans)] text-[12px] font-medium text-[var(--color-text-secondary)] transition-[background] duration-[100ms] hover:bg-[var(--color-bg-subtle)]"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        className="flex-1 rounded-[var(--radius-md)] bg-[var(--color-accent)] px-0 py-[8px] font-[var(--font-sans)] text-[12px] font-medium text-[#E8F5F0] transition-[background] duration-[120ms] hover:bg-[var(--color-accent)]"
                        onClick={onConfirm}
                    >
                        Confirm
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Main card ─────────────────────────────────────────────────

export default function RedeemCard({
    item,
    index
}: RedeemCardProps) {
    const [state, setState] = useState<CardState>('idle');
    const isPT = item.type === 'PT';

    return (
        <motion.div
            className="relative overflow-hidden rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--color-bg-surface)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.07, ease: 'easeOut' }}
            layout
        >
            <AnimatePresence mode="wait">
                {state === 'success' && <SuccessState key="success" item={item} />}

                {state !== 'success' && (
                    <motion.div
                        key="body"
                        className="relative"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Type tag + underlying */}
                        <div className="flex items-center justify-between border-b-[var(--border)] bg-[var(--color-bg-subtle)] px-4 py-3">
                            <div className="flex items-center gap-[10px]">
                                <span
                                    className="rounded-[3px] px-[7px] py-[2px] font-[var(--font-mono)] text-[9px] font-medium uppercase tracking-[0.08em]"
                                    style={{
                                        background: isPT ? 'var(--color-pt-bg)' : 'var(--color-yt-bg)',
                                        color: isPT ? 'var(--color-pt)' : 'var(--color-yt)',
                                        border: isPT
                                            ? '0.5px solid var(--color-pt-border)'
                                            : '0.5px solid var(--color-yt-border)',
                                    }}
                                >
                                    {item.type}
                                </span>

                                <span className="flex items-center gap-[5px] font-[var(--font-mono)] text-[11px] text-[var(--color-text-secondary)]">
                                    <span
                                        className="h-[6px] w-[6px] shrink-0 rounded-full"
                                        style={{ background: item.underlyingColor }}
                                    />
                                    {item.underlying}
                                </span>
                            </div>

                            <span className="rounded-[3px] border-[0.5px] border-[var(--color-accent-border)] bg-[var(--color-accent-bg)] px-[7px] py-[2px] font-[var(--font-mono)] text-[9px] uppercase tracking-[0.06em] text-[var(--color-accent-text)]">
                                {item.maturedDaysAgo === 0 ? 'Accrued' : `Matured ${item.maturedDaysAgo}d ago`}
                            </span>
                        </div>

                        {/* Amounts */}
                        <div className="flex items-center gap-4 px-4 pb-4 pt-5">
                            <div className="flex-1">
                                <p className="mb-1 text-[10px] uppercase tracking-[0.07em] text-[var(--color-text-tertiary)]">
                                    {isPT ? 'PT to redeem' : 'YT yield to claim'}
                                </p>
                                <p className="font-[var(--font-mono)] text-[22px] font-medium leading-[1.1] tabular-nums text-[var(--color-text-primary)]">
                                    {item.amount.toFixed(2)}
                                    <span className="text-[13px] font-normal text-[var(--color-text-tertiary)]">
                                        {' '}
                                        {item.type}
                                    </span>
                                </p>
                            </div>

                            <div className="shrink-0 pt-4 font-[var(--font-mono)] text-[16px] text-[var(--color-text-tertiary)]">
                                →
                            </div>

                            <div className="flex-1">
                                <p className="mb-1 text-[10px] uppercase tracking-[0.07em] text-[var(--color-text-tertiary)]">
                                    You receive
                                </p>
                                <p className="font-[var(--font-mono)] text-[22px] font-medium leading-[1.1] tabular-nums text-[var(--color-positive)]">
                                    {item.receiveAmount.toFixed(2)}
                                    <span className="text-[13px] font-normal text-[var(--color-text-tertiary)]">
                                        {' '}
                                        {item.receiveToken}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Maturity detail */}
                        <div className="flex justify-between px-4 pb-[14px]">
                            <span className="text-[10px] tracking-[0.04em] text-[var(--color-text-tertiary)]">
                                Maturity
                            </span>
                            <span className="font-[var(--font-mono)] text-[10px] text-[var(--color-text-secondary)]">
                                {item.maturityDate}
                            </span>
                        </div>

                        {/* Redeem button */}
                        <div className="px-4 pb-4">
                            <button
                                className="w-full rounded-[var(--radius-md)] bg-[var(--color-accent)] py-[10px] font-[var(--font-sans)] text-[13px] font-medium tracking-[0.01em] text-[#E8F5F0] transition-[background] duration-[150ms] hover:bg-[var(--color-accent)]"
                                onClick={() => setState('confirming')}
                                aria-label={`Redeem ${item.amount.toFixed(2)} ${item.type}`}
                            >
                                Redeem {item.receiveAmount.toFixed(2)} {item.receiveToken}
                            </button>
                        </div>

                        {/* Confirm modal */}
                        <AnimatePresence>
                            {state === 'confirming' && (
                                <ConfirmModal
                                    item={item}
                                    onCancel={() => setState('idle')}
                                    onConfirm={() => setState('success')}
                                />
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}