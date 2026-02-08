import { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';

import bannerFashion from '@/assets/showcase/fashion-blazer-golden.jpg';
import bannerSkincare from '@/assets/showcase/skincare-serum-marble.jpg';
import bannerHome from '@/assets/showcase/home-candle-evening.jpg';

interface HeroBannerThumbnailProps {
  isActive: boolean;
}

const banners = [
  {
    image: bannerFashion,
    textSide: 'right' as const,
    headline: 'New Season',
    subtext: 'Explore the collection',
    cta: 'Shop Now',
    tint: 'from-amber-900/60',
  },
  {
    image: bannerSkincare,
    textSide: 'right' as const,
    headline: 'Glow Up',
    subtext: 'Clinical skincare essentials',
    cta: 'Discover',
    tint: 'from-stone-800/60',
  },
  {
    image: bannerHome,
    textSide: 'left' as const,
    headline: 'Cozy Living',
    subtext: 'Handcrafted home accents',
    cta: 'Browse',
    tint: 'from-orange-900/50',
  },
];

const BANNER_DURATION = 2500; // ms per banner
const TOTAL_CYCLE = banners.length * BANNER_DURATION;
const BADGE_DELAY = TOTAL_CYCLE + 500;
const LOOP_DURATION = TOTAL_CYCLE + 2000;

export function HeroBannerThumbnail({ isActive }: HeroBannerThumbnailProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBadge, setShowBadge] = useState(false);
  const [shimmer, setShimmer] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isActive) {
      setCurrentIndex(0);
      setShowBadge(false);
      setShimmer(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (phaseRef.current) clearTimeout(phaseRef.current);
      return;
    }

    let elapsed = 0;

    const tick = () => {
      elapsed += BANNER_DURATION;

      if (elapsed < TOTAL_CYCLE) {
        setCurrentIndex((elapsed / BANNER_DURATION) % banners.length);
      } else if (elapsed >= TOTAL_CYCLE && elapsed < TOTAL_CYCLE + BANNER_DURATION) {
        setShimmer(true);
      } else if (elapsed >= BADGE_DELAY && elapsed < BADGE_DELAY + BANNER_DURATION) {
        setShowBadge(true);
      } else if (elapsed >= LOOP_DURATION) {
        // Reset loop
        elapsed = 0;
        setCurrentIndex(0);
        setShowBadge(false);
        setShimmer(false);
      }
    };

    timerRef.current = setInterval(tick, BANNER_DURATION);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (phaseRef.current) clearTimeout(phaseRef.current);
    };
  }, [isActive]);

  return (
    <div className="w-full h-full bg-muted/30 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Banners container — centered landscape frame */}
      <div className="absolute inset-0 flex items-center justify-center">
        {banners.map((banner, i) => (
          <div
            key={i}
            className="absolute inset-x-2 top-1/2 -translate-y-1/2 rounded-lg overflow-hidden shadow-lg transition-opacity duration-700"
            style={{
              aspectRatio: '16 / 9',
              opacity: currentIndex === i ? 1 : 0,
              maxHeight: '55%',
            }}
          >
            {/* Background image with Ken Burns */}
            <img
              src={banner.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[5000ms] ease-out"
              style={{
                transform: currentIndex === i && isActive ? 'scale(1.08)' : 'scale(1)',
              }}
            />

            {/* Gradient overlay for text side */}
            <div
              className={`absolute inset-0 bg-gradient-to-${banner.textSide === 'right' ? 'l' : 'r'} ${banner.tint} via-transparent to-transparent`}
              style={{
                background:
                  banner.textSide === 'right'
                    ? `linear-gradient(to left, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 35%, transparent 60%)`
                    : `linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 35%, transparent 60%)`,
              }}
            />

            {/* Mock UI overlay — text + CTA */}
            <div
              className={`absolute inset-y-0 flex flex-col justify-center gap-1.5 px-3 ${
                banner.textSide === 'right' ? 'right-0 items-end text-right' : 'left-0 items-start text-left'
              }`}
              style={{
                width: '48%',
                opacity: currentIndex === i ? 1 : 0,
                transition: 'opacity 0.5s ease 0.3s',
              }}
            >
              <span className="text-white/90 font-bold text-[11px] leading-tight tracking-tight drop-shadow-md">
                {banner.headline}
              </span>
              <span className="text-white/60 text-[8px] leading-tight drop-shadow-sm">
                {banner.subtext}
              </span>
              <span className="mt-1 inline-block bg-white/90 text-[7px] font-semibold text-black/80 px-2 py-0.5 rounded-full shadow-sm">
                {banner.cta} →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Shimmer sweep */}
      {shimmer && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
              animation: 'shimmerSweep 0.8s ease-out forwards',
            }}
          />
        </div>
      )}

      {/* "3 Heroes" badge */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-20 transition-all duration-500 ${
          showBadge
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-2 scale-90'
        }`}
      >
        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm shadow-lg rounded-full px-2.5 py-1">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-semibold text-foreground">3 Heroes</span>
        </div>
      </div>

      {/* Shimmer keyframes */}
      <style>{`
        @keyframes shimmerSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
