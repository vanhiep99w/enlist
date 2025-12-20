import { useState, useEffect, useCallback } from 'react';

export type Theme = 'midnight' | 'sunrise' | 'arctic' | 'desert';

export interface ThemeInfo {
  id: Theme;
  name: string;
  icon: string;
  description: string;
}

export const THEMES: ThemeInfo[] = [
  { id: 'midnight', name: 'Midnight', icon: '🌙', description: 'Deep space vibes' },
  { id: 'sunrise', name: 'Sunrise', icon: '🌅', description: 'Warm & cozy' },
  { id: 'arctic', name: 'Arctic', icon: '❄️', description: 'Cool & crisp' },
  { id: 'desert', name: 'Desert', icon: '🏜️', description: 'Light & warm' },
];

const THEME_KEY = 'enlist-theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'midnight';
  
  const stored = localStorage.getItem(THEME_KEY);
  if (stored && THEMES.some(t => t.id === stored)) return stored as Theme;
  
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'desert' : 'midnight';
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    const root = document.documentElement;
    root.classList.add('theme-transition');
    
    setThemeState(newTheme);
    
    setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 300);
  }, []);

  const cycleTheme = useCallback(() => {
    const currentIndex = THEMES.findIndex(t => t.id === theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setTheme(THEMES[nextIndex].id);
  }, [theme, setTheme]);

  const currentThemeInfo = THEMES.find(t => t.id === theme)!;

  return { 
    theme, 
    setTheme, 
    cycleTheme,
    currentThemeInfo,
    themes: THEMES,
    isDark: theme === 'midnight' || theme === 'arctic',
  };
}
