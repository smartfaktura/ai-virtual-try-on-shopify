import { Skeleton } from '@/components/ui/skeleton';
import type { FamilyGroup } from '@/hooks/usePublicSceneLibrary';

interface LibrarySidebarNavProps {
  families: FamilyGroup[];
  activeFamilySlug: string | null;
  onSelectFamily: (slug: string) => void;
  isLoading?: boolean;
}

export function LibrarySidebarNav({
  families,
  activeFamilySlug,
  onSelectFamily,
  isLoading = false,
}: LibrarySidebarNavProps) {
  const showSkeleton = isLoading && families.length === 0;

  // Desktop sticky rail only — mobile uses LibraryMobileFilters drawer.
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
          <nav className="space-y-1">
            {families.map((f) => {
              const active = f.slug === activeFamilySlug;
              return (
                <button
                  key={f.slug}
                  onClick={() => onSelectFamily(f.slug)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    active
                      ? 'bg-foreground text-background font-semibold'
                      : 'text-foreground/70 hover:bg-foreground/[0.05] hover:text-foreground'
                  }`}
                >
                  <span className="truncate">{f.label}</span>
                  <span
                    className={`shrink-0 text-[11px] tabular-nums ${
                      active ? 'text-background/70' : 'text-foreground/40'
                    }`}
                  >
                    {f.totalCount}
                  </span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </aside>
  );
}
