import { Link } from 'react-router-dom';
import { Instagram, Facebook } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Visual Studio', to: '/features/workflows' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Virtual Try-On', to: '/features/virtual-try-on' },
    
    { label: 'Brand Profiles', to: '/features/brand-profiles' },
    { label: 'Image Upscaling', to: '/features/upscale' },
    { label: 'Perspectives', to: '/features/perspectives' },
    { label: 'Real Estate Staging', to: '/features/real-estate-staging' },
  ],
  Company: [
    { label: 'About', to: '/about' },
    { label: 'Blog', to: '/blog' },
    { label: 'Careers', to: '/careers' },
    { label: 'Press', to: '/press' },
    { label: 'Team', to: '/team' },
  ],
  Support: [
    { label: 'Help Center', to: '/help' },
    { label: 'Contact', to: '/contact' },
    { label: 'Status', to: '/status' },
    { label: 'Changelog', to: '/changelog' },
  ],
  Legal: [
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Cookie Policy', to: '/cookies' },
  ],
};

export function LandingFooter() {

  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">V</span>
              </div>
              <span className="font-bold text-foreground">VOVV.AI</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your automated visual studio for e-commerce. Professional product visuals, delivered monthly.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="https://www.instagram.com/vovv.ai" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.facebook.com/vovvaistudio/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Facebook">
              <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.tiktok.com/@vovv.ai" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="TikTok">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52V6.79a4.83 4.83 0 01-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-sm font-semibold text-foreground mb-3">{heading}</h4>
              <ul className="space-y-0">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} VOVV.AI. All rights reserved.
          </p>
          <span className="text-xs text-muted-foreground">A product by 123Presets</span>
        </div>
      </div>
    </footer>
  );
}
