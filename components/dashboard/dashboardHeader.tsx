'use client';
import { WalletConnectButton } from '../wallet/wallet-connect-button';

interface DashboardHeaderProps {
    walletAddress?: string;
    network?: 'mainnet' | 'devnet';
    onStakeClick?: () => void;
}

export default function DashboardHeader({
    walletAddress = '',
    network = 'mainnet',
    onStakeClick,
}: DashboardHeaderProps) {
    return (
        <header className="sticky top-0 z-100 flex h-[52px] items-center justify-between gap-4 border-b [border-bottom:var(--border)] bg-(--color-bg-surface) px-6">
            <div className="flex items-center gap-[10px]">
                <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[4px] bg-(--color-accent)">
                    <span className="font-(--font-mono) text-[10px] tracking-[-0.05em] text-[#E8F5F0]">Ft</span>
                </div>
                <span className="font-(--font-sans) text-[13px] uppercase tracking-[0.04em] text-(--color-text-primary)">Fent.</span>
            </div>

            <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-[6px] rounded-sm bg-(--color-accent-bg) px-[14px] py-[6px] font-(--font-mono) text-sm uppercase tracking-[0.06em] text-(--color-accent-text) border-[0.5px] border-(--color-accent-border)">
                    <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-(--color-accent)" />
                    {network === 'mainnet' ? 'Mainnet' : 'Devnet'}
                </span>

                <WalletConnectButton />

                <button
                    className="cursor-pointer rounded-md border-none bg-(--color-accent) px-[14px] py-[6px] font-(--font-sans) text-[12px] tracking-[0.01em] text-[#E8F5F0]"
                    aria-label="Stake SOL"
                    onClick={onStakeClick}
                >
                    Stake SOL
                </button>
            </div>
        </header>
    );
}