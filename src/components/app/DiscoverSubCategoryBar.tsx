import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SubCategoryItem {
  id: string;
  label: string;
}

interface DiscoverSubCategoryBarProps {
  /** Family label used to render the "All <family>" pill (id: '__all__'). */
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
  familyLabel,
  subcategories,
  selectedSubcategory,
  onSelectSubcategory,
}: DiscoverSubCategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { canScrollLeft, canScrollRight, scrollLeft, scrollRight } = useScrollArrows(scrollRef);

  const items: SubCategoryItem[] = [
    { id: '__all__', label: `All ${familyLabel}` },
    ...subcategories,
  ];

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
        <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-foreground transition-colors" />
      </button>

      <div
        ref={scrollRef}
        className="fade-scroll flex gap-1.5 overflow-x-auto scrollbar-hide pb-1 -mb-1 cursor-grab active:cursor-grabbing scroll-smooth"
      >
        {items.map((sub) => (
          <button
            key={sub.id}
            onClick={() => onSelectSubcategory(sub.id)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 whitespace-nowrap shrink-0',
              selectedSubcategory === sub.id
                ? 'bg-primary/15 text-primary border border-primary/30'
                : 'bg-transparent text-muted-foreground/70 border border-border/40 hover:bg-muted/40 hover:text-foreground',
            )}
          >
            {sub.label}
          </button>
        ))}
      </div>

      <button
        onClick={scrollRight}
        className={cn(
          'hidden sm:flex shrink-0 p-1 ml-1.5 transition-opacity duration-200',
          canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        aria-label="Scroll right"
      >
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-foreground transition-colors" />
      </button>
    </div>
  );
}
