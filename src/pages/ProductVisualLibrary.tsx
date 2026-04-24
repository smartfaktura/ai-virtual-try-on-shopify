import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { Skeleton } from '@/components/ui/skeleton';
import { SITE_URL } from '@/lib/constants';
import {
  usePublicSceneLibrary,
  type FamilyGroup,
  type CollectionGroup,
  type PublicScene,
} from '@/hooks/usePublicSceneLibrary';
import { LibrarySidebarNav } from '@/components/library/LibrarySidebarNav';
import { LibraryMobileFilters } from '@/components/library/LibraryMobileFilters';
import { SceneCard, SceneCardSkeleton } from '@/components/library/SceneCard';
import { SceneDetailModal } from '@/components/library/SceneDetailModal';

export default function ProductVisualLibrary() {
  const { families, totalScenes, isLoading } = usePublicSceneLibrary();

  const [activeFamilySlug, setActiveFamilySlug] = useState<string | null>(null);
  const [activeCollectionSlug, setActiveCollectionSlug] = useState<string | null>(null);
  const [selectedScene, setSelectedScene] = useState<PublicScene | null>(null);
  const [selectedFamilyLabel, setSelectedFamilyLabel] = useState<string | undefined>();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Set first family as active when data loads.
  useEffect(() => {
    if (!activeFamilySlug && families.length > 0) {
      setActiveFamilySlug(families[0].slug);
    }
  }, [families, activeFamilySlug]);

  const activeFamily = useMemo<FamilyGroup | null>(() => {
    if (!activeFamilySlug) return families[0] ?? null;
    return families.find((f) => f.slug === activeFamilySlug) ?? families[0] ?? null;
  }, [families, activeFamilySlug]);

  const activeCollectionLabel = useMemo(() => {
    if (!activeFamily || !activeCollectionSlug) return null;
    return activeFamily.collections.find((c) => c.slug === activeCollectionSlug)?.label ?? null;
  }, [activeFamily, activeCollectionSlug]);

  const scrollToGrid = () => {
    const el = document.getElementById('catalog-grid');
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handleSelectFamily = (slug: string) => {
    setActiveFamilySlug(slug);
    setActiveCollectionSlug(null);
    scrollToGrid();
  };

  const handleMobileSelect = (familySlug: string | null, collectionSlug: string | null) => {
    if (familySlug) setActiveFamilySlug(familySlug);
    setActiveCollectionSlug(collectionSlug);
    scrollToGrid();
  };

  const handleSceneClick = (s: PublicScene, familyLabel: string) => {
    setSelectedScene(s);
    setSelectedFamilyLabel(familyLabel);
  };

  const triggerLabel = activeFamily
    ? activeCollectionLabel
      ? `${activeFamily.label} · ${activeCollectionLabel}`
      : activeFamily.label
    : 'All categories';

  return (
    <PageLayout>
      <SEOHead
        title="AI Product Visual Library for Ecommerce Brands | VOVV.AI"
        description="Browse AI product visual ideas across fashion, footwear, beauty, jewelry, food, home, tech, accessories and more. Upload one product photo and create brand-ready visuals with VOVV.AI."
        canonical={`${SITE_URL}/product-visual-library`}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'AI Product Visual Library',
            description:
              'Browse AI product visual ideas across every ecommerce category. Upload one product photo and create brand-ready visuals.',
            url: `${SITE_URL}/product-visual-library`,
            numberOfItems: totalScenes || 1000,
          }),
        }}
      />

      {/* HERO — slim, left-aligned */}
      <section id="top" className="bg-[#FAFAF8]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 sm:pt-14 pb-6 sm:pb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            AI Product Visual Library
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-foreground/65">
            Browse {totalScenes > 0 ? `${totalScenes}+` : '1,600+'} visual directions across every
            ecommerce category. Pick one and create it with your product photo.
          </p>
        </div>
      </section>

      {/* CATALOG */}
      <section id="catalog" className="bg-background pt-2 sm:pt-4 pb-10 sm:pb-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div id="catalog-grid" className="grid gap-10 lg:grid-cols-[14rem_1fr] scroll-mt-24">
            <LibrarySidebarNav
              families={families}
              activeFamilySlug={activeFamilySlug}
              onSelectFamily={handleSelectFamily}
              isLoading={isLoading}
            />

            <div className="min-w-0">
              {/* Mobile filters trigger bar */}
              <div className="lg:hidden mb-5">
                {isLoading ? (
                  <Skeleton className="h-11 w-full rounded-full" />
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMobileFiltersOpen(true)}
                      className="flex flex-1 items-center gap-2 rounded-full border border-foreground/10 bg-background px-4 py-2.5 text-sm font-medium text-foreground/80 shadow-sm transition-colors hover:bg-foreground/[0.04] active:bg-foreground/[0.06]"
                    >
                      <SlidersHorizontal className="h-4 w-4 opacity-70 shrink-0" />
                      <span className="truncate flex-1 text-left">{triggerLabel}</span>
                      {activeFamily && (
                        <span className="tabular-nums text-xs text-foreground/45 shrink-0">
                          {activeCollectionSlug
                            ? activeFamily.collections.find((c) => c.slug === activeCollectionSlug)?.totalCount
                            : activeFamily.totalCount}
                        </span>
                      )}
                    </button>
                    {activeCollectionSlug && (
                      <button
                        type="button"
                        onClick={() => setActiveCollectionSlug(null)}
                        aria-label="Clear sub-category"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-foreground/10 bg-background text-foreground/60 shadow-sm transition-colors hover:bg-foreground/[0.04]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {isLoading && (
                <div className="space-y-6">
                  {/* Pill row skeleton (desktop only — mobile shows trigger skeleton above) */}
                  <div className="hidden lg:flex gap-2 overflow-hidden">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton
                        key={i}
                        className="h-9 shrink-0 rounded-full"
                        style={{ width: `${90 + (i % 3) * 30}px` }}
                      />
                    ))}
                  </div>
                  {/* Eyebrow skeleton */}
                  <Skeleton className="h-3 w-40 rounded" />
                  {/* Card grid skeleton */}
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <SceneCardSkeleton key={i} />
                    ))}
                  </div>
                </div>
              )}

              {!isLoading && activeFamily && (
                <FamilySection
                  key={activeFamily.slug}
                  family={activeFamily}
                  activeCollectionSlug={activeCollectionSlug}
                  onChangeCollection={setActiveCollectionSlug}
                  onSceneClick={(s) => handleSceneClick(s, activeFamily.label)}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SEO COPY */}
      <section className="bg-[#FAFAF8] py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid gap-10 sm:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                AI product visuals for ecommerce brands
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                Turn one product photo into a full library of brand-ready visuals. Skip studio
                sessions and ship campaigns in hours, not weeks.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Tuned to your product category
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                Each visual direction is built for its category — apparel knows how to drape,
                fragrance knows how to catch glass, footwear knows how to anchor a hero shot.
              </p>
            </div>
          </div>
        </div>
      </section>

      <LibraryMobileFilters
        open={mobileFiltersOpen}
        onOpenChange={setMobileFiltersOpen}
        families={families}
        totalScenes={totalScenes}
        activeFamilySlug={activeFamilySlug}
        activeCollectionSlug={activeCollectionSlug}
        onSelect={handleMobileSelect}
      />

      <SceneDetailModal
        scene={selectedScene}
        familyLabel={selectedFamilyLabel}
        onClose={() => setSelectedScene(null)}
      />
    </PageLayout>
  );
}

