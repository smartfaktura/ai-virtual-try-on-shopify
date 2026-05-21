import { useEffect, useRef, useState } from 'react';
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
import bp1 from '@/assets/seo/bags-motion-1.jpg';
import bp2 from '@/assets/seo/bags-motion-2.jpg';
import bp3 from '@/assets/seo/bags-motion-3.jpg';
import bp4 from '@/assets/seo/bags-motion-4.jpg';
import bp5 from '@/assets/seo/bags-motion-5.jpg';
import bp6 from '@/assets/seo/bags-motion-6.jpg';
import sv1 from '@/assets/seo/swimwear-motion-1.mp4';
import sv2 from '@/assets/seo/swimwear-motion-2.mp4';
import sv3 from '@/assets/seo/swimwear-motion-3.mp4';
import sv4 from '@/assets/seo/swimwear-motion-4.mp4';
import sv5 from '@/assets/seo/swimwear-motion-5.mp4';
import sv6 from '@/assets/seo/swimwear-motion-6.mp4';
import sp1 from '@/assets/seo/swimwear-motion-1.jpg';
import sp2 from '@/assets/seo/swimwear-motion-2.jpg';
import sp3 from '@/assets/seo/swimwear-motion-3.jpg';
import sp4 from '@/assets/seo/swimwear-motion-4.jpg';
import sp5 from '@/assets/seo/swimwear-motion-5.jpg';
import sp6 from '@/assets/seo/swimwear-motion-6.jpg';
import av1 from '@/assets/seo/activewear-motion-1.mp4';
import av2 from '@/assets/seo/activewear-motion-2.mp4';
import av3 from '@/assets/seo/activewear-motion-3.mp4';
import av4 from '@/assets/seo/activewear-motion-4.mp4';
import av5 from '@/assets/seo/activewear-motion-5.mp4';
import av6 from '@/assets/seo/activewear-motion-6.mp4';
import ap1 from '@/assets/seo/activewear-motion-1.jpg';
import ap2 from '@/assets/seo/activewear-motion-2.jpg';
import ap3 from '@/assets/seo/activewear-motion-3.jpg';
import ap4 from '@/assets/seo/activewear-motion-4.jpg';
import ap5 from '@/assets/seo/activewear-motion-5.jpg';
import ap6 from '@/assets/seo/activewear-motion-6.jpg';
import ev1 from '@/assets/seo/eyewear-motion-1.mp4';
import ev2 from '@/assets/seo/eyewear-motion-2.mp4';
import ev3 from '@/assets/seo/eyewear-motion-3.mp4';
import ev4 from '@/assets/seo/eyewear-motion-4.mp4';
import ev5 from '@/assets/seo/eyewear-motion-5.mp4';
import ev6 from '@/assets/seo/eyewear-motion-6.mp4';
import ep1 from '@/assets/seo/eyewear-motion-1.jpg';
import ep2 from '@/assets/seo/eyewear-motion-2.jpg';
import ep3 from '@/assets/seo/eyewear-motion-3.jpg';
import ep4 from '@/assets/seo/eyewear-motion-4.jpg';
import ep5 from '@/assets/seo/eyewear-motion-5.jpg';
import ep6 from '@/assets/seo/eyewear-motion-6.jpg';
import hv1 from '@/assets/seo/hoodies-motion-1.mp4';
import hv2 from '@/assets/seo/hoodies-motion-2.mp4';
import hv3 from '@/assets/seo/hoodies-motion-3.mp4';
import hv4 from '@/assets/seo/hoodies-motion-4.mp4';
import hv5 from '@/assets/seo/hoodies-motion-5.mp4';
import hv6 from '@/assets/seo/hoodies-motion-6.mp4';
import hp1 from '@/assets/seo/hoodies-motion-1.jpg';
import hp2 from '@/assets/seo/hoodies-motion-2.jpg';
import hp3 from '@/assets/seo/hoodies-motion-3.jpg';
import hp4 from '@/assets/seo/hoodies-motion-4.jpg';
import hp5 from '@/assets/seo/hoodies-motion-5.jpg';
import hp6 from '@/assets/seo/hoodies-motion-6.jpg';

type MotionSlug = 'bags' | 'swimwear' | 'activewear' | 'eyewear' | 'hoodies';
type Clip = { video: string; poster: string };

const CLIPS_BY_SLUG: Record<MotionSlug, Clip[]> = {
  bags: [
    { video: bv1, poster: bp1 },
    { video: bv2, poster: bp2 },
    { video: bv3, poster: bp3 },
    { video: bv4, poster: bp4 },
    { video: bv5, poster: bp5 },
    { video: bv6, poster: bp6 },
  ],
  swimwear: [
    { video: sv1, poster: sp1 },
    { video: sv2, poster: sp2 },
    { video: sv3, poster: sp3 },
    { video: sv4, poster: sp4 },
    { video: sv5, poster: sp5 },
    { video: sv6, poster: sp6 },
  ],
  activewear: [
    { video: av1, poster: ap1 },
    { video: av2, poster: ap2 },
    { video: av3, poster: ap3 },
    { video: av4, poster: ap4 },
    { video: av5, poster: ap5 },
    { video: av6, poster: ap6 },
  ],
  eyewear: [
    { video: ev1, poster: ep1 },
    { video: ev2, poster: ep2 },
    { video: ev3, poster: ep3 },
    { video: ev4, poster: ep4 },
    { video: ev5, poster: ep5 },
    { video: ev6, poster: ep6 },
  ],
  hoodies: [
    { video: hv1, poster: hp1 },
    { video: hv2, poster: hp2 },
    { video: hv3, poster: hp3 },
    { video: hv4, poster: hp4 },
    { video: hv5, poster: hp5 },
    { video: hv6, poster: hp6 },
  ],
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
  eyewear: {
    eyebrow: 'Motion · Frames in movement',
    heading: 'Your eyewear, brought to life',
    sub: 'Turn one frame photo into scroll-stopping motion for ads, reels and campaign film',
    aria: 'AI-generated eyewear motion clip',
  },
};

