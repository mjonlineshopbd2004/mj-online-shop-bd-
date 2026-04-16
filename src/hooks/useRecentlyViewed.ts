import { useState, useEffect, useCallback } from 'react';

const MAX_RECENT = 10;
const STORAGE_KEY = 'recently_viewed_products';

export function useRecentlyViewed() {
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setRecentIds(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recently viewed', e);
      }
    }
  }, []);

  const addViewedProduct = useCallback((productId: string) => {
    setRecentIds(prev => {
      const filtered = prev.filter(id => id !== productId);
      const updated = [productId, ...filtered].slice(0, MAX_RECENT);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecentIds([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { recentIds, addViewedProduct, clearRecent };
}
