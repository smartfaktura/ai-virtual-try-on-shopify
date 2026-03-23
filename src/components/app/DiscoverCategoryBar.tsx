import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryItem {
  id: string;
  label: string;
}

interface DiscoverCategoryBarProps {
  categories: readonly CategoryItem[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  savedCount?: number;
  hideArrows?: boolean;
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

export function DiscoverCategoryBar({ categories, selectedCategory, onSelectCategory, savedCount, hideArrows }: DiscoverCategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { canScrollLeft, canScrollRight, scrollLeft, scrollRight } = useScrollArrows(scrollRef);

  return (
    <div className="flex items-center">
      {/* Left arrow — desktop only, collapses when hidden */}
      {!hideArrows && (
        <button
          onClick={scrollLeft}
          className={cn(
            'hidden sm:flex shrink-0 p-1 transition-all duration-200',
            canScrollLeft ? 'opacity-100 w-6' : 'opacity-0 w-0 overflow-hidden pointer-events-none'
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4 text-muted-foreground/60 hover:text-foreground transition-colors" />
        </button>
      )}

      {/* Scrollable categories */}
      <div
        ref={scrollRef}
        className="fade-scroll flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mb-1 cursor-grab active:cursor-grabbing scroll-smooth"
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={cn(
              'px-5 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-200 whitespace-nowrap shrink-0',
              selectedCategory === cat.id
                ? 'bg-foreground text-background shadow-sm'
                : 'bg-muted/20 text-muted-foreground/80 hover:bg-muted/50 hover:text-foreground'
            )}
          >
            {cat.label}
          </button>
        ))}
        {savedCount !== undefined && savedCount > 0 && (
          <button
            onClick={() => onSelectCategory('saved')}
            className={cn(
              'px-5 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-200 whitespace-nowrap shrink-0',
              selectedCategory === 'saved'
                ? 'bg-foreground text-background shadow-sm'
                : 'bg-muted/20 text-muted-foreground/80 hover:bg-muted/50 hover:text-foreground'
            )}
          >
            Saved<span className="ml-1.5 text-xs opacity-70">· {savedCount}</span>
          </button>
        )}
      </div>

      {/* Right arrow — desktop only */}
      {!hideArrows && (
        <button
          onClick={scrollRight}
          className={cn(
            'hidden sm:flex shrink-0 p-1 ml-1.5 transition-opacity duration-200',
            canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground/60 hover:text-foreground transition-colors" />
        </button>
      )}
    </div>
  );
}

export function PublicDiscoverCategoryBar({ categories, selectedCategory, onSelectCategory }: Omit<DiscoverCategoryBarProps, 'savedCount'>) {
  return (
    <DiscoverCategoryBar
      categories={categories}
      selectedCategory={selectedCategory}
      onSelectCategory={onSelectCategory}
    />
  );
}
