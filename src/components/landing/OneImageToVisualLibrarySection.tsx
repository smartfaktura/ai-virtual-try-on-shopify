import { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { cn } from '@/lib/utils';

const h = (file: string) => getLandingAssetUrl(`hero/${file}`);

// Default 16 outputs — reuses already-loaded hero assets so the grid
// renders nearly instantly from the browser cache.
const DEFAULT_SOURCE = h('hero-product-croptop.jpg');
const DEFAULT_OUTPUTS: string[] = [
  // Crop top scenes (8)
  h('hero-croptop-studio-lookbook.png'),
  h('hero-croptop-golden-hour.png'),
  h('hero-croptop-cafe-lifestyle.png'),
  h('hero-croptop-studio-lounge.png'),
  h('hero-croptop-basketball-court.png'),
  h('hero-croptop-urban-edge.png'),
  h('hero-croptop-pilates-studio.png'),
  h('hero-croptop-studio-dark.png'),
  // Ring scenes (4)
  h('hero-ring-fabric.png'),
  h('hero-ring-hand.png'),
  h('hero-ring-eucalyptus.png'),
  h('hero-ring-floating.png'),
  // Headphones scenes (4)
  h('hero-hp-desert.png'),
  h('hero-hp-elevator.png'),
  h('hero-hp-cozy.png'),
  h('hero-hp-home.png'),
];

interface OneImageToVisualLibrarySectionProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  microcopy?: string;
  sourceImage?: string;
  outputImages?: string[];
  /** Reserved for future per-category landing pages. */
  categoryLabel?: string;
}

/**
 * Reveals 1 product image expanding into a 4x4 grid of generated outputs.
 * One-shot IntersectionObserver + CSS transitions only. No animation libs.
 * Honors prefers-reduced-motion (renders final state immediately).
 */
export function OneImageToVisualLibrarySection({
  eyebrow = 'One image. Many outcomes.',
  title = 'Turn one product photo into a full visual library',
  description = 'Upload a single product image and generate catalog shots, editorial scenes, social content, ad creatives, UGC-style visuals, and campaign-ready assets in minutes.',
  ctaLabel = 'Start creating visuals',
  ctaHref,
  microcopy = 'No studio. No models. No complex setup.',
  sourceImage = DEFAULT_SOURCE,
  outputImages = DEFAULT_OUTPUTS,
}: OneImageToVisualLibrarySectionProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  // Build the 16 cells. Cell 0 = source; cells 1..15 = outputs.
  // We always render exactly 16; if fewer outputs are passed, we cycle.
  const cells = useMemo(() => {
    const out: { src: string; isSource: boolean; quality: number }[] = [
      { src: sourceImage, isSource: true, quality: 70 },
    ];
    for (let i = 0; i < 15; i++) {
      out.push({
        src: outputImages[i % outputImages.length],
        isSource: false,
        quality: 50,
      });
    }
    return out;
  }, [sourceImage, outputImages]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // Respect reduced motion: skip animation entirely.
    const reduced = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setRevealed(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handleCta = () => {
    if (ctaHref) {
      navigate(ctaHref);
      return;
    }
    navigate(user ? '/app/workflows' : '/auth');
  };

  // Stagger order — radiates outward from the source (cell 0).
  // Index in this array = animation order; value = cell index.
  // Source (0) appears first; then immediate neighbors; then outer cells.
  const staggerOrder = [0, 1, 4, 5, 2, 6, 8, 9, 3, 7, 10, 12, 13, 11, 14, 15];
  const cellOrder: number[] = new Array(16);
  staggerOrder.forEach((cellIdx, animIdx) => {
    cellOrder[cellIdx] = animIdx;
  });

  return (
    <section
      ref={sectionRef}
      className="relative py-16 lg:py-32 bg-background overflow-hidden"
      aria-labelledby="one-image-library-heading"
    >
      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10">
        {/* Text content */}
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            {eyebrow}
          </p>
          <h2
            id="one-image-library-heading"
            className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4"
          >
            {title}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8">
            {description}
          </p>
          <div className="flex flex-col items-center gap-3">
            <Button
              size="lg"
              className="rounded-full h-[3.25rem] px-8 text-base font-semibold gap-2 shadow-lg shadow-primary/25"
              onClick={handleCta}
            >
              {ctaLabel}
              <ArrowRight className="w-4 h-4" />
            </Button>
            <p className="text-xs text-muted-foreground">{microcopy}</p>
          </div>
        </div>

        {/* Animated grid */}
        <div className="relative max-w-5xl mx-auto">
          <div
            className={cn(
              'grid gap-2 sm:gap-3',
              // Mobile: 2x8. Desktop: 4x4.
              'grid-cols-2 md:grid-cols-4',
            )}
          >
            {cells.map((cell, idx) => {
              const animOrder = cellOrder[idx] ?? idx;
              const delayMs = revealed ? animOrder * 55 : 0;
              return (
                <div
                  key={idx}
                  className={cn(
                    'relative overflow-hidden rounded-2xl border border-border/40 bg-muted/30',
                    'shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
                    'transition-[opacity,transform] duration-[600ms] ease-out',
                    'will-change-transform',
                    revealed
                      ? 'opacity-100 scale-100'
                      : cell.isSource
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-90',
                    cell.isSource && revealed && 'ring-1 ring-primary/40',
                  )}
                  style={{
                    transitionDelay: `${delayMs}ms`,
                    aspectRatio: '4 / 5',
                  }}
                >
                  <ShimmerImage
                    src={getOptimizedUrl(cell.src, { quality: cell.quality })}
                    alt={cell.isSource ? 'Original product photo' : `Generated visual ${idx}`}
                    className="w-full h-full object-cover"
                    aspectRatio="4/5"
                    width={isMobile ? 200 : 280}
                    height={isMobile ? 250 : 350}
                    loading={cell.isSource ? 'eager' : 'lazy'}
                    fetchPriority={cell.isSource ? 'high' : undefined}
                  />
                  {cell.isSource && (
                    <span
                      className={cn(
                        'absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wider',
                        'bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-full',
                        'transition-opacity duration-500',
                        revealed ? 'opacity-100' : 'opacity-0',
                      )}
                      style={{ transitionDelay: `${delayMs + 200}ms` }}
                    >
                      Original
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Caption under the grid */}
          <p
            className={cn(
              'text-center text-sm text-muted-foreground mt-8 md:mt-10',
              'transition-opacity duration-700',
              revealed ? 'opacity-100' : 'opacity-0',
            )}
            style={{ transitionDelay: revealed ? '900ms' : '0ms' }}
          >
            <span className="text-foreground font-medium">1 photo</span>
            <span className="mx-2 text-muted-foreground/50">·</span>
            <span className="text-foreground font-medium">16 outputs</span>
            <span className="mx-2 text-muted-foreground/50">·</span>
            <span>ready in minutes</span>
          </p>
        </div>
      </div>
    </section>
  );
}
