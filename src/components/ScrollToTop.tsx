import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { trackPageView } from '@/lib/fbPixel';

export function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (navType !== 'POP') {
      window.scrollTo(0, 0);
    }
    trackPageView();
  }, [pathname, navType]);

  return null;
}
