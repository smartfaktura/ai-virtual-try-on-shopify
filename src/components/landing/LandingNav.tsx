import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
  { label: 'Examples', href: '/discover', isRoute: true },
  { label: 'Team', href: '#team' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '/pricing', isRoute: true },
  { label: 'FAQ', href: '#faq' },
];

export function LandingNav() {
  const navigate = useNavigate();
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

  const handleNavClick = (link: typeof navLinks[number]) => {
    setMobileOpen(false);
    if ('isRoute' in link && link.isRoute) {
      navigate(link.href);
      return;
    }
    // Only scroll if we're on the landing page
    if (window.location.pathname === '/' || window.location.pathname === '/landing') {
      const el = document.querySelector(link.href);
      el?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/' + link.href);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-3">
      <nav
        className={`transition-colors duration-300 rounded-2xl border border-white/[0.06] shadow-2xl shadow-black/20 bg-sidebar lg:backdrop-blur-xl px-4 sm:px-6 lg:px-8 h-14 lg:h-16 flex items-center justify-between lg:max-w-7xl lg:mx-auto ${
          scrolled
            ? 'lg:bg-sidebar/95'
            : 'lg:bg-sidebar/90'
        }`}
      >
        {/* Logo */}
        <button onClick={() => navigate('/')} className="flex items-center gap-2 group">
          <span className="font-bold text-xl text-sidebar-foreground tracking-tight">VOVV.AI</span>
        </button>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link)}
              className="text-sm font-medium text-sidebar-foreground/80 hover:text-sidebar-foreground transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:block">
          <Button size="sm" className="rounded-full px-6 font-semibold bg-sidebar-foreground text-sidebar hover:bg-sidebar-foreground/90" onClick={() => navigate(user ? '/app' : '/auth')}>
            {user ? 'My Dashboard' : hasAccount ? 'Sign In' : 'Start Free'}
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 text-sidebar-foreground"
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
          mobileOpen ? 'max-h-80 border border-white/[0.06] shadow-2xl shadow-black/20' : 'max-h-0'
        }`}
      >
        <div className="px-4 py-3 flex flex-col divide-y divide-white/[0.06]">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link)}
              className="text-left text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors py-3"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3">
            <Button
              size="sm"
              className="rounded-full w-full font-semibold bg-sidebar-foreground text-sidebar hover:bg-sidebar-foreground/90"
              onClick={() => { setMobileOpen(false); navigate(user ? '/app' : '/auth'); }}
            >
              {user ? 'My Dashboard' : hasAccount ? 'Sign In' : 'Start Free'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
