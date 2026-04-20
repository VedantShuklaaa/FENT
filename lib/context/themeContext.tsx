'use client';
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
    theme: Theme;
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'FENt:theme';
const DATA_ATTR = 'data-theme';

const FOUC_SCRIPT = `
(function() {
  try {
    var stored = localStorage.getItem('${STORAGE_KEY}');
    var prefer = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var theme  = stored || prefer;
    document.documentElement.setAttribute('${DATA_ATTR}', theme);
  } catch(e) {}
})();
`;

export function ThemeScript() {
    return (
        <script
            dangerouslySetInnerHTML={{ __html: FOUC_SCRIPT }}
            suppressHydrationWarning
        />
    );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('light');

    // On mount, sync state with the attribute already set by ThemeScript
    useEffect(() => {
        const current = document.documentElement.getAttribute(DATA_ATTR) as Theme;
        if (current === 'dark' || current === 'light') {
            setThemeState(current);
        }
    }, []);

    const applyTheme = useCallback((t: Theme) => {
        document.documentElement.setAttribute(DATA_ATTR, t);
        try { localStorage.setItem(STORAGE_KEY, t); } catch { }
        setThemeState(t);
    }, []);

    const toggleTheme = useCallback(() => {
        applyTheme(theme === 'light' ? 'dark' : 'light');
    }, [theme, applyTheme]);

    return (
        <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme, setTheme: applyTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
    return ctx;
}