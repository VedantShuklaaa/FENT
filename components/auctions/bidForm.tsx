'use client';
import React, { useState, useCallback } from 'react';
import { activeAuction, fmtPrice, fmtPct } from '@/lib/auctionData/auctionData';
import Panel from '@/components/dashboard/panel';

type Side = 'buy' | 'sell';
type TokenType = 'PT' | 'YT';

export default function BidForm() {
    const [side, setSide] = useState<Side>('buy');
    const [token, setToken] = useState<TokenType>('PT');
    const [amount, setAmount] = useState('');
    const [price, setPrice] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const a = activeAuction;
    const pNum = parseFloat(price) || 0;
    const aNum = parseFloat(amount) || 0;

    // Implied yield from submitted price (simplified: discount = 1 - price, annualised)
    const impliedYield = pNum > 0
        ? (((1 - pNum) / pNum) * (365 / a.daysToMaturity) * 100)
        : null;

    // Estimated fill: price at or above clearing → likely fill
    const likelyFill = pNum >= a.clearingPrice;

    const handleSubmit = useCallback(() => {
        if (!pNum || !aNum) return;
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 2400);
    }, [pNum, aNum]);

    return (
        <Panel title={`Place Order · Round #${a.round}`}>
            {/* Side tabs */}
            <div className={`flex [border-bottom:var(--border)]`}>
                {(['buy', 'sell'] as Side[]).map((t) => (
                    <button
                        key={t}
                        className={`flex-1 border-none bg-transparent py-[9px] text-[12px] font-(--font-sans) font-medium tracking-[0.01em] cursor-pointer transition-[background,color] duration-[120ms]
                             ${side === t ? t === "buy" ?
                                `bg-(--color-pt-bg) text-(--color-pt) border-b-2 border-(--color-pt-fill)` :
                                `bg-(--color-yt-bg) text-(--color-yt) border-b-2 border-(--color-yt-fill)` :
                                `text-(--color-text-tertiary)`}`}
                        onClick={() => setSide(t)}
                        aria-pressed={side === t}
                    >
                        {t === 'buy' ? 'Buy (Bid)' : 'Sell (Ask)'}
                    </button>
                ))}
            </div>

            <div className='flex flex-col gap-3 px-4 py-[14px]'>
                {/* Token selector */}
                <div className='flex flex-col gap-[5px]'>
                    <label className='text-[10px] uppercase tracking-[0.07em] text-(--color-text-tertiary)'>Token</label>
                    <div className='flex gap-2'>
                        {(['PT', 'YT'] as TokenType[]).map((tk) => (
                            <button
                                key={tk}
                                className={`flex flex-1 cursor-pointer flex-col items-start gap-[2px] rounded-(--radius-md) border-[0.5px] border-(--color-border-medium) bg-(--color-bg-surface) px-[10px] py-[8px] transition-[background,border-color] duration-[100ms]
                                     ${token === tk
                                        ? (tk === 'PT' ?
                                            `bg-(--color-pt-bg) border-(--color-pt-border)` :
                                            `bg-(--color-yt-bg) border-(--color-yt-border)`)
                                        : `bg-(--color-bg-subtle)`}`}
                                onClick={() => setToken(tk)}
                                aria-pressed={token === tk}
                            >
                                <span className={`font-(--font-mono) text-[12px] font-medium text-(--color-text-primary)`}>{tk}</span>
                                <span className={`text-[10px] text-(--color-text-tertiary)`}>
                                    {tk === 'PT' ? 'Principal Token' : 'Yield Token'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Amount */}
                <div className={`flex flex-col gap-[5px]`}>
                    <label className={`text-[10px] uppercase tracking-[0.07em] text-(--color-text-tertiary)`} htmlFor="bid-amount">
                        Amount ({token})
                    </label>
                    <div className={`flex items-center overflow-hidden rounded-md border-[0.5px] border-(--color-border-medium) bg-(--color-bg-surface)`}>
                        <input
                            id="bid-amount"
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className={`flex-1 border-none bg-transparent px-[10px] py-[8px] font-(--font-mono) text-[13px] tabular-nums text-(--color-text-primary) outline-none`}
                            min="0"
                            step="0.01"
                        />
                        <span className={`flex h-full items-center border-l-[0.5px] border-(--color-border-soft) bg-(--color-bg-subtle) px-[10px] py-[9px] font-(--font-mono) text-[10px] text-(--color-text-tertiary)`}>{token}</span>
                    </div>
                </div>

                {/* Price */}
                <div className={`flex flex-col gap-[5px]`}>
                    <label className={`text-[10px] uppercase tracking-[0.07em] text-(--color-text-tertiary)`} htmlFor="bid-price">
                        Price ({a.underlying} per {token})
                    </label>
                    <div className={`flex items-center overflow-hidden rounded-md border-[0.5px] border-(--color-border-medium) bg-(--color-bg-surface)`}>
                        <input
                            id="bid-price"
                            type="number"
                            placeholder={fmtPrice(a.clearingPrice)}
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className={`flex-1 border-none bg-transparent px-[10px] py-[8px] font-(--font-mono) text-[13px] tabular-nums text-(--color-text-primary) outline-none`}
                            min={a.minBid}
                            max={a.maxBid}
                            step="0.0001"
                        />
                        <span className={`flex h-full items-center border-l-[0.5px] border-(--color-border-soft) bg-(--color-bg-subtle) px-[10px] py-[9px] font-(--font-mono) text-[10px] text-(--color-text-tertiary)`}>{a.underlying}</span>
                    </div>
                    <div className={`flex justify-between`}>
                        <span className={`font-(--font-mono) text-[9px] tracking-[0.04em] text-(--color-text-tertiary)`}>Min {fmtPrice(a.minBid)}</span>
                        <span className={`font-(--font-mono) text-[9px] tracking-[0.04em] text-(--color-text-tertiary)`}>Clearing {fmtPrice(a.clearingPrice)}</span>
                        <span className={`font-(--font-mono) text-[9px] tracking-[0.04em] text-(--color-text-tertiary)`}>Max {fmtPrice(a.maxBid)}</span>
                    </div>
                </div>

                {/* Preview metrics */}
                {pNum > 0 && aNum > 0 && (
                    <div className={`flex flex-col gap-[6px] rounded-md bg-(--color-bg-subtle) px-[12px] py-[10px] [border:var(--border)]`}>
                        <div className={`flex items-baseline justify-between`}>
                            <span className={`text-[10px] text-(--color-text-tertiary)`}>Total cost</span>
                            <span className={`font-(--font-mono) text-[11px] tabular-nums text-(--color-text-primary)`}>{(pNum * aNum).toFixed(4)} {a.underlying}</span>
                        </div>
                        {token === 'PT' && impliedYield !== null && (
                            <div className={`flex items-baseline justify-between`}>
                                <span className={`text-[10px] text-(--color-text-tertiary)`}>Implied yield at price</span>
                                <span className={`font-(--font-mono) text-[11px] tabular-nums text-(--color-text-primary) 
                                    ${impliedYield > a.impliedYield
                                        ? `text-(--color-positive)`
                                        : `text-(--color-text-primary)`
                                    }`}>
                                    {fmtPct(impliedYield)}
                                </span>
                            </div>
                        )}
                        <div className={`flex items-baseline justify-between`}>
                            <span className={`text-[10px] text-(--color-text-tertiary)`}>Likely to fill</span>
                            <span className={`font-(--font-mono) text-[11px] tabular-nums text-(--color-text-primary) ${likelyFill ? `text-(--color-positive)` : `text-(--color-yt)`}`}>
                                {likelyFill ? 'Yes — at or above clearing' : 'Unlikely — below clearing'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Submit */}
                <button
                    className={`w-full rounded-md border-none px-[10px] py-[10px] font-(--font-sans) text-[13px] font-medium tracking-[0.01em] cursor-pointer transition-[background,opacity] duration-[120ms] disabled:cursor-not-allowed ${side === 'buy' ? `bg-(--color-pt-fill) text-[#EDF1F8]` : `bg-(--color-yt-fill) text-[#FBF3E8]`} ${!pNum || !aNum ? "opacity-45" : "opacity-100"}`}
                    onClick={handleSubmit}
                    disabled={!pNum || !aNum}
                    aria-label={`${side === 'buy' ? 'Submit bid' : 'Submit ask'} for ${token}`}
                >
                    {submitted
                        ? '✓ Order submitted'
                        : `${side === 'buy' ? 'Submit Bid' : 'Submit Ask'} · ${token}`}
                </button>

                {/* Disclaimer */}
                <p className={`text-[10px] leading-[1.6] text-(--color-text-tertiary)`}>
                    Orders are settled on-chain at the round's clearing price.
                    Bids above clearing price are filled; bids below are returned.
                </p>
            </div>
        </Panel>
    );
}

