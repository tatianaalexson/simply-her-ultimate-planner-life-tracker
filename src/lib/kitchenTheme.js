import { useAppSettings } from '@/lib/AppSettings';

// Lightweight theme "personality" layer for Kitchen.
// Themes influence more than colour: this maps each Simply Her theme to a
// subtle decorative personality (motif glyph + tone) used for placeholders,
// empty-state artwork and small accents. Designed to be extended later with
// icon-family / illustration swaps without changing call sites.

const PERSONALITIES = {
  'soft-clean':     { personality: 'botanical', motif: '🌿', tone: 'calm' },
  'pink-glam':     { personality: 'romantic',  motif: '🌸', tone: 'soft' },
  'baby-blue':     { personality: 'cloud',      motif: '☁️', tone: 'airy' },
  'butter-yellow': { personality: 'sunshine',  motif: '🐝', tone: 'warm' },
  'lavender':      { personality: 'romantic',  motif: '💜', tone: 'soft' },
  'whimsigoth':    { personality: 'elegant',   motif: '🌙', tone: 'dark' },
  'dark-academia': { personality: 'elegant',   motif: '📜', tone: 'dark' },
  'noir':          { personality: 'minimal',   motif: '✦',  tone: 'dark' },
  'matcha':        { personality: 'botanical',  motif: '🍃', tone: 'calm' },
  'cozy-autumn':   { personality: 'harvest',   motif: '🍂', tone: 'warm' },
};

const DEFAULT_PERSONALITY = { personality: 'botanical', motif: '🌿', tone: 'calm' };

export function getKitchenTheme(themeId) {
  return PERSONALITIES[themeId] || DEFAULT_PERSONALITY;
}

// Section-specific decorative motifs for empty states and placeholders.
const SECTION_MOTIFS = {
  groceries: '🛒',
  shopping: '✓',
  mealprep: '👨‍🍳',
  pantry: '📦',
  fridge: '🥛',
  freezer: '❄️',
  leftovers: '🍽️',
  nutrition: '🥗',
  recipes: '📖',
  mealplan: '📅',
};

export function getSectionMotif(section) {
  return SECTION_MOTIFS[section] || '🌿';
}

export function useKitchenTheme() {
  const { settings } = useAppSettings();
  return getKitchenTheme(settings.themeId);
}

export function useKitchenSectionTheme(section) {
  const theme = useKitchenTheme();
  return { ...theme, sectionMotif: getSectionMotif(section) };
}