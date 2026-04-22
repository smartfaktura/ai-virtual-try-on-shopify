import { useMemo } from 'react';
import { Sparkles, LayoutGrid, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CATEGORY_FAMILY_MAP, FAMILY_ORDER, SUBJECT_LABEL,
} from '@/lib/sceneTaxonomy';
import type { SceneCounts } from '@/hooks/useSceneCounts';

export type QuickView = 'all' | 'recommended' | 'new';

interface SceneCatalogSidebarProps {
  counts: SceneCounts | undefined;
  /** Single-select Product Family (one of the family display names, e.g. "Fashion"). null = none. */
  selectedFamily: string | null;
  selectedSubjects: string[];
  quickView: QuickView;
  recommendedCount?: number;
  newCount?: number;
  onSelectFamily: (family: string | null) => void;
  onToggleSubject: (value: string) => void;
  onSelectQuickView: (view: QuickView) => void;
}

const SUBJECTS_IN_RAIL: Array<'product-only' | 'with-model'> = ['product-only', 'with-model'];

export function SceneCatalogSidebar({
  counts,
  selectedFamily,
  selectedSubjects,
  quickView,
  recommendedCount,
  newCount,
  onSelectFamily,
  onToggleSubject,
  onSelectQuickView,
}: SceneCatalogSidebarProps) {
  // Aggregate per-family counts by summing the per-collection counts.
  const familyCounts = useMemo(() => {
    const result: Record<string, number> = {};
    if (!counts) return result;
    for (const [slug, count] of Object.entries(counts.byCollection)) {
      const family = CATEGORY_FAMILY_MAP[slug] ?? 'Other';
      result[family] = (result[family] ?? 0) + count;
    }
    return result;
  }, [counts]);

  const orderedFamilies = FAMILY_ORDER.filter(f => (familyCounts[f] ?? 0) > 0);

  const renderRow = (
    label: string,
    count: number | undefined,
    active: boolean,
    onClick: () => void,
    icon?: React.ReactNode,
  ) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-xs transition-colors',
        active
          ? 'bg-primary/10 text-primary font-semibold'
          : 'text-foreground/80 hover:bg-muted/60',
      )}
    >
      {icon}
      <span className="truncate flex-1">{label}</span>
      {typeof count === 'number' && count > 0 && (
        <span className={cn('text-[10px] tabular-nums', active ? 'text-primary' : 'text-muted-foreground')}>
          {count}
        </span>
      )}
    </button>
  );

  const sectionLabel = (text: string) => (
    <p className="px-2 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
      {text}
    </p>
  );

  return (
    <aside className="hidden lg:block w-60 shrink-0 border-r border-border/40 overflow-y-auto bg-muted/20">
      <div className="px-3 py-2">
        {sectionLabel('Quick')}
        <div className="space-y-0.5">
          {renderRow(
            'All scenes',
            counts?.total,
            quickView === 'all' && selectedFamily === null && selectedSubjects.length === 0,
            () => onSelectQuickView('all'),
            <LayoutGrid className="w-3.5 h-3.5 opacity-60" />,
          )}
          {renderRow(
            'Recommended',
            recommendedCount,
            quickView === 'recommended',
            () => onSelectQuickView('recommended'),
            <Sparkles className="w-3.5 h-3.5 opacity-60" />,
          )}
          {renderRow(
            'New',
            newCount,
            quickView === 'new',
            () => onSelectQuickView('new'),
            <Clock className="w-3.5 h-3.5 opacity-60" />,
          )}
        </div>

        {sectionLabel('Product Families')}
        <div className="space-y-0.5">
          {orderedFamilies.map(family =>
            renderRow(
              family,
              familyCounts[family],
              selectedFamily === family,
              () => onSelectFamily(selectedFamily === family ? null : family),
            ),
          )}
        </div>

        {sectionLabel('Shot Types')}
        <div className="space-y-0.5">
          {SUBJECTS_IN_RAIL.map(s =>
            renderRow(
              SUBJECT_LABEL[s],
              counts?.bySubject[s],
              selectedSubjects.includes(s),
              () => onToggleSubject(s),
            ),
          )}
        </div>
      </div>
    </aside>
  );
}
