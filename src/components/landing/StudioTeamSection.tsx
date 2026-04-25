import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { TEAM_MEMBERS } from '@/data/teamData';
import { getOptimizedUrl } from '@/lib/imageOptimization';

function LazyVideo({ src, poster, className }: { src: string; poster: string; className: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          const video = videoRef.current;
          if (video && video.src) video.play().catch(() => {});
        } else {
          const video = videoRef.current;
          if (video) video.pause();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Auto-play once src is set and video enters view
  useEffect(() => {
    if (!shouldLoad) return;
    const video = videoRef.current;
    if (video) {
      video.src = src;
      video.load();
    }
  }, [shouldLoad, src]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {/* Poster image shown instantly, hidden once video can play */}
      <img
        src={poster}
        alt=""
        className={`${className} absolute inset-0 ${videoReady ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading="lazy"
      />
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        onCanPlay={() => {
          setVideoReady(true);
          videoRef.current?.play().catch(() => {});
        }}
        className={`${className} ${videoReady ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      />
    </div>
  );
}

export function StudioTeamSection() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // RAF-based smooth auto-scroll
  const speedRef = useRef(0.5);
  const targetSpeedRef = useRef(0.5);
  const rafRef = useRef<number>(0);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>('[data-team-card]')?.offsetWidth ?? 280;
    el.scrollBy({
      left: direction === 'left' ? -cardWidth - 20 : cardWidth + 20,
      behavior: 'smooth',
    });
  };

  // Frame-synced auto-scroll with lerped speed — pauses when off-screen
  const sectionRef = useRef<HTMLElement>(null);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting; },
      { threshold: 0 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const tick = () => {
      speedRef.current += (targetSpeedRef.current - speedRef.current) * 0.08;

      const el = scrollRef.current;
      if (el && speedRef.current > 0.01 && isVisibleRef.current) {
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
          el.scrollTo({ left: 0 });
          updateScrollState();
        }
        el.scrollLeft += speedRef.current;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [updateScrollState]);

  const touchResumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback(() => {
    targetSpeedRef.current = 0;
  }, []);

  const handleMouseLeave = useCallback(() => {
    targetSpeedRef.current = 0.5;
  }, []);

  const handleTouchStart = useCallback(() => {
    targetSpeedRef.current = 0;
    if (touchResumeRef.current) clearTimeout(touchResumeRef.current);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchResumeRef.current) clearTimeout(touchResumeRef.current);
    touchResumeRef.current = setTimeout(() => {
      targetSpeedRef.current = 0.5;
    }, 4000);
  }, []);

  return (
    <section ref={sectionRef} id="team" className="py-16 lg:py-32 bg-background">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Your AI Creative Studio
          </p>
          <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
            10 specialists. Zero overhead.
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            A dedicated AI-powered creative team that never sleeps, never misses deadlines,
            and delivers studio-quality product visuals on demand.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {/* Navigation arrows */}
          <button
            onClick={() => scroll('left')}
            className={`absolute -left-2 sm:-left-5 top-[35%] -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-card border border-border shadow-md hidden sm:flex items-center justify-center transition-all ${
              canScrollLeft
                ? 'opacity-100 hover:bg-accent hover:shadow-lg'
                : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={() => scroll('right')}
            className={`absolute -right-2 sm:-right-5 top-[35%] -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-card border border-border shadow-md hidden sm:flex items-center justify-center transition-all ${
              canScrollRight
                ? 'opacity-100 hover:bg-accent hover:shadow-lg'
                : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>

          {/* Cards strip */}
          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="flex gap-5 overflow-x-auto pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {TEAM_MEMBERS.map((member) => (
              <div
                key={member.name}
                data-team-card
                className="flex-shrink-0 w-[240px] sm:w-[270px] lg:w-[300px] snap-start group"
              >
                {/* Character image card */}
                <div className="rounded-3xl overflow-hidden aspect-[4/5] bg-white border border-[#f0efed] shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300">
                  {member.videoUrl ? (
                    <LazyVideo
                      src={member.videoUrl}
                      poster={getOptimizedUrl(member.avatar, { quality: 60 })}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src={getOptimizedUrl(member.avatar, { quality: 60 })}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                </div>

                {/* Info */}
                <div className="mt-4 px-1">
                  <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm font-medium text-foreground/80 mt-0.5">{member.role}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                    {member.description}
                  </p>
                  <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {member.expertiseTag}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 mt-12 lg:mt-16">
          <Button
            size="lg"
            className="rounded-full h-[3.25rem] px-8 text-base font-semibold gap-2 shadow-lg shadow-primary/25"
            onClick={() => navigate('/team')}
          >
            Meet Your Team <ArrowRight className="w-4 h-4" />
          </Button>
          <p className="text-xs text-muted-foreground">
            10 specialists ready when you are
          </p>
        </div>
      </div>
    </section>
  );
}
