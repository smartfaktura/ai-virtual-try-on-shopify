import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TEAM_MEMBERS } from '@/data/teamData';

export function StudioTeamSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const isHoveredRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>('[data-team-card]')?.offsetWidth ?? 280;
    el.scrollBy({
      left: direction === 'left' ? -cardWidth - 20 : cardWidth + 20,
      behavior: 'smooth',
    });
  };

  // Auto-scroll effect
  useEffect(() => {
    const startAutoScroll = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(() => {
        const el = scrollRef.current;
        if (!el || isHoveredRef.current) return;
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          el.scrollLeft += 1;
        }
        updateScrollState();
      }, 30);
    };

    startAutoScroll();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const handleMouseEnter = useCallback(() => {
    isHoveredRef.current = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isHoveredRef.current = false;
  }, []);

  return (
    <section className="py-20 sm:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 lg:mb-20">
          <Badge variant="secondary" className="mb-4 text-xs tracking-wide uppercase">
            Your AI Studio Team
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            10 AI Professionals. Zero Overhead.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            A full creative team of photographers, art directors, stylists, and brand specialists
            — working together on every visual you create. Instantly.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {/* Navigation arrows */}
          <button
            onClick={() => scroll('left')}
            className={`absolute -left-2 sm:-left-5 top-[35%] -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-card border border-border shadow-md flex items-center justify-center transition-all ${
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
            className={`absolute -right-2 sm:-right-5 top-[35%] -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-card border border-border shadow-md flex items-center justify-center transition-all ${
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
            className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {TEAM_MEMBERS.map((member) => (
              <div
                key={member.name}
                data-team-card
                className="flex-shrink-0 w-[240px] sm:w-[270px] lg:w-[300px] snap-start group"
              >
                {/* Character image card */}
                <div className="rounded-2xl overflow-hidden aspect-[4/5] bg-card border border-border shadow-sm group-hover:shadow-lg group-hover:border-primary/30 transition-all duration-300">
                  {member.videoUrl ? (
                    <video
                      src={member.videoUrl}
                      poster={member.avatar}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="none"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                </div>

                {/* Info */}
                <div className="mt-4 px-1">
                  <h3 className="text-lg font-bold text-foreground">{member.name}</h3>
                  <p className="text-sm font-medium text-primary mt-0.5">{member.role}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <Button size="lg" className="gap-2" asChild>
            <a href="/auth">
              Meet Your Team <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
