import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, ArrowRight } from 'lucide-react';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { SITE_URL } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import {
  usePublicSceneLibrary,
  type FamilyGroup,
  type PublicScene,
} from '@/hooks/usePublicSceneLibrary';
import { LibrarySidebarNav } from '@/components/library/LibrarySidebarNav';
import { SceneCard, SceneCardSkeleton } from '@/components/library/SceneCard';
import { SceneDetailModal } from '@/components/library/SceneDetailModal';

const CREATE_PATH = '/app/generate/product-images';

export default function ProductVisualLibrary() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { families, totalScenes, isLoading } = usePublicSceneLibrary();

  const [search, setSearch] = useState('');
  const [activeFamilySlug, setActiveFamilySlug] = useState<string | null>(null);
  const [selectedScene, setSelectedScene] = useState<PublicScene | null>(null);
  const [selectedFamilyLabel, setSelectedFamilyLabel] = useState<string | undefined>();

  // Set first family as active when data loads.
  useEffect(() => {
    if (!activeFamilySlug && families.length > 0) {
      setActiveFamilySlug(families[0].slug);
    }
  }, [families, activeFamilySlug]);

  // Filter families by search query (client-side, fast).
  const filteredFamilies = useMemo<FamilyGroup[]>(() => {
    if (!search.trim()) return families;
    const q = search.trim().toLowerCase();
    return families
      .map((f) => {
        const collections = f.collections
          .map((c) => {
            const subGroups = c.subGroups
              .map((g) => ({
                ...g,
                scenes: g.scenes.filter((s) => {
                  return (
                    s.title.toLowerCase().includes(q) ||
                    g.label.toLowerCase().includes(q) ||
                    c.label.toLowerCase().includes(q)
                  );
                }),
              }))
              .filter((g) => g.scenes.length > 0);
            const totalCount = subGroups.reduce((acc, g) => acc + g.scenes.length, 0);
            return { ...c, subGroups, totalCount };
          })
          .filter((c) => c.totalCount > 0);
        const totalCount = collections.reduce((acc, c) => acc + c.totalCount, 0);
        return { ...f, collections, totalCount };
      })
      .filter((f) => f.totalCount > 0);
  }, [families, search]);

  const isSearching = search.trim().length > 0;

  // The single family currently rendered (or null when searching, where we render all matches).
  const activeFamily = useMemo<FamilyGroup | null>(() => {
    if (isSearching) return null;
    if (!activeFamilySlug) return filteredFamilies[0] ?? null;
    return filteredFamilies.find((f) => f.slug === activeFamilySlug) ?? filteredFamilies[0] ?? null;
  }, [filteredFamilies, activeFamilySlug, isSearching]);

  const handleSelectFamily = (slug: string) => {
    setActiveFamilySlug(slug);
    const el = document.getElementById('catalog-grid');
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog');
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handlePrimaryCta = () => {
    if (user) navigate(CREATE_PATH);
    else navigate(`/auth?next=${encodeURIComponent(CREATE_PATH)}`);
  };

  const ctaLabel = user ? 'Create Product Visuals' : 'Create Free Visuals';

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

      {/* JSON-LD CollectionPage schema */}
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

      {/* HERO — slim */}
      <section id="top" className="relative overflow-hidden bg-[#FAFAF8]">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] leading-[1.05]">
              AI Product Visual Library
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-foreground/65 sm:text-lg">
              Browse {totalScenes > 0 ? `${totalScenes}+` : '1,600+'} visual directions across every
              ecommerce category. Pick one and create it with your product photo.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                onClick={handlePrimaryCta}
                className="h-[3.25rem] rounded-full bg-foreground px-8 text-base font-semibold text-background hover:bg-foreground/90"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {ctaLabel}
              </Button>
              <Button
                variant="ghost"
                onClick={scrollToCatalog}
                className="h-[3.25rem] rounded-full px-7 text-base font-semibold text-foreground/75 hover:bg-foreground/[0.05] hover:text-foreground"
              >
                Browse Categories
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CATALOG */}
      <section id="catalog" className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Search */}
          <div className="mx-auto mb-10 max-w-xl">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search visuals or categories…"
                className="h-12 rounded-full border-foreground/10 bg-muted/30 pl-11 pr-4 text-sm focus-visible:ring-foreground/20"
              />
            </div>
          </div>

          <div id="catalog-grid" className="grid gap-10 lg:grid-cols-[14rem_1fr] scroll-mt-24">
            <LibrarySidebarNav
              families={filteredFamilies}
              activeFamilySlug={activeFamilySlug}
              onSelectFamily={handleSelectFamily}
            />

            <div className="min-w-0">
              {isLoading && (
                <div>
                  <div className="mb-6 h-7 w-48 animate-pulse rounded bg-foreground/10" />
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <SceneCardSkeleton key={i} />
                    ))}
                  </div>
                </div>
              )}

              {!isLoading && filteredFamilies.length === 0 && (
                <div className="rounded-3xl bg-muted/30 p-12 text-center">
                  <p className="text-sm text-foreground/60">
                    No visuals match "{search}". Try a different search.
                  </p>
                </div>
              )}

              {/* Default: render only the active family */}
              {!isLoading && !isSearching && activeFamily && (
                <FamilySection
                  family={activeFamily}
                  onSceneClick={(s) => handleSceneClick(s, activeFamily.label)}
                />
              )}

              {/* Search mode: render all matching families flat */}
              {!isLoading && isSearching && filteredFamilies.length > 0 && (
                <div className="space-y-14">
                  {filteredFamilies.map((family) => (
                    <FamilySection
                      key={family.slug}
                      family={family}
                      onSceneClick={(s) => handleSceneClick(s, family.label)}
                    />
                  ))}
                </div>
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

// ── Family section: clean, single-level header + sub-category rows ──

interface FamilySectionProps {
  family: FamilyGroup;
  onSceneClick: (s: PublicScene) => void;
}

function FamilySection({ family, onSceneClick }: FamilySectionProps) {
  return (
    <section className="scroll-mt-24">
      {/* Compact eyebrow header */}
      <div className="mb-6 flex items-baseline gap-2">
        <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {family.label}
        </h3>
        <span className="text-sm text-foreground/45 tabular-nums">
          · {family.totalCount} ideas
        </span>
      </div>

      <div className="space-y-10">
        {family.collections.map((collection) => (
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
    </section>
  );
}
