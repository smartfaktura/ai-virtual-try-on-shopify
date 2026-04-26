import { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { TEAM_MEMBERS } from '@/data/teamData';
import { getOptimizedUrl } from '@/lib/imageOptimization';

/* Lightweight lazy video — same idea as StudioTeamSection but smaller */
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
          videoRef.current?.play().catch(() => {});
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
      <img
        src={poster}
        alt=""
        loading="lazy"
        decoding="async"
        className={`${className} absolute inset-0 ${videoReady ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
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

export function HomeStudioTeam() {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Gentle auto-scroll
  const speedRef = useRef(0.4);
  const targetSpeedRef = useRef(0.4);
  const rafRef = useRef<number>(0);
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
        }
        el.scrollLeft += speedRef.current;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleMouseEnter = useCallback(() => { targetSpeedRef.current = 0; }, []);
  const handleMouseLeave = useCallback(() => { targetSpeedRef.current = 0.4; }, []);

  return (
    <section ref={sectionRef} className="py-14 lg:py-24 bg-background">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-10 lg:mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Your AI Creative Studio
          </p>
          <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
            10 specialists. Zero overhead.
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            A dedicated AI creative crew that ships studio-grade visuals on demand.
          </p>
        </div>

        <div
          ref={scrollRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="flex gap-4 overflow-x-auto pb-3"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {TEAM_MEMBERS.map((member) => (
            <div
              key={member.name}
              className="flex-shrink-0 w-[180px] sm:w-[200px] lg:w-[220px] snap-start group"
            >
              <div className="rounded-2xl overflow-hidden aspect-[4/5] bg-white border border-[#f0efed] shadow-sm group-hover:shadow-md transition-all duration-300">
                {member.videoUrl ? (
                  <LazyVideo
                    src={member.videoUrl}
                    poster={getOptimizedUrl(member.avatar, { width: 320, height: 400, quality: 55, resize: 'cover' })}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <img
                    src={getOptimizedUrl(member.avatar, { width: 320, height: 400, quality: 55, resize: 'cover' })}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </div>
              <div className="mt-3 px-1">
                <h3 className="text-sm font-semibold text-foreground">{member.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{member.role}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8 lg:mt-10">
          <Link
            to="/team"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:opacity-70 transition-opacity"
          >
            Meet the team <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
