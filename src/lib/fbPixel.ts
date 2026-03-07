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

export function trackViewContent(contentName: string, contentType: string, value?: number) {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'ViewContent', {
      content_name: contentName,
      content_type: contentType,
      ...(value != null && { value, currency: 'USD' }),
    });
  }
}

export function trackInitiateCheckout(value?: number, currency = 'USD') {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'InitiateCheckout', {
      ...(value != null && { value, currency }),
    });
  }
}

export function trackCompleteRegistration(method?: string) {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'CompleteRegistration', {
      ...(method && { content_name: method }),
    });
  }
}
