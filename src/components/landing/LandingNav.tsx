import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
  { label: 'Team', href: '#team' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export function LandingNav() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-3">
      <nav
        className={`transition-all duration-300 rounded-2xl border border-white/[0.06] shadow-2xl shadow-black/20 backdrop-blur-xl px-4 sm:px-6 lg:px-8 h-14 lg:h-16 flex items-center justify-between lg:max-w-7xl lg:mx-auto ${
          scrolled
            ? 'bg-sidebar/95'
            : 'bg-sidebar/90'
        }`}
      >
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">V</span>
          </div>
          <span className="font-bold text-lg text-sidebar-foreground tracking-tight">VOVV.AI</span>
        </a>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-sm font-medium text-sidebar-foreground/80 hover:text-sidebar-foreground transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:block">
          <Button size="sm" className="rounded-full px-6 font-semibold bg-sidebar-foreground text-sidebar hover:bg-sidebar-foreground/90" onClick={() => navigate(user ? '/app' : '/auth')}>
            {user ? 'My Dashboard' : 'Start Free'}
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

      {/* Mobile menu with smooth animation */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out mt-1 rounded-2xl border border-white/[0.06] shadow-2xl shadow-black/20 ${
          mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0 border-transparent shadow-none'
        }`}
      >
        <div className="bg-sidebar/95 backdrop-blur-xl rounded-2xl">
          <div className="px-4 py-3 flex flex-col divide-y divide-white/[0.06]">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-left text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors py-3"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-3">
              <Button
                size="sm"
                className="rounded-full w-full font-semibold"
                onClick={() => navigate(user ? '/app' : '/auth')}
              >
                {user ? 'My Dashboard' : 'Start Free'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
