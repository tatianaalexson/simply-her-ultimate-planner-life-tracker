// Recurrence engine for Kitchen Meal Plan recurring meals.
//
// A recurring meal is stored as a single MealPlanEntry "series" record:
//   { series_id, rrule_freq, rrule_interval, rrule_days[], rrule_until, excluded_dates[], date (start) }
// Occurrences are computed on the fly for a given date range — we never
// materialize endless future records.
//
// Exceptions (one-off overrides for a specific date+slot) are stored as
// separate MealPlanEntry records with is_exception=true, exception_of=series_id.
//
// Supported rules:
//   weekly    → every rrule_interval weeks, on rrule_days (or the start day)
//   biweekly  → shorthand for weekly with interval 2
//   weekdays  → Mon–Fri every week
//   monthly   → same day-of-month each month
//   custom    → every rrule_interval weeks, on rrule_days

const MS_DAY = 86400000;

export const RRULE_FREQS = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'weekly', label: 'Every week' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'weekdays', label: 'Weekdays (Mon–Fri)' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom' },
];

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Monday-based weekday index (0=Mon … 6=Sun) for a Date.
export const mondayIdx = (d) => (d.getDay() + 6) % 7;

const toDate = (s) => (s ? new Date(s + 'T00:00:00') : null);
const toStr = (d) => d ? d.toISOString().slice(0, 10) : '';

// Generate occurrence dates for a series within [from, to] inclusive.
export function occurrencesForSeries(series, from, to) {
  if (!series || !series.series_id || !series.rrule_freq || series.rrule_freq === 'none') return [];
  const start = toDate(series.date);
  const fromD = toDate(from);
  const toD = toDate(to);
  if (!start || !fromD || !toD) return [];
  const until = series.rrule_until ? toDate(series.rrule_until) : null;
  const excluded = new Set(series.excluded_dates || []);
  const days = series.rrule_days || [];
  const interval = series.rrule_interval || 1;
  const slot = series.meal_slot;

  const out = [];
  const freq = series.rrule_freq;

  // Cap iterations to avoid runaway loops (~2 years max).
  const cap = new Date(toD.getTime() + MS_DAY);
  let cursor = new Date(start);
  let guard = 0;
  while (cursor <= cap && guard < 800) {
    guard++;
    if (cursor >= fromD && cursor <= toD) {
      const ds = toStr(cursor);
      if (!excluded.has(ds) && matchesRule(cursor, start, freq, interval, days)) {
        out.push(ds);
      }
    }
    cursor = new Date(cursor.getTime() + MS_DAY);
  }
  return out.filter((ds) => !until || toDate(ds) <= until);
}

function matchesRule(date, start, freq, interval, days) {
  const wd = mondayIdx(date);
  switch (freq) {
    case 'weekly': {
      if (days.length) return days.includes(wd);
      return wd === mondayIdx(start);
    }
    case 'biweekly': {
      if (days.length && !days.includes(wd)) return false;
      const baseWd = days.length ? days[0] : mondayIdx(start);
      if (wd !== baseWd) return false;
      const weeksDiff = Math.round((date - start) / (MS_DAY * 7));
      return weeksDiff >= 0 && weeksDiff % 2 === 0;
    }
    case 'weekdays':
      return wd < 5;
    case 'monthly':
      return date.getDate() === start.getDate();
    case 'custom': {
      if (days.length && !days.includes(wd)) return false;
      const weeksDiff = Math.round((date - start) / (MS_DAY * 7));
      return weeksDiff >= 0 && weeksDiff % Math.max(1, interval) === 0;
    }
    default:
      return false;
  }
}

// Expand a flat meals list into a combined list including virtual recurring
// occurrences for [from, to]. Exception records override series occurrences
// for their date+slot.
export function expandRecurring(meals, from, to) {
  const series = meals.filter((m) => m.series_id && m.rrule_freq && m.rrule_freq !== 'none' && !m.is_exception);
  const exceptions = meals.filter((m) => m.is_exception && m.exception_of);
  const plain = meals.filter((m) => !m.series_id || m.rrule_freq === 'none' || (m.series_id && m.rrule_freq === 'none'));

  const virtual = [];
  for (const s of series) {
    const dates = occurrencesForSeries(s, from, to);
    for (const ds of dates) {
      const hasException = exceptions.some((e) => e.exception_of === s.series_id && e.date === ds && e.meal_slot === s.meal_slot);
      const hasPlain = plain.some((p) => p.date === ds && p.meal_slot === s.meal_slot);
      if (hasException || hasPlain) continue;
      virtual.push({ ...s, id: `virtual:${s.id}:${ds}`, date: ds, _virtual: true, _series_id: s.series_id, _series_record_id: s.id });
    }
  }
  return [...plain, ...exceptions, ...virtual];
}

// Human-readable summary of a rule.
export function describeRule(series) {
  if (!series || !series.rrule_freq || series.rrule_freq === 'none') return '';
  const days = series.rrule_days || [];
  const dayLabel = days.length ? days.map((d) => WEEKDAYS[d] || '').join(', ') : '';
  switch (series.rrule_freq) {
    case 'weekly': return days.length ? `Weekly · ${dayLabel}` : 'Weekly';
    case 'biweekly': return days.length ? `Every 2 weeks · ${dayLabel}` : 'Every 2 weeks';
    case 'weekdays': return 'Weekdays';
    case 'monthly': return 'Monthly';
    case 'custom': return `Every ${series.rrule_interval || 1} wk${days.length ? ` · ${dayLabel}` : ''}`;
    default: return '';
  }
}

export const isSeries = (m) => !!m && !!m.series_id && m.rrule_freq && m.rrule_freq !== 'none' && !m.is_exception;
export const isVirtual = (m) => !!m && !!m._virtual;
export const isException = (m) => !!m && !!m.is_exception;

// Create a new series id.
export const newSeriesId = () => `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;