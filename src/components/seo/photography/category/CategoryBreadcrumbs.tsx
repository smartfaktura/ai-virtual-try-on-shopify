import { Link } from 'react-router-dom';
import type { CategoryPage } from '@/data/aiProductPhotographyCategoryPages';

/**
 * Editorial-style breadcrumb: thin slash dividers, no pills.
 * Sits as a quiet navigation strip above the hero.
 */
export function CategoryBreadcrumbs({ page }: { page: CategoryPage }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="pt-24 lg:pt-28 bg-[#FAFAF8] border-b border-border/40"
    >
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-3 lg:py-4">
        <ol className="flex items-center gap-2.5 text-[13.5px] tracking-[-0.005em]">
          <li>
            <Link
              to="/"
              className="text-muted-foreground/70 hover:text-foreground transition-colors"
            >
              Home
            </Link>
          </li>
          <li aria-hidden className="text-muted-foreground/40 select-none">/</li>
          <li>
            <Link
              to="/ai-product-photography"
              className="text-muted-foreground/70 hover:text-foreground transition-colors"
            >
              AI Product Photography
            </Link>
          </li>
          <li aria-hidden className="text-muted-foreground/40 select-none">/</li>
          <li>
            <span aria-current="page" className="text-foreground font-medium">
              {page.groupName}
            </span>
          </li>
        </ol>
      </div>
    </nav>
  );
}
