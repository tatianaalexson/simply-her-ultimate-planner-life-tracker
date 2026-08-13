// Shared constants + key builders for the local-storage-backed Planner hub.

export const CATEGORIES = [
  { id: 'personal', label: 'Personal', h: 265, s: 60, l: 65 },
  { id: 'household', label: 'Household', h: 43, s: 74, l: 55 },
  { id: 'partner', label: 'Partner Shift', h: 340, s: 75, l: 65 },
  { id: 'selfcare', label: 'Self-Care', h: 160, s: 60, l: 45 },
  { id: 'rest', label: 'Rest', h: 220, s: 30, l: 60 }
];

export const catMeta = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

// Full 24-hour day: 12am through 12am
export const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const fmtHour = (h) => {
  if (h === 0) return '12 AM';
  if (h === 12) return '12 PM';
  const ap = h > 12 ? 'PM' : 'AM';
  const hr = h > 12 ? h - 12 : h;
  return `${hr} ${ap}`;
};

export const dayKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
};

export const focusKey = (d) => `planner-focus-${dayKey(d)}`;
export const blocksKey = (d) => `planner-blocks-${dayKey(d)}`;
export const tasksKey = (d) => `planner-tasks-${dayKey(d)}`;
export const routineDoneKey = (d) => `planner-routine-done-${dayKey(d)}`;
export const reflectionKey = (d) => `planner-reflection-${dayKey(d)}`;

export const ROUTINES_KEY = 'planner-routines';
export const DEFAULT_ROUTINES = {
  morning: ['Make the bed', 'Morning meds', 'Hydrate (1 glass)', 'Skincare'],
  afternoon: ['Stretch / move body', 'Hydrate', 'Tidy one space'],
  evening: ['Evening meds', 'Prep for tomorrow', 'Screens off', 'Gratitude breath']
};