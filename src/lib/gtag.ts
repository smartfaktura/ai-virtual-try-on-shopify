// Google Analytics (gtag.js) helpers
// The base gtag snippet is loaded in index.html

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export function gtagPageView() {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view');
  }
}

export function gtagEvent(action: string, params?: Record<string, any>) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, params);
  }
}

export function gtagSignUp(method: string) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'sign_up', { method });
  }
}

export function gtagPurchase(value: number, currency = 'USD', transactionId?: string) {
  if (typeof window.gtag === 'function') {
    // GA4 purchase event
    window.gtag('event', 'purchase', {
      value,
      currency,
      ...(transactionId && { transaction_id: transactionId }),
    });
    // Google Ads conversion event
    window.gtag('event', 'ads_conversion_PURCHASE_1', {
      value,
      currency,
      ...(transactionId && { transaction_id: transactionId }),
    });
  }
}

export function gtagBeginCheckout(value?: number, currency = 'USD') {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'begin_checkout', {
      ...(value != null && { value, currency }),
    });
  }
}

export function gtagViewItem(itemName: string, itemCategory: string, value?: number) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'view_item', {
      items: [{ item_name: itemName, item_category: itemCategory }],
      ...(value != null && { value, currency: 'USD' }),
    });
  }
}
