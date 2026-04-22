import { Search, X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

export interface FilterChipDef {
  key: string;
  label: string;
  axis: 'subject' | 'shot_style' | 'setting' | 'sort' | 'tag';
  value: string;
}

/** Compact top-bar chips: only the two we want exposed to users. */
export const QUICK_CHIPS: FilterChipDef[] = [
  { key: 'product-only', label: 'Product Only', axis: 'subject', value: 'product-only' },
  { key: 'with-model', label: 'With Model', axis: 'subject', value: 'with-model' },
];

interface SceneCatalogFiltersBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  activeChipKeys: Set<string>;
  onChipToggle: (chip: FilterChipDef) => void;
  onClearAll: () => void;
  anyActive: boolean;
  sort: 'recommended' | 'new';
  onSortChange: (sort: 'recommended' | 'new') => void;
  onOpenMobileFilters?: () => void;
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
}: SceneCatalogFiltersBarProps) {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-2 px-4 sm:px-6 py-2.5 border-b border-border/40 bg-background/60 backdrop-blur-sm">
      {/* Mobile-only row: equal-width Filters + Sort pills */}
      <div className="flex items-center gap-2 w-full lg:hidden">
        {onOpenMobileFilters && (
          <Button
            variant="outline"
            className="flex-1 h-9 rounded-full px-4 text-xs"
            onClick={onOpenMobileFilters}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
            Filters
          </Button>
        )}
        <Select value={sort} onValueChange={v => onSortChange(v as 'recommended' | 'new')}>
          <SelectTrigger className="flex-1 h-9 rounded-full text-xs [&>span]:truncate">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recommended">Recommended</SelectItem>
            <SelectItem value="new">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop search */}
      <div className="hidden lg:flex items-center gap-2 lg:flex-1">
        <div className="relative lg:w-[280px] min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search scenes..."
            className="pl-8 pr-7 h-8 text-xs rounded-full"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted"
              aria-label="Clear search"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Desktop subject chips */}
      <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto scrollbar-thin min-w-0 lg:flex-1">
        {QUICK_CHIPS.map(chip => {
          const active = activeChipKeys.has(chip.key);
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => onChipToggle(chip)}
              className={cn(
                'shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors border',
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
            className="shrink-0 ml-1 px-2 py-1 text-xs text-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Desktop-only sort on the right */}
      <Select value={sort} onValueChange={v => onSortChange(v as 'recommended' | 'new')}>
        <SelectTrigger className="hidden lg:flex h-8 w-[140px] rounded-full text-xs shrink-0">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recommended">Recommended</SelectItem>
          <SelectItem value="new">Newest</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
