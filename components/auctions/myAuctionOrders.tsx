'use client';
import { activeAuction, fmtPrice, fmtSol } from '@/lib/auctionData/auctionData';
import Panel from '@/components/dashboard/panel';

type FillStatus = 'filled' | 'partial' | 'pending' | 'cancelled';

interface MyOrder {
    id: string;
    side: 'buy' | 'sell';
    tokenType: 'PT' | 'YT';
    amount: number;
    price: number;
    filledPct: number;       // 0–100
    status: FillStatus;
    submittedAt: string;
}

// Mock — replace with wallet-filtered on-chain query
const myOrders: MyOrder[] = [
    { id: 'o1', side: 'buy', tokenType: 'PT', amount: 42.0, price: 0.9712, filledPct: 100, status: 'filled', submittedAt: '14:02:18' },
    { id: 'o2', side: 'buy', tokenType: 'YT', amount: 200.0, price: 0.0200, filledPct: 60, status: 'partial', submittedAt: '13:48:05' },
    { id: 'o3', side: 'buy', tokenType: 'PT', amount: 80.0, price: 0.9680, filledPct: 0, status: 'pending', submittedAt: '13:21:33' },
];

const statusConfig: Record<FillStatus, { label: string; bg: string; color: string; border: string }> = {
    filled: { label: 'Filled', bg: 'var(--color-accent-bg)', color: 'var(--color-accent-text)', border: 'var(--color-accent-border)' },
    partial: { label: 'Partial', bg: 'var(--color-yt-bg)', color: 'var(--color-yt)', border: 'var(--color-yt-border)' },
    pending: { label: 'Pending', bg: 'var(--color-bg-muted)', color: 'var(--color-text-tertiary)', border: 'var(--color-border-soft)' },
    cancelled: { label: 'Cancelled', bg: '#FBF0E8', color: '#8A4E1A', border: '#E8D5B0' },
};

function FillBar({ pct, status }: { pct: number; status: FillStatus }) {
    const fillColor =
        status === 'filled' ? 'var(--color-accent)' :
            status === 'partial' ? 'var(--color-yt-fill)' :
                'var(--color-bg-muted)';

    return (
        <div className={`flex items-center justify-end gap-7 `}>
            <div className={`inline-block h-[3px] w-[48px] overflow-hidden rounded-[2px] bg-(--color-bg-muted) align-middle`}>
                <div className={`h-full rounded-[2px] bg-[fillColor]`} style={{ width: `${pct}%` }} />
            </div>
            <span className={`min-w-[28px] text-right font-(--font-mono) text-[10px] tabular-nums text-(--color-text-secondary)`}>{pct}%</span>
        </div>
    );
}

function OrderRow({
    order
}: {
    order: MyOrder
}) {
    const cfg = statusConfig[order.status];
    const isBuy = order.side === 'buy';
    const aboveClear = order.price >= activeAuction.clearingPrice;

    return (
        <tr className="mo-row cursor-default">
            <td className={`align-middle whitespace-nowrap px-4 py-[9px] font-(--font-mono) text-[11px] tabular-nums text-(--color-text-primary) transition-[background] duration-[100ms] [border-bottom:var(--border)]`}>
                <span
                    className={`rounded-[3px] px-[6px] py-[2px] font-[var(--font-mono)] text-[9px] uppercase tracking-[0.06em] 0.5px solid ${isBuy ? `bg-(--color-pt-bg) text-(--color-pt) border-(--color-pt-border)` : `bg-[#FBF0E8] text-[#8A4E1A] border-[#E8D5B0]`}`}>
                    {isBuy ? 'Buy' : 'Sell'} {order.tokenType}
                </span>
            </td>
            <td className={`align-middle whitespace-nowrap px-4 py-[9px] text-right font-(--font-mono) text-[11px] tabular-nums text-(--color-text-primary) transition-[background] duration-[100ms] [border-bottom:var(--border)]`}>{order.amount.toFixed(1)} {order.tokenType}</td>
            <td className={`align-middle whitespace-nowrap px-4 py-[9px] text-right font-(--font-mono) text-[11px] tabular-nums text-(--color-text-primary) transition-[background] duration-[100ms] [border-bottom:var(--border)]`}>
                <span className={`${aboveClear ? 'text-(--color-pt-fill)' : 'text-(--color-text-secondary)'}`}>
                    {fmtPrice(order.price)}
                </span>
                {aboveClear && (
                    <span className={`ml-1 font-(--font-mono) text-[9px] text-(--color-pt-fill)`} title="At or above clearing price">↑</span>
                )}
            </td>
            <td className={`align-middle whitespace-nowrap px-4 py-[9px] text-right font-(--font-mono) text-[11px] tabular-nums text-(--color-text-primary) transition-[background] duration-[100ms] [border-bottom:var(--border)]`}>
                <FillBar pct={order.filledPct} status={order.status} />
            </td>
            <td className={`align-middle whitespace-nowrap px-4 py-[9px] text-right font-(--font-mono) text-[11px] tabular-nums text-(--color-text-primary) transition-[background] duration-[100ms] [border-bottom:var(--border)]`}>
                <span style={{ background: cfg.bg, color: cfg.color, border: `0.5px solid ${cfg.border}` }} className={`rounded-[3px] px-[6px] py-[2px] font-(--font-mono) text-[9px] uppercase tracking-[0.06em]`}>
                    {cfg.label}
                </span>
            </td>
            <td className={`align-middle whitespace-nowrap px-4 py-[9px] text-right font-(--font-mono) text-[11px] tabular-nums text-(--color-text-primary) transition-[background] duration-[100ms] [border-bottom:var(--border)]`}>
                {order.submittedAt}
            </td>
        </tr>
    );
}

export default function MyAuctionOrders() {
    const totalFilledSol = myOrders
        .filter((o) => o.status === 'filled' || o.status === 'partial')
        .reduce((acc, o) => acc + (o.amount * o.filledPct / 100) * o.price, 0);

    return (
        <>
            <style>{`.mo-row:hover td { background: var(--color-bg-subtle); }`}</style>
            <Panel title="My Orders · Round #14">
                <div style={{ overflowX: 'auto' }}>
                    <table className={`w-full min-w-[480px] border-collapse`}>
                        <thead>
                            <tr>
                                {['Side', 'Amount', 'Price', 'Fill', 'Status', 'Submitted'].map((h, i) => (
                                    <th key={h} className={`bg-(--color-bg-subtle) px-4 py-[7px] text-[9px] font-normal uppercase tracking-[0.07em] whitespace-nowrap text-(--color-text-tertiary) [border-bottom:var(--border)] ${i > 0 ? "text-right" : "text-left"}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {myOrders.map((o) => <OrderRow key={o.id} order={o} />)}
                        </tbody>
                    </table>
                </div>

                <div className={`flex justify-between bg-(--color-bg-subtle) px-4 py-2 [border-top:var(--border)]`}>
                    <span className={`text-[10px] text-(--color-text-tertiary)`}>
                        {myOrders.length} orders · {myOrders.filter(o => o.status === 'filled').length} filled
                    </span>
                    <span className={`text-[10px] text-(--color-text-tertiary)`}>
                        Total filled:&nbsp;
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                            {fmtSol(totalFilledSol)} SOL
                        </span>
                    </span>
                </div>
            </Panel>
        </>
    );
}

