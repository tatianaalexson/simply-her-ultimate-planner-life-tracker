// =====================================================
// CAPABILITY DETECTOR
// Honestly reports what the current Simply Her runtime can support.
// This is the SINGLE SOURCE OF TRUTH for platform capability.
// Never fake capabilities. Never claim Health Connect works on web.
// =====================================================

/**
 * Detects the current runtime platform and its health-sync capabilities.
 * Returns a frozen capability object used throughout the app.
 */
export function detectPlatformCapabilities() {
  const isBrowser = typeof window !== 'undefined';

  // Detect potential native bridges (Capacitor, Cordova, etc.)
  // In a standard Vite web app these will not exist.
  const hasCapacitor = isBrowser && !!window.Capacitor;
  const hasCordova = isBrowser && !!window.cordova;
  const hasWebkitBridge = isBrowser && !!window.webkit?.messageHandlers?.healthConnect;

  const hasNativeBridge = hasCapacitor || hasCordova || hasWebkitBridge;

  // Runtime classification
  let runtime = 'unknown';
  if (isBrowser && !hasNativeBridge) {
    runtime = 'web_app';
  } else if (hasCapacitor) {
    runtime = 'capacitor_hybrid';
  } else if (hasCordova) {
    runtime = 'cordova_hybrid';
  } else if (hasWebkitBridge) {
    runtime = 'native_bridge';
  }

  // Platform-specific capability checks
  const isNativeAndroid = hasCapacitor && !!window.Capacitor?.getPlatform && window.Capacitor.getPlatform() === 'android';

  // Health Connect requires Android native SDK access.
  // A pure web app CANNOT call Health Connect APIs directly.
  // Even in a Capacitor app, a dedicated Health Connect plugin would be required.
  const healthConnectAvailable = isNativeAndroid && !!window.Capacitor?.Plugins?.HealthConnect;

  // Google Health API requires server-side OAuth token exchange.
  // No Google Health API connector is registered in this workspace.
  const googleHealthConnectorAvailable = false; // No connector configured

  // Webhook support requires a backend endpoint — not currently deployed.
  const webhookSupport = false;

  // Background sync requires native background task support.
  const backgroundSyncSupport = isNativeAndroid && healthConnectAvailable;

  // Secure token storage requires backend functions with secrets.
  const secureTokenStorageAvailable = true; // Backend functions support secrets

  return Object.freeze({
    runtime,
    isBrowser,
    isWebOnly: runtime === 'web_app',
    isNativeAndroid,
    isNativeIOS: hasCapacitor && !!window.Capacitor?.getPlatform && window.Capacitor.getPlatform() === 'ios',

    // Provider availability
    healthConnect: {
      available: healthConnectAvailable,
      reason: healthConnectAvailable
        ? null
        : runtime === 'web_app'
          ? 'Health Connect requires Simply Her\'s Android device integration. It cannot be accessed from a web browser.'
          : 'Health Connect requires an Android native layer with Health Connect SDK permissions.',
      status: healthConnectAvailable ? 'available' : 'unavailable',
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
    googleHealthStatus: caps.googleHealth.status,
    webhookStatus: caps.webhookSupport.available ? 'available' : 'unsupported',
    backgroundSyncStatus: caps.backgroundSync.available ? 'available' : 'unsupported',
    honestAssessment: caps.isWebOnly
      ? 'Simply Her is currently a web application. Health Connect (Android native) is not available. Google Health API requires backend OAuth configuration that has not been set up yet. All health data sync architecture is in place but cannot synchronize real data until the platform supports it.'
      : 'Platform capability detected. See individual provider statuses.',
  };
}