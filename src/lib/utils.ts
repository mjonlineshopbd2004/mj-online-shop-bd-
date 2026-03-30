import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(price);
}

export function calculateDiscount(price: number, discountPrice?: number) {
  if (!discountPrice) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}

export function getProxyUrl(url: string) {
  if (!url) return 'https://picsum.photos/seed/placeholder/600/800';
  
  // Normalize protocol-relative URLs
  const normalizedUrl = url.startsWith('//') ? `https:${url}` : url;
  
  // Don't proxy data URLs, blobs, or local URLs
  if (normalizedUrl.startsWith('data:') || normalizedUrl.startsWith('blob:') || normalizedUrl.startsWith('/') || normalizedUrl.startsWith('http://localhost') || normalizedUrl.startsWith('https://localhost')) {
    return normalizedUrl;
  }
  
  // If it's already a proxy URL, don't proxy again
  if (normalizedUrl.includes('/api/proxy-image')) return normalizedUrl;

  // Check if it's an external URL
  const isExternal = normalizedUrl.startsWith('http');
  
  // If it's not external, it's probably a local asset
  if (!isExternal) return normalizedUrl;

  // Use absolute URL for the proxy if VITE_APP_URL is set, 
  // otherwise fallback to current origin if in browser, or empty string
  const baseUrl = import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  
  // Ensure baseUrl doesn't end with a slash if it's set
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  return `${cleanBaseUrl}/api/proxy-image?url=${encodeURIComponent(normalizedUrl)}`;
}
