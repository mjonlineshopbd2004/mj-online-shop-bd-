import { useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';

export default function FaviconUpdater() {
  const { settings } = useSettings();

  useEffect(() => {
    if (settings.logoUrl) {
      // Update standard favicon
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) {
        link.href = settings.logoUrl;
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = settings.logoUrl;
        document.head.appendChild(newLink);
      }

      // Update apple-touch-icon
      const appleIcon = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
      if (appleIcon) {
        appleIcon.href = settings.logoUrl;
      } else {
        const newAppleIcon = document.createElement('link');
        newAppleIcon.rel = 'apple-touch-icon';
        newAppleIcon.href = settings.logoUrl;
        document.head.appendChild(newAppleIcon);
      }
    }

    if (settings.primaryColor) {
      const themeColor = document.querySelector("meta[name='theme-color']") as HTMLMetaElement;
      if (themeColor) {
        themeColor.content = settings.primaryColor;
      }
    }
  }, [settings.logoUrl, settings.primaryColor]);

  return null;
}
