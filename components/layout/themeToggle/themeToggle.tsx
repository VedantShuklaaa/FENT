'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/context/themeContext';

interface ThemeToggleProps {
    /** compact = icon only (for sidebar collapsed state) */
    size?: 'compact' | 'default';
}

function SunIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7zm0-5a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1zm0 17a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1zM5.64 6.36a1 1 0 0 1 0-1.42l.7-.7a1 1 0 1 1 1.42 1.42l-.71.7a1 1 0 0 1-1.41 0zm11.31 11.31a1 1 0 0 1 0-1.41l.7-.71a1 1 0 1 1 1.42 1.42l-.71.7a1 1 0 0 1-1.41 0zM3 11h1a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2zm17 0h1a1 1 0 1 1 0 2h-1a1 1 0 1 1 0-2zM6.34 18.36l-.7.7a1 1 0 1 1-1.42-1.41l.71-.71a1 1 0 1 1 1.41 1.42zm12.02-12.02l-.7.71a1 1 0 1 1-1.41-1.42l.7-.7a1 1 0 1 1 1.41 1.41z" />
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    );
}

export default function ThemeToggle({ size = 'default' }: ThemeToggleProps) {
    const { isDark, toggleTheme } = useTheme();

    return (
        <motion.button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
            className={[
                // layout
                'flex items-center justify-center relative overflow-hidden',
                // spacing — gap and padding differ by size
                size === 'default' ? 'gap-1.5 px-2.5 py-[5px]' : 'gap-0 p-1.5',
                // appearance
                'border border-[var(--border-md)] rounded-[var(--radius-md)]',
                'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]',
                // typography
                'font-[var(--font-sans)] text-[11px] whitespace-nowrap',
                // interaction
                'cursor-pointer',
            ].join(' ')}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
            {/* Icon cross-fade */}
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={isDark ? 'moon' : 'sun'}
                    initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="flex items-center"
                >
                    {isDark ? <SunIcon /> : <MoonIcon />}
                </motion.span>
            </AnimatePresence>

            {/* Label — only in default size */}
            {size === 'default' && (
                <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                        key={isDark ? 'light-label' : 'dark-label'}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="leading-none"
                    >
                        {isDark ? 'Light' : 'Dark'}
                    </motion.span>
                </AnimatePresence>
            )}
        </motion.button>
    );
}