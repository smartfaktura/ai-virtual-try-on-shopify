import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { useScrollReveal } from '@/hooks/useScrollReveal';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { Button } from '@/components/ui/button';

/* ── Swimwear category showcase: 1 original + 9 scene previews ── */
const SUPABASE_PUBLIC =
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads';

const PREVIEW = (id: string) =>
  `${SUPABASE_PUBLIC}/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/${id}.jpg`;

type GridCardData = { label: string; src: string; isOriginal?: boolean };

const SWIMWEAR_CARDS: GridCardData[] = [
  { label: 'Original',              src: PREVIEW('1776523219756-c5vnc7'), isOriginal: true }, // Ghost Mannequin Shot — Swimwear
  { label: 'Architectural Stair',   src: PREVIEW('1776522769405-3v1gs0') },
  { label: 'Sunbathing Editorial',  src: PREVIEW('1776524131703-gvh4bb') },
  { label: 'Golden Horizon',        src: PREVIEW('1776574228066-oyklfz') },
  { label: 'Textured Bikini Back',  src: PREVIEW('1776574265735-cvu5sc') },
  { label: 'Coastal Camera',        src: PREVIEW('1776524128011-dcnlpo') },
  { label: 'Yacht Bow Editorial',   src: PREVIEW('1776524132929-q8upyp') },
  { label: 'Rocky Coast Editorial', src: PREVIEW('1776524128888-371hoo') },
  { label: 'Minimal Horizon',       src: PREVIEW('1776574730668-ltg55f') },
  { label: 'Cliffside Beach Walk',  src: PREVIEW('1776574208384-fmg2u3') },
];

/* ── Grid card ── */
function GridCard({ label, src, isOriginal }: GridCardData) {
  return (
    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md shadow-foreground/[0.04] bg-muted/30">
      <img
        src={getOptimizedUrl(src, { quality: 60 })}
        alt={label}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {isOriginal && (
        <span className="absolute top-2 right-2 text-[10px] font-semibold uppercase tracking-wider bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-full">
          Original
        </span>
      )}
      <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/55 to-transparent">
        <span className="text-[10px] sm:text-[11px] font-medium tracking-wide text-white/90">
          {label}
        </span>
      </div>
    </div>
  );
}

/* ── Main section ── */
export function HomeTransformStrip() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-16 lg:py-32 bg-background overflow-hidden" id="examples">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 lg:mb-14">
          <h2 className="text-foreground text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            From one product photo to every asset you need
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            One swimwear shot becomes a full editorial set — campaigns, lookbooks, lifestyle.
          </p>
        </div>

        {/* Grid */}
        <div
          ref={ref}
          className={`grid grid-cols-3 sm:grid-cols-6 gap-3 lg:gap-4 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {SWIMWEAR_CARDS.map((card) => (
            <GridCard key={card.label} {...card} />
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
