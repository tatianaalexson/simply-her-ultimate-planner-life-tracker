// Simply Her — Native Mobile Configuration Constants
// Central source of truth for native app identity, versions, and permissions.

import { Capacitor } from '@capacitor/core';

// ── App Identity ──────────────────────────────────────
// PROPOSED Bundle/Application Identifier.
// The owner must confirm they own simplyher.com, or choose a different domain.
// This must remain stable for: Apple Developer, App Store Connect, HealthKit,
// push notifications, OAuth callbacks, associated domains, Android app ID.
export const BUNDLE_ID = 'com.simplyher.app';
export const APP_NAME = 'Simply Her';
export const APP_PRODUCT_NAME = 'Simply Her: Ultimate Planner & Life Tracker';

// ── Platform Targets ───────────────────────────────────
// iOS 15.0 minimum — chosen for:
// - Capacitor 6 requires iOS 13+
// - HealthKit modern APIs require iOS 13+
// - iOS 15 covers ~96%+ of active iPhones (as of 2026)
// - Broad compatibility without excessive maintenance burden
export const IOS_MIN_DEPLOYMENT_TARGET = '15.0';

// Android minimum will be determined during Android phase.
// Likely API 24 (Android 7.0) or API 26 (Android 8.0) for Health Connect.
export const ANDROID_MIN_SDK = null; // TBD during Android phase

// ── Versioning ─────────────────────────────────────────
// Development builds — NOT 1.0. Unfinished software stays 0.x.
export const APP_VERSION = '0.1.0';
export const APP_BUILD_NUMBER = '1';

// ── HealthKit Permission Descriptions ───────────────────
// These go in Info.plist as NSHealthShareUsageDescription and
// NSHealthUpdateUsageDescription. The user must understand WHY
// Simply Her requests access.
export const HEALTHKIT_PERMISSIONS = {
  NSHealthShareUsageDescription:
    'Simply Her uses the health and fitness information you choose to share so your activity, workouts, sleep, and other enabled fitness information can appear without entering it twice.',
  NSHealthUpdateUsageDescription:
    'Simply Her can add workouts, water, and other records you create to Apple Health, keeping your health information in one place.',
};

// ── Deep Link Foundation ────────────────────────────────
export const DEEP_LINK_SCHEME = 'simplyher';
export const UNIVERSAL_LINK_DOMAIN = 'simplyher.app'; // PROPOSED — requires owner domain

// ── Environment ─────────────────────────────────────────
export const NATIVE_ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
};

// ── Platform Helpers ────────────────────────────────────
export function isNativePlatform() {
  return Capacitor.isNativePlatform();
}

export function getNativePlatform() {
  return Capacitor.getPlatform(); // 'ios', 'android', or 'web'
}

export function isIOS() {
  return Capacitor.getPlatform() === 'ios';
}

export function isAndroid() {
  return Capacitor.getPlatform() === 'android';
}