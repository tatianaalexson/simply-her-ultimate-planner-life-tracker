// Kitchen Phase 3 — Non-destructive, idempotent migration of legacy
// localStorage Kitchen data into the synced entity architecture.
//
// Design principles:
//  - NON-DESTRUCTIVE: legacy localStorage keys are NEVER cleared.
//  - IDEMPOTENT: re-running never duplicates records. Guaranteed by a
//    combination of (a) a versioned manifest with per-record fingerprints
//    mapping to created entity IDs, (b) existing-entity natural-key checks
//    as a secondary guard, and (c) a versioned completion marker.
//  - RECOVERABLE / SAFE IF INTERRUPTED: the manifest is saved after every
//    successful record creation, so an interrupted run resumes cleanly.
//  - PARTIAL-FAILURE SAFE: one malformed record never fails the whole
//    category; per-record try/catch; a category is only marked complete
//    after a verification read-back of every created record.
//  - Migration metadata (source, fingerprint, version) lives in the
//    manifest, NOT on the entity records — keeping entity schemas clean and
//    the user-facing UI uncluttered. Each migrated record is still fully
//    identifiable via manifest.records[<category>:<fingerprint>] -> entityId.

import { base44 } from '@/api/base44Client';
import { normalizeName } from '@/lib/kitchenGrocery';
import { startOfWeek, weekDates, todayStr } from '@/components/kitchen/kitchenConstants';

export const MIGRATION_VERSION = 1;
const MANIFEST_KEY = 'kitchen-migration-manifest';
const VERSION_KEY = 'kitchen-migration-version';

const LEGACY_KEYS = {
  recipes: 'kitchen-recipes',
  meals: 'kitchen-meals',
  grocery: 'kitchen-grocery',
  pantry: 'kitchen-pantry',
  freezer: 'kitchen-freezer',
  mealprep: 'kitchen-mealprep',
};

const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

// ---------- small helpers ----------
const str = (v) => (v == null ? '' : String(v));
const toArray = (v) => {
  if (Array.isArray(v)) return v.map((x) => str(x).trim()).filter(Boolean);
  if (typeof v === 'string') return v.split(',').map((s) => s.trim()).filter(Boolean);
  return [];
};
function readJSON(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
}
function parseNum(v) { const n = parseFloat(str(v).replace(/[^0-9.]/g, '')); return isNaN(n) ? 0 : n; }

// stable stringify (sorted object keys) for deterministic fingerprints
function stableStringify(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(stableStringify).join(',') + ']';
  const keys = Object.keys(v).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + stableStringify(v[k])).join(',') + '}';
}
function shortHash(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}
function fingerprint(category, obj) {
  return `${category}:${shortHash(stableStringify(obj))}`;
}

// ---------- manifest ----------
function emptyManifest() {
  return { version: 0, createdAt: new Date().toISOString(), completedAt: null, records: {}, categories: {} };
}
function loadManifest() {
  const m = readJSON(MANIFEST_KEY);
  if (!m || typeof m !== 'object') return emptyManifest();
  if (!m.records || typeof m.records !== 'object') m.records = {};
  if (!m.categories || typeof m.categories !== 'object') m.categories = {};
  return m;
}
function saveManifest(m) {
  try { localStorage.setItem(MANIFEST_KEY, JSON.stringify(m)); } catch { /* ignore quota */ }
}

// ---------- legacy normalizers (defensive — shapes are unknown) ----------
function normalizeRecipes(raw) {
  const arr = Array.isArray(raw) ? raw : [];
  const out = [];
  for (const r of arr) {
    if (!r) continue;
    if (typeof r === 'string') { if (r.trim()) out.push({ name: r.trim(), link: '', tags: [], notes: '' }); continue; }
    if (typeof r === 'object') {
      const name = str(r.name) || str(r.title) || str(r.text);
      if (!name) continue;
      out.push({
        name,
        link: str(r.link) || str(r.url) || str(r.source_url) || '',
        tags: toArray(r.tags),
        notes: str(r.notes) || str(r.note) || '',
      });
    }
  }
  return out;
}

