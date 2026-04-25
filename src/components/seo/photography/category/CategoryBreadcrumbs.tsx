import { Link } from 'react-router-dom';
import type { CategoryPage } from '@/data/aiProductPhotographyCategoryPages';

/**
 * SEO breadcrumb for category hub pages. Renders as a quiet inline strip
 * sitting just above the hero — no border, no band feel, fully crawlable.
 *
 * Pairs with the `BreadcrumbList` JSON-LD emitted in
 * `AIProductPhotographyCategory.tsx`.
 */
export function CategoryBreadcrumbs({ page }: { page: CategoryPage }) {
  return (
    <nav aria-label="Breadcrumb" className="pt-24 lg:pt-28">
      <div className="max-w-[1320px] mx-auto px-6 sm:px-8 lg:px-12 pb-2 lg:pb-3">
        <ol className="flex items-center gap-2 text-[12.5px] tracking-[-0.005em]">
          <li>
            <Link
              to="/"
              className="text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              Home
            </Link>
          </li>
          <li aria-hidden className="text-muted-foreground/30 select-none">/</li>
          <li>
            <Link
              to="/ai-product-photography"
              className="text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              AI Product Photography
            </Link>
          </li>
          <li aria-hidden className="text-muted-foreground/30 select-none">/</li>
          <li>
            <span aria-current="page" className="text-foreground/80">
              {page.groupName}
            </span>
          </li>
        </ol>
      </div>
    </nav>
  );
}
