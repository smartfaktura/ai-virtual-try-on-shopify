import { Link } from 'react-router-dom';
import type { CategoryPage } from '@/data/aiProductPhotographyCategoryPages';

/**
 * VOVV.AI minimalist breadcrumb — 2026 forward.
 *
 * No separators, no dots, no borders. Whitespace carries the rhythm.
 * Inactive items quiet, current page in full foreground. Animated underline
 * on hover for tactile micro-feedback.
 *
 * Accessibility: hidden `›` between items so screen readers announce hierarchy.
 * SEO: real <nav>/<ol> + <a> + aria-current; pairs with BreadcrumbList JSON-LD.
 */
export function CategoryBreadcrumbs({ page }: { page: CategoryPage }) {
  const linkClass =
    'text-muted-foreground/45 hover:text-foreground hover:underline underline-offset-4 decoration-foreground/30 transition-colors duration-200';

  return (
    <nav aria-label="Breadcrumb" className="pt-24 lg:pt-28">
      <div className="max-w-[1320px] mx-auto px-6 sm:px-8 lg:px-12 pb-4 lg:pb-5">
        <ol className="flex items-center gap-5 text-[11.5px] font-medium tracking-[-0.005em]">
          <li>
            <Link to="/" className={linkClass}>
              Home
            </Link>
          </li>
          <li className="sr-only" aria-hidden>›</li>
          <li>
            <Link to="/ai-product-photography" className={linkClass}>
              AI Product Photography
            </Link>
          </li>
          <li className="sr-only" aria-hidden>›</li>
          <li>
            <span aria-current="page" className="text-foreground">
              {page.groupName}
            </span>
          </li>
        </ol>
      </div>
    </nav>
  );
}
