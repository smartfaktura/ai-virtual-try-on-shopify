import { useMemo } from 'react';
import { Sparkles, LayoutGrid, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORY_FAMILY_MAP, FAMILY_ORDER, getSubFamilyLabel } from '@/lib/sceneTaxonomy';
import type { SceneCounts } from '@/hooks/useSceneCounts';

export type QuickView = 'all' | 'recommended' | 'new';

interface SceneCatalogSidebarProps {
  counts: SceneCounts | undefined;
  /** Single-select Product Family (one of the family display names, e.g. "Fashion"). null = none. */
  selectedFamily: string | null;
  /** Single-select sub-family slug (a `category_collection` value). */
  selectedCategoryCollection: string | null;
  selectedSubjects: string[];
  quickView: QuickView;
  recommendedCount?: number;
  newCount?: number;
  onSelectFamily: (family: string | null) => void;
  onSelectCategoryCollection: (slug: string | null) => void;
  onSelectQuickView: (view: QuickView) => void;
  /** When true, render full-width without the desktop-only `hidden lg:block` and fixed width. */
  mobileMode?: boolean;
  /** Optional callback fired after a selection is made (e.g., to close the mobile drawer). */
  onAfterSelect?: () => void;
}

/** Push any "essential"-flavoured slug to the bottom of a sub-family list. */
function isEssentialSlug(slug: string): boolean {
  return slug.includes('essential');
}