// ── Family section: sub-category pills + lazy-loaded scenes ──

interface FamilySectionProps {
  family: FamilyGroup;
  activeCollectionSlug: string | null;
  onChangeCollection: (slug: string | null) => void;
  onSceneClick: (s: PublicScene) => void;
}

const PAGE_SIZE = 30;

function FamilySection({ family, activeCollectionSlug, onChangeCollection, onSceneClick }: FamilySectionProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Pills horizontal scroller (desktop only)
  const pillsScrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Reset visible window when filter changes.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeCollectionSlug, family.slug]);

  // Pills overflow detection (desktop arrows).
  useEffect(() => {
    const el = pillsScrollRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [family.slug]);

  const scrollPills = (dir: 'left' | 'right') => {
    const el = pillsScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' });
  };

  // Filtered collections (one collection or all).
  const collections: CollectionGroup[] = useMemo(() => {
    if (!activeCollectionSlug) return family.collections;
    return family.collections.filter((c) => c.slug === activeCollectionSlug);
  }, [family.collections, activeCollectionSlug]);

  const totalAvailable = useMemo(
    () => collections.reduce((acc, c) => acc + c.totalCount, 0),
    [collections],
  );

  // Slice the flattened scene list to visibleCount, then rebuild grouped view.
  const visibleCollections = useMemo<CollectionGroup[]>(() => {
    let remaining = visibleCount;
    const out: CollectionGroup[] = [];
    for (const c of collections) {
      if (remaining <= 0) break;
      const subGroups = [];
      let collTaken = 0;
      for (const g of c.subGroups) {
        if (remaining <= 0) break;
        const take = Math.min(g.scenes.length, remaining);
        if (take === 0) continue;
        subGroups.push({ ...g, scenes: g.scenes.slice(0, take) });
        remaining -= take;
        collTaken += take;
      }
      if (subGroups.length > 0) {
        out.push({ ...c, subGroups, totalCount: collTaken });
      }
    }
    return out;
  }, [collections, visibleCount]);

  const hasMore = visibleCount < totalAvailable;

  // Infinite scroll sentinel.
  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisibleCount((n) => n + PAGE_SIZE);
        }
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, visibleCollections]);

  const showPills = family.collections.length > 1;

  return (
    <section className="scroll-mt-24">
      {/* Sub-category pills — desktop only (mobile uses drawer) */}
      {showPills && (
        <div className="relative mb-8 hidden lg:block">
          <div
            ref={pillsScrollRef}
            className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            <button
              onClick={() => onChangeCollection(null)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCollectionSlug === null
                  ? 'bg-foreground text-background'
                  : 'bg-foreground/[0.06] text-foreground/70 hover:bg-foreground/[0.1]'
              }`}
            >
              All
              <span className="ml-1.5 text-xs opacity-60">{family.totalCount}</span>
            </button>
            {family.collections.map((c) => {
              const active = c.slug === activeCollectionSlug;
              return (
                <button
                  key={c.slug}
                  onClick={() => onChangeCollection(c.slug)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-foreground text-background'
                      : 'bg-foreground/[0.06] text-foreground/70 hover:bg-foreground/[0.1]'
                  }`}
                >
                  {c.label}
                  <span className="ml-1.5 text-xs opacity-60">{c.totalCount}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop scroll arrows + edge fades */}
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-y-0 left-0 hidden w-12 bg-gradient-to-r from-background to-transparent transition-opacity lg:block ${
              canScrollLeft ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-y-0 right-0 hidden w-12 bg-gradient-to-l from-background to-transparent transition-opacity lg:block ${
              canScrollRight ? 'opacity-100' : 'opacity-0'
            }`}
          />
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollPills('left')}
              aria-label="Scroll categories left"
              className="absolute left-0 top-1/2 hidden h-8 w-8 -translate-y-1/2 -translate-x-1 items-center justify-center rounded-full border border-foreground/10 bg-background text-foreground/70 shadow-sm transition-colors hover:bg-foreground hover:text-background lg:flex"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollPills('right')}
              aria-label="Scroll categories right"
              className="absolute right-0 top-1/2 hidden h-8 w-8 -translate-y-1/2 translate-x-1 items-center justify-center rounded-full border border-foreground/10 bg-background text-foreground/70 shadow-sm transition-colors hover:bg-foreground hover:text-background lg:flex"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Scenes — grouped by collection · sub-category */}
      <div className="space-y-10">
        {visibleCollections.map((collection) => (
          <div key={collection.slug} className="space-y-5">
            {collection.subGroups.map((sub) => {
              const isOnlyGeneral =
                collection.subGroups.length === 1 && sub.label === 'General';
              const rowLabel = isOnlyGeneral
                ? collection.label
                : `${collection.label} · ${sub.label}`;

              return (
                <div key={`${collection.slug}-${sub.label}`} className="space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/55">
                    {rowLabel}
                  </p>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {sub.scenes.map((scene, i) => (
                      <SceneCard
                        key={scene.scene_id}
                        scene={scene}
                        eager={i < 5}
                        onClick={onSceneClick}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Lazy-load sentinel + skeletons */}
      {hasMore && (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <SceneCardSkeleton key={i} />
            ))}
          </div>
          <div ref={sentinelRef} aria-hidden className="h-1 w-full" />
        </>
      )}
    </section>
  );
}