/**
 * "Motion · {Category} in movement" — gated to slugs with curated clips.
 * Posters render immediately as the visible base layer. Videos load lazily
 * via IntersectionObserver (preload=metadata, throttled to 3 concurrent)
 * and fade in once the first frame decodes. On reduced-motion or save-data,
 * the poster stays as the final image with no video request.
 */
export function CategoryMotionShowcase({ page }: { page: CategoryPage }) {
  const slug = page.slug as MotionSlug;
  if (!(slug in CLIPS_BY_SLUG)) return null;
  const CLIPS = CLIPS_BY_SLUG[slug];
  const copy = COPY_BY_SLUG[slug];

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  // Per-tile state: has the tile been allowed to mount its <video>?
  const [loadStates, setLoadStates] = useState<boolean[]>(() => CLIPS.map(() => false));
  // Per-tile readiness (first frame decoded)
  const [readyStates, setReadyStates] = useState<boolean[]>(() => CLIPS.map(() => false));
  // Save-data / reduced-motion: skip videos entirely, posters remain
  const [degraded, setDegraded] = useState(false);

  // Throttled load queue — at most MAX_CONCURRENT tiles fetching at once
  const MAX_CONCURRENT = 3;
  const visibleQueue = useRef<Set<number>>(new Set());
  const activeLoads = useRef<Set<number>>(new Set());

  const flushQueue = () => {
    while (activeLoads.current.size < MAX_CONCURRENT && visibleQueue.current.size > 0) {
      const next = visibleQueue.current.values().next().value as number;
      visibleQueue.current.delete(next);
      activeLoads.current.add(next);
      setLoadStates((prev) => {
        if (prev[next]) return prev;
        const copyArr = prev.slice();
        copyArr[next] = true;
        return copyArr;
      });
    }
  };

  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      setDegraded(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const idx = Number((entry.target as HTMLElement).dataset.idx);
          if (Number.isNaN(idx)) continue;
          if (entry.isIntersecting) {
            if (!activeLoads.current.has(idx) && !visibleQueue.current.has(idx)) {
              visibleQueue.current.add(idx);
            }
            const v = videoRefs.current[idx];
            if (v) {
              v.muted = true;
              if (v.readyState >= 2) v.play().catch(() => {});
            }
          } else {
            const v = videoRefs.current[idx];
            if (v) v.pause();
          }
        }
        flushQueue();
      },
      { rootMargin: '500px 0px', threshold: 0.01 },
    );

    const tiles = document.querySelectorAll('[data-motion-tile="1"]');
    tiles.forEach((t) => io.observe(t));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When a video element is mounted (after loadStates[i] flips), explicitly
  // call load()+play(). Mobile browsers often need this for inline autoplay.
  const attachVideoRef = (i: number) => (el: HTMLVideoElement | null) => {
    videoRefs.current[i] = el;
    if (!el) return;
    el.muted = true;
    try { el.load(); } catch {}
    const p = el.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  };

  const onReady = (i: number) => {
    setReadyStates((prev) => {
      if (prev[i]) return prev;
      const c = prev.slice();
      c[i] = true;
      return c;
    });
    if (activeLoads.current.has(i)) {
      activeLoads.current.delete(i);
      flushQueue();
    }
    const v = videoRefs.current[i];
    if (v) v.play().catch(() => {});
  };

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
          {CLIPS.map((clip, i) => (
            <div
              key={clip.video}
              data-motion-tile="1"
              data-idx={i}
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
              {/* Poster — always present, decodes fast, visible immediately */}
              <img
                src={clip.poster}
                alt={copy.aria}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Video — mounts when near viewport, fades in over the poster */}
              {!degraded && loadStates[i] && (
                <video
                  ref={attachVideoRef(i)}
                  src={clip.video}
                  poster={clip.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  disableRemotePlayback
                  aria-label={copy.aria}
                  {...({ defaultMuted: true } as any)}
                  onLoadedMetadata={(e) => { (e.currentTarget as HTMLVideoElement).play().catch(() => {}); }}
                  onLoadedData={() => onReady(i)}
                  onCanPlay={() => onReady(i)}
                  onPlaying={() => onReady(i)}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:scale-[1.03] ${
                    readyStates[i] ? 'opacity-100' : 'opacity-0'
                  }`}
                />

              )}
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
