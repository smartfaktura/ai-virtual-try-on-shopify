import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, ImageIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { useScrollReveal } from '@/hooks/useScrollReveal';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import originalFragrance from '@/assets/home-hero-original-fragrance.jpg';
import originalEyewear from '@/assets/home-hero-original-eyewear.png';

/* ── Scene preview helper (Supabase public bucket) ── */
const SUPABASE_PUBLIC =
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads';

const PREVIEW = (id: string) =>
  `${SUPABASE_PUBLIC}/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/${id}.jpg`;

type GridCardData = { label: string; src: string; isOriginal?: boolean };

/* ── Swimwear: 12 cards (mobile shows first 9) ── */
const SWIMWEAR_CARDS: GridCardData[] = [
  { label: 'Original',              src: PREVIEW('1776523219756-c5vnc7'), isOriginal: true },
  { label: 'Architectural Stair',   src: PREVIEW('1776522769405-3v1gs0') },
  { label: 'Sunbathing Editorial',  src: PREVIEW('1776524131703-gvh4bb') },
  { label: 'Golden Horizon',        src: PREVIEW('1776574228066-oyklfz') },
  { label: 'Textured Bikini Back',  src: PREVIEW('1776574265735-cvu5sc') },
  { label: 'Coastal Camera',        src: PREVIEW('1776524128011-dcnlpo') },
  { label: 'Yacht Bow Editorial',   src: PREVIEW('1776524132929-q8upyp') },
  { label: 'Rocky Coast Editorial', src: PREVIEW('1776524128888-371hoo') },
  { label: 'Minimal Horizon',       src: PREVIEW('1776574730668-ltg55f') },
  { label: 'Cliffside Beach Walk',  src: PREVIEW('1776574208384-fmg2u3') },
  { label: 'Shoreline Adjust',      src: PREVIEW('1776574249450-gizx6h') },
  { label: 'Sunstone Wall',         src: PREVIEW('1776574255634-kmhz9g') },
];

/* ── Fragrance ── */
const FRAGRANCE_CARDS: GridCardData[] = [
  { label: 'Original',                src: originalFragrance, isOriginal: true },
  { label: 'Volcanic Sunset',         src: PREVIEW('repeated-shadow-grid-fragrance-1776013389735') },
  { label: 'Dynamic Water Splash',    src: PREVIEW('1776018039712-1hifzr') },
  { label: 'Motion Blur Float',       src: PREVIEW('motion-blur-float-fragrance-1776013400244') },
  { label: 'Frozen Aura',             src: PREVIEW('1776018038709-gmt0eg') },
  { label: 'Natural Light Backdrop',  src: PREVIEW('1776018015756-3xfquh') },
  { label: 'Earthy Driftwood',        src: PREVIEW('near-face-hold-fragrance-1776013185169') },
  { label: 'Near Face Hold',          src: PREVIEW('1776018027926-ua03bd') },
  { label: 'Dark Elegance',           src: PREVIEW('1776018020221-aehe8n') },
  { label: 'Aquatic Reflection',      src: PREVIEW('1776018039712-1hifzr') },
  { label: 'Red Gradient Embrace',    src: PREVIEW('1776018038709-gmt0eg') },
  { label: 'Earthy Glow Stage',       src: PREVIEW('1776018027926-ua03bd') },
];

/* ── Eyewear ── */
const EYEWEAR_CARDS: GridCardData[] = [
  { label: 'Original',          src: originalEyewear, isOriginal: true },
  { label: 'Candy Flash',       src: PREVIEW('1776102176417-iih747') },
  { label: 'Stair Selfie',      src: PREVIEW('concrete-stair-selfie-eyewear-1776149876284') },
  { label: 'Beauty Closeup',    src: PREVIEW('beauty-closeup-oversized-eyewear-1776150210659') },
  { label: 'Golden Hour',       src: PREVIEW('1776102185057-0ulf1m') },
  { label: 'Office Flash',      src: PREVIEW('editorial-office-flash-eyewear-1776150153576') },
  { label: 'Lounge Selfie',     src: PREVIEW('1776102190563-dioke2') },
  { label: 'Bench Side',        src: PREVIEW('1776102172131-vq969w') },
  { label: 'Sunset Drive',      src: PREVIEW('1776102204479-9rlc0n') },
  { label: 'Dessert Table',     src: PREVIEW('1776102181320-jisnae') },
  { label: 'Flash Candy',       src: PREVIEW('1776102183733-g1twvv') },
  { label: 'Beauty Closeup II', src: PREVIEW('aesthetic-beauty-closeup-eyewear-1776148096014') },
];

