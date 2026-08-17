import React, { createContext, useContext, useEffect, useState } from 'react';
import { THEMES } from '@/lib/themes';
import { applyFontPairing } from '@/lib/fonts';
import { hexToHslChannels, foregroundForChannels } from '@/lib/colorUtils';
import {
  FEATURE_GROUPS,
  FEATURES,
  getFeature,
  defaultVisibility,
  featuresByGroup
} from '@/lib/featureRegistry';

const STORAGE_KEY = 'simply-her-settings';

const DEFAULTS = {
  // appearance
  themeId: 'soft-clean',
  darkMode: false,
  // fitness config
  fitnessFocus: 'pilates',
  // studio enable flags (legacy keys preserved)
  fitnessEnabled: true,
  kitchenEnabled: true,
  homeEnabled: true,
  beautyEnabled: true,
  creativeEnabled: true,
  faithEnabled: true,
  tradition: 'christianity',
  denomination: 'Nondenominational',
  budgetEnabled: false,
  healthEnabled: false,
  creatorEnabled: false,
  ttcEnabled: false,
  // health sub-toggles (legacy)
  healthMental: true,
  healthPhysical: true,
  healthMedication: true,
  healthAppointments: true,
  healthConditions: true,
  healthFitness: true,
  healthHistory: true,
  healthTests: true,
  healthInsights: true,
  // global
  notifications: true,
  // new foundation
  lifeModes: [],
  customModes: [],
  featureVisibility: {},
  fontPairing: 'lora',
  accentOverride: ''
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
    Object.entries(palette).forEach(([k, val]) => {
      root.style.setProperty(`--${k}`, val);
    });
    applyFontPairing(settings.fontPairing);
    if (settings.accentOverride) {
      const channels = hexToHslChannels(settings.accentOverride);
      if (channels) {
        root.style.setProperty('--primary', channels);
        root.style.setProperty('--ring', channels);
        root.style.setProperty('--primary-foreground', foregroundForChannels(channels));
      }
    }
  }, [settings]);

  const update = (key, value) => setSettings((s) => ({ ...s, [key]: value }));

  // --- Group (studio) enable ---
  const isGroupEnabled = (groupId) => {
    const g = FEATURE_GROUPS.find((x) => x.id === groupId);
    return g ? !!settings[g.studioKey] : false;
  };
  const setGroupEnabled = (groupId, bool) => {
    const g = FEATURE_GROUPS.find((x) => x.id === groupId);
    if (g) update(g.studioKey, bool);
  };

  // --- Feature enable ---
  const isFeatureEnabled = (featureId) => {
    const f = getFeature(featureId);
    if (!f) return false;
    if (f.legacyKey) return !!settings[f.legacyKey];
    const ov = settings.featureVisibility[featureId];
    return ov?.enabled ?? (f.defaultEnabled ?? true);
  };
  const patchFeature = (featureId, patch) =>
    setSettings((s) => ({
      ...s,
      featureVisibility: {
        ...s.featureVisibility,
        [featureId]: { ...s.featureVisibility[featureId], ...patch }
      }
    }));
  const setFeatureEnabled = (featureId, bool) => {
    const f = getFeature(featureId);
    if (!f) return;
    if (f.legacyKey) update(f.legacyKey, bool);
    else patchFeature(featureId, { enabled: bool });
  };

  // --- Feature visibility ---
  const getVisibility = (featureId) => ({
    ...defaultVisibility(featureId),
    ...(settings.featureVisibility[featureId] || {})
  });
  const setVisibility = (featureId, channel, bool) => patchFeature(featureId, { [channel]: bool });

  // --- Life Modes ---
  const toggleLifeMode = (modeId) =>
    setSettings((s) => ({
      ...s,
      lifeModes: s.lifeModes.includes(modeId)
        ? s.lifeModes.filter((m) => m !== modeId)
        : [...s.lifeModes, modeId]
    }));
  const addCustomMode = (label, recommends) =>
    setSettings((s) => {
      const id = `custom-${Date.now()}`;
      return { ...s, customModes: [...s.customModes, { id, label, recommends, custom: true }] };
    });
  const removeCustomMode = (modeId) =>
    setSettings((s) => ({
      ...s,
      customModes: s.customModes.filter((m) => m.id !== modeId),
      lifeModes: s.lifeModes.filter((m) => m !== modeId)
    }));

  // --- Helpers for pages ---
  const visibleFeaturesFor = (channel) =>
    FEATURES.filter((f) => isFeatureEnabled(f.id) && getVisibility(f.id)[channel]);

  const enabledGroups = () => FEATURE_GROUPS.filter((g) => isGroupEnabled(g.id));

  const value = {
    settings,
    update,
    isGroupEnabled,
    setGroupEnabled,
    isFeatureEnabled,
    setFeatureEnabled,
    getVisibility,
    setVisibility,
    toggleLifeMode,
    addCustomMode,
    removeCustomMode,
    visibleFeaturesFor,
    enabledGroups,
    featuresByGroup
  };

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error('useAppSettings must be used within AppSettingsProvider');
  return ctx;
}