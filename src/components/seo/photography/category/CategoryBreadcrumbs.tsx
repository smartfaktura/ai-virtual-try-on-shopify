import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { CategoryPage } from '@/data/aiProductPhotographyCategoryPages';

/**
 * Slim full-width breadcrumb band rendered above the hero.
 * Premium, breathing layout — replaces the inline crumb that lived in CategoryHero.
 */
export function CategoryBreadcrumbs({ page }: { page: CategoryPage }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="pt-24 lg:pt-28 bg-[#FAFAF8]"
    >
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-4 lg:py-5">
        <ol className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <li>
            <Link
              to="/"
              className="hover:text-foreground transition-colors"
            >
              Home
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight size={13} className="opacity-40" />
          </li>
          <li>
            <Link
              to="/ai-product-photography"
              className="hover:text-foreground transition-colors"
            >
              AI Product Photography
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight size={13} className="opacity-40" />
          </li>
          <li>
            <span
              aria-current="page"
              className="inline-flex items-center px-3 py-1 rounded-full bg-foreground/[0.06] text-foreground font-medium"
            >
              {page.groupName}
            </span>
          </li>
        </ol>
      </div>
    </nav>
  );
}
