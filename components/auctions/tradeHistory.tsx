'use client';
import { tradeHistory, fmtPrice, fmtSol, TradeHistoryEntry } from '@/lib/auctionData/auctionData';
import Panel from '@/components/dashboard/panel';

function SidePill({
    side,
    tokenType
}: {
    side: 'buy' | 'sell';
    tokenType: 'PT' | 'YT'
}) {
    const isBuy = side === 'buy';
    const isPT = tokenType === 'PT';
    return (
        <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.06em',
            textTransform: 'uppercase' as const,
            padding: '2px 6px',
            borderRadius: 3,
            whiteSpace: 'nowrap' as const,
            background: isBuy
                ? (isPT ? 'var(--color-pt-bg)' : 'var(--color-accent-bg)')
                : 'rgba(251,240,232,1)',
            color: isBuy
                ? (isPT ? 'var(--color-pt)' : 'var(--color-accent-text)')
                : '#8A4E1A',
            border: isBuy
                ? (isPT ? '0.5px solid var(--color-pt-border)' : '0.5px solid var(--color-accent-border)')
                : '0.5px solid #E8D5B0',
        }}>
            {isBuy ? 'Buy' : 'Sell'} {tokenType}
        </span>
    );
}

function TradeRow({
    trade
}: {
    trade: TradeHistoryEntry
}) {
    return (
        <tr className="th-row cursor-default">
            <td className={`align-middle whitespace-nowrap px-4 py-[8px] font-(--font-mono) text-[11px] tabular-nums text-(--color-text-primary) transition-[background] duration-[100ms] [border-bottom:var(--border)]`}><SidePill side={trade.side} tokenType={trade.tokenType} /></td>
            <td className={`align-middle whitespace-nowrap px-4 py-[8px] text-right font-(--font-mono) text-[11px] tabular-nums text-(--color-text-primary) transition-[background] duration-[100ms] [border-bottom:var(--border)]`}>{trade.amount.toFixed(1)}</td>
            <td className={`align-middle whitespace-nowrap px-4 py-[8px] text-right font-(--font-mono) text-[11px] tabular-nums text-(--color-text-primary) transition-[background] duration-[100ms] [border-bottom:var(--border)]`}>{fmtPrice(trade.price)}</td>
            <td className={`align-middle whitespace-nowrap px-4 py-[8px] text-right font-(--font-mono) text-[11px] tabular-nums text-(--color-text-primary) transition-[background] duration-[100ms] [border-bottom:var(--border)]`}>{fmtSol(trade.valueSol)}</td>
            <td className={`align-middle whitespace-nowrap px-4 py-[8px] text-right font-(--font-mono) text-[11px] tabular-nums text-(--color-text-primary) transition-[background] duration-[100ms] [border-bottom:var(--border)]`}>
                <span className={`text-[10px] text-(--color-text-tertiary)`}>{trade.wallet}</span>
            </td>
            <td className={`align-middle whitespace-nowrap px-4 py-[8px] text-right font-(--font-mono) text-[11px] tabular-nums text-(--color-text-primary) transition-[background] duration-[100ms] [border-bottom:var(--border)]`}>
                <span className={`cursor-pointer text-[10px] text-(--color-accent) underline underline-offset-2`}>{trade.txHash}</span>
            </td>
            <td className={`align-middle whitespace-nowrap px-4 py-[8px] text-right font-(--font-mono) text-[11px] tabular-nums text-(--color-text-primary) transition-[background] duration-[100ms] [border-bottom:var(--border)]`}>
                {trade.timestamp}
            </td>
        </tr>
    );
}

export default function TradeHistory() {
    return (
        <>
            <Panel title={`Trade History · Round #14`}>
                <div style={{ overflowX: 'auto' }}>
                    <table className={`w-full min-w-[620px] border-collapse`}>
                        <thead>
                            <tr>
                                {['Side', 'Amount', 'Price', 'Value (SOL)', 'Wallet', 'Tx Hash', 'Time'].map((h, i) => (
                                    <th key={h} className={`bg-(--color-bg-subtle) px-4 py-[7px] text-[9px] font-normal uppercase tracking-[0.07em] whitespace-nowrap text-(--color-text-tertiary) [border-bottom:var(--border)] ${i > 0 ? "text-right" : "text-left"}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tradeHistory.map((t) => <TradeRow key={t.id} trade={t} />)}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className={`flex justify-between bg-(--color-bg-subtle) px-4 py-2 [border-top:var(--border)]`}>
                    <span className={`text-[10px] text-(--color-text-tertiary)`}>{tradeHistory.length} trades this round</span>
                    <span className={`text-[10px] text-(--color-text-tertiary)`}>
                        Total volume:&nbsp;
                        <span className={`font-(--font-mono) tabular-nums text-(--color-text-secondary)`}>
                            {fmtSol(tradeHistory.reduce((acc, t) => acc + t.valueSol, 0))} SOL
                        </span>
                    </span>
                </div>
            </Panel>
        </>
    );
}