/* ── Jackets (real preview filenames from product_image_scenes · jackets) ── */
const JACKETS_CARDS: GridCardData[] = [
  { label: 'Original',                   src: PREVIEW('1776690211513-2hgcjm'), isOriginal: true },
  { label: 'Side Profile Street Study',  src: PREVIEW('1776691909999-ra3rym') },
  { label: 'Old Money Outdoor Portrait', src: PREVIEW('1776691906436-3fe7l9') },
  { label: 'On-Model Front',             src: PREVIEW('1776690214570-al6wzo') },
  { label: 'On-Model Back',              src: PREVIEW('1776690213075-4gnekd') },
  { label: 'On-Model Editorial',         src: PREVIEW('1776690213983-4h5fjc') },
  { label: 'Movement Shot',              src: PREVIEW('1776690212460-cq4xnb') },
  { label: 'Texture Detail',             src: PREVIEW('1776690215217-gkv2x3') },
  { label: 'Fisheye Streetwear Studio',  src: PREVIEW('1776691901110-5dydmu') },
  { label: 'Sunlit Tailored Chair',      src: PREVIEW('1776691912818-yiu2uq') },
  { label: 'Paris Curb Side',            src: PREVIEW('1776691907477-77vt46') },
  { label: 'Soft Volume Lean',           src: PREVIEW('1776691911049-gsxycu') },
];

