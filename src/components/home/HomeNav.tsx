import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const links = [
  { label: 'Examples', href: '#examples' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export function HomeNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-[#e8e7e4]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex items-center justify-between h-16">
        <Link to="/home" className="text-[#1a1a2e] font-semibold text-xl tracking-tight">
          VOVV
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[13px] font-medium text-[#6b7280] hover:text-[#1a1a2e] transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <Link
            to="/auth"
            className="inline-flex items-center justify-center h-9 px-5 rounded-lg bg-[#1a1a2e] text-white text-[13px] font-medium hover:bg-[#2a2a3e] transition-colors"
          >
            Start free
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-[#1a1a2e]"
          aria-label="Menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-[#e8e7e4] px-6 py-4 space-y-3">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block text-sm text-[#6b7280] hover:text-[#1a1a2e]"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/auth"
            className="block w-full text-center h-10 leading-10 rounded-lg bg-[#1a1a2e] text-white text-sm font-medium"
          >
            Start free
          </Link>
        </div>
      )}
    </nav>
  );
}
