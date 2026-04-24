import type { FamilyGroup } from '@/hooks/usePublicSceneLibrary';

interface LibrarySidebarNavProps {
  families: FamilyGroup[];
  activeFamilySlug: string | null;
  onSelectFamily: (slug: string) => void;
}

export function LibrarySidebarNav({ families, activeFamilySlug, onSelectFamily }: LibrarySidebarNavProps) {
  return (
    <>
      {/* Desktop sticky rail */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-3">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/45">
            Categories
          </p>
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
        </div>
      </aside>

      {/* Mobile horizontal pills */}
      <div className="lg:hidden -mx-4 sm:-mx-6">
        <div className="flex gap-2 overflow-x-auto px-4 pb-2 sm:px-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {families.map((f) => {
            const active = f.slug === activeFamilySlug;
            return (
              <button
                key={f.slug}
                onClick={() => onSelectFamily(f.slug)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-foreground text-background'
                    : 'bg-foreground/[0.06] text-foreground/70 hover:bg-foreground/[0.1]'
                }`}
              >
                {f.label}
                <span className="ml-1.5 text-xs opacity-60">{f.totalCount}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
