import { Link } from 'react-router-dom';
import type { CategoryPage } from '@/data/aiProductPhotographyCategoryPages';

/**
 * VOVV.AI signature breadcrumb.
 *
 * Editorial, restrained, locked to the hero column. Navy dot anchor,
 * em-dash separators, color-only weight contrast (grey → navy on current).
 * No band, no border — the page surface does the work.
 *
 * Pairs with the `BreadcrumbList` JSON-LD emitted in
 * `AIProductPhotographyCategory.tsx`.
 */
export function CategoryBreadcrumbs({ page }: { page: CategoryPage }) {
  return (
    <nav aria-label="Breadcrumb" className="pt-24 lg:pt-28">
      <div className="max-w-[1320px] mx-auto px-6 sm:px-8 lg:px-12 pb-4 lg:pb-5">
        <ol className="flex items-center text-[12px] font-medium tracking-[-0.005em]">
          {/* Anchor dot — VOVV "you are here" mark */}
          <li aria-hidden className="mr-2.5 flex items-center">
            <span className="block w-[4px] h-[4px] rounded-full bg-foreground" />
          </li>

          <li>
            <Link
              to="/"
              className="text-muted-foreground/60 hover:text-foreground hover:underline underline-offset-4 decoration-foreground/30 transition-colors duration-200"
            >
              Home
            </Link>
          </li>

          <li aria-hidden className="mx-2.5 text-muted-foreground/25 select-none">
            —
          </li>

          <li>
            <Link
              to="/ai-product-photography"
              className="text-muted-foreground/60 hover:text-foreground hover:underline underline-offset-4 decoration-foreground/30 transition-colors duration-200"
            >
              AI Product Photography
            </Link>
          </li>

          <li aria-hidden className="mx-2.5 text-muted-foreground/25 select-none">
            —
          </li>

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
