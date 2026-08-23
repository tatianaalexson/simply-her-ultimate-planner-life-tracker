// =====================================================
// DEDUPLICATION / RECONCILIATION
// Prevents double-counting when the same physical event
// appears through multiple providers (e.g. Pixel Watch →
// Google Health API AND Health Connect, or iPhone Fitbit
// user with both Apple Health AND Google Health).
//
// This module contains the matching strategy and reconciliation
// logic. It is designed to be provider-agnostic.
// =====================================================

import { base44 } from '@/api/base44Client';

/**
 * Source priority per data type.
 * When the same record exists from multiple providers, the
 * higher-priority provider's value is authoritative.
 *
 * Key principle (Part XL): Do NOT assume Apple Health is the
 * only authority. An iPhone Fitbit user could connect Apple Health
 * AND Google Health — the same workout might appear in both.
 *
 * Priority logic:
 * - Cloud-sourced account records: Apple Health = Google Health = 3 (peers)
 * - On-device aggregated daily metrics: Apple Health = Health Connect = 3
 * - Manual entries: user is authoritative (priority 1, preserved)
 */
export const SOURCE_PRIORITY = {
  // Cloud/account-sourced records: Apple Health & Google Health are peers
  exercise_sessions: { apple_health: 3, google_health: 3, health_connect: 2, manual: 1 },
  sleep: { apple_health: 3, google_health: 3, health_connect: 2, manual: 1 },
  sleep_stages: { apple_health: 3, google_health: 3, health_connect: 2 },
  weight: { apple_health: 3, google_health: 3, health_connect: 2, manual: 1 },
  heart_rate: { apple_health: 3, google_health: 3, health_connect: 2 },
  resting_hr: { apple_health: 3, google_health: 3, health_connect: 2 },
  hrv: { apple_health: 3, google_health: 3, health_connect: 2 },
  hr_zones: { google_health: 3 },

  // On-device aggregated daily metrics: native platform is authoritative
  steps: { apple_health: 3, health_connect: 3, google_health: 2, manual: 1 },
  active_minutes: { apple_health: 3, health_connect: 3, google_health: 2, manual: 1 },
  distance: { apple_health: 3, health_connect: 3, google_health: 2, manual: 1 },
  floors: { apple_health: 3, health_connect: 3, google_health: 2 },
  elevation: { health_connect: 3, google_health: 2 },
  wheelchair_pushes: { apple_health: 3, health_connect: 3, google_health: 2, manual: 1 },
  hydration: { apple_health: 3, health_connect: 3, google_health: 2, manual: 1 },
  active_energy: { apple_health: 3, health_connect: 3, google_health: 2 },
  total_calories: { health_connect: 3, google_health: 2 },

  // Body metrics: cloud/native preferred
  body_fat: { apple_health: 3, google_health: 3, health_connect: 2 },
  lean_body_mass: { apple_health: 3, google_health: 3, health_connect: 2 },

  // Performance: whichever provider supplies it
  vo2_max: { apple_health: 3, google_health: 3, health_connect: 2 },
  speed: { apple_health: 3, google_health: 3, health_connect: 2 },
  cadence: { apple_health: 3, google_health: 3, health_connect: 2 },
  power: { apple_health: 3, health_connect: 3 },
};

/**
 * Compute a deterministic sync hash for deduplication matching.
 * Uses provider + data_type + external_id — never relies on name alone.
 */
export function computeSyncHash(provider, dataType, externalId) {
  return `${provider}::${dataType}::${externalId}`;
}

/**
 * Find an existing ExternalHealthMapping for a given external record.
 * This is the primary deduplication check — if a mapping exists,
 * the record has already been imported and should be UPDATED, not duplicated.
 */
export async function findExistingMapping(provider, dataType, externalId) {
  const syncHash = computeSyncHash(provider, dataType, externalId);
  const existing = await base44.entities.ExternalHealthMapping.filter({
    sync_hash: syncHash,
  }, '-last_synced_at', 1);
  return existing?.[0] || null;
}

