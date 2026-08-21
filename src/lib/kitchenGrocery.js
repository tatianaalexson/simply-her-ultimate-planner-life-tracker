// Shared kitchen grocery-generation engine — pure logic, no SDK calls.
// Used identically by: individual recipes, selected meals, full meal plans,
// and meal-prep sessions. Never adds groceries without a review screen.

// --- Normalization ---
const SIZE_WORDS = ['large', 'small', 'medium', 'fresh', 'frozen', 'raw', 'chopped', 'diced', 'minced', 'sliced', 'grated', 'whole'];

export function normalizeName(raw = '') {
  let n = String(raw).toLowerCase().trim();
  // strip leading size/prep adjectives
  for (const w of SIZE_WORDS) {
    if (n.startsWith(w + ' ')) n = n.slice(w.length + 1).trim();
  }
  n = n.replace(/\s+/g, ' ');
  // naive singularize for common plurals (length > 3)
  if (n.length > 3 && n.endsWith('s') && !n.endsWith('ss')) n = n.slice(0, -1);
  return n;
}

// --- Quantity scaling ---
// Scales a numeric-ish qty string by a factor. Preserves fractions like "1/2".
function parseQty(q) {
  if (typeof q === 'number') return q;
  if (!q) return 0;
  const s = String(q).trim();
  const frac = s.match(/^(\d+)\s*\/\s*(\d+)$/); // "1/2"
  if (frac) return parseInt(frac[1], 10) / parseInt(frac[2], 10);
  const mixed = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/); // "1 1/2"
  if (mixed) return parseInt(mixed[1], 10) + parseInt(mixed[2], 10) / parseInt(mixed[3], 10);
  const num = parseFloat(s.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : num;
}

function formatQty(n) {
  if (!n) return '0';
  // whole number
  if (Number.isInteger(n)) return String(n);
  // common fractions
  const fr = [2, 3, 4, 8, 16];
  for (const d of fr) {
    const whole = Math.floor(n);
    const rem = n - whole;
    const num = Math.round(rem * d);
    if (Math.abs(num / d - rem) < 0.01 && num > 0) {
      return whole > 0 ? `${whole} ${num}/${d}` : `${num}/${d}`;
    }
  }
  return String(Math.round(n * 100) / 100);
}

// --- Unit compatibility (lightweight common cooking units) ---
// Returns a canonical base amount (in unit's own system) only when units
// are safely convertible. Returns null when units cannot be safely combined.
const UNIT_ALIASES = {
  cup: 'cup', cups: 'cup', c: 'cup',
  tbsp: 'tbsp', tablespoon: 'tbsp', tablespoons: 'tbsp', t: 'tbsp',
  tsp: 'tsp', teaspoon: 'tsp', teaspoons: 'tsp',
  oz: 'oz', ounce: 'oz', ounces: 'oz',
  lb: 'lb', pound: 'lb', pounds: 'lb', lbs: 'lb',
  g: 'g', gram: 'g', grams: 'g',
  kg: 'kg', kilo: 'kg',
  ml: 'ml', milliliter: 'ml', milliliters: 'ml',
  l: 'l', liter: 'l', liters: 'l',
  clove: 'clove', cloves: 'clove',
  piece: 'piece', pieces: 'piece', pc: 'piece',
  can: 'can', cans: 'can',
  pinch: 'pinch', dash: 'pinch',
};

// conversions to a base within the same family (volume, mass, count)
const TO_BASE = {
  // volume (ml)
  cup: { base: 'ml', factor: 240 }, tbsp: { base: 'ml', factor: 15 }, tsp: { base: 'ml', factor: 5 },
  ml: { base: 'ml', factor: 1 }, l: { base: 'ml', factor: 1000 },
  // mass (g)
  g: { base: 'g', factor: 1 }, kg: { base: 'g', factor: 1000 }, oz: { base: 'g', factor: 28.35 }, lb: { base: 'g', factor: 453.6 },
  // count
  clove: { base: 'count', factor: 1 }, piece: { base: 'count', factor: 1 }, can: { base: 'count', factor: 1 }, pinch: { base: 'pinch', factor: 1 },
};

function canonicalUnit(u = '') {
  const key = String(u).toLowerCase().trim();
  return UNIT_ALIASES[key] || (key ? key : '');
}

// returns { base, amount } if convertible, else null
function toBase(amount, unit) {
  const cu = canonicalUnit(unit);
  const conv = TO_BASE[cu];
  if (!conv) return null;
  return { base: conv.base, amount: amount * conv.factor };
}

function fromBase(base, targetUnit) {
  const cu = canonicalUnit(targetUnit);
  const conv = TO_BASE[cu];
  if (!conv || conv.base !== base.base) return null;
  return base.amount / conv.factor;
}

// can we combine these two units?
function unitsCompatible(u1, u2) {
  const c1 = canonicalUnit(u1), c2 = canonicalUnit(u2);
  if (c1 === c2) return true;
  const b1 = TO_BASE[c1], b2 = TO_BASE[c2];
  return !!(b1 && b2 && b1.base === b2.base);
}

// sum two unit-amounts (returns in u1's unit)
function sumAmounts(a1, u1, a2, u2) {
  if (!unitsCompatible(u1, u2)) return null;
  const base1 = toBase(a1, u1);
  const base2 = toBase(a2, u2);
  if (!base1 || !base2) {
    // no conversion table but same canonical unit — direct sum
    if (canonicalUnit(u1) === canonicalUnit(u2)) return a1 + a2;
    return null;
  }
  const totalBase = { base: base1.base, amount: base1.amount + base2.amount };
  const back = fromBase(totalBase, u1);
  return back === null ? null : back;
}

