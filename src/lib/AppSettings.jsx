import React, { createContext, useContext, useEffect, useState } from 'react';
import { THEMES } from '@/lib/themes';

const STORAGE_KEY = 'simply-her-settings';

const DEFAULTS = {
  themeId: 'soft-clean',
  darkMode: false,
  fitnessFocus: 'pilates',
  faithEnabled: true,
  tradition: 'christianity',
  denomination: 'Nondenominational',
  budgetEnabled: false,
  healthEnabled: false,
  creatorEnabled: false,
  ttcEnabled: false,
  notifications: true
};

const AppSettingsContext = createContext(null);

export function AppSettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    const theme = THEMES.find((t) => t.id === settings.themeId) || THEMES[0];
    const palette = settings.darkMode ? theme.dark : theme.light;
    const root = document.documentElement;
    Object.entries(palette).forEach(([k, v]) => {
      root.style.setProperty(`--${k}`, v);
    });
  }, [settings]);

  const update = (key, value) => setSettings((s) => ({ ...s, [key]: value }));

  return (
    <AppSettingsContext.Provider value={{ settings, update }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error('useAppSettings must be used within AppSettingsProvider');
  return ctx;
}