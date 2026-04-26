import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { trackPageView } from '@/lib/fbPixel';
import { gtagPageView } from '@/lib/gtag';

export function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  // Disable browser auto scroll restoration once — we manage scroll ourselves.
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    if (navType !== 'POP') {
      // Immediate scroll for fast pages.
      window.scrollTo(0, 0);
      // Re-assert after the lazy route chunk mounts and layout settles,
      // otherwise the page can paint already scrolled a few px down.
      const raf = requestAnimationFrame(() => window.scrollTo(0, 0));
      const t = setTimeout(() => window.scrollTo(0, 0), 80);
      trackPageView();
      gtagPageView();
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(t);
      };
    }
    trackPageView();
    gtagPageView();
  }, [pathname, navType]);

  return null;
}