// --- Core: build review items ---
//
// sources: array of { recipe, meal, prep, servings, plannedServings }
//   recipe: { id, name, default_servings, ingredients: [{qty, unit, name, prep, optional, section}] }
//   meal: { id } optional
//   prep: { id } optional
//   servings: planned servings for this source (scales ingredients)
//
// inventory: array of FoodInventoryItem (zone-filtered upstream by settings)
// existingList: array of GroceryItem already on destination list
//
// settings: { pantry_aware, fridge_aware, freezer_aware }
//
// returns: array of review items:
// { key, normalized_name, display_name, unit, total_needed (number), total_needed_str,
//   on_hand (number), suggested_to_buy (number), suggested_str,
//   sources: [{ recipe_id, recipe_name, meal_id, prep_id, amount, amount_str, original_qty }],
//   existing_item_id: string|null,
//   decision: 'buy_suggested'|'buy_full'|'skip'|'edit', edit_amount: number|null }

export function buildGroceryReview(sources = [], inventory = [], existingList = [], settings = {}) {
  const useInv = settings.pantry_aware || settings.fridge_aware || settings.freezer_aware;

  // 1. Collect scaled ingredients
  const collected = []; // { normalized_name, display_name, unit, amount, source }
  for (const src of sources) {
    const recipe = src.recipe;
    if (!recipe || !Array.isArray(recipe.ingredients)) continue;
    const defaultServ = recipe.default_servings || 1;
    const plannedServ = src.plannedServings || src.servings || defaultServ;
    const factor = plannedServ / defaultServ;
    for (const ing of recipe.ingredients) {
      if (ing.optional) continue; // skip optional ingredients in generation
      const baseAmount = parseQty(ing.qty);
      const scaledAmount = baseAmount * factor;
      const unit = ing.unit || '';
      collected.push({
        normalized_name: normalizeName(ing.name),
        display_name: ing.name,
        unit,
        amount: scaledAmount,
        original_qty: ing.qty,
        source: {
          recipe_id: recipe.id,
          recipe_name: recipe.name,
          meal_id: src.meal?.id || null,
          prep_id: src.prep?.id || null,
        },
      });
    }
  }

  // 2. Consolidate by normalized_name + compatible unit
  const groups = new Map();
  for (const c of collected) {
    let matched = null;
    const existing = groups.get(c.normalized_name) || [];
    for (const g of existing) {
      if (unitsCompatible(g.unit, c.unit)) { matched = g; break; }
    }
    if (matched) {
      const summed = sumAmounts(matched.total_needed, matched.unit, c.amount, c.unit);
      if (summed !== null) {
        matched.total_needed = summed;
        matched.sources.push({ ...c.source, amount: c.amount, amount_str: formatQty(c.amount), original_qty: c.original_qty });
        // keep the display name from the first non-generic source
        continue;
      }
    }
    // incompatible units OR no existing group — new entry
    const newEntry = {
      key: `${c.normalized_name}__${canonicalUnit(c.unit)}`,
      normalized_name: c.normalized_name,
      display_name: c.display_name,
      unit: c.unit,
      total_needed: c.amount,
      sources: [{ ...c.source, amount: c.amount, amount_str: formatQty(c.amount), original_qty: c.original_qty }],
    };
    const arr = groups.get(c.normalized_name) || [];
    arr.push(newEntry);
    groups.set(c.normalized_name, arr);
  }

  const consolidated = [];
  for (const arr of groups.values()) consolidated.push(...arr);

  // 3. Compare inventory (sum on-hand per normalized_name, compatible unit)
  const invByName = new Map();
  for (const item of inventory) {
    if (item.status && item.status !== 'available') continue;
    const nn = item.normalized_name || normalizeName(item.name);
    const arr = invByName.get(nn) || [];
    arr.push(item);
    invByName.set(nn, arr);
  }

  // 4. Check existing grocery items on destination list
  const existingByName = new Map();
  for (const gi of existingList) {
    const nn = gi.normalized_name || normalizeName(gi.name);
    existingByName.set(nn, gi);
  }

  // 5. Build review items
  const review = consolidated.map((g) => {
    let onHand = 0;
    if (useInv) {
      const items = invByName.get(g.normalized_name) || [];
      for (const it of items) {
        if (unitsCompatible(g.unit, it.unit)) {
          const summed = sumAmounts(onHand, g.unit, it.amount || parseQty(it.qty), it.unit);
          if (summed !== null) onHand = summed;
        }
      }
    }
    const suggested = Math.max(0, g.total_needed - onHand);
    const existing = existingByName.get(g.normalized_name) || null;
    return {
      key: g.key,
      normalized_name: g.normalized_name,
      display_name: g.display_name,
      unit: g.unit,
      total_needed: g.total_needed,
      total_needed_str: formatQty(g.total_needed),
      on_hand: onHand,
      on_hand_str: formatQty(onHand),
      suggested_to_buy: suggested,
      suggested_str: formatQty(suggested),
      has_inventory: useInv && onHand > 0,
      sources: g.sources,
      existing_item_id: existing?.id || null,
      decision: 'buy_suggested',
      edit_amount: null,
    };
  });

  return review;
}

// Resolve a review item's final amount based on its decision.
export function resolveAmount(item) {
  switch (item.decision) {
    case 'skip': return 0;
    case 'buy_full': return item.total_needed;
    case 'edit': return item.edit_amount ?? 0;
    case 'buy_suggested':
    default: return item.has_inventory ? item.suggested_to_buy : item.total_needed;
  }
}

export function formatQuantity(n) {
  return formatQty(n);
}