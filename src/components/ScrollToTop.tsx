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

    const toTop = () => window.scrollTo(0, 0);

    // Fast path: immediate, next frame, and a short timeout.
    toTop();
    const raf = requestAnimationFrame(toTop);
    const t1 = setTimeout(toTop, 80);
    const t2 = setTimeout(toTop, 250);

    // Robust path for lazy-loaded routes: re-assert as soon as the new
    // page actually mounts under <main>. We watch for any DOM mutation
    // for a short window and force scrollTop=0 on each one, then stop.
    let mutationCount = 0;
    const observer = new MutationObserver(() => {
      toTop();
      mutationCount++;
      // Cap work — after enough mutations the page has rendered.
      if (mutationCount > 20) observer.disconnect();
    });
    const root = document.body;
    if (root) observer.observe(root, { childList: true, subtree: true });
    const stopObserving = setTimeout(() => observer.disconnect(), 600);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(stopObserving);
      observer.disconnect();
    };
  }, [pathname, hash, navType]);

  return null;
}