export function SceneCatalogSidebar({
  counts,
  selectedFamily,
  selectedCategoryCollection,
  quickView,
  recommendedCount,
  newCount,
  onSelectFamily,
  onSelectCategoryCollection,
  onSelectQuickView,
  mobileMode,
  onAfterSelect,
}: SceneCatalogSidebarProps) {
  // Group collection slugs by their family + aggregate per-family totals in one pass.
  const { familyCounts, subFamiliesByFamily } = useMemo(() => {
    const fc: Record<string, number> = {};
    const subs: Record<string, Array<{ slug: string; count: number }>> = {};
    if (!counts) return { familyCounts: fc, subFamiliesByFamily: subs };

    for (const [slug, count] of Object.entries(counts.byCollection)) {
      const family = CATEGORY_FAMILY_MAP[slug];
      if (!family) {
        if (typeof console !== 'undefined') console.warn('[SceneCatalogSidebar] Unmapped category_collection slug:', slug);
        continue;
      }
      fc[family] = (fc[family] ?? 0) + count;
      (subs[family] ||= []).push({ slug, count });
    }

    // Sort sub-families: non-essentials by count desc, essentials at the bottom.
    for (const family of Object.keys(subs)) {
      subs[family].sort((a, b) => {
        const aE = isEssentialSlug(a.slug) ? 1 : 0;
        const bE = isEssentialSlug(b.slug) ? 1 : 0;
        if (aE !== bE) return aE - bE;
        return b.count - a.count;
      });
    }
    return { familyCounts: fc, subFamiliesByFamily: subs };
  }, [counts]);

  const orderedFamilies = FAMILY_ORDER.filter(f => (familyCounts[f] ?? 0) > 0);

  const handleFamilyClick = (family: string) => {
    const subs = subFamiliesByFamily[family] ?? [];
    if (subs.length === 1) {
      const onlySlug = subs[0].slug;
      if (selectedCategoryCollection === onlySlug && selectedFamily === family) {
        onSelectFamily(null);
      } else {
        onSelectFamily(family);
        onSelectCategoryCollection(onlySlug);
        onAfterSelect?.();
      }
      return;
    }
    if (selectedFamily === family) {
      onSelectFamily(null);
    } else {
      onSelectFamily(family);
      onSelectCategoryCollection(null);
    }
  };

  const handleSubClick = (slug: string) => {
    if (selectedCategoryCollection === slug) {
      onSelectCategoryCollection(null);
    } else {
      onSelectCategoryCollection(slug);
      onAfterSelect?.();
    }
  };

  const handleQuickViewClick = (view: QuickView) => {
    onSelectQuickView(view);
    onAfterSelect?.();
  };

  const renderRow = (
    label: string,
    count: number | undefined,
    active: boolean,
    onClick: () => void,
    icon?: React.ReactNode,
    indent = false,
  ) => (
    <button
      key={label + (indent ? '-sub' : '')}
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 text-left transition-colors',
        mobileMode
          ? cn('py-3 rounded-xl text-sm', indent ? 'pl-10 pr-4' : 'px-4')
          : cn('py-1.5 rounded-md text-xs', indent ? 'pl-6 pr-2' : 'px-2'),
        active
          ? 'bg-primary/10 text-primary font-semibold'
          : 'text-foreground/80 hover:bg-muted/60',
      )}
    >
      {icon}
      <span className="truncate flex-1">{label}</span>
      {typeof count === 'number' && count > 0 && (
        <span
          className={cn(
            'tabular-nums',
            mobileMode ? 'text-xs' : 'text-[10px]',
            active ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );

  const sectionLabel = (text: string) => (
    <p
      className={cn(
        'font-semibold uppercase tracking-[0.12em] text-muted-foreground/70',
        mobileMode ? 'px-4 pt-5 pb-2 text-[11px]' : 'px-2 pt-3 pb-1.5 text-[10px]',
      )}
    >
      {text}
    </p>
  );

  return (
    <aside
      className={cn(
        'shrink-0 overflow-y-auto bg-muted/20',
        mobileMode
          ? 'w-full h-full'
          : 'hidden lg:block w-60 border-r border-border/40',
      )}
    >
      <div className="px-3 py-2">
        {sectionLabel('Quick')}
        <div className="space-y-0.5">
          {renderRow(
            'All scenes',
            counts?.total,
            quickView === 'all' && selectedFamily === null && selectedCategoryCollection === null,
            () => handleQuickViewClick('all'),
            <LayoutGrid className="w-3.5 h-3.5 opacity-60" />,
          )}
          {renderRow(
            'Recommended',
            recommendedCount,
            quickView === 'recommended',
            () => handleQuickViewClick('recommended'),
            <Sparkles className="w-3.5 h-3.5 opacity-60" />,
          )}
          {renderRow(
            'New',
            newCount,
            quickView === 'new',
            () => handleQuickViewClick('new'),
            <Clock className="w-3.5 h-3.5 opacity-60" />,
          )}
        </div>

        {sectionLabel('Product Families')}
        <div className="space-y-0.5">
          {orderedFamilies.map(family => {
            const subs = subFamiliesByFamily[family] ?? [];
            const isActive = selectedFamily === family;
            const hasMultiple = subs.length > 1;
            const ChevronIcon = hasMultiple
              ? (isActive ? ChevronDown : ChevronRight)
              : null;

            return (
              <div key={family}>
                <button
                  type="button"
                  onClick={() => handleFamilyClick(family)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-xs transition-colors',
                    isActive && !selectedCategoryCollection
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-foreground/80 hover:bg-muted/60',
                  )}
                >
                  {ChevronIcon ? (
                    <ChevronIcon className="w-3 h-3 opacity-60 shrink-0" />
                  ) : (
                    <span className="w-3 shrink-0" />
                  )}
                  <span className="truncate flex-1">{family}</span>
                  <span
                    className={cn(
                      'text-[10px] tabular-nums',
                      isActive && !selectedCategoryCollection
                        ? 'text-primary'
                        : 'text-muted-foreground',
                    )}
                  >
                    {familyCounts[family]}
                  </span>
                </button>

                {isActive && hasMultiple && (
                  <div className="mt-0.5 mb-1 space-y-0.5">
                    {subs.map(({ slug, count }) =>
                      renderRow(
                        getSubFamilyLabel(slug),
                        count,
                        selectedCategoryCollection === slug,
                        () => handleSubClick(slug),
                        undefined,
                        true,
                      ),
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
