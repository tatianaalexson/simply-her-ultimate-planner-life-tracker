// Simply Her shared nutrition layer.
// ONE source of truth: NutritionEntry (food log) + FitnessSetting (goals).
// Used by both Kitchen (food diary, recipes) and Fitness (calorie/macro view).

const NUM = (v) => (typeof v === 'number' ? v : parseFloat(v) || 0);

export const MACRO_FIELDS = [
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbs', label: 'Carbs', unit: 'g' },
  { key: 'fat', label: 'Fat', unit: 'g' },
];

export const OPTIONAL_NUTRIENTS = [
  { key: 'fibre', label: 'Fibre', unit: 'g' },
  { key: 'sugar', label: 'Sugar', unit: 'g' },
  { key: 'sodium', label: 'Sodium', unit: 'mg' },
  { key: 'saturated_fat', label: 'Sat. Fat', unit: 'g' },
  { key: 'cholesterol', label: 'Cholesterol', unit: 'mg' },
  { key: 'potassium', label: 'Potassium', unit: 'mg' },
  { key: 'calcium', label: 'Calcium', unit: 'mg' },
  { key: 'iron', label: 'Iron', unit: 'mg' },
];

export const CORE_NUTRIENTS = [
  { key: 'calories', label: 'Calories', unit: '' },
  ...MACRO_FIELDS,
];

export const NUTRIENT_KEYS = [
  ...CORE_NUTRIENTS.map((n) => n.key),
  ...OPTIONAL_NUTRIENTS.map((n) => n.key),
];

export const NUTRITION_SLOTS = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snacks' },
];

// Per-serving nutrition for a recipe, honoring its nutrition_basis.
// Returns null when the recipe has no nutrition entered.
export function recipePerServing(recipe) {
  if (!recipe || (recipe.nutrition_basis || 'none') === 'none') return null;
  const servings = Math.max(1, NUM(recipe.default_servings));
  const basis = recipe.nutrition_basis;
  const out = {};
  NUTRIENT_KEYS.forEach((k) => {
    const v = NUM(recipe[k]);
    out[k] = basis === 'total' ? v / servings : v;
  });
  return out;
}

export function recipeTotal(recipe) {
  if (!recipe || (recipe.nutrition_basis || 'none') === 'none') return null;
  const servings = Math.max(1, NUM(recipe.default_servings));
  const basis = recipe.nutrition_basis;
  const out = {};
  NUTRIENT_KEYS.forEach((k) => {
    const v = NUM(recipe[k]);
    out[k] = basis === 'per_serving' ? v * servings : v;
  });
  return out;
}

// Scale a nutrition object by a decimal serving count (e.g. 1.5).
export function scaleNutrition(nut, servings) {
  if (!nut) return null;
  const s = NUM(servings);
  const out = {};
  Object.keys(nut).forEach((k) => {
    out[k] = NUM(nut[k]) * s;
  });
  return out;
}

// Saved-food nutrition is already per serving_size — scale by servings eaten.
export function savedFoodPerServing(food) {
  if (!food) return null;
  const out = {};
  NUTRIENT_KEYS.forEach((k) => {
    out[k] = NUM(food[k]);
  });
  return out;
}

export function sumEntries(entries) {
  const totals = {};
  NUTRIENT_KEYS.forEach((k) => (totals[k] = 0));
  (entries || []).forEach((e) => {
    NUTRIENT_KEYS.forEach((k) => {
      totals[k] += NUM(e?.[k]);
    });
  });
  return totals;
}

export function groupBySlot(entries) {
  const groups = { breakfast: [], lunch: [], dinner: [], snack: [], custom: [] };
  (entries || []).forEach((e) => {
    const slot = e?.meal_slot || 'snack';
    if (!groups[slot]) groups[slot] = [];
    groups[slot].push(e);
  });
  return groups;
}

export const roundNut = (v, decimals = 0) => {
  const n = NUM(v);
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
};

export function fmtNut(value, unit) {
  const n = Math.round(NUM(value));
  return unit ? `${n}${unit}` : `${n}`;
}