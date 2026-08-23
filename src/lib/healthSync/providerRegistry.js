// =====================================================
// PROVIDER REGISTRY
// Defines the two Google-ecosystem health providers behind a
// common Simply Her health-sync abstraction. Future providers
// (Apple Health, Garmin, etc.) can be added here without
// rewriting Fitness components.
// =====================================================

import { getCapabilities } from './capabilityDetector';

/**
 * Provider definitions. Each provider declares:
 * - id, label, description (user-facing)
 * - type (how it connects: native_android, oauth_api)
 * - supportedDataTypes (from the health data catalog)
 * - platformCapabilityCheck (honest availability)
 *
 * The rest of Fitness should NEVER contain `if google_health` or
 * `if health_connect` checks — it uses the provider interface.
 */
export const PROVIDERS = {
  health_connect: {
    id: 'health_connect',
    label: 'Health Connect',
    shortLabel: 'Health Connect',
    description: 'Use fitness data from compatible apps and devices on this Android device.',
    connectLabel: 'Connect Health Connect',
    type: 'native_android',
    icon: 'smartphone',
    color: 'blue',
    requiresNativeLayer: true,
    platformCapabilityKey: 'healthConnect',
    supportedDirections: { read: true, write: true },
    userFacingCopy: {
      rationale: 'Simply Her can use your activity data so you don\'t have to enter it twice.',
      connectDescription: 'Bring in activity tracked by compatible Android health apps and devices.',
    },
  },

  google_health: {
    id: 'google_health',
    label: 'Google Health',
    shortLabel: 'Google Health',
    description: 'Connect Fitbit & Pixel Watch data through Google Health.',
    connectLabel: 'Connect Google Health',
    type: 'oauth_api',
    icon: 'heart-pulse',
    color: 'rose',
    requiresNativeLayer: false,
    platformCapabilityKey: 'googleHealth',
    supportedDirections: { read: true, write: true },
    userFacingCopy: {
      rationale: 'Keep your fitness data together. Bring in activity tracked by Fitbit, Pixel Watch, and the Google health ecosystem.',
      connectDescription: 'Choose what Simply Her can access from your Google Health account.',
    },
  },

  apple_health: {
    id: 'apple_health',
    label: 'Apple Health',
    shortLabel: 'Apple Health',
    description: 'Use fitness and activity data stored in Apple Health.',
    connectLabel: 'Connect Apple Health',
    type: 'native_ios',
    icon: 'apple',
    color: 'rose',
    requiresNativeLayer: true,
    platformCapabilityKey: 'appleHealth',
    supportedDirections: { read: true, write: true },
    userFacingCopy: {
      rationale: 'Simply Her uses the health and fitness information you choose to share so your activity, workouts, sleep, and other enabled fitness information can appear without entering it twice.',
      connectDescription: 'Choose what Simply Her can access from your Apple Health data.',
    },
  },
};

// Future providers — not built, but the architecture supports them
export const FUTURE_PROVIDERS = [
  { id: 'apple_health', label: 'Apple Health', description: 'Available when Simply Her adds iOS device integration.', status: 'future' },
  { id: 'garmin', label: 'Garmin', description: 'Garmin Connect integration.', status: 'future' },
];

/**
 * Get a provider definition by ID
 */
export function getProvider(providerId) {
  return PROVIDERS[providerId] || null;
}

/**
 * Get all registered providers
 */
export function getAllProviders() {
  return Object.values(PROVIDERS);
}

/**
 * Honestly check whether a provider is available on the current platform.
 * This is the function every component should use — not direct capability checks.
 */
export function isProviderAvailable(providerId) {
  const provider = getProvider(providerId);
  if (!provider) return { available: false, reason: 'Unknown provider' };

  const caps = getCapabilities();
  const capability = caps[provider.platformCapabilityKey];

  return {
    available: capability?.available ?? false,
    status: capability?.status ?? 'unavailable',
    reason: capability?.reason ?? 'Provider not available',
  };
}

/**
 * Connection status states for UI rendering.
 * Maps provider status to user-friendly labels and colors.
 */
export const CONNECTION_STATES = {
  not_connected: { label: 'Not Connected', color: 'muted', action: 'Connect' },
  connecting: { label: 'Connecting…', color: 'amber', action: null },
  connected: { label: 'Connected', color: 'green', action: 'Manage' },
  permission_needed: { label: 'Permission Needed', color: 'amber', action: 'Update Access' },
  syncing: { label: 'Syncing…', color: 'blue', action: null },
  sync_failed: { label: 'Last Sync Failed', color: 'rose', action: 'Try Again' },
  disconnected: { label: 'Disconnected', color: 'muted', action: 'Reconnect' },
  unavailable: { label: 'Unavailable', color: 'muted', action: null },
};

export function getConnectionState(status) {
  return CONNECTION_STATES[status] || CONNECTION_STATES.not_connected;
}

/**
 * Map Simply Her movement categories to provider exercise types.
 * Used for workout import/export.
 */
export const EXERCISE_TYPE_MAPPING = {
  walking: { health_connect: 'WALKING', google_health: 'walking' },
  running: { health_connect: 'RUNNING', google_health: 'running' },
  cycling: { health_connect: 'BIKING', google_health: 'cycling' },
  swimming: { health_connect: 'SWIMMING_OPEN_WATER', google_health: 'swimming' },
  strength: { health_connect: 'STRENGTH_TRAINING', google_health: 'strength_training' },
  yoga: { health_connect: 'YOGA', google_health: 'yoga' },
  pilates: { health_connect: 'PILATES', google_health: 'pilates' },
  hiking: { health_connect: 'HIKING', google_health: 'hiking' },
  rowing: { health_connect: 'ROWING_MACHINE', google_health: 'rowing' },
  dancing: { health_connect: 'DANCING', google_health: 'dancing' },
  hiit: { health_connect: 'HIGH_INTENSITY_INTERVAL_TRAINING', google_health: 'hiit' },
  wheelchair: { health_connect: 'WHEELCHAIR', google_health: 'wheelchair' },
  stretching: { health_connect: 'STRETCHING', google_health: 'stretching' },
  mobility: { health_connect: 'MOBILITY', google_health: 'other' },
  custom: { health_connect: 'OTHER', google_health: 'other' },
};

/**
 * Get the provider-specific exercise type for a Simply Her movement category
 */
export function getProviderExerciseType(movementCategory, providerId) {
  const mapping = EXERCISE_TYPE_MAPPING[movementCategory];
  return mapping?.[providerId] || (providerId === 'health_connect' ? 'OTHER' : 'other');
}