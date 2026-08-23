// =====================================================
// CAPABILITY DETECTOR
// Honestly reports what the current Simply Her runtime can support.
// This is the SINGLE SOURCE OF TRUTH for platform capability.
// Never fake capabilities. Never claim HealthKit works on web.
// =====================================================

import { Capacitor } from '@capacitor/core';

/**
 * Detects the current runtime platform and its health-sync capabilities.
 * Returns a frozen capability object used throughout the app.
 */
export function detectPlatformCapabilities() {
  const isBrowser = typeof window !== 'undefined';
  const hasCapacitor = Capacitor.isNativePlatform();

  // Runtime classification via Capacitor
  let runtime = 'web_app';
  let isNativeIOS = false;
  let isNativeAndroid = false;

  if (hasCapacitor) {
    const platform = Capacitor.getPlatform();
    if (platform === 'ios') {
      runtime = 'native_ios';
      isNativeIOS = true;
    } else if (platform === 'android') {
      runtime = 'native_android';
      isNativeAndroid = true;
    }
  }

  // ── Health Connect ───────────────────────────────────
  // Requires Android native + Health Connect SDK.
  const healthConnectAvailable = isNativeAndroid &&
    !!Capacitor.Plugins?.HealthConnect;

  // ── Apple Health / HealthKit ──────────────────────────
  // Requires iOS native + the SimplyHerHealthKit plugin (must be implemented in Xcode).
  const healthKitPluginExists = isNativeIOS &&
    !!Capacitor.Plugins?.SimplyHerHealthKit;

  // HealthKit itself is available on iPhone (not iPad without Health).
  // The plugin must be implemented AND the device must be an iPhone.
  const healthKitAvailable = healthKitPluginExists; // Device check happens in native layer

  // ── Google Health API ─────────────────────────────────
  // Requires server-side OAuth. No connector registered.
  const googleHealthConnectorAvailable = false;

  // ── Infrastructure ────────────────────────────────────
  const webhookSupport = false;
  const backgroundSyncSupport = isNativeAndroid && healthConnectAvailable;
  const secureTokenStorageAvailable = true;

  return Object.freeze({
    runtime,
    isBrowser,
    isWebOnly: runtime === 'web_app',
    isNativeIOS,
    isNativeAndroid,

    // Provider availability
    healthConnect: {
      available: healthConnectAvailable,
      reason: healthConnectAvailable
        ? null
        : runtime === 'web_app'
          ? 'Health Connect requires Simply Her\'s Android device integration. It cannot be accessed from a web browser.'
          : isNativeIOS
            ? 'Health Connect is an Android platform. Use Apple Health on iOS.'
            : 'Health Connect requires an Android native layer with Health Connect SDK permissions.',
      status: healthConnectAvailable ? 'available' : 'unavailable',
    },

    appleHealth: {
      available: healthKitAvailable,
      reason: healthKitAvailable
        ? null
        : runtime === 'web_app'
          ? 'Apple Health requires Simply Her\'s iOS native integration. Install the development build on iPhone to enable HealthKit.'
          : isNativeAndroid
            ? 'Apple Health is an iOS platform. Use Health Connect on Android.'
            : isNativeIOS && !healthKitPluginExists
              ? 'HealthKit native plugin not found. The SimplyHerHealthKit plugin must be implemented in Xcode (see NATIVE_SETUP.md).'
              : 'Apple Health / HealthKit is not available on this platform.',
      status: healthKitAvailable ? 'available' : 'requires_native_plugin',
    },

    googleHealth: {
      available: googleHealthConnectorAvailable,
      reason: googleHealthConnectorAvailable
        ? null
        : 'Google Health API requires a backend OAuth configuration. No Google Health connector is registered in this workspace yet.',
      status: googleHealthConnectorAvailable ? 'available' : 'requires_configuration',
    },

    // Infrastructure capabilities
    webhookSupport: {
      available: webhookSupport,
      reason: webhookSupport ? null : 'Webhook-driven sync requires a deployed backend webhook endpoint.',
    },
    backgroundSync: {
      available: backgroundSyncSupport,
      reason: backgroundSyncSupport ? null : 'Background sync requires native Android Health Connect background permissions.',
    },
    secureTokenStorage: {
      available: secureTokenStorageAvailable,
    },
  });
}

// Singleton — capabilities don't change during a session
let _cached = null;
export function getCapabilities() {
  if (!_cached) {
    _cached = detectPlatformCapabilities();
  }
  return _cached;
}

// Human-readable summary for the capability audit report
export function getCapabilitySummary() {
  const caps = getCapabilities();
  return {
    runtime: caps.runtime,
    healthConnectStatus: caps.healthConnect.status,
    appleHealthStatus: caps.appleHealth.status,
    googleHealthStatus: caps.googleHealth.status,
    webhookStatus: caps.webhookSupport.available ? 'available' : 'unsupported',
    backgroundSyncStatus: caps.backgroundSync.available ? 'available' : 'unsupported',
    honestAssessment: caps.isWebOnly
      ? 'Simply Her is currently a web application. Apple Health (HealthKit) requires iOS native — install the development build on iPhone. Health Connect (Android) is not available. Google Health API requires backend OAuth configuration. All health sync architecture is in place but cannot synchronize real data until native builds are configured.'
      : caps.isNativeIOS
        ? 'Running on iOS native. Apple Health / HealthKit availability depends on the SimplyHerHealthKit plugin being implemented in Xcode.'
        : caps.isNativeAndroid
          ? 'Running on Android native. Health Connect availability depends on the native SDK being configured.'
          : 'Platform capability detected. See individual provider statuses.',
  };
}