'use client';
import { motion } from 'framer-motion';

const notes = [
    {
        dot: 'var(--color-pt-fill)',
        text: 'PT redeems 1:1 for the underlying LST at maturity. You receive exactly what you put in, plus the fixed yield baked into the discount.',
    },
    {
        dot: 'var(--color-yt-fill)',
        text: 'YT claims the yield accrued since your position was opened. Value is zero at maturity — claim before the deadline.',
    },
    {
        dot: 'var(--color-text-tertiary)',
        text: 'Redemptions settle on-chain in the same transaction. Gas is paid in SOL and deducted from your wallet automatically.',
    },
];

export default function RedeemNote() {
    return (
        <motion.div
            className="flex flex-col gap-[10px] rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--color-bg-surface)] px-4 py-[14px] "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
        >
            {notes.map((n, i) => (
                <div key={i} className="flex items-start gap-[10px]">
                    <span
                        className="mt-[5px] h-[5px] w-[5px] shrink-0 rounded-full"
                        style={{ background: n.dot }}
                        aria-hidden
                    />
                    <p className="text-[11px] leading-[1.65] text-[var(--color-text-secondary)]">
                        {n.text}
                    </p>
                </div>
            ))}
        </motion.div>
    );
}