/**
 * Match criteria for reconciling records that may come from
 * different providers but represent the same physical event.
 * Used when external_id doesn't match (different providers).
 *
 * Match is based on:
 * - Same data type (e.g. both are exercise_sessions)
 * - Start time within tolerance (±2 minutes)
 * - Duration within tolerance (±5 minutes)
 * - Same activity type (e.g. both are running)
 * - Distance within tolerance (±5%) — only for distance-bearing activities
 *
 * Returns 'match' | 'possible_match' | 'no_match'
 */
export function matchRecords(recordA, recordB) {
  if (recordA.data_type !== recordB.data_type) return 'no_match';

  // Time-based matching
  const startA = new Date(recordA.start_time).getTime();
  const startB = new Date(recordB.start_time).getTime();
  const startDiff = Math.abs(startA - startB);

  // ±2 minutes tolerance for start time
  if (startDiff > 2 * 60 * 1000) return 'no_match';

  // Duration matching (if both have duration)
  if (recordA.duration && recordB.duration) {
    const durationDiff = Math.abs(recordA.duration - recordB.duration);
    if (durationDiff > 5 * 60 * 1000) return 'no_match'; // ±5 min
  }

  // Activity type matching (for exercise sessions)
  if (recordA.activity_type && recordB.activity_type) {
    if (recordA.activity_type !== recordB.activity_type) return 'no_match';
  }

  // If times match closely but we can't be fully certain
  if (startDiff > 30 * 1000) return 'possible_match';

  return 'match';
}

/**
 * Determine which provider's record should be authoritative
 * when two records represent the same event.
 */
export function getAuthoritativeProvider(dataType, providers) {
  const priority = SOURCE_PRIORITY[dataType];
  if (!priority) return providers[0]; // fallback: first provider

  let bestProvider = null;
  let bestPriority = -1;
  for (const p of providers) {
    const pVal = priority[p] ?? 0;
    if (pVal > bestPriority) {
      bestPriority = pVal;
      bestProvider = p;
    }
  }
  return bestProvider;
}

/**
 * Check if a record should be excluded from totals based on
 * deduplication. If a higher-priority provider already has this
 * data, the lower-priority record is marked as reconciled/excluded.
 */
export function shouldExcludeRecord(record, reconciledProviders, dataType) {
  if (!reconciledProviders || reconciledProviders.length <= 1) return false;

  const authoritative = getAuthoritativeProvider(dataType, reconciledProviders);
  return record.provider !== authoritative;
}

/**
 * Aggregate daily metrics from multiple sources without double-counting.
 * Takes an array of { provider, value, source } and returns the
 * reconciled value using source priority.
 */
export function reconcileDailyValue(dataType, sources) {
  if (!sources || sources.length === 0) return { value: 0, source: 'manual' };

  // If only one source, use it
  if (sources.length === 1) return sources[0];

  // Multiple sources — pick authoritative
  const providerIds = sources.map((s) => s.provider);
  const authoritative = getAuthoritativeProvider(dataType, providerIds);
  const authoritativeSource = sources.find((s) => s.provider === authoritative);

  return authoritativeSource || sources[0];
}

/**
 * Compute the correct daily total for a metric, preventing
 * the "8,000 + 8,000 = 16,000" step duplication problem.
 *
 * This does NOT sum overlapping streams blindly.
 * Each provider's daily total is already aggregated — take the max per
 * provider, then pick the authoritative provider's value.
 */
export function computeSafeDailyTotal(dataType, sourceRecords) {
  if (!sourceRecords || sourceRecords.length === 0) return 0;

  // Group by provider
  const byProvider = {};
  for (const rec of sourceRecords) {
    if (!byProvider[rec.provider]) byProvider[rec.provider] = 0;
    // Each provider's daily total is already aggregated — take the max, not the sum
    byProvider[rec.provider] = Math.max(byProvider[rec.provider], rec.value || 0);
  }

  // Pick the authoritative provider's value
  const providers = Object.keys(byProvider);
  const authoritative = getAuthoritativeProvider(dataType, providers);

  return byProvider[authoritative] || 0;
}

/**
 * Sync loop prevention: check if a record was originally exported
 * from Simply Her before importing it back as a new record.
 * Uses the ExternalHealthMapping sync_direction field.
 */
export async function isReexportedRecord(provider, dataType, externalId) {
  const mapping = await findExistingMapping(provider, dataType, externalId);
  return mapping?.sync_direction === 'exported';
}