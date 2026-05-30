/**
 * Prevents Radix Dialog from auto-focusing the first focusable element on touch devices.
 * Avoids the mobile keyboard sliding up when a search-first modal opens.
 * Desktop (mouse/keyboard) behaviour is preserved.
 */
export const preventAutoFocusOnMobile = (e: Event) => {
  if (typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches) {
    e.preventDefault();
  }
};
