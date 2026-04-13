'use client'; import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavItem as NavItemType } from '@/lib/nav';
import NavIcon from './navIcon';
import NavBadge from './navBadge';

interface NavItemProps {
  item: NavItemType;
  collapsed: boolean;
}

export default function NavItem({ item, collapsed }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

  return (
    <Link
      className={`nav-item-link relative flex min-h-[34px] cursor-pointer items-center gap-[10px] px-[12px] py-[7px] rounded-md no-underline select-none transition-[background] duration-[120ms] ${isActive ? "bg-(--color-accent-bg)" : ""} ${collapsed ? "justify-center px-0 py-[7px]" : ""}`}
      href={item.href}
      title={collapsed ? item.label : undefined}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Icon */}
      <span className='flex h-[16px] w-[16px] shrink-0 items-center relative'>
        <NavIcon
          d={item.icon}
          size={16}
          color={isActive ? 'var(--color-accent)' : 'var(--color-text-tertiary)'}
          title={collapsed ? item.label : undefined} />
        {collapsed && item.badge && (
          <NavBadge value={item.badge} collapsed />
        )}
      </span>

      {/* Label + badge — hidden when collapsed */}
      {!collapsed && (
        <>
          <span
            className={`flex-1 truncate text-[13px] leading-none tracking-[-0.01em] transition-opacity duration-[150ms] ${isActive ? 'text-(--color-text-primary) font-medium' : 'text-(--color-text-secondary) font-normal'}`}>
            {item.label}
          </span>
          {item.badge && (
            <NavBadge value={item.badge} collapsed={false} />
          )}
        </>
      )}

      {/* Active indicator bar */}
      {isActive && (
        <span
          className={`absolute left-0 top-1/2 -translate-y-1/2 h-[16px] w-[2px] rounded-r-[2px] bg-(--color-accent) ${collapsed ? "left-[-1px] h-[12px]" : ""}`}
          aria-hidden />
      )}
    </Link>
  );
}

