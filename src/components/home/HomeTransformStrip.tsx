import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { useScrollReveal } from '@/hooks/useScrollReveal';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { Button } from '@/components/ui/button';
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
  // hidden on mobile
  { label: 'Cliffside Beach Walk',  src: PREVIEW('1776574208384-fmg2u3') },
  { label: 'Shoreline Adjust',      src: PREVIEW('1776574249450-gizx6h') },
  { label: 'Sunstone Wall',         src: PREVIEW('1776574255634-kmhz9g') },
];

/* ── Fragrance: 12 cards (mobile shows first 9) ── */
const FRAGRANCE_CARDS: GridCardData[] = [
  { label: 'Original',                src: originalFragrance, isOriginal: true },
  { label: 'Volcanic Sunset',         src: PREVIEW('1776018021309-gfgfci') },
  { label: 'Dynamic Water Splash',    src: PREVIEW('1776018039712-1hifzr') },
  { label: 'Motion Blur Float',       src: PREVIEW('motion-blur-float-fragrance-1776013400244') },
  { label: 'Frozen Aura',             src: PREVIEW('1776018038709-gmt0eg') },
  { label: 'Natural Light Backdrop',  src: PREVIEW('1776018032748-kg4bn6') },
  { label: 'Earthy Driftwood',        src: PREVIEW('1776018021309-gfgfci') },
  { label: 'Near Face Hold',          src: PREVIEW('near-face-hold-fragrance-1776013185169') },
  { label: 'Dark Elegance',           src: PREVIEW('1776018015756-3xfquh') },
  // hidden on mobile
  { label: 'Aquatic Reflection',      src: PREVIEW('1775132826887-gjbnyl') },
  { label: 'Red Gradient Embrace',    src: PREVIEW('1776018027926-ua03bd') },
  { label: 'Earthy Glow Stage',       src: PREVIEW('1775135707468-egh405') },
];

/* ── Eyewear: 12 cards (mobile shows first 9) ── */
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
  // hidden on mobile
  { label: 'Dessert Table',     src: PREVIEW('1776102181320-jisnae') },
  { label: 'Flash Candy',       src: PREVIEW('1776102183733-g1twvv') },
  { label: 'Beauty Closeup II', src: PREVIEW('aesthetic-beauty-closeup-eyewear-1776148096014') },
];

const CATEGORIES = [
  { id: 'swimwear',  label: 'Swimwear',  cards: SWIMWEAR_CARDS },
  { id: 'fragrance', label: 'Fragrance', cards: FRAGRANCE_CARDS },
  { id: 'eyewear',   label: 'Eyewear',   cards: EYEWEAR_CARDS },
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

/* ── Grid card ── */
function GridCard({ card, hideOnMobile }: { card: GridCardData; hideOnMobile: boolean }) {
  return (
    <div
      className={cn(
        'relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md shadow-foreground/[0.04] bg-muted/30',
        hideOnMobile && 'hidden sm:block',
      )}
    >
      <img
        src={getOptimizedUrl(card.src, { quality: 60 })}
        alt={card.label}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {card.isOriginal && (
        <span className="absolute top-2 right-2 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-full">
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

  const current = CATEGORIES.find((c) => c.id === active)!;

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
        <div className="flex justify-center mb-8 lg:mb-10 -mx-6 px-6 overflow-x-auto scrollbar-hide">
          <div className="inline-flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 rounded-full bg-muted/60 border border-border/60 mx-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActive(cat.id)}
                className={cn(
                  'px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap',
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
                  className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap inline-flex items-center gap-1 sm:gap-1.5"
                >
                  <span className="sm:hidden">All</span>
                  <span className="hidden sm:inline">All categories</span>
                  <ChevronDown size={14} />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="center"
                sideOffset={10}
                className="w-[min(92vw,560px)] p-5 rounded-2xl"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
                  35+ Categories
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                  {ALL_CATEGORY_NAMES.map((name) => (
                    <span key={name} className="text-sm text-foreground/80">
                      {name}
                    </span>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Grid */}
        <div
          ref={ref}
          className={cn(
            'grid grid-cols-3 sm:grid-cols-6 gap-3 lg:gap-4 transition-all duration-700',
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
          )}
        >
          {current.cards.map((card, i) => (
            <GridCard key={`${current.id}-${card.label}-${i}`} card={card} hideOnMobile={i >= 9} />
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 mt-10 lg:mt-14">
          <p className="text-xs text-muted-foreground tracking-wide">
            35+ categories · 1000+ scenes · one upload
          </p>
          <Button asChild size="lg" className="rounded-full px-8 text-base">
            <Link to="/auth">
              Try it on my product
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
