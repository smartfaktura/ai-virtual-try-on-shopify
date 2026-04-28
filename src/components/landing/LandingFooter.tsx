import { Link } from 'react-router-dom';
import { Instagram, Facebook, ChevronDown } from 'lucide-react';

type FooterLink = { label: string; to: string };
type FooterGroup = { subheading?: string; links: FooterLink[] };

const productLinks: FooterLink[] = [
  { label: 'AI Product Photography', to: '/ai-product-photography' },
  { label: 'AI Product Photo Generator', to: '/ai-product-photo-generator' },
  { label: 'Visual Studio', to: '/features/workflows' },
  { label: 'Freestyle Studio', to: '/features/freestyle' },
  { label: 'Virtual Try-On', to: '/features/virtual-try-on' },
  { label: 'Product Perspectives', to: '/features/perspectives' },
  { label: 'Image Upscaling', to: '/features/upscale' },
  { label: 'Pricing', to: '/pricing' },
];

const solutionsGroups: FooterGroup[] = [
  {
    subheading: 'Platforms',
    links: [
      { label: 'Shopify Product Photos', to: '/shopify-product-photography-ai' },
      { label: 'Etsy Product Photos', to: '/etsy-product-photography-ai' },
    ],
  },
  {
    subheading: 'Categories',
    links: [
      { label: 'Fashion Product Photography', to: '/ai-product-photography/fashion' },
      { label: 'Footwear Product Photography', to: '/ai-product-photography/footwear' },
      { label: 'Beauty & Skincare', to: '/ai-product-photography/beauty-skincare' },
      { label: 'Fragrance Photography', to: '/ai-product-photography/fragrance' },
      { label: 'Jewelry Product Photography', to: '/ai-product-photography/jewelry' },
      { label: 'Food & Beverage', to: '/ai-product-photography/food-beverage' },
      { label: 'Home & Furniture', to: '/ai-product-photography/home-furniture' },
      { label: 'Electronics & Gadgets', to: '/ai-product-photography/electronics-gadgets' },
    ],
  },
  {
    subheading: 'Compare',
    links: [
      { label: 'Compare VOVV.AI to Others', to: '/compare' },
      { label: 'VOVV.AI vs Flair AI', to: '/compare/vovv-vs-flair-ai' },
      { label: 'AI vs Photoshoot', to: '/ai-product-photography-vs-photoshoot' },
      { label: 'VOVV.AI vs Studio', to: '/ai-product-photography-vs-studio' },
    ],
  },
];

const resourcesGroups: FooterGroup[] = [
  {
    subheading: 'Learn',
    links: [
      { label: 'Why VOVV.AI', to: '/why-vovv' },
      { label: 'How It Works', to: '/how-it-works' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Roadmap', to: '/roadmap' },
      { label: 'Help Center', to: '/help' },
      { label: 'Blog', to: '/blog' },
    ],
  },
  {
    subheading: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Careers', to: '/careers' },
      { label: 'Press', to: '/press' },
      { label: 'Contact', to: '/contact' },
    ],
  },
];

const legalLinks: FooterLink[] = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Cookie Policy', to: '/cookies' },
];

