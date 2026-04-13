'use client';
import React from 'react';

interface SidebarWalletFooterProps {
  collapsed: boolean;
  walletAddress?: string;
  network?: 'mainnet' | 'devnet';
  balanceSol?: number;
}

export default function SidebarWalletFooter({
  collapsed,
  walletAddress = '7xKq…d4Rn',
  network = 'mainnet',
  balanceSol = 248.40,
}: SidebarWalletFooterProps) {
  return (
    <div className={`${collapsed ? '12px 0 center' : '12px 12px flex-start'} flex items-center gap-[10px] [border-top:var(--border)] transition-[padding] duration-200`}>
      <div className='relative flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-muted)]' aria-label="Wallet avatar">
        <span className='font-mono text-[11px] font-medium leading-none text-[var(--color-text-secondary)]'>W</span>
        <span className='absolute bottom-[1px] right-[1px] h-[7px] w-[7px] rounded-full border-[1.5px] border-[var(--color-bg-surface)] bg-[var(--color-accent)]' title={network === 'mainnet' ? 'Mainnet' : 'Devnet'} />
      </div>

      {/* Wallet details — hidden when collapsed */}
      {!collapsed && (
        <div className='min-w-0 flex-1 overflow-hidden'>
          <p className='mb-[2px] truncate font-mono text-[11px] text-(--color-text-primary)'>{walletAddress}</p>
          <p className='flex items-center gap-[6px] font-mono text-[10px] text-[var(--color-text-tertiary)]'>
            {balanceSol.toFixed(2)} SOL
            <span className="inline-flex items-center gap-[6px] rounded-sm bg-(--color-accent-bg) px-2 py-[3px] font-(--font-mono) text-[10px] uppercase tracking-[0.06em] text-(--color-accent-text) border-[0.5px] border-(--color-accent-border)">
              <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-(--color-accent)" />
              {network === 'mainnet' ? 'Mainnet' : 'Devnet'}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

