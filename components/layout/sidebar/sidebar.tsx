"use client";
import { useSidebarContext } from '@/lib/context/SidebarContext';
import { NAV_SECTIONS } from '@/lib/nav';
import NavSection from './navSection';
import SidebarToggle from './sidebarToggle';
import SidebarWalletFooter from './sidebarWalletFooter';
import { useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { truncateAddress } from "@/lib/utils";

const SIDEBAR_WIDTH_EXPANDED = 274;
const SIDEBAR_WIDTH_COLLAPSED = 56;


export default function Sidebar() {
    const { collapsed, toggle, collapse, isMobile } = useSidebarContext();
    const { publicKey } = useWallet();

    const shortAddress = useMemo(() => {
        return publicKey ? truncateAddress(publicKey.toBase58()) : '';
    }, [publicKey]);

    const width = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

    return (
        <div>
            {isMobile && !collapsed && (
                <div
                    className='fixed inset-0 z-[49] cursor-pointer bg-[rgba(0,0,0,0.35)]'
                    onClick={collapse}
                    aria-hidden
                />
            )}

            <aside
                className='relative z-50 flex h-screen shrink-0 flex-col overflow-x-hidden overflow-y-auto bg-(--color-bg-surface) text-black [border-right:var(--border)] transition-[width,min-width] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]'
                style={{ width, minWidth: width }}
                aria-label="Main navigation"
            >
                <div className='h-[52px] shrink-0 [border-bottom:var(--border)]' aria-hidden />

                <nav className='flex-1 overflow-x-hidden overflow-y-auto' aria-label="Sidebar navigation">
                    <div
                        className={`flex flex-col gap-3 py-3 transition-[padding] duration-200 ${collapsed ? 'p-[8px]' : 'p-[10px]'}`}>
                        {NAV_SECTIONS.map((section) => (
                            <NavSection
                                key={section.key}
                                section={section}
                                collapsed={collapsed}
                            />
                        ))}
                    </div>
                </nav>


                <div className={`flex shrink-0 flex-col gap-2 [border-top:var(--border)] transition-[padding] duration-200 ${collapsed ? 'p-[8px]' : 'p-[10px]'}`}>
                    <SidebarToggle collapsed={collapsed} onToggle={toggle} />
                    <SidebarWalletFooter
                        collapsed={collapsed}
                        walletAddress={shortAddress}
                        network="mainnet"
                        balanceSol={248.40}
                    />
                </div>
            </aside>
        </div>
    );
}