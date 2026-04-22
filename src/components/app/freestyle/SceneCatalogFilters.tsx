import { Search, X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface FilterChipDef {
  key: string;
  label: string;
  axis: 'subject' | 'shot_style' | 'setting' | 'sort' | 'tag';
  value: string;
}

export const QUICK_CHIPS: FilterChipDef[] = [
  { key: 'editorial', label: 'Editorial', axis: 'shot_style', value: 'editorial' },
  { key: 'product-only', label: 'Product Only', axis: 'subject', value: 'product-only' },
  { key: 'with-model', label: 'With Model', axis: 'subject', value: 'with-model' },
  { key: 'lifestyle', label: 'Lifestyle', axis: 'shot_style', value: 'lifestyle' },
  { key: 'outdoor', label: 'Outdoor', axis: 'setting', value: 'outdoor' },
  { key: 'studio', label: 'Studio', axis: 'setting', value: 'studio' },
  { key: 'macro', label: 'Close-up', axis: 'shot_style', value: 'macro' },
  { key: 'flatlay', label: 'Flat Lay', axis: 'shot_style', value: 'flatlay' },
  { key: 'seasonal', label: 'Seasonal', axis: 'tag', value: 'seasonal' },
];

interface SceneCatalogFiltersBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  activeChipKeys: Set<string>;
  onChipToggle: (chip: FilterChipDef) => void;
  onClearAll: () => void;
  anyActive: boolean;
  sort: 'recommended' | 'popular' | 'new';
  onSortChange: (sort: 'recommended' | 'popular' | 'new') => void;
  onOpenMobileFilters?: () => void;
  showMobileFiltersBtn?: boolean;
}

export function SceneCatalogFiltersBar({
  search,
  onSearchChange,
  activeChipKeys,
  onChipToggle,
  onClearAll,
  anyActive,
  sort,
  onSortChange,
  onOpenMobileFilters,
  showMobileFiltersBtn,
}: SceneCatalogFiltersBarProps) {
  return (
    <div className="flex flex-col gap-3 px-4 sm:px-6 py-3 border-b border-border/40 bg-background/60 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search scenes..."
            className="pl-9 h-9 text-sm rounded-full"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
        {showMobileFiltersBtn && (
          <Button variant="outline" size="sm" className="h-9 rounded-full lg:hidden" onClick={onOpenMobileFilters}>
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
            Filters
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mb-1 scrollbar-thin">
        <button
          type="button"
          onClick={() => onSortChange('recommended')}
          className={cn(
            'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
            sort === 'recommended'
              ? 'bg-foreground text-background'
              : 'bg-muted/60 text-muted-foreground hover:bg-muted',
          )}
        >
          All Scenes
        </button>
        <button
          type="button"
          onClick={() => onSortChange('new')}
          className={cn(
            'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
            sort === 'new'
              ? 'bg-foreground text-background'
              : 'bg-muted/60 text-muted-foreground hover:bg-muted',
          )}
        >
          New
        </button>

        <span className="shrink-0 w-px h-5 bg-border/60 mx-1" />

        {QUICK_CHIPS.map(chip => {
          const active = activeChipKeys.has(chip.key);
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => onChipToggle(chip)}
              className={cn(
                'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border',
                active
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border/60 hover:bg-muted',
              )}
            >
              {chip.label}
            </button>
          );
        })}

        {anyActive && (
          <button
            type="button"
            onClick={onClearAll}
            className="shrink-0 ml-2 px-2 py-1.5 text-xs text-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
