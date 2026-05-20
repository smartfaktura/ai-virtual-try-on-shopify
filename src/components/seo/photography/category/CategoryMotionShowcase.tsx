import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { CategoryPage } from '@/data/aiProductPhotographyCategoryPages';
import { getVisualLibraryHrefForCategory } from '@/lib/visualLibraryDeepLink';
import bv1 from '@/assets/seo/bags-motion-1.mp4';
import bv2 from '@/assets/seo/bags-motion-2.mp4';
import bv3 from '@/assets/seo/bags-motion-3.mp4';
import bv4 from '@/assets/seo/bags-motion-4.mp4';
import bv5 from '@/assets/seo/bags-motion-5.mp4';
import bv6 from '@/assets/seo/bags-motion-6.mp4';
import sv1 from '@/assets/seo/swimwear-motion-1.mp4';
import sv2 from '@/assets/seo/swimwear-motion-2.mp4';
import sv3 from '@/assets/seo/swimwear-motion-3.mp4';
import sv4 from '@/assets/seo/swimwear-motion-4.mp4';
import sv5 from '@/assets/seo/swimwear-motion-5.mp4';
import sv6 from '@/assets/seo/swimwear-motion-6.mp4';
import av1 from '@/assets/seo/activewear-motion-1.mp4';
import av2 from '@/assets/seo/activewear-motion-2.mp4';
import av3 from '@/assets/seo/activewear-motion-3.mp4';
import av4 from '@/assets/seo/activewear-motion-4.mp4';
import av5 from '@/assets/seo/activewear-motion-5.mp4';
import av6 from '@/assets/seo/activewear-motion-6.mp4';

type MotionSlug = 'bags' | 'swimwear' | 'activewear';

const CLIPS_BY_SLUG: Record<MotionSlug, string[]> = {
  bags: [bv1, bv2, bv3, bv4, bv5, bv6],
  swimwear: [sv1, sv2, sv3, sv4, sv5, sv6],
  activewear: [av1, av2, av3, av4, av5, av6],
};

const COPY_BY_SLUG: Record<MotionSlug, { eyebrow: string; heading: string; sub: string; aria: string }> = {
  bags: {
    eyebrow: 'Motion · Bags in movement',
    heading: 'Your bag, brought to life',
    sub: 'Turn one product photo into scroll-stopping motion for ads, reels and PDP loops',
    aria: 'AI-generated bag motion clip',
  },
  swimwear: {
    eyebrow: 'Motion · Resort in movement',
    heading: 'Your swimwear, brought to life',
    sub: 'Turn one swim photo into scroll-stopping motion for ads, reels and resort campaigns',
    aria: 'AI-generated swimwear motion clip',
  },
  activewear: {
    eyebrow: 'Motion · Sport in movement',
    heading: 'Your activewear, brought to life',
    sub: 'Turn one product photo into scroll-stopping motion for ads, reels and pilates campaigns',
    aria: 'AI-generated activewear motion clip',
  },
};

/**
 * "Motion · {Category} in movement" — gated to slugs with curated clips.
 * Six 9:16 looping clips arranged as 2×2 on mobile (last two hidden),
 * 3×2 on sm, and a 6-up cinematic strip on lg. Tokens and rhythm match
 * CategoryFeedShowcase / CategoryBuiltForEveryCategory token-for-token.
 */
export function CategoryMotionShowcase({ page }: { page: CategoryPage }) {
  const slug = page.slug as MotionSlug;
  if (!(slug in CLIPS_BY_SLUG)) return null;
  const CLIPS = CLIPS_BY_SLUG[slug];
  const copy = COPY_BY_SLUG[slug];

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
            {copy.eyebrow}
          </p>
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
            {copy.heading}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            {copy.sub}
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
                aria-label={copy.aria}
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
