import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [themeMode, setThemeModeState] = useState(() => {
        return localStorage.getItem('theme') || 'system';
    });

    const [systemIsDark, setSystemIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    // Handle system preference changes
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            setSystemIsDark(e.matches);
        };

        setSystemIsDark(mediaQuery.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Compute effective theme ('dark' | 'light')
    const effectiveTheme = themeMode === 'system' ? (systemIsDark ? 'dark' : 'light') : themeMode;

    // Apply 'dark' class to html and body element
    useEffect(() => {
        const root = document.documentElement;
        const body = document.body;
        if (effectiveTheme === 'dark') {
            root.classList.add('dark');
            body.classList.add('dark');
            root.style.colorScheme = 'dark';
        } else {
            root.classList.remove('dark');
            body.classList.remove('dark');
            root.style.colorScheme = 'light';
        }
    }, [effectiveTheme]);

    const setThemeMode = (mode) => {
        setThemeModeState(mode);
        localStorage.setItem('theme', mode);
    };

    return (
        <ThemeContext.Provider value={{ themeMode, effectiveTheme, setThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
