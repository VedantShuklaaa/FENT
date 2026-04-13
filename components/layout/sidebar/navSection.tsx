'use client';
import { NavSection as NavSectionType } from '@/lib/nav';
import NavItem from './navItem';

interface NavSectionProps {
    section: NavSectionType;
    collapsed: boolean;
}

export default function NavSection({
    section,
    collapsed
}: NavSectionProps) {
    return (
        <div className='mb-1' role="group" aria-label={section.label}>
            {!collapsed && (
                <div
                    className='px-3 py-px text-[9px] font-medium uppercase tracking-[0.1em] text-[var(--color-text-tertiary)] transition-[opacity,height,margin] duration-[150ms]'
                    aria-hidden={collapsed}
                >
                    {section.label}
                </div>
            )}

            {collapsed && (
                <div className='mx-2 my-[6px] h-[0.5px] bg-[var(--color-border-soft)]' aria-hidden />
            )}

            <div className='flex flex-col gap-[4px]'>
                {section.items.map((item) => (
                    <NavItem key={item.id} item={item} collapsed={collapsed} />
                ))}
            </div>
        </div>
    );
}