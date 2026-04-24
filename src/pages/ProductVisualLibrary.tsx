import { useEffect, useMemo, useRef, useState } from 'react';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { SITE_URL } from '@/lib/constants';
import {
  usePublicSceneLibrary,
  type FamilyGroup,
  type CollectionGroup,
  type PublicScene,
} from '@/hooks/usePublicSceneLibrary';
import { LibrarySidebarNav } from '@/components/library/LibrarySidebarNav';
import { SceneCard, SceneCardSkeleton } from '@/components/library/SceneCard';
import { SceneDetailModal } from '@/components/library/SceneDetailModal';

export default function ProductVisualLibrary() {
  const { families, totalScenes, isLoading } = usePublicSceneLibrary();

  const [activeFamilySlug, setActiveFamilySlug] = useState<string | null>(null);
  const [selectedScene, setSelectedScene] = useState<PublicScene | null>(null);
  const [selectedFamilyLabel, setSelectedFamilyLabel] = useState<string | undefined>();

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

  const handleSelectFamily = (slug: string) => {
    setActiveFamilySlug(slug);
    const el = document.getElementById('catalog-grid');
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handleSceneClick = (s: PublicScene, familyLabel: string) => {
    setSelectedScene(s);
    setSelectedFamilyLabel(familyLabel);
  };

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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
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
      <section id="catalog" className="bg-background py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div id="catalog-grid" className="grid gap-10 lg:grid-cols-[14rem_1fr] scroll-mt-24">
            <LibrarySidebarNav
              families={families}
              activeFamilySlug={activeFamilySlug}
              onSelectFamily={handleSelectFamily}
            />

            <div className="min-w-0">
              {isLoading && (
                <div>
                  <div className="mb-6 h-9 w-64 animate-pulse rounded-full bg-foreground/10" />
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <SceneCardSkeleton key={i} />
                    ))}
                  </div>
                </div>
              )}

              {!isLoading && activeFamily && (
                <FamilySection
                  key={activeFamily.slug}
                  family={activeFamily}
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
  onSceneClick: (s: PublicScene) => void;
}

const PAGE_SIZE = 30;

function FamilySection({ family, onSceneClick }: FamilySectionProps) {
  const [activeCollectionSlug, setActiveCollectionSlug] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset whenever family changes (parent re-mounts via key, but be safe).
  useEffect(() => {
    setActiveCollectionSlug(null);
    setVisibleCount(PAGE_SIZE);
  }, [family.slug]);

  // Reset visible window when filter changes.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeCollectionSlug]);

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

  return (
    <section className="scroll-mt-24">
      {/* Sub-category pills */}
      {family.collections.length > 1 && (
        <div className="-mx-4 mb-8 sm:-mx-6">
          <div className="flex gap-2 overflow-x-auto px-4 pb-2 sm:px-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setActiveCollectionSlug(null)}
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
                  onClick={() => setActiveCollectionSlug(c.slug)}
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
