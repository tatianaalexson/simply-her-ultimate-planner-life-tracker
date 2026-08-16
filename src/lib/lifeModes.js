// Life Modes are personalization presets — they recommend modules to surface,
// they never restrict access or delete data. Users may select multiple modes
// and create custom ones. `recommends` lists group ids (see featureRegistry).

export const LIFE_MODES = [
  { id: 'school', label: 'School Girl Era', emoji: '🎒', recommends: ['kitchen', 'beauty', 'fitness', 'faith', 'creative'] },
  { id: 'university', label: 'University Era', emoji: '📚', recommends: ['budget', 'kitchen', 'fitness', 'creator', 'faith'] },
  { id: 'career', label: 'Career Girl Era', emoji: '💼', recommends: ['creator', 'budget', 'beauty', 'fitness', 'home'] },
  { id: 'home', label: 'Home Era', emoji: '🏡', recommends: ['home', 'kitchen', 'beauty', 'creative', 'faith'] },
  { id: 'married', label: 'Married Life', emoji: '💍', recommends: ['home', 'kitchen', 'budget', 'faith', 'beauty'] },
  { id: 'motherhood', label: 'Motherhood', emoji: '🤱', recommends: ['home', 'kitchen', 'health', 'faith', 'creative'] },
  { id: 'ttc', label: 'TTC Journey', emoji: '🌸', recommends: ['ttc', 'health', 'faith'] },
  { id: 'creator', label: 'Creator Era', emoji: '🎬', recommends: ['creator', 'budget', 'beauty', 'fitness'] },
  { id: 'glowup', label: 'Glow-Up Era', emoji: '✨', recommends: ['beauty', 'fitness', 'health', 'creative'] },
  { id: 'faith', label: 'Faith Life', emoji: '🕊️', recommends: ['faith', 'home', 'creative'] },
  { id: 'growth', label: 'Personal Growth', emoji: '🌱', recommends: ['faith', 'creative', 'budget', 'home'] }
];

export const getMode = (id, customModes = []) =>
  LIFE_MODES.find((m) => m.id === id) || customModes.find((m) => m.id === id);

// Aggregated recommended group ids from all selected modes.
export const recommendedGroups = (selectedIds, customModes = []) => {
  const set = new Set();
  selectedIds.forEach((id) => {
    const m = getMode(id, customModes);
    if (m) m.recommends.forEach((g) => set.add(g));
  });
  return Array.from(set);
};