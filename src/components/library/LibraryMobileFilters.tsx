import { ChevronDown, ChevronRight, LayoutGrid } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { FamilyGroup } from '@/hooks/usePublicSceneLibrary';

interface LibraryMobileFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  families: FamilyGroup[];
  totalScenes: number;
  activeFamilySlug: string | null;
  activeCollectionSlug: string | null;
  onSelect: (familySlug: string | null, collectionSlug: string | null) => void;
}

export function LibraryMobileFilters({
  open,
  onOpenChange,
  families,
  totalScenes,
  activeFamilySlug,
  activeCollectionSlug,
  onSelect,
}: LibraryMobileFiltersProps) {
  const handleAll = () => {
    onSelect(families[0]?.slug ?? null, null);
    onOpenChange(false);
  };

  const handleFamily = (family: FamilyGroup) => {
    const hasMultiple = family.collections.length > 1;
    if (!hasMultiple) {
      onSelect(family.slug, null);
      onOpenChange(false);
      return;
    }
    // Toggle expand: if already active, collapse by selecting null collection;
    // if not active, just open it (don't close drawer).
    if (activeFamilySlug === family.slug) {
      // Already expanded — just close drawer to confirm
      onOpenChange(false);
      return;
    }
    onSelect(family.slug, null);
  };

  const handleCollection = (familySlug: string, collectionSlug: string) => {
    onSelect(familySlug, collectionSlug);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[88vw] max-w-[340px] p-0 flex flex-col"
      >
        <header className="border-b border-border/40 px-5 pt-5 pb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/45">
            Browse
          </p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">Categories</h3>
        </header>

        <div className="flex-1 overflow-y-auto px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            onClick={handleAll}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-3 rounded-xl text-sm transition-colors',
              !activeFamilySlug || (activeFamilySlug === families[0]?.slug && !activeCollectionSlug)
                ? 'bg-foreground text-background font-semibold'
                : 'text-foreground/80 hover:bg-foreground/[0.05]',
            )}
          >
            <LayoutGrid className="h-4 w-4 opacity-70 shrink-0" />
            <span className="flex-1 text-left">All categories</span>
            <span className="tabular-nums text-xs opacity-60">{totalScenes}</span>
          </button>

          <p className="px-3 pt-5 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/45">
            Categories
          </p>

          <div className="space-y-0.5">
            {families.map((family) => {
              const isActive = activeFamilySlug === family.slug;
              const hasMultiple = family.collections.length > 1;
              const ChevronIcon = hasMultiple
                ? isActive ? ChevronDown : ChevronRight
                : null;

              return (
                <div key={family.slug}>
                  <button
                    type="button"
                    onClick={() => handleFamily(family)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-3 rounded-xl text-sm transition-colors text-left',
                      isActive && !activeCollectionSlug
                        ? 'bg-foreground/[0.08] text-foreground font-semibold'
                        : 'text-foreground/80 hover:bg-foreground/[0.05]',
                    )}
                  >
                    {ChevronIcon ? (
                      <ChevronIcon className="w-4 h-4 opacity-60 shrink-0" />
                    ) : (
                      <span className="w-4 shrink-0" />
                    )}
                    <span className="truncate flex-1">{family.label}</span>
                    <span className="tabular-nums text-xs text-foreground/45">
                      {family.totalCount}
                    </span>
                  </button>

                  {isActive && hasMultiple && (
                    <div className="mt-0.5 mb-1 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => handleCollection(family.slug, '')}
                        className={cn(
                          'w-full flex items-center gap-2 pl-10 pr-3 py-2.5 rounded-xl text-sm transition-colors text-left',
                          activeCollectionSlug === null
                            ? 'bg-foreground text-background font-semibold'
                            : 'text-foreground/70 hover:bg-foreground/[0.05]',
                        )}
                      >
                        <span className="flex-1">All</span>
                        <span className="tabular-nums text-xs opacity-60">
                          {family.totalCount}
                        </span>
                      </button>
                      {family.collections.map((c) => {
                        const collActive = activeCollectionSlug === c.slug;
                        return (
                          <button
                            key={c.slug}
                            type="button"
                            onClick={() => handleCollection(family.slug, c.slug)}
                            className={cn(
                              'w-full flex items-center gap-2 pl-10 pr-3 py-2.5 rounded-xl text-sm transition-colors text-left',
                              collActive
                                ? 'bg-foreground text-background font-semibold'
                                : 'text-foreground/70 hover:bg-foreground/[0.05]',
                            )}
                          >
                            <span className="truncate flex-1">{c.label}</span>
                            <span className="tabular-nums text-xs opacity-60">
                              {c.totalCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
