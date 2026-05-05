import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { FamilyGroup } from '@/hooks/usePublicSceneLibrary';

interface LibrarySidebarNavProps {
  families: FamilyGroup[];
  activeFamilySlug: string | null;
  activeCollectionSlug: string | null;
  onSelectFamily: (slug: string) => void;
  onSelectCollection: (familySlug: string, collectionSlug: string | null) => void;
  isLoading?: boolean;
}

export function LibrarySidebarNav({
  families,
  activeFamilySlug,
  activeCollectionSlug,
  onSelectFamily,
  onSelectCollection,
  isLoading = false,
}: LibrarySidebarNavProps) {
  const showSkeleton = isLoading && families.length === 0;

  // Track which family is expanded — defaults to active family
  const [expandedSlug, setExpandedSlug] = useState<string | null>(activeFamilySlug);

  // Sync expanded state when active family changes externally
  useEffect(() => {
    if (activeFamilySlug) setExpandedSlug(activeFamilySlug);
  }, [activeFamilySlug]);

  const handleFamilyClick = (family: FamilyGroup) => {
    const hasCollections = family.collections.length > 1;

    if (activeFamilySlug === family.slug) {
      // Already active — toggle expand
      setExpandedSlug((prev) => (prev === family.slug ? null : family.slug));
    } else {
      // Select and expand
      onSelectFamily(family.slug);
      if (hasCollections) {
        setExpandedSlug(family.slug);
      }
    }
  };

  const handleCollectionClick = (familySlug: string, collectionSlug: string | null) => {
    onSelectCollection(familySlug, collectionSlug);
  };

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-3">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/45">
          Categories
        </p>
        {showSkeleton ? (
          <div className="space-y-1.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <nav className="space-y-0.5">
            {families.map((f) => {
              const isActive = f.slug === activeFamilySlug;
              const isExpanded = f.slug === expandedSlug;
              const hasCollections = f.collections.length > 1;
              const ChevronIcon = hasCollections
                ? isExpanded ? ChevronDown : ChevronRight
                : null;

              return (
                <div key={f.slug}>
                  <button
                    onClick={() => handleFamilyClick(f)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                      isActive && !activeCollectionSlug
                        ? 'bg-foreground text-background font-semibold'
                        : isActive
                          ? 'bg-foreground/[0.08] text-foreground font-semibold'
                          : 'text-foreground/70 hover:bg-foreground/[0.05] hover:text-foreground',
                    )}
                  >
                    {ChevronIcon ? (
                      <ChevronIcon className="h-3.5 w-3.5 shrink-0 opacity-60" />
                    ) : (
                      <span className="w-3.5 shrink-0" />
                    )}
                    <span className="truncate flex-1">{f.label}</span>
                    <span
                      className={cn(
                        'shrink-0 text-[11px] tabular-nums',
                        isActive && !activeCollectionSlug
                          ? 'text-background/70'
                          : 'text-foreground/40',
                      )}
                    >
                      {f.totalCount}
                    </span>
                  </button>

                  {/* Sub-categories (collections) */}
                  {isExpanded && hasCollections && (
                    <div className="mt-1 mb-1.5 ml-5 pl-3 border-l border-foreground/10 space-y-0.5">
                      {/* "All" option within this family */}
                      <button
                        onClick={() => handleCollectionClick(f.slug, null)}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors text-left',
                          isActive && activeCollectionSlug === null
                            ? 'bg-foreground text-background font-semibold'
                            : 'text-foreground/60 hover:bg-foreground/[0.05] hover:text-foreground',
                        )}
                      >
                        <span className="flex-1">All</span>
                        <span
                          className={cn(
                            'tabular-nums text-[11px]',
                            isActive && activeCollectionSlug === null
                              ? 'text-background/60'
                              : 'opacity-50',
                          )}
                        >
                          {f.totalCount}
                        </span>
                      </button>

                      {f.collections.map((c) => {
                        const collActive = isActive && activeCollectionSlug === c.slug;
                        return (
                          <button
                            key={c.slug}
                            onClick={() => handleCollectionClick(f.slug, c.slug)}
                            className={cn(
                              'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors text-left',
                              collActive
                                ? 'bg-foreground text-background font-semibold'
                                : 'text-foreground/60 hover:bg-foreground/[0.05] hover:text-foreground',
                            )}
                          >
                            <span className="truncate flex-1">{c.label}</span>
                            <span
                              className={cn(
                                'tabular-nums text-[11px]',
                                collActive ? 'text-background/60' : 'opacity-50',
                              )}
                            >
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
          </nav>
        )}
      </div>
    </aside>
  );
}
