import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const h = (file: string) => getLandingAssetUrl(`hero/${file}`);

/* ── Hero images for the marquee ── */
const heroImages = [
  { label: 'Product page', src: h('hero-croptop-studio-lookbook.png') },
  { label: 'Social content', src: h('hero-croptop-cafe-lifestyle.png') },
  { label: 'Creator style', src: h('hero-croptop-studio-dark.png') },
  { label: 'Editorial', src: h('hero-croptop-golden-hour.png') },
  { label: 'Campaign', src: h('hero-croptop-pilates-studio.png') },
  { label: 'Lifestyle', src: h('hero-croptop-studio-lounge.png') },
  { label: 'Lookbook', src: h('hero-croptop-basketball-court.png') },
  { label: 'Ad creative', src: h('hero-ring-golden-light.png') },
  { label: 'Flat lay', src: h('hero-ring-hand.png') },
  { label: 'Video', src: h('hero-croptop-urban-edge.png') },
  { label: 'Product page', src: h('hero-hp-desert.png') },
  { label: 'Social content', src: h('hero-ring-eucalyptus.png') },
];

const row1 = heroImages.slice(0, 6);
const row2 = heroImages.slice(6).concat(heroImages.slice(0, 2));

/* ── Marquee card ── */
function MarqueeCard({ label, src }: { label: string; src: string }) {
  return (
    <div className="relative flex-shrink-0 w-[180px] sm:w-[210px] aspect-[3/4] rounded-2xl overflow-hidden shadow-md shadow-foreground/[0.04]">
      <img
        src={getOptimizedUrl(src, { width: 420, quality: 55 })}
        alt={label}
        loading="lazy"
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/50 to-transparent">
        <span className="text-[10px] sm:text-[11px] font-medium tracking-wide text-white/90">{label}</span>
      </div>
    </div>
  );
}

/* ── Marquee row ── */
function MarqueeRow({ cards, direction, duration }: {
  cards: { label: string; src: string }[];
  direction: 'left' | 'right';
  duration: string;
}) {
  const doubled = [...cards, ...cards];
  return (
    <div className="overflow-hidden w-full group/marquee">
      <div
        className={`flex gap-3 w-max ${direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'} group-hover/marquee:[animation-play-state:paused]`}
        style={{ animationDuration: duration }}
      >
        {doubled.map((card, i) => (
          <MarqueeCard key={`${card.label}-${i}`} label={card.label} src={card.src} />
        ))}
      </div>
    </div>
  );
}

/* ── Main component ── */
export function HomeHero() {
  return (
    <section className="pt-24 pb-6 lg:pt-28 lg:pb-10 bg-[#FAFAF8] overflow-hidden">
      {/* ── Centered copy ── */}
      <div className="max-w-3xl mx-auto px-6 text-center mb-10">
        <h1 className="text-foreground text-[2.75rem] sm:text-5xl lg:text-[3.5rem] leading-[1.08] font-semibold tracking-[-0.03em] mb-5">
          One product photo.
          <br />
          <span className="text-[#4a5578]">AI creates the rest.</span>
        </h1>

        <p className="max-w-xl mx-auto text-muted-foreground text-lg leading-relaxed mb-6">
          Turn a single product image into product page visuals, social content, and campaign-ready creative in minutes.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
          <Link
            to="/auth"
            className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-primary text-primary-foreground text-[15px] font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/15"
          >
            Try it on my product
            <ArrowRight size={16} />
          </Link>
          <a
            href="#examples"
            className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full border border-border text-foreground text-[15px] font-medium hover:bg-secondary transition-colors"
          >
            See examples
          </a>
        </div>

        <p className="text-[11px] tracking-[0.12em] uppercase text-muted-foreground/60 font-medium">
          20 free credits · No credit card required
        </p>
      </div>

      {/* ── Marquee rows ── */}
      <div className="flex flex-col gap-3">
        <MarqueeRow cards={row1} direction="left" duration="35s" />
        <MarqueeRow cards={row2} direction="right" duration="40s" />
      </div>
    </section>
  );
}
