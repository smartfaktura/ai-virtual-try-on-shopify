/**
 * Skeleton shown while resolving a direct hit on /discover/:slug.
 * Mirrors DiscoverItemSEOView layout so there's no jump when real
 * content swaps in. Pure shimmer, no data fetching.
 */
export function DiscoverItemDetailSkeleton() {
  return (
    <article className="mx-auto max-w-6xl px-4 sm:px-6 pt-10 sm:pt-14 pb-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-8">
        <div className="h-3 w-16 rounded bg-muted animate-pulse" />
        <div className="h-3 w-3 rounded bg-muted/60 animate-pulse" />
        <div className="h-3 w-24 rounded bg-muted animate-pulse" />
        <div className="h-3 w-3 rounded bg-muted/60 animate-pulse" />
        <div className="h-3 w-32 rounded bg-muted animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12">
        {/* Hero image (4:5) */}
        <div className="relative w-full overflow-hidden rounded-2xl bg-muted animate-pulse aspect-[4/5]" />

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* H1 */}
          <div className="space-y-3">
            <div className="h-8 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-8 w-1/2 rounded bg-muted animate-pulse" />
          </div>

          {/* Chips */}
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-7 rounded-full bg-muted animate-pulse"
                style={{ width: `${64 + ((i * 17) % 48)}px` }}
              />
            ))}
          </div>

          {/* Prompt block */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-5 space-y-2">
            <div className="h-3 w-20 rounded bg-muted animate-pulse" />
            <div className="h-3 w-full rounded bg-muted animate-pulse" />
            <div className="h-3 w-full rounded bg-muted animate-pulse" />
            <div className="h-3 w-5/6 rounded bg-muted animate-pulse" />
            <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
          </div>

          {/* CTA */}
          <div className="h-11 w-44 rounded-md bg-muted animate-pulse" />
        </div>
      </div>

      {/* Related grid */}
      <div className="mt-16">
        <div className="h-5 w-40 rounded bg-muted animate-pulse mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/5] rounded-xl bg-muted animate-pulse"
            />
          ))}
        </div>
      </div>
    </article>
  );
}
