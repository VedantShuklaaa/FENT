'use client';
import { ChevronsLeft } from 'lucide-react';

interface SidebarToggleProps {
    collapsed: boolean;
    onToggle: () => void;
}

export default function SidebarToggle({ collapsed, onToggle }: SidebarToggleProps) {

    return (
        <button
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={`${collapsed ? 'Expand' : 'Collapse'} sidebar ([)`}
            className={`sidebar-toggle-btn ${collapsed ? 'center' : 'space-between'} flex w-full items-center min-h-[28px] px-[10px] py-[6px] cursor-pointer rounded-md bg-transparent font-sans border-border transition-[background] duration-[120ms]`}
        >
            {!collapsed && (
                <span className='rounded-[2px] px-[5px] py-[1px] font-mono text-[10px] leading-[1.4] tracking-[0.04em] text-(--color-text-tertiary) [border:var(--border-md)]'>[</span>
            )}

            <svg
                width={14}
                height={14}
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
                className={`block shrink-0 transition-transform duration-200 ease-in text-(--color-text-tertiary) ${collapsed ? "rotate-180" : "rotate-0"}`}
            >
                <ChevronsLeft />
            </svg>
        </button>
    );
}
