import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

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
  { label: 'Volcanic Sunset',         src: PREVIEW('1776847680436-3svy5f') },
  { label: 'Dynamic Water Splash',    src: PREVIEW('1776018020221-aehe8n') },
  { label: 'Motion Blur Float',       src: PREVIEW('motion-blur-float-fragrance-1776013400244') },
  { label: 'Frozen Aura',             src: PREVIEW('1776018027926-ua03bd') },
  { label: 'Natural Light Backdrop',  src: PREVIEW('1776018032748-kg4bn6') },
  { label: 'Earthy Botanicals',       src: PREVIEW('1776018021309-gfgfci') },
  { label: 'Near Face Hold',          src: PREVIEW('near-face-hold-fragrance-1776013185169') },
  { label: 'Dark Elegance',           src: PREVIEW('1776018015756-3xfquh') },
  // hidden on mobile
  { label: 'Warm Neutral Studio',     src: PREVIEW('1776018040785-dq78y5') },
  { label: 'Volcanic Sunset II',      src: PREVIEW('1776843791659-3oq68h') },
  { label: 'Frozen Aura II',          src: PREVIEW('1776835749003-43ooe1') },
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
  { id: 'swimwear',  label: 'Swimwear',  cards: SWIMWEAR_CARDS,  copy: 'See what your swimwear can become.' },
  { id: 'fragrance', label: 'Fragrance', cards: FRAGRANCE_CARDS, copy: 'See what your fragrance can become.' },
  { id: 'eyewear',   label: 'Eyewear',   cards: EYEWEAR_CARDS,   copy: 'See what your eyewear can become.' },
] as const;

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
        <span className="absolute top-2 right-2 text-[10px] font-semibold uppercase tracking-wider bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-full">
          Original
        </span>
      )}
      <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/55 to-transparent">
        <span className="text-[10px] sm:text-[11px] font-medium tracking-wide text-white/90">
          {card.label}
        </span>
      </div>
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
        <div className="text-center max-w-2xl mx-auto mb-8 lg:mb-10">
          <h2 className="text-foreground text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            From one product photo to every asset you need
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {current.copy}
          </p>
        </div>

        {/* Category pills */}
        <div className="flex justify-center mb-8 lg:mb-10">
          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-muted/60 border border-border/60">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActive(cat.id)}
                className={cn(
                  'px-5 py-2 rounded-full text-sm font-medium transition-colors',
                  active === cat.id
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {cat.label}
              </button>
            ))}
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
        <div className="flex justify-center mt-10 lg:mt-14">
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
