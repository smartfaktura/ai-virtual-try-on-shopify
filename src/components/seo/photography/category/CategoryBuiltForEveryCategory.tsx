import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOptimizedUrl, getResizedSrcSet } from '@/lib/imageOptimization';
import { SmartImage } from './SmartImage';
import { PREVIEW, type CategoryPage } from '@/data/aiProductPhotographyCategoryPages';
import { getBuiltForGroupsForPage, slotSlugify } from '@/data/builtForGridGroups';
import { useSeoVisualOverridesMap } from '@/hooks/useSeoVisualOverrides';
import { resolveSlotImageUrl, resolveSlotLabel } from '@/lib/resolveSlotImage';
import { usePublicSceneLibrary } from '@/hooks/usePublicSceneLibrary';
import { getVisualLibraryHrefForCategory } from '@/lib/visualLibraryDeepLink';

/**
 * Per-category "One photo · Every shot" section, rebuilt to mirror the
 * homepage's HomeTransformStrip pattern: chip rail of subcategories, each
 * chip reveals an 8-image grid of real scenes from the live catalog.
 *
 * Title and eyebrow adapt to the page's category and noun.
 */
export function CategoryBuiltForEveryCategory({ page }: { page: CategoryPage }) {
  // Shared with the SEO slot registry so admin overrides match this layout.
  const groups = getBuiltForGroupsForPage(page.slug);
  const splitLabel = (s: string): { subject: string; style?: string } => {
    const parts = s.split('·').map((p) => p.trim());
    return { subject: parts[0], style: parts.slice(1).join(' · ') || undefined };
  };

  const overrides = useSeoVisualOverridesMap();
  const { scenes } = usePublicSceneLibrary();
  const sceneTitleById = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of scenes) m.set(s.scene_id, s.title);
    return m;
  }, [scenes]);
  const [activeIdx, setActiveIdx] = useState(0);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Keep the active chip visible when the user changes it.
  // Skip on first mount so we don't pull the page down to this section
  // immediately after navigation.
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    const chip = chipRefs.current[activeIdx];
    if (!chip) return;
    chip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeIdx]);

  if (groups.length === 0) return null;
  const active = groups[Math.min(activeIdx, groups.length - 1)];
  const noun = page.heroNoun ?? 'photo';
  const totalScenes = groups.reduce((sum, g) => sum + g.cards.length, 0);

  return (
    <section
      id="scenes"
      className="py-16 lg:py-32 bg-background overflow-hidden scroll-mt-24"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        {/* Heading — adaptive */}
        <div className="text-center max-w-2xl mx-auto mb-10 lg:mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            One {noun} · Every shot
          </p>
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
            Built for every {page.groupName.toLowerCase()} shot.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground">
            Every chip — real scenes from a single upload
          </p>
        </div>

        {/* Chip rail — short subject-only labels, wraps on every breakpoint */}
        <div className="mb-8 lg:mb-10 flex justify-center">
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl px-2">
            {groups.map((g, idx) => {
              const { subject } = splitLabel(g.subCategory);
              return (
                <button
                  key={g.subCategory}
                  ref={(el) => { chipRefs.current[idx] = el; }}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className={cn(
                    'px-3.5 sm:px-4 py-2 rounded-full text-[13px] sm:text-sm font-medium transition-colors whitespace-nowrap border',
                    activeIdx === idx
                      ? 'bg-foreground text-background border-foreground shadow-sm'
                      : 'bg-muted/60 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted',
                  )}
                >
                  {subject}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid — 8 images per subcategory (mobile shows 6) */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 lg:gap-4 animate-in fade-in duration-500" key={active.subCategory}>
          {active.cards.map((card, i) => {
            const slotKey = `builtFor_${slotSlugify(active.subCategory)}_${i + 1}`;
            const resolved = resolveSlotImageUrl(overrides, page.url, slotKey, PREVIEW(card.imageId));
            return (
              <div
                key={`${active.subCategory}-${card.imageId}-${i}`}
                className={cn(
                  'group relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted/40 shadow-sm shadow-foreground/[0.04]',
                  i >= 6 && 'hidden sm:block',
                )}
              >
                <SmartImage
                  src={getOptimizedUrl(resolved, { width: 480, height: 640, quality: 80, resize: 'cover' })}
                  srcSet={getResizedSrcSet(resolved, { widths: [320, 480, 640], aspect: [3, 4], quality: 80 })}
                  sizes="(max-width: 1024px) 40vw, 240px"
                  alt={`${card.label} — ${page.groupName} AI product photography example`}
                  imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[11px] font-medium text-white/90 leading-tight line-clamp-2">
                    {card.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 mt-10 lg:mt-14">
          <p className="text-sm text-foreground/70 tracking-wide">
            {totalScenes}+ scenes for {page.groupName.toLowerCase()} · one upload
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/app/generate/product-images"
              className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
            >
              Try it free
              <ArrowRight size={16} />
            </Link>
            <Link
              to={getVisualLibraryHrefForCategory(page.slug)}
              className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full border border-border text-foreground text-base font-semibold hover:bg-secondary transition-colors"
            >
              Browse the visual library
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