function resolveDayIndex(day, weekday, fallback) {
  const d = str(day || weekday).toLowerCase().slice(0, 3);
  const idx = DAY_ORDER.indexOf(d);
  if (idx >= 0) return idx;
  if (typeof day === 'number' && day >= 0 && day <= 6) return day;
  return fallback;
}

// Returns [{ weekdayIndex: 0-6 (Mon=0), name, date? }]
function normalizeMeals(raw) {
  const out = [];
  if (!raw) return out;
  if (Array.isArray(raw)) {
    raw.forEach((item, i) => {
      if (item == null) return;
      if (typeof item === 'string') { if (item.trim()) out.push({ weekdayIndex: i, name: item.trim(), date: '' }); return; }
      if (typeof item === 'object') {
        const name = str(item.name) || str(item.meal) || str(item.text) || str(item.title);
        if (!name) return;
        out.push({ weekdayIndex: resolveDayIndex(item.day, item.weekday, i), name, date: str(item.date) || '' });
      }
    });
  } else if (typeof raw === 'object') {
    for (const k of Object.keys(raw)) {
      const idx = DAY_ORDER.indexOf(str(k).toLowerCase().slice(0, 3));
      if (idx < 0) continue;
      const v = raw[k];
      if (typeof v === 'string') { if (v.trim()) out.push({ weekdayIndex: idx, name: v.trim(), date: '' }); }
      else if (v && typeof v === 'object') {
        const name = str(v.name) || str(v.meal) || str(v.text);
        if (name) out.push({ weekdayIndex: idx, name, date: str(v.date) || '' });
      }
    }
  }
  return out;
}

function normalizeGrocery(raw) {
  const arr = Array.isArray(raw) ? raw : [];
  const out = [];
  for (const g of arr) {
    if (!g) continue;
    if (typeof g === 'string') { if (g.trim()) out.push({ name: g.trim(), aisle: '', done: false }); continue; }
    const name = str(g.name) || str(g.text) || str(g.item);
    if (!name) continue;
    out.push({ name, aisle: str(g.aisle) || str(g.category) || '', done: !!(g.done || g.checked) });
  }
  return out;
}

function normalizeFoodItems(raw) {
  const arr = Array.isArray(raw) ? raw : [];
  const out = [];
  for (const p of arr) {
    if (!p) continue;
    if (typeof p === 'string') { if (p.trim()) out.push({ name: p.trim(), qty: '' }); continue; }
    const name = str(p.name) || str(p.item);
    if (!name) continue;
    out.push({ name, qty: str(p.qty) || str(p.quantity) || '' });
  }
  return out;
}

function normalizeMealPrep(raw) {
  const arr = Array.isArray(raw) ? raw : [];
  const out = [];
  for (const t of arr) {
    if (!t) continue;
    if (typeof t === 'string') { if (t.trim()) out.push({ task: t.trim(), day: '', done: false }); continue; }
    const task = str(t.task) || str(t.text) || str(t.title) || str(t.name);
    if (!task) continue;
    out.push({ task, day: str(t.day) || str(t.weekday) || '', done: !!(t.done || t.completed || t.checked) });
  }
  return out;
}

