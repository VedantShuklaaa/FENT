"use client";
import Link from 'next/link';
import { useSidebarContext } from '@/lib/context/SidebarContext';
import { NAV_SECTIONS } from '@/lib/nav';
import NavSection from './navSection';
import NavIcon from './navIcon';
import SidebarToggle from './sidebarToggle';
import SidebarWalletFooter from './sidebarWalletFooter';

const SIDEBAR_WIDTH_EXPANDED = 274;
const SIDEBAR_WIDTH_COLLAPSED = 56;

const LOGO_PATH = 'M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 5a4 4 0 1 0 8 0 4 4 0 0 0-8 0z';

export default function Sidebar() {
    const { collapsed, toggle, collapse, isMobile } = useSidebarContext();

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
                        walletAddress="7xKq…d4Rn"
                        network="mainnet"
                        balanceSol={248.40}
                    />
                </div>
            </aside>
        </div>
    );
}