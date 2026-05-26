import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { gtagPageView } from '@/lib/gtag';

export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navType = useNavigationType();

  // Disable browser auto scroll restoration once — we manage scroll ourselves.
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    // Always track the page view (Meta tracking handled in GTM via dataLayer).
    gtagPageView();

    // Back/forward — let the browser/restored position win.
    if (navType === 'POP') return;
    // Hash anchor navigation — let the browser jump to the anchor.
    if (hash) return;

    // Single scroll reset. The previous rAF + timeout + MutationObserver
    // cascade was needed when lazy routes unmounted via a Suspense
    // fallback; with `fallback={null}` the page stays mounted during
    // chunk fetch, so one scrollTo is enough.
    window.scrollTo(0, 0);
  }, [pathname, hash, navType]);

  return null;
}
