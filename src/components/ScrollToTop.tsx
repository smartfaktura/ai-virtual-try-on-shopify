import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { trackPageView } from '@/lib/fbPixel';
import { gtagPageView } from '@/lib/gtag';

export function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (navType !== 'POP') {
      window.scrollTo(0, 0);
    }
    trackPageView();
    gtagPageView();
  }, [pathname, navType]);

  return null;
}
