import { registerPlugin } from '@capacitor/core';

/**
 * HealthKit Native Bridge Interface
 *
 * This is the JavaScript-side interface to the native SimplyHerHealthKit
 * Capacitor plugin. The native Swift implementation must be created in Xcode
 * (see NATIVE_SETUP.md for instructions).
 *
 * The React application communicates ONLY through this interface — never
 * directly with native HealthKit APIs. This keeps provider-specific logic
 * isolated from shared UI components.
 *
 * When the native plugin is not available (web, or native without the plugin),
 * all methods return "not available" results gracefully.
 */

// Web implementation — all methods return "not available"
const webImplementation = {
  isAvailable: async () => ({ available: false, reason: 'HealthKit requires iOS native bridge' }),
  requestAuthorization: async () => ({ granted: false, reason: 'HealthKit not available' }),
  getAuthorizationStatus: async () => ({ status: 'not_determined' }),
  readSteps: async () => ({ records: [] }),
  readWorkouts: async () => ({ records: [] }),
  readSleep: async () => ({ records: [] }),
  readHeartRate: async () => ({ records: [] }),
  readBodyMetrics: async () => ({ records: [] }),
  readActiveEnergy: async () => ({ records: [] }),
  readHydration: async () => ({ records: [] }),
  readDistance: async () => ({ records: [] }),
  readFlightsClimbed: async () => ({ records: [] }),
  readWheelchairPushes: async () => ({ records: [] }),
  writeWorkout: async () => ({ success: false, reason: 'HealthKit not available' }),
  writeHydration: async () => ({ success: false, reason: 'HealthKit not available' }),
  writeBodyMetric: async () => ({ success: false, reason: 'HealthKit not available' }),
};

const HealthKitBridge = registerPlugin('SimplyHerHealthKit', {
  web: () => Promise.resolve(webImplementation),
});

export default HealthKitBridge;

// ── Safe convenience wrappers ───────────────────────────

export async function isHealthKitAvailable() {
  try {
    const result = await HealthKitBridge.isAvailable();
    return result.available === true;
  } catch {
    return false;
  }
}

export async function requestHealthKitAuthorization(readTypes, writeTypes) {
  try {
    return await HealthKitBridge.requestAuthorization({ readTypes, writeTypes });
  } catch (err) {
    return { granted: false, reason: err?.message || 'Authorization request failed' };
  }
}