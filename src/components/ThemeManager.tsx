import { useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';

export default function ThemeManager() {
  const { settings } = useSettings();

  useEffect(() => {
    // Handle Dark Mode - Disabled for now to restore original look
    const applyTheme = (isDark: boolean) => {
      document.documentElement.classList.remove('dark');
    };

    if (settings.darkMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyTheme(settings.darkMode === 'dark');
    }
  }, [settings.darkMode]);

  useEffect(() => {
    if (settings.primaryColor) {
      // Apply primary color
      document.documentElement.style.setProperty('--primary', settings.primaryColor);
      
      // Helper to darken color
      const darkenColor = (hex: string, percent: number) => {
        try {
          const num = parseInt(hex.replace('#', ''), 16);
          const amt = Math.round(2.55 * percent);
          const R = (num >> 16) - amt;
          const G = (num >> 8 & 0x00FF) - amt;
          const B = (num & 0x0000FF) - amt;
          return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
        } catch (e) {
          return hex;
        }
      };

      const primaryDark = darkenColor(settings.primaryColor, 10);
      document.documentElement.style.setProperty('--primary-dark', primaryDark);
    }

    if (settings.bannerTextColor) {
      document.documentElement.style.setProperty('--banner-text', settings.bannerTextColor);
    }

    if (settings.bannerBgColor) {
      document.documentElement.style.setProperty('--banner-bg', settings.bannerBgColor);
    }
  }, [settings.primaryColor, settings.bannerTextColor, settings.bannerBgColor]);

  return null;
}
