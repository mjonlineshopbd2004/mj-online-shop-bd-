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
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/') || url.startsWith('http://localhost') || url.startsWith('https://localhost')) return url;
  
  // If it's already a proxy URL, don't proxy again
  if (url.includes('/api/proxy-image')) return url;

  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
}
