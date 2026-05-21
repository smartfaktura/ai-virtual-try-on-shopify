import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Grid3x3, Film, Layers } from 'lucide-react';
import type { CategoryPage } from '@/data/aiProductPhotographyCategoryPages';
import { getVisualLibraryHrefForCategory } from '@/lib/visualLibraryDeepLink';
import bagsFeed from '@/assets/seo/bags-feed.jpg';
import swimwearFeed from '@/assets/seo/swimwear-feed.jpg';
import activewearFeed from '@/assets/seo/activewear-feed.jpg';
import eyewearFeed from '@/assets/seo/eyewear-feed.jpg';
import hoodiesFeed from '@/assets/seo/hoodies-feed.jpg';

type FeedSlug = 'bags' | 'swimwear' | 'activewear' | 'eyewear' | 'hoodies';

const FEED_BY_SLUG: Record<FeedSlug, {
  image: string;
  eyebrow: string;
  heading: string;
  sub: string;
  alt: string;
}> = {
  bags: {
    image: bagsFeed,
    eyebrow: 'One bag · Whole feed',
    heading: 'Your entire feed from a single upload',
    sub: 'One product photo in — a month of posts, reels and PDP details out, on brand and on rhythm',
    alt: 'Curated Instagram-style feed of bag campaigns, on-body editorials, studio shots and detail closeups — all generated from a single product upload',
  },
  swimwear: {
    image: swimwearFeed,
    eyebrow: 'One swimsuit · Whole feed',
    heading: 'Your entire resort feed from a single upload',
    sub: 'One swim photo in — a season of posts, reels and PDP details out, on brand and on rhythm',
    alt: 'Curated Instagram-style feed of swimwear resort editorials, poolside lifestyle and beach moments — all generated from a single product upload',
  },
  activewear: {
    image: activewearFeed,
    eyebrow: 'One sport set · Whole feed',
    heading: 'Your entire sport feed from a single upload',
    sub: 'One activewear photo in — a month of editorials, reels and pilates studios out, on brand and on rhythm',
    alt: 'Curated Instagram-style feed of activewear pilates editorials, studio portraits and aesthetic UGC — all generated from a single product upload',
  },
  eyewear: {
    image: eyewearFeed,
    eyebrow: 'One frame · Whole feed',
    heading: 'Your entire eyewear feed from a single upload',
    sub: 'One frame photo in — a season of editorials, reels and PDP details out, on brand and on rhythm',
    alt: 'Curated Instagram-style feed of eyewear editorial portraits, vintage film campaigns and product still life — all generated from a single frame upload',
  },
  hoodies: {
    image: hoodiesFeed,
    eyebrow: 'One hoodie · Whole feed',
    heading: 'Your entire hoodie feed from a single upload',
    sub: 'One hoodie photo in — a month of editorials, reels and lifestyle stories out, on brand and on rhythm',
    alt: 'Curated Instagram-style feed of hoodie editorials, cozy lifestyle moments and off-duty streetwear scenes — all generated from a single product upload',
  },
};

/**
 * "One {noun} · Whole feed" — gated to slugs with curated feed screenshots.
 * Embeds a curated Instagram-style feed screenshot as the visual hero, paired
 * with a text rail that mirrors the typography, spacing, button styles, and
 * fade-in rhythm of CategoryBuiltForEveryCategory.
 */
export function CategoryFeedShowcase({ page }: { page: CategoryPage }) {
  const slug = page.slug as FeedSlug;
  const [isLoaded, setIsLoaded] = useState(false);
  if (!(slug in FEED_BY_SLUG)) return null;
  const copy = FEED_BY_SLUG[slug];

  return (
    <section
      id="feed-showcase"
      className="py-16 lg:py-32 bg-background overflow-hidden scroll-mt-24"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_minmax(0,520px)] gap-10 lg:gap-16 items-center">
          {/* Text rail */}
          <div className="text-center lg:text-left mx-auto lg:mx-0 max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-700">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
              {copy.eyebrow}
            </p>
            <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
              {copy.heading}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto lg:mx-0">
              {copy.sub}
            </p>

            {/* Stat row — icon + label, no boxes */}
            <div className="mt-8 flex items-center justify-center lg:justify-start gap-x-5 gap-y-2 flex-wrap text-[13px] text-foreground/70 tracking-wide">
              <span className="inline-flex items-center gap-1.5">
                <Grid3x3 size={14} className="text-foreground/50" strokeWidth={1.75} />
                12 posts
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Film size={14} className="text-foreground/50" strokeWidth={1.75} />
                3 reels
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Layers size={14} className="text-foreground/50" strokeWidth={1.75} />
                4 carousels
              </span>
            </div>

            {/* CTAs — match peer section markup exactly */}
            <div className="mt-8 lg:mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
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

          {/* Feed image frame */}
          <div className="relative w-full max-w-[420px] sm:max-w-[460px] lg:max-w-none lg:w-[480px] mx-auto lg:mx-0 aspect-[1127/2000] rounded-3xl overflow-hidden ring-1 ring-foreground/[0.06] bg-muted/30 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.25)] transition-transform duration-700 hover:scale-[1.01] motion-reduce:transition-none motion-reduce:hover:scale-100 animate-in fade-in duration-700">
            {/* Skeleton shimmer — fades out when image is decoded */}
            <div
              aria-hidden="true"
              className={`absolute inset-0 bg-gradient-to-br from-muted/60 via-muted/30 to-muted/60 animate-pulse transition-opacity duration-500 ${
                isLoaded ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <img
              src={copy.image}
              alt={copy.alt}
              width={1127}
              height={2000}
              loading="lazy"
              decoding="async"
              onLoad={() => setIsLoaded(true)}
              {...({ fetchpriority: 'low' } as any)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Top-right tag: input */}
            <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-foreground/85 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-background ring-1 ring-foreground/10 shadow-sm">
              One upload
            </span>

            {/* Bottom-left chip: output stats */}
            <span className="absolute left-4 bottom-4 inline-flex items-center gap-1.5 rounded-full bg-background/85 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/80 ring-1 ring-foreground/[0.06] shadow-sm">
              12 posts · 3 reels
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
