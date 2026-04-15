export type RedeemType = 'PT' | 'YT';
export type RedeemStatus = 'ready' | 'pending' | 'claimed';

export interface RedeemableItem {
    id: string;
    type: RedeemType;
    underlying: string;
    underlyingColor: string;
    amount: number;           // token amount
    receiveAmount: number;           // SOL / LST to receive on redemption
    receiveToken: string;
    maturityDate: string;
    maturedDaysAgo: number;           // 0 = today
    status: RedeemStatus;
}

export interface RedeemHistoryEntry {
    id: string;
    type: RedeemType;
    underlying: string;
    amount: number;
    received: number;
    receiveToken: string;
    txHash: string;
    date: string;
}

// ─── Items ready to redeem ──────────────────────────────────────

export const redeemableItems: RedeemableItem[] = [
    {
        id: 'pt-jito-old',
        type: 'PT',
        underlying: 'jitoSOL',
        underlyingColor: '#9BC4B2',
        amount: 80.00,
        receiveAmount: 80.00,
        receiveToken: 'jitoSOL',
        maturityDate: 'Mar 31, 2025',
        maturedDaysAgo: 15,
        status: 'ready',
    },
    {
        id: 'yt-jito-accrued',
        type: 'YT',
        underlying: 'jitoSOL',
        underlyingColor: '#9BC4B2',
        amount: 164.20,
        receiveAmount: 3.18,
        receiveToken: 'jitoSOL',
        maturityDate: 'Jun 30, 2025',
        maturedDaysAgo: 0,
        status: 'ready',
    },
];

// ─── Redeem history ────────────────────────────────────────────

export const redeemHistory: RedeemHistoryEntry[] = [
    {
        id: 'h1',
        type: 'PT',
        underlying: 'jitoSOL',
        amount: 40.0,
        received: 40.0,
        receiveToken: 'jitoSOL',
        txHash: '1tKv…M7ez',
        date: 'Apr 12, 2025',
    },
    {
        id: 'h2',
        type: 'YT',
        underlying: 'mSOL',
        amount: 200.0,
        received: 1.84,
        receiveToken: 'mSOL',
        txHash: '7rGt…K9cx',
        date: 'Mar 31, 2025',
    },
    {
        id: 'h3',
        type: 'PT',
        underlying: 'bSOL',
        amount: 60.0,
        received: 60.0,
        receiveToken: 'bSOL',
        txHash: '3sJu…L8dy',
        date: 'Mar 31, 2025',
    },
];