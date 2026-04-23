import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SubCategoryItem {
  id: string;
  label: string;
}

interface DiscoverSubCategoryBarProps {
  /** Family label — kept for API compatibility, no longer rendered. */
  familyLabel: string;
  subcategories: readonly SubCategoryItem[];
  /** '__all__' means "no sub-type filter, show all of family". */
  selectedSubcategory: string;
  onSelectSubcategory: (id: string) => void;
}

function useScrollArrows(ref: React.RefObject<HTMLDivElement>) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [ref, update]);

  const scrollBy = useCallback((dir: number) => {
    ref.current?.scrollBy({ left: dir * 200, behavior: 'smooth' });
  }, [ref]);

  return { canScrollLeft, canScrollRight, scrollLeft: () => scrollBy(-1), scrollRight: () => scrollBy(1) };
}

export function DiscoverSubCategoryBar({
  subcategories,
  selectedSubcategory,
  onSelectSubcategory,
}: DiscoverSubCategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { canScrollLeft, canScrollRight, scrollLeft, scrollRight } = useScrollArrows(scrollRef);

  if (!subcategories.length) return null;

  const items: SubCategoryItem[] = [{ id: '__all__', label: 'All' }, ...subcategories];

  return (
    <div className="flex items-center">
      <button
        onClick={scrollLeft}
        className={cn(
          'hidden sm:flex shrink-0 p-1 transition-all duration-200',
          canScrollLeft ? 'opacity-100 w-6' : 'opacity-0 w-0 overflow-hidden pointer-events-none',
        )}
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-4 h-4 text-muted-foreground/60 hover:text-foreground transition-colors" />
      </button>

      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 -mb-1 scroll-smooth"
      >
        {items.map((sub) => {
          const isActive = selectedSubcategory === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => onSelectSubcategory(sub.id)}
              aria-pressed={isActive}
              className={cn(
                'rounded-full px-4 py-1.5 text-[12px] font-medium tracking-wide transition-all duration-200 whitespace-nowrap shrink-0 border',
                isActive
                  ? 'bg-foreground text-background border-foreground shadow-sm'
                  : 'bg-transparent border-border/60 text-muted-foreground/80 hover:border-foreground/40 hover:text-foreground',
              )}
            >
              {sub.label}
            </button>
          );
        })}
      </div>

      <button
        onClick={scrollRight}
        className={cn(
          'hidden sm:flex shrink-0 p-1 ml-1.5 transition-opacity duration-200',
          canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        aria-label="Scroll right"
      >
        <ChevronRight className="w-4 h-4 text-muted-foreground/60 hover:text-foreground transition-colors" />
      </button>
    </div>
  );
}
