import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

/**
 * Native app lifecycle management hook.
 *
 * Handles:
 * - Status bar style (light/dark based on theme)
 * - Splash screen dismissal
 * - App foreground/background/resume events
 * - Global events for other components to react to
 *
 * No-op on web — only activates on native iOS/Android.
 *
 * Call this once in the Layout component.
 */
export function useNativeLifecycle() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let resumeListener = null;

    const setup = async () => {
      // Configure status bar based on current theme
      await applyStatusBarStyle();

      // Hide splash screen after React has mounted
      try {
        await SplashScreen.hide();
      } catch {
        // Splash screen may already be hidden
      }

      // Listen for app state changes (foreground/background)
      resumeListener = await App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          // App returned to foreground — dispatch for health sync, timers, etc.
          window.dispatchEvent(new CustomEvent('simplyher:app-resumed'));
        } else {
          // App went to background — preserve state, don't force-save
          window.dispatchEvent(new CustomEvent('simplyher:app-backgrounded'));
        }
      });
    };

    setup();

    return () => {
      resumeListener?.remove?.();
    };
  }, []);
}

async function applyStatusBarStyle() {
  try {
    const isDark = document.documentElement.classList.contains('dark');
    await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
    await StatusBar.setBackgroundColor({ color: isDark ? '#0a0a0a' : '#ffffff' });
  } catch {
    // StatusBar may not be available on all platforms
  }
}