// ---------- entity transforms ----------
function toRecipeEntity(r) {
  return {
    name: r.name,
    source_url: r.link,
    source: r.link ? 'Imported' : 'Family',
    source_type: r.link ? 'website' : 'user',
    tags: r.tags,
    notes: r.notes,
    ingredients: [], // legacy had no structured ingredients — do NOT invent
    instructions: [],
    category: 'other', // honest "uncategorized" — do NOT invent a meal category
  };
}
function toMealPlanEntity(meal, dateStr) {
  return {
    date: dateStr,
    meal_slot: 'dinner',
    meal_type: 'custom', // do NOT link to recipes by guessing
    custom_name: meal.name,
  };
}
function toGroceryEntity(g) {
  return {
    list_name: 'Weekly Groceries',
    name: g.name,
    normalized_name: normalizeName(g.name),
    category: g.aisle || 'Other',
    checked: g.done,
  };
}
function toInventoryEntity(item, zone) {
  return {
    name: item.name,
    normalized_name: normalizeName(item.name),
    zone,
    qty: item.qty,
    status: 'available',
  };
}
function toMealPrepSessionEntity(tasks) {
  return {
    name: 'Imported Prep Tasks',
    date: todayStr(),
    status: 'planned',
    notes: 'Imported from your previous Kitchen prep checklist.',
    items: [],
    tasks: tasks.map((t, i) => ({
      id: `imp-${Date.now()}-${i}`,
      text: t.day ? `${t.day} — ${t.task}` : t.task,
      type: 'custom',
      duration: 0,
      done: !!t.done,
      order: i,
    })),
    outputs: [],
  };
}

// ---------- generic per-record idempotent migrate ----------
async function migrateRecords({
  category, entityName, records, fpBase, buildEntity, naturalKey, manifest, reportCat,
}) {
  let existing = [];
  try { existing = await base44.entities[entityName].filter({}, '-created_date', 500); } catch { existing = []; }
  const existingMap = new Map();
  for (const e of existing) { const k = naturalKey(e); if (k) existingMap.set(k, e); }

  for (const rec of records) {
    const fp = fingerprint(category, fpBase(rec));
    if (manifest.records[fp]) { reportCat.skipped++; continue; } // already migrated
    const nk = naturalKey(rec);
    if (nk && existingMap.has(nk)) { manifest.records[fp] = existingMap.get(nk).id; saveManifest(manifest); reportCat.skipped++; continue; }
    try {
      const created = await base44.entities[entityName].create(buildEntity(rec));
      manifest.records[fp] = created.id;
      saveManifest(manifest); // safe if interrupted here
      existingMap.set(nk, created);
      reportCat.migrated++;
    } catch (e) {
      reportCat.failed++;
      reportCat.errors.push({ fingerprint: fp, error: str(e?.message || e) });
    }
  }

  // verification: read back the category and confirm every created record is readable
  reportCat.verified = true; // trivially true if nothing created
  // (created ids are tracked via manifest; verify by re-reading the list)
};

// verify reads back created records for a category
async function verifyCategory(entityName, manifest, category, reportCat) {
  const createdIds = Object.entries(manifest.records)
    .filter(([k]) => k.startsWith(category + ':'))
    .map(([, id]) => id);
  if (createdIds.length === 0) { reportCat.verified = true; return; }
  try {
    const all = await base44.entities[entityName].filter({}, '-created_date', 500);
    const ids = new Set(all.map((x) => x.id));
    reportCat.verified = createdIds.every((id) => ids.has(id));
  } catch { reportCat.verified = false; }
}

async function migrateMealPrep(legacyRaw, manifest, reportCat) {
  const tasks = normalizeMealPrep(legacyRaw);
  reportCat.total = tasks.length;
  if (tasks.length === 0) { reportCat.status = 'complete'; reportCat.verified = true; return; }

  const fp = fingerprint('mealprep', tasks); // whole checklist -> one session
  if (manifest.records[fp]) { reportCat.skipped = tasks.length; reportCat.status = 'complete'; reportCat.verified = true; return; }

  // natural-key guard: a session already named "Imported Prep Tasks"
  let existing = [];
  try { existing = await base44.entities.MealPrepSession.filter({ name: 'Imported Prep Tasks' }, '-created_date', 5); } catch { existing = []; }
  if (existing.length) {
    manifest.records[fp] = existing[0].id; saveManifest(manifest);
    reportCat.skipped = tasks.length; reportCat.status = 'complete'; reportCat.verified = true; return;
  }

  try {
    const session = await base44.entities.MealPrepSession.create(toMealPrepSessionEntity(tasks));
    manifest.records[fp] = session.id; saveManifest(manifest);
    reportCat.migrated = 1;
    // verify
    let got = null;
    try { got = await base44.entities.MealPrepSession.get(session.id); } catch { got = null; }
    reportCat.verified = !!got;
    reportCat.status = got ? 'complete' : 'partial';
  } catch (e) {
    reportCat.failed = 1;
    reportCat.errors.push({ error: str(e?.message || e) });
    reportCat.status = 'partial';
    reportCat.verified = false;
  }
}

function newCat() { return { status: 'pending', total: 0, migrated: 0, skipped: 0, failed: 0, verified: false, errors: [] }; }

// ---------- main orchestrator ----------
export async function runKitchenMigration() {
  const manifest = loadManifest();
  const report = {
    version: MIGRATION_VERSION,
    noLegacyData: false,
    alreadyMigrated: false,
    migratedTotal: 0,
    skippedTotal: 0,
    failedTotal: 0,
    categories: {},
    notes: [],
  };

  // read all legacy keys
  const legacy = {
    recipes: readJSON(LEGACY_KEYS.recipes),
    meals: readJSON(LEGACY_KEYS.meals),
    grocery: readJSON(LEGACY_KEYS.grocery),
    pantry: readJSON(LEGACY_KEYS.pantry),
    freezer: readJSON(LEGACY_KEYS.freezer),
    mealprep: readJSON(LEGACY_KEYS.mealprep),
  };

  const hasAny = Object.values(legacy).some((v) => v && (!Array.isArray(v) || v.length));
  if (!hasAny) {
    report.noLegacyData = true;
    manifest.version = MIGRATION_VERSION;
    manifest.completedAt = new Date().toISOString();
    saveManifest(manifest);
    return report;
  }

  // short-circuit if a prior run already completed all categories at this version
  const allComplete = manifest.version >= MIGRATION_VERSION && manifest.completedAt &&
    ['recipes', 'meals', 'grocery', 'pantry', 'freezer', 'mealprep']
      .every((c) => manifest.categories[c]?.status === 'complete');
  if (allComplete) {
    report.alreadyMigrated = true;
    return report;
  }

  // normalize legacy data
  const recipes = normalizeRecipes(legacy.recipes);
  const meals = normalizeMeals(legacy.meals);
  const grocery = normalizeGrocery(legacy.grocery);
  const pantry = normalizeFoodItems(legacy.pantry);
  const freezer = normalizeFoodItems(legacy.freezer);

  report.categories.recipes = { ...newCat(), total: recipes.length };
  report.categories.meals = { ...newCat(), total: meals.length };
  report.categories.grocery = { ...newCat(), total: grocery.length };
  report.categories.pantry = { ...newCat(), total: pantry.length };
  report.categories.freezer = { ...newCat(), total: freezer.length };
  report.categories.mealprep = { ...newCat(), total: normalizeMealPrep(legacy.mealprep).length };
  manifest.categories = manifest.categories || {};

  // --- recipes ---
  await migrateRecords({
    category: 'recipes', entityName: 'Recipe', records: recipes,
    fpBase: (r) => ({ n: r.name, l: r.link }),
    buildEntity: toRecipeEntity,
    naturalKey: (r) => `recipe|${str(r.name).toLowerCase()}`,
    manifest, reportCat: report.categories.recipes,
  });
  await verifyCategory('Recipe', manifest, 'recipes', report.categories.recipes);
  manifest.categories.recipes = { status: report.categories.recipes.failed ? 'partial' : 'complete', verified: report.categories.recipes.verified };
  saveManifest(manifest);

  // --- meals ---
  // Legacy meals were weekday-labeled dinners with no stored calendar date.
  // Map to the current week's Mon–Sun using the app's week start (Monday).
  // If a record carried an explicit date, preserve it. (Limitation documented.)
  const week = weekDates(startOfWeek());
  await migrateRecords({
    category: 'meals', entityName: 'MealPlanEntry', records: meals,
    fpBase: (m) => ({ w: m.weekdayIndex, n: m.name, d: m.date }),
    buildEntity: (m) => toMealPlanEntity(m, m.date || week[m.weekdayIndex]),
    naturalKey: (m) => `meal|dinner|${str(m.name).toLowerCase()}`, // weak key (no date) to avoid cross-week dup
    manifest, reportCat: report.categories.meals,
  });
  await verifyCategory('MealPlanEntry', manifest, 'meals', report.categories.meals);
  manifest.categories.meals = { status: report.categories.meals.failed ? 'partial' : 'complete', verified: report.categories.meals.verified };
  saveManifest(manifest);
  report.notes.push('Legacy meal-plan entries had weekday labels only (no stored calendar dates). They were mapped to the current week (Mon–Sun) dinner slots matching their original weekday.');

  // --- grocery ---
  await migrateRecords({
    category: 'grocery', entityName: 'GroceryItem', records: grocery,
    fpBase: (g) => ({ n: g.name, a: g.aisle, d: g.done }),
    buildEntity: toGroceryEntity,
    naturalKey: (g) => `grocery|Weekly Groceries|${normalizeName(g.name)}`,
    manifest, reportCat: report.categories.grocery,
  });
  await verifyCategory('GroceryItem', manifest, 'grocery', report.categories.grocery);
  manifest.categories.grocery = { status: report.categories.grocery.failed ? 'partial' : 'complete', verified: report.categories.grocery.verified };
  saveManifest(manifest);

  // --- pantry ---
  await migrateRecords({
    category: 'pantry', entityName: 'FoodInventoryItem', records: pantry,
    fpBase: (p) => ({ n: p.name, q: p.qty }),
    buildEntity: (p) => toInventoryEntity(p, 'pantry'),
    naturalKey: (p) => `inv|pantry|${normalizeName(p.name)}`,
    manifest, reportCat: report.categories.pantry,
  });
  await verifyCategory('FoodInventoryItem', manifest, 'pantry', report.categories.pantry);
  manifest.categories.pantry = { status: report.categories.pantry.failed ? 'partial' : 'complete', verified: report.categories.pantry.verified };
  saveManifest(manifest);

  // --- freezer ---
  await migrateRecords({
    category: 'freezer', entityName: 'FoodInventoryItem', records: freezer,
    fpBase: (p) => ({ n: p.name, q: p.qty }),
    buildEntity: (p) => toInventoryEntity(p, 'freezer'),
    naturalKey: (p) => `inv|freezer|${normalizeName(p.name)}`,
    manifest, reportCat: report.categories.freezer,
  });
  await verifyCategory('FoodInventoryItem', manifest, 'freezer', report.categories.freezer);
  manifest.categories.freezer = { status: report.categories.freezer.failed ? 'partial' : 'complete', verified: report.categories.freezer.verified };
  saveManifest(manifest);

  // --- meal prep (single legacy session) ---
  await migrateMealPrep(legacy.mealprep, manifest, report.categories.mealprep);
  manifest.categories.mealprep = { status: report.categories.mealprep.status, verified: report.categories.mealprep.verified };
  saveManifest(manifest);

  // finalize version marker only if every category verified
  const allVerified = Object.values(report.categories).every((c) => c.verified);
  if (allVerified) {
    manifest.version = MIGRATION_VERSION;
    manifest.completedAt = new Date().toISOString();
    saveManifest(manifest);
  } else {
    report.notes.push('One or more categories could not be fully verified; migration version not finalized. Re-running will safely continue without duplicating.');
  }

  // totals
  for (const c of Object.values(report.categories)) {
    report.migratedTotal += c.migrated || 0;
    report.skippedTotal += c.skipped || 0;
    report.failedTotal += c.failed || 0;
  }

  // dev/debug log (not user-facing)
  // eslint-disable-next-line no-console
  console.info('[Kitchen Migration]', report);
  return report;
}

// dev/debug accessor — returns the stored manifest (migration metadata)
export function getMigrationManifest() {
  return loadManifest();
}