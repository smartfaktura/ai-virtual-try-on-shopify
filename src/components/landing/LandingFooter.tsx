import { Link } from 'react-router-dom';
import { Instagram, Facebook } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Visual Studio', to: '/features/workflows' },
    { label: 'AI Product Photography', to: '/ai-product-photography' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Virtual Try-On', to: '/features/virtual-try-on' },
    { label: 'Brand Profiles', to: '/features/brand-profiles' },
    { label: 'Image Upscaling', to: '/features/upscale' },
    { label: 'Perspectives', to: '/features/perspectives' },
    { label: 'Real Estate Staging', to: '/features/real-estate-staging' },
  ],
  Solutions: [
    { label: 'Fashion Photography', to: '/ai-product-photography/fashion' },
    { label: 'Footwear Photography', to: '/ai-product-photography/footwear' },
    { label: 'Beauty & Skincare', to: '/ai-product-photography/beauty-skincare' },
    { label: 'Bags & Accessories', to: '/ai-product-photography/bags-accessories' },
    { label: 'All categories', to: '/ai-product-photography' },
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4">
            <Link to="/" className="inline-flex items-center group">
              <span className="font-bold text-3xl tracking-tight text-foreground">
                VOVV.AI
              </span>
            </Link>
            <p className="mt-5 text-sm text-muted-foreground leading-relaxed max-w-xs">
              AI product visuals for e-commerce brands.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://www.instagram.com/vovv.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com/vovvaistudio/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.tiktok.com/@vovv.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="TikTok"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52V6.79a4.83 4.83 0 01-1-.1z" />
                </svg>
              </a>
              <a
                href="https://discord.gg/ZgnSJqUyV"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Discord"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.369A19.791 19.791 0 0016.558 3.2a.074.074 0 00-.079.037c-.34.607-.719 1.4-.984 2.022a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.995-2.022.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.369a.07.07 0 00-.032.027C.533 9.045-.32 13.579.099 18.057a.082.082 0 00.031.056 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.105 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 01.077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.009c.12.099.246.198.373.292a.077.077 0 01-.006.128 12.298 12.298 0 01-1.873.891.077.077 0 00-.041.106c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.029 19.84 19.84 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.974 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div className="col-span-2 md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([heading, links]) => (
              <div key={heading}>
                <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/90 mb-4">
                  {heading}
                </h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} VOVV.AI. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            A product by{' '}
            <a
              href="https://123presets.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              123Presets
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
