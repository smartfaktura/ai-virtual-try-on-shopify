import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { CategoryPage } from '@/data/aiProductPhotographyCategoryPages';
import { getVisualLibraryHrefForCategory } from '@/lib/visualLibraryDeepLink';
import v1 from '@/assets/seo/bags-motion-1.mp4';
import v2 from '@/assets/seo/bags-motion-2.mp4';
import v3 from '@/assets/seo/bags-motion-3.mp4';
import v4 from '@/assets/seo/bags-motion-4.mp4';
import v5 from '@/assets/seo/bags-motion-5.mp4';
import v6 from '@/assets/seo/bags-motion-6.mp4';

const CLIPS = [v1, v2, v3, v4, v5, v6];

/**
 * "Motion · Bags in movement" — bag-page only.
 * Six 9:16 looping clips arranged as 2×2 on mobile (last two hidden),
 * 3×2 on sm, and a 6-up cinematic strip on lg. Tokens and rhythm match
 * CategoryFeedShowcase / CategoryBuiltForEveryCategory token-for-token.
 */
export function CategoryMotionShowcase({ page }: { page: CategoryPage }) {
  if (page.slug !== 'bags') return null;

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const saveData =
      typeof navigator !== 'undefined' &&
      // @ts-expect-error - non-standard but widely shipped
      Boolean(navigator.connection?.saveData);

    if (reduceMotion || saveData) {
      videoRefs.current.forEach((v) => {
        if (v) {
          v.autoplay = false;
          v.pause();
        }
      });
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            el.play().catch(() => {});
          } else {
            el.pause();
          }
        }
      },
      { rootMargin: '200px 0px', threshold: 0.01 },
    );

    videoRefs.current.forEach((v) => v && io.observe(v));
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="motion-showcase"
      className="py-16 lg:py-32 bg-background overflow-hidden scroll-mt-24"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Motion · Bags in movement
          </p>
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
            Your bag, brought to life
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Turn one product photo into scroll-stopping motion for ads, reels and PDP loops
          </p>
        </div>

        {/* Video grid: 2 cols (4 tiles) on mobile, 3×2 on sm, 6-up strip on lg */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
          {CLIPS.map((src, i) => (
            <div
              key={src}
              className={[
                'group relative aspect-[9/16] rounded-2xl overflow-hidden',
                'ring-1 ring-foreground/[0.06] bg-muted/30',
                'shadow-[0_20px_50px_-30px_rgba(15,23,42,0.22)]',
                'transition-transform duration-700 hover:scale-[1.015]',
                'motion-reduce:transition-none motion-reduce:hover:scale-100',
                'animate-in fade-in slide-in-from-bottom-2 duration-700 fill-mode-backwards',
                i >= 4 ? 'hidden sm:block' : '',
              ].join(' ')}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <video
                ref={(el) => { videoRefs.current[i] = el; }}
                src={src}
                autoPlay
                muted
                loop
                playsInline
                preload={i === 0 ? 'auto' : 'metadata'}
                disableRemotePlayback
                aria-label="AI-generated bag motion clip"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              {i === 0 && (
                <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-foreground/85 backdrop-blur-md px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-background ring-1 ring-foreground/10 shadow-sm">
                  New
                </span>
              )}
            </div>
          ))}
        </div>

        {/* CTAs — token-for-token match with CategoryFeedShowcase */}
        <div className="mt-10 lg:mt-14 flex flex-col sm:flex-row gap-4 justify-center">
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
    </section>
  );
}
