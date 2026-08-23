import type { CapacitorConfig } from '@capacitor/cli';

// Simply Her — Capacitor Configuration
// PROPOSED Bundle ID: com.simplyher.app
// The owner must confirm they own the simplyher.com domain or choose
// a different reverse-domain identifier before App Store submission.
const config: CapacitorConfig = {
  appId: 'com.simplyher.app',
  appName: 'Simply Her',
  webDir: 'dist',
  backgroundColor: '#ffffff',
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DEFAULT',
      backgroundColor: '#ffffff',
    },
    Keyboard: {
      resize: 'native',
      resizeOnFullScreen: true,
      style: 'DARK',
    },
  },
  ios: {
    contentInset: 'always',
    scrollEnabled: false,
  },
  android: {
    backgroundColor: '#ffffff',
  },
};

export default config;