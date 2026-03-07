// Facebook / Meta Pixel helpers
// The base pixel snippet is loaded in index.html

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

export function trackPageView() {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }
}

export function trackPurchase(value: number, currency = 'USD') {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Purchase', { value, currency });
  }
}
