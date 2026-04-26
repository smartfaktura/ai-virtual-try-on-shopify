import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

type NavLink = {
  label: string;
  href: string;
  isRoute: boolean;
  /**
   * Async loader for the route's lazy chunk. Calling it warms the chunk so
   * clicking the link doesn't trigger a Suspense fallback flash.
   */
  prefetch?: () => Promise<unknown>;
};

const navLinks: NavLink[] = [
  {
    label: 'Explore',
    href: '/discover',
    isRoute: true,
    prefetch: () => import('@/pages/PublicDiscover'),
  },
  {
    label: 'AI Product Photography',
    href: '/ai-product-photography',
    isRoute: true,
    prefetch: () => import('@/pages/seo/AIProductPhotography'),
  },
  {
    label: 'Scene Library',
    href: '/product-visual-library',
    isRoute: true,
    prefetch: () => import('@/pages/ProductVisualLibrary'),
  },
  {
    label: 'How It Works',
    href: '/how-it-works',
    isRoute: true,
    prefetch: () => import('@/pages/HowItWorks'),
  },
  {
    label: 'Pricing',
    href: '/pricing',
    isRoute: true,
    prefetch: () => import('@/pages/Pricing'),
  },
  {
    label: 'FAQ',
    href: '/faq',
    isRoute: true,
    prefetch: () => import('@/pages/FAQ'),
  },
];

export function LandingNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);

  useEffect(() => {
    setHasAccount(localStorage.getItem('has_account') === 'true');
  }, []);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Prefetch each routed nav target's lazy chunk on idle so first click is instant.
  useEffect(() => {
    const idle = (cb: () => void) => {
      const w = window as unknown as { requestIdleCallback?: (cb: () => void) => number };
      if (typeof w.requestIdleCallback === 'function') w.requestIdleCallback(cb);
      else setTimeout(cb, 1200);
    };
    idle(() => {
      navLinks.forEach((l) => {
        try { l.prefetch?.(); } catch { /* noop */ }
      });
    });
  }, []);

  const handleHashClick = (href: string) => {
    setMobileOpen(false);
    const onLanding =
      location.pathname === '/' ||
      location.pathname === '/landing' ||
      location.pathname === '/home';
    if (onLanding) {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/home' + href);
    }
  };

  const isActive = (href: string) =>
    href.startsWith('/') && location.pathname === href;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-3 lg:px-6">
      <nav
        className={`transition-colors duration-300 rounded-2xl border border-white/[0.06] shadow-2xl shadow-black/20 bg-sidebar lg:backdrop-blur-xl px-4 sm:px-6 lg:px-8 h-14 lg:h-16 flex items-center lg:max-w-[1600px] lg:mx-auto ${
          scrolled ? 'lg:bg-sidebar/95' : 'lg:bg-sidebar/90'
        }`}
      >
        {/* Logo (left) */}
        <Link to="/" className="flex items-center gap-2 group shrink-0 lg:flex-1">
          <span className="font-bold text-xl text-sidebar-foreground tracking-tight">VOVV.AI</span>
        </Link>

        {/* Desktop links (centered) */}
        <div className="hidden lg:flex items-center justify-center gap-9 xl:gap-11">
          {navLinks.map((link) =>
            link.isRoute ? (
              <Link
                key={link.href}
                to={link.href}
                onMouseEnter={() => link.prefetch?.()}
                onFocus={() => link.prefetch?.()}
                className={cn(
                  'relative text-sm font-medium transition-colors whitespace-nowrap py-1',
                  isActive(link.href)
                    ? 'text-sidebar-foreground after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-0.5 after:h-px after:w-5 after:bg-sidebar-foreground/70 after:rounded-full'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground',
                )}
              >
                {link.label}
              </Link>
            ) : (
              <button
                key={link.href}
                onClick={() => handleHashClick(link.href)}
                className="text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors whitespace-nowrap py-1"
              >
                {link.label}
              </button>
            ),
          )}
        </div>

        {/* Desktop CTA (right) */}
        <div className="hidden lg:flex lg:flex-1 items-center justify-end">
          <Button
            className="rounded-full h-11 px-7 text-[15px] font-semibold bg-sidebar-foreground text-sidebar hover:bg-sidebar-foreground/90"
            onClick={() => navigate(user ? '/app' : '/auth')}
          >
            {user ? 'My Dashboard' : hasAccount ? 'Sign In' : 'Start Free'}
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 text-sidebar-foreground ml-auto"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Backdrop — blocks page interaction when menu is open, does NOT close menu */}
      {mobileOpen && <div className="fixed inset-0 z-[-1] lg:hidden" />}

      {/* Mobile menu — no backdrop-blur, fully opaque */}
      <div
        className={`lg:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out will-change-[max-height] mt-1 rounded-2xl bg-sidebar ${
          mobileOpen ? 'max-h-96 border border-white/[0.06] shadow-2xl shadow-black/20' : 'max-h-0'
        }`}
      >
        <div className="px-4 py-3 flex flex-col divide-y divide-white/[0.06]">
          {navLinks.map((link) =>
            link.isRoute ? (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'text-left text-sm font-medium transition-colors py-3',
                  isActive(link.href)
                    ? 'text-sidebar-foreground'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground',
                )}
              >
                {link.label}
              </Link>
            ) : (
              <button
                key={link.href}
                onClick={() => handleHashClick(link.href)}
                className="text-left text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors py-3"
              >
                {link.label}
              </button>
            ),
          )}
          <div className="pt-3">
            <Button
              size="lg"
              className="rounded-full w-full font-semibold bg-sidebar-foreground text-sidebar hover:bg-sidebar-foreground/90"
              onClick={() => {
                setMobileOpen(false);
                navigate(user ? '/app' : '/auth');
              }}
            >
              {user ? 'My Dashboard' : hasAccount ? 'Sign In' : 'Start Free'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
