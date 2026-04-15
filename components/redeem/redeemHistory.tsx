'use client';
import { motion } from 'framer-motion';
import { redeemHistory } from '@/lib/redeemData/redeemData';
import Panel from '@/components/dashboard/panel';

export default function RedeemHistory() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.22, ease: 'easeOut' }}
        >
            <Panel title="Redemption History">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px] border-collapse">
                        <thead>
                            <tr>
                                {['Type', 'Underlying', 'Amount', 'Received', 'Tx Hash', 'Date'].map((h, i) => (
                                    <th
                                        key={h}
                                        className={`bg-[var(--color-bg-subtle)] px-4 py-[7px] text-left text-[9px] font-normal uppercase tracking-[0.07em] whitespace-nowrap text-[var(--color-text-tertiary)] [border-bottom:var(--border)] ${i > 1 ? 'text-right' : ''
                                            }`}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {redeemHistory.map((r) => {
                                const isPT = r.type === 'PT';

                                return (
                                    <tr key={r.id} className="cursor-default [&:hover_td]:bg-[var(--color-bg-subtle)]">
                                        <td className="align-middle whitespace-nowrap px-4 py-[9px] font-[var(--font-mono)] text-[11px] tabular-nums text-[var(--color-text-primary)] transition-[background] duration-[100ms] [border-bottom:var(--border)]">
                                            <span
                                                className="rounded-[3px] px-[6px] py-[2px] font-[var(--font-mono)] text-[9px] font-medium uppercase tracking-[0.08em]"
                                                style={{
                                                    background: isPT ? 'var(--color-pt-bg)' : 'var(--color-yt-bg)',
                                                    color: isPT ? 'var(--color-pt)' : 'var(--color-yt)',
                                                    border: isPT
                                                        ? '0.5px solid var(--color-pt-border)'
                                                        : '0.5px solid var(--color-yt-border)',
                                                }}
                                            >
                                                {r.type}
                                            </span>
                                        </td>

                                        <td className="align-middle whitespace-nowrap px-4 py-[9px] font-[var(--font-mono)] text-[11px] tabular-nums text-[var(--color-text-primary)] transition-[background] duration-[100ms] [border-bottom:var(--border)]">
                                            {r.underlying}
                                        </td>

                                        <td className="align-middle whitespace-nowrap px-4 py-[9px] text-right font-[var(--font-mono)] text-[11px] tabular-nums text-[var(--color-text-primary)] transition-[background] duration-[100ms] [border-bottom:var(--border)]">
                                            {r.amount.toFixed(1)} {r.type}
                                        </td>

                                        <td className="align-middle whitespace-nowrap px-4 py-[9px] text-right font-[var(--font-mono)] text-[11px] tabular-nums text-[var(--color-positive)] transition-[background] duration-[100ms] [border-bottom:var(--border)]">
                                            {r.received.toFixed(2)} {r.receiveToken}
                                        </td>

                                        <td className="align-middle whitespace-nowrap px-4 py-[9px] text-right font-[var(--font-mono)] text-[11px] tabular-nums text-[var(--color-text-primary)] transition-[background] duration-[100ms] [border-bottom:var(--border)]">
                                            <span className="cursor-pointer text-[var(--color-accent)] underline underline-offset-2">
                                                {r.txHash}
                                            </span>
                                        </td>

                                        <td className="align-middle whitespace-nowrap px-4 py-[9px] text-right font-[var(--font-mono)] text-[11px] tabular-nums text-[var(--color-text-tertiary)] transition-[background] duration-[100ms] [border-bottom:var(--border)]">
                                            {r.date}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Panel>
        </motion.div>
    );
}