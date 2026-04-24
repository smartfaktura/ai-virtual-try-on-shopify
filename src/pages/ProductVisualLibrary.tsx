import { useEffect, useMemo, useRef, useState } from 'react';
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
import { CategoryOverviewCard } from '@/components/library/CategoryOverviewCard';
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

  const handleSelectFamily = (slug: string) => {
    setActiveFamilySlug(slug);
    const el = document.getElementById(`cat-${slug}`);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const scrollToCatalog = () => {
    const el = document.getElementById('categories');
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
  const totalLabel = totalScenes > 0 ? `${totalScenes}+` : '1,000+';

  return (
    <PageLayout>
      <SEOHead
        title="AI Product Visual Library for Ecommerce Brands | VOVV.AI"
        description="Browse 1,000+ AI product visual ideas across fashion, footwear, beauty, jewelry, food, home, tech, accessories, and more. Upload one product photo and create brand-ready visuals with VOVV.AI."
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

      {/* HERO */}
      <section id="top" className="relative overflow-hidden bg-[#f6f3ee]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-foreground/[0.06] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/65">
              <Sparkles className="h-3 w-3" />
              AI Product Visual Library
            </div>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Explore AI Product Visuals for Every Category
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-foreground/65 sm:text-lg">
              Browse {totalLabel} ready-to-create visual ideas across fashion, beauty, footwear,
              jewelry, food, home, tech, accessories, and more. Choose a visual direction,
              upload your product, and create brand-ready ecommerce visuals in minutes.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={handlePrimaryCta}
                className="rounded-full bg-foreground px-7 font-semibold text-background hover:bg-foreground/90"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {ctaLabel}
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={scrollToCatalog}
                className="rounded-full px-6 font-medium text-foreground/75 hover:bg-foreground/[0.05] hover:text-foreground"
              >
                Browse Categories
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY OVERVIEW */}
      <section id="categories" className="bg-background py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Built for every kind of ecommerce product
            </h2>
            <p className="mt-4 text-base leading-relaxed text-foreground/60">
              From apparel and sneakers to fragrance, jewelry, food, home decor, tech, and
              accessories, VOVV.AI helps brands create visuals that match their product category
              and selling channel.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-72 animate-pulse rounded-3xl bg-[#efece8]"
                  />
                ))
              : families.map((family) => (
                  <CategoryOverviewCard
                    key={family.slug}
                    family={family}
                    onClick={() => handleSelectFamily(family.slug)}
                  />
                ))}
          </div>
        </div>
      </section>

      {/* ACTIVE CATALOG */}
      <section id="catalog" className="bg-[#f6f3ee] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Browse product visual ideas
            </h2>
            <p className="mt-3 text-base text-foreground/60">
              Choose a visual direction and create it with your own product photo.
            </p>
          </div>

          {/* Search */}
          <div className="mx-auto mt-8 max-w-xl">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search visuals or categories…"
                className="h-12 rounded-full border-foreground/10 bg-background pl-11 pr-4 text-sm focus-visible:ring-foreground/20"
              />
            </div>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[14rem_1fr]">
            <LibrarySidebarNav
              families={filteredFamilies}
              activeFamilySlug={activeFamilySlug}
              onSelectFamily={handleSelectFamily}
            />

            <div className="min-w-0 space-y-16">
              {isLoading && (
                <div>
                  <div className="mb-4 h-7 w-48 animate-pulse rounded bg-foreground/10" />
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <SceneCardSkeleton key={i} />
                    ))}
                  </div>
                </div>
              )}

              {!isLoading && filteredFamilies.length === 0 && (
                <div className="rounded-3xl bg-background p-12 text-center">
                  <p className="text-sm text-foreground/60">
                    No visuals match "{search}". Try a different search.
                  </p>
                </div>
              )}

              {!isLoading &&
                filteredFamilies.map((family, fi) => (
                  <FamilySection
                    key={family.slug}
                    family={family}
                    eager={fi < 2}
                    onSceneClick={(s) => {
                      setSelectedScene(s);
                      setSelectedFamilyLabel(family.label);
                    }}
                  />
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* SEO COPY */}
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid gap-10 sm:grid-cols-2">
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                AI product visuals for ecommerce brands
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                VOVV.AI helps ecommerce brands turn a single product photo into a full library of
                brand-ready visuals. Skip expensive studio sessions and ship campaigns in hours,
                not weeks.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                Create product visuals by category
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                Each visual direction is tuned to its product category — apparel scenes know how
                to drape on a model, fragrance scenes know how to catch glass refractions, and
                footwear scenes know how to anchor a hero shot.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                From one product photo to campaign-ready visuals
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                Upload your product, pick a visual direction, and VOVV.AI generates a polished
                image you can drop straight onto a product page, social post, ad, or editorial.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                Visuals for fashion, beauty, footwear, jewelry, food, home, tech, and more
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                Whether you sell sneakers, skincare, perfume, rings, snacks, decor, or devices —
                VOVV.AI has visual directions tuned to your category and selling channel.
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

// ── Family section with progressive mounting ──

interface FamilySectionProps {
  family: FamilyGroup;
  eager: boolean;
  onSceneClick: (s: PublicScene) => void;
}

function FamilySection({ family, eager, onSceneClick }: FamilySectionProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(eager);

  useEffect(() => {
    if (mounted) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setMounted(true);
            io.disconnect();
          }
        }
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mounted]);

  return (
    <section ref={ref} id={`cat-${family.slug}`} className="scroll-mt-24">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {family.label}
        </h3>
        <span className="shrink-0 text-xs text-foreground/45 tabular-nums">
          {family.totalCount} visuals
        </span>
      </div>

      {!mounted ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <SceneCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {family.collections.map((collection) => (
            <div key={collection.slug} className="space-y-4">
              {/* Show collection label only when family has more than one collection */}
              {family.collections.length > 1 && (
                <div className="flex items-baseline justify-between">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground/55">
                    {collection.label}
                  </h4>
                  <span className="text-[11px] text-foreground/40 tabular-nums">
                    {collection.totalCount}
                  </span>
                </div>
              )}

              {collection.subGroups.map((sub) => (
                <div key={sub.label} className="space-y-3">
                  {sub.label && sub.label !== 'General' && (
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-foreground/45">
                      {sub.label}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {sub.scenes.map((scene, i) => (
                      <SceneCard
                        key={scene.scene_id}
                        scene={scene}
                        eager={eager && i < 5}
                        onClick={onSceneClick}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