/* ── Footwear / Sneakers (real preview filenames) ── */
const FOOTWEAR_CARDS: GridCardData[] = [
  { label: 'Original',              src: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/render/image/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/pair-display-shoes-sneakers-1776008063507.jpg?quality=60', isOriginal: true },
  { label: 'Pair Display',          src: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/render/image/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/1776770356335-261bui.jpg?quality=75' },
  { label: 'In-Hand Studio',        src: PREVIEW('in-hand-studio-shoes-sneakers-1776008276313') },
  { label: 'Front View',            src: PREVIEW('front-view-shoes-sneakers-1776008034245') },
  { label: 'Geometric Grid Minimal',src: PREVIEW('1776770345914-cg8uyy') },
  { label: 'Clean Top View',        src: PREVIEW('1776770342811-jr21sq') },
  { label: 'Close-Up Detail',       src: PREVIEW('closeup-detail-shoes-sneakers-1776008260513') },
  { label: 'Woven Chair Display',   src: PREVIEW('1776770352201-yu4wqm') },
  { label: 'Casual Lace Moment',    src: PREVIEW('1776770353784-010tv3') },
  { label: 'Hard Shadow Hero',      src: PREVIEW('hard-shadow-shoes-sneakers-1776008136691') },
  { label: 'Studio Hero',           src: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/render/image/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/1776770347820-s3qwmr.jpg?quality=75' },
  { label: 'Sculpt Balance Edge',   src: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/render/image/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/1776770349853-t3x72w.jpg?quality=75' },
];

/* ── Watches (verified preview filenames) ── */
const WATCHES_CARDS: GridCardData[] = [
  { label: 'On-Wrist Studio',           src: PREVIEW('1776596629281-anqgf5'), isOriginal: true },
  { label: 'Front View',                src: PREVIEW('1776247092505-0ugq0d') },
  { label: 'Side View',                 src: PREVIEW('1776596642031-wqv2yx') },
  { label: 'Angle View',                src: PREVIEW('1776596689365-pf1c97') },
  { label: 'Back View',                 src: PREVIEW('1776247087022-pv2irf') },
  { label: 'On-Wrist Lifestyle',        src: PREVIEW('1776596780029-phrw2z') },
  { label: 'Close-Up Detail',           src: PREVIEW('1776247088202-e612sc') },
  { label: 'Texture Detail',            src: PREVIEW('1776247104640-v8gg45') },
  { label: 'Hard Shadow Hero',          src: PREVIEW('1776247093519-s8oold') },
  { label: 'Flat Lay Styled',           src: PREVIEW('1776247091482-4lken5') },
  { label: 'Earthy Glow Stage',         src: PREVIEW('1776856607319-693vtg') },
  { label: 'Gradient Backdrop Elegance',src: PREVIEW('1776856610327-uhrujn') },
];

const CATEGORIES = [
  { id: 'swimwear',  label: 'Swimwear',  cards: SWIMWEAR_CARDS },
  { id: 'fragrance', label: 'Fragrance', cards: FRAGRANCE_CARDS },
  { id: 'eyewear',   label: 'Eyewear',   cards: EYEWEAR_CARDS },
  { id: 'jackets',   label: 'Jackets',   cards: JACKETS_CARDS },
  { id: 'footwear',  label: 'Footwear',  cards: FOOTWEAR_CARDS },
  { id: 'watches',   label: 'Watches',   cards: WATCHES_CARDS },
] as const;

const ALL_CATEGORY_NAMES = [
  'Swimwear', 'Fragrance', 'Eyewear', 'Skincare', 'Makeup',
  'Dresses', 'Garments', 'Hoodies', 'Jackets', 'Jeans',
  'Lingerie', 'Activewear', 'Scarves', 'Belts', 'Hats',
  'Sneakers', 'Shoes', 'Boots', 'Heels',
  'Bags & Accessories', 'Backpacks', 'Wallets', 'Cardholders',
  'Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Watches',
  'Home Decor', 'Furniture', 'Tech',
  'Beverages', 'Food', 'Snacks', 'Wellness',
];

type CategoryId = typeof CATEGORIES[number]['id'];

/* ── Grid card with shimmer skeleton until image paints ── */
function GridCard({
  card,
  hideOnMobile,
  eager,
}: {
  card: GridCardData;
  hideOnMobile: boolean;
  eager?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={cn(
        'relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md shadow-foreground/[0.04] bg-[#efece8]',
        hideOnMobile && 'hidden sm:block',
      )}
    >
      {/* Shimmer skeleton until image paints */}
      {!loaded && (
        <Skeleton className="absolute inset-0 z-[1] rounded-2xl" />
      )}
      {/* Subtle placeholder icon under the skeleton */}
      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
        <ImageIcon size={22} strokeWidth={1.25} />
      </div>
      <img
        src={getOptimizedUrl(card.src, { quality: 60 })}
        alt={card.label}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        // @ts-expect-error fetchpriority is valid HTML attr
        fetchpriority={eager ? 'high' : 'auto'}
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
          setLoaded(true);
        }}
        className={cn(
          'relative z-[2] w-full h-full object-cover transition-opacity duration-500',
          loaded ? 'opacity-100' : 'opacity-0',
        )}
      />
      {card.isOriginal && (
        <span className="absolute top-2 right-2 z-[3] text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-full">
          Original
        </span>
      )}
    </div>
  );
}

/* ── Main section ── */
export function HomeTransformStrip() {
  const { ref, visible } = useScrollReveal();
  const [active, setActive] = useState<CategoryId>('swimwear');
  const [visited, setVisited] = useState<Set<CategoryId>>(() => new Set(['swimwear']));

  const selectCategory = (id: CategoryId) => {
    setActive(id);
    setVisited((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  // Warm browser cache for every category's tile so pill-switching is instant.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const head = document.head;
    const created: HTMLLinkElement[] = [];

    // preconnect to Supabase storage origin
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://azwiljtrbtaupofwmpzb.supabase.co';
    preconnect.crossOrigin = '';
    head.appendChild(preconnect);
    created.push(preconnect);

    // preload every tile (low priority so it doesn't fight critical assets)
    const seen = new Set<string>();
    CATEGORIES.forEach((cat) => {
      cat.cards.forEach((card) => {
        const url = getOptimizedUrl(card.src, { quality: 60 });
        if (!url || seen.has(url) || url.startsWith('data:')) return;
        seen.add(url);
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = url;
        link.setAttribute('fetchpriority', 'low');
        head.appendChild(link);
        created.push(link);
      });
    });

    return () => {
      created.forEach((el) => el.parentNode?.removeChild(el));
    };
  }, []);

  return (
    <section className="py-16 lg:py-32 bg-background overflow-hidden" id="examples">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 lg:mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            One photo · Every shot
          </p>
          <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
            Built for every category.
          </h2>
        </div>

        {/* Category pills */}
        <div className="mb-8 lg:mb-10">
          {/* Mobile: full-bleed scrollable rail with edge fades */}
          <div className="lg:hidden relative -mx-6">
            <div className="flex gap-2 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => selectCategory(cat.id)}
                  className={cn(
                    'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap border',
                    active === cat.id
                      ? 'bg-foreground text-background border-foreground shadow-sm'
                      : 'bg-muted/60 text-muted-foreground border-border/60 hover:text-foreground',
                  )}
                >
                  {cat.label}
                </button>
              ))}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="shrink-0 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap inline-flex items-center gap-1.5 bg-muted/60 border border-border/60"
                  >
                    All
                    <ChevronDown size={14} />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  sideOffset={10}
                  className="w-[min(92vw,420px)] p-5 rounded-2xl"
                >
                  <AllCategoriesPanel />
                </PopoverContent>
              </Popover>
            </div>
            {/* Edge fades hint scrollability */}
            <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-background to-transparent" />
            <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background to-transparent" />
          </div>

          {/* Desktop: centered chip group */}
          <div className="hidden lg:flex justify-center">
            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-muted/60 border border-border/60">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => selectCategory(cat.id)}
                  className={cn(
                    'px-5 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
                    active === cat.id
                      ? 'bg-foreground text-background shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {cat.label}
                </button>
              ))}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="px-5 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap inline-flex items-center gap-1.5"
                  >
                    All categories
                    <ChevronDown size={14} />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="center"
                  sideOffset={10}
                  className="w-[min(92vw,560px)] p-5 rounded-2xl"
                >
                  <AllCategoriesPanel />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Grid — all categories stay mounted; visibility toggles via CSS to avoid re-loading */}
        <div
          ref={ref}
          className={cn(
            'transition-all duration-700',
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
          )}
        >
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className={cn(
                'grid-cols-3 sm:grid-cols-6 gap-3 lg:gap-4',
                active === cat.id ? 'grid' : 'hidden',
              )}
              aria-hidden={active !== cat.id}
            >
              {visited.has(cat.id) &&
                cat.cards.map((card, i) => (
                  <GridCard
                    key={`${cat.id}-${card.label}-${i}`}
                    card={card}
                    hideOnMobile={i >= 9}
                    eager={cat.id === 'swimwear' && i < 9}
                  />
                ))}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 mt-10 lg:mt-14">
          <p className="text-sm text-foreground/70 tracking-wide">
            35+ categories · 1000+ scenes · one upload
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button asChild size="lg" className="rounded-full px-8 text-base">
              <Link to="/auth">
                Try it on my product
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 text-base">
              <Link to="/product-visual-library">
                Browse the visual library
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── All categories popover panel (shared mobile + desktop) ── */
function AllCategoriesPanel() {
  return (
    <>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
        35+ Categories
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mb-4">
        {ALL_CATEGORY_NAMES.map((name) => (
          <span key={name} className="text-sm text-foreground/80">
            {name}
          </span>
        ))}
      </div>
      <Button asChild className="w-full rounded-full" size="sm">
        <Link to="/product-visual-library">
          Preview all categories
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </>
  );
}