const socialLinks = [
  {
    href: 'https://www.instagram.com/vovv.ai',
    label: 'Instagram',
    icon: <Instagram className="h-[18px] w-[18px]" />,
  },
  {
    href: 'https://www.facebook.com/vovvaistudio/',
    label: 'Facebook',
    icon: <Facebook className="h-[18px] w-[18px]" />,
  },
  {
    href: 'https://www.tiktok.com/@vovv.ai',
    label: 'TikTok',
    icon: (
      <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52V6.79a4.83 4.83 0 01-1-.1z" />
      </svg>
    ),
  },
  {
    href: 'https://discord.gg/ZgnSJqUyV',
    label: 'Discord',
    icon: (
      <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.369A19.791 19.791 0 0016.558 3.2a.074.074 0 00-.079.037c-.34.607-.719 1.4-.984 2.022a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.995-2.022.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.369a.07.07 0 00-.032.027C.533 9.045-.32 13.579.099 18.057a.082.082 0 00.031.056 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.105 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 01.077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.009c.12.099.246.198.373.292a.077.077 0 01-.006.128 12.298 12.298 0 01-1.873.891.077.077 0 00-.041.106c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.029 19.84 19.84 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.974 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
];

const columnHeadingClass =
  'text-xs font-semibold uppercase tracking-[0.14em] text-foreground/90 mb-3.5';
const subheadingClass =
  'text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/70 mb-2.5';
const linkClass =
  'block py-0.5 text-sm leading-relaxed text-muted-foreground hover:text-foreground transition-colors';

function FlatColumn({ heading, links }: { heading: string; links: FooterLink[] }) {
  return (
    <div>
      <h4 className={columnHeadingClass}>{heading}</h4>
      <ul className="space-y-1.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link to={link.to} className={linkClass}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GroupedColumn({ heading, groups }: { heading: string; groups: FooterGroup[] }) {
  return (
    <div>
      <h4 className={columnHeadingClass}>{heading}</h4>
      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.subheading ?? heading}>
            {group.subheading && <p className={subheadingClass}>{group.subheading}</p>}
            <ul className="space-y-1.5">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        {/* Brand + columns row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 items-start">
          {/* Brand */}
          <div className="md:col-span-4 lg:col-span-3">
            <Link to="/" className="inline-flex items-center group">
              <span className="font-bold text-3xl tracking-tight text-foreground">
                VOVV.AI
              </span>
            </Link>
            <p className="mt-5 text-sm text-muted-foreground leading-relaxed max-w-sm">
              AI product visuals for e-commerce brands, from one product photo.
            </p>
            <div className="flex items-center gap-2 mt-6">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Desktop / tablet columns: 3 columns */}
          <div className="hidden sm:grid sm:grid-cols-3 gap-10 md:col-span-8 lg:col-span-9">
            <FlatColumn heading="Product" links={productLinks} />
            <GroupedColumn heading="Solutions" groups={solutionsGroups} />
            <GroupedColumn heading="Resources" groups={resourcesGroups} />
          </div>
        </div>

        {/* Mobile collapsible columns */}
        <div className="sm:hidden mt-10 border-t border-border/60">
          {/* Product accordion */}
          <details className="group border-b border-border/60 py-4">
            <summary className="flex items-center justify-between text-sm font-semibold uppercase tracking-[0.14em] text-foreground cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <span>Product</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <ul className="mt-4 space-y-3 pb-2">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </details>

          {/* Solutions accordion (grouped) */}
          <details className="group border-b border-border/60 py-4">
            <summary className="flex items-center justify-between text-sm font-semibold uppercase tracking-[0.14em] text-foreground cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <span>Solutions</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-4 space-y-6 pb-2">
              {solutionsGroups.map((group) => (
                <div key={group.subheading}>
                  {group.subheading && <p className={subheadingClass}>{group.subheading}</p>}
                  <ul className="space-y-3 pl-0.5">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <Link to={link.to} className={linkClass}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>

          {/* Resources accordion (grouped) */}
          <details className="group border-b border-border/60 py-4">
            <summary className="flex items-center justify-between text-sm font-semibold uppercase tracking-[0.14em] text-foreground cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <span>Resources</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-4 space-y-6 pb-2">
              {resourcesGroups.map((group) => (
                <div key={group.subheading}>
                  {group.subheading && <p className={subheadingClass}>{group.subheading}</p>}
                  <ul className="space-y-3 pl-0.5">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <Link to={link.to} className={linkClass}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 sm:mt-12 pt-6 border-t border-border flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} VOVV.AI. All rights reserved.
          </p>

          <nav
            aria-label="Legal"
            className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground"
          >
            {legalLinks.map((link, i) => (
              <span key={link.label} className="flex items-center gap-x-3">
                <Link
                  to={link.to}
                  className="hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
                {i < legalLinks.length - 1 && (
                  <span aria-hidden className="text-muted-foreground/40">·</span>
                )}
              </span>
            ))}
          </nav>

          <p className="text-xs text-muted-foreground">
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
