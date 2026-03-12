import { useRef, useState, useEffect, useCallback } from 'react';
import { TEAM_MEMBERS } from '@/data/teamData';

const HERO_INDEX = 3; // Kenji — Campaign Art Director

// Grid positions: 5 columns, 2 rows. Hero spans col 3, rows 1-2.
// Order: [row1: 0,1, HERO, 2,3] [row2: 4,5, HERO, 6,7] + member[8] fills extra
const GRID_ORDER = [0, 1, /* hero */ 4, 5, 2, 6, /* hero */ 7, 8, 9];
const SMALL_MEMBERS = TEAM_MEMBERS.filter((_, i) => i !== HERO_INDEX);

function VideoTile({
  member,
  index,
  isVisible,
  isHero,
  parallaxY,
}: {
  member: (typeof TEAM_MEMBERS)[0];
  index: number;
  isVisible: boolean;
  isHero?: boolean;
  parallaxY?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (isVisible && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [isVisible]);

  return (
    <div
      className={`relative overflow-hidden rounded-xl group transition-all duration-500 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      } ${isHero ? 'md:col-start-3 md:row-start-1 md:row-span-2' : ''}`}
      style={{
        transitionDelay: isVisible ? `${100 + index * 80}ms` : '0ms',
        aspectRatio: isHero ? undefined : '4/5',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={member.videoUrl}
        poster={member.avatar}
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        style={
          isHero
            ? { transform: `scale(1.05) translateY(${parallaxY ?? 0}px)` }
            : undefined
        }
      />

      {/* Bottom gradient */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, hsl(var(--foreground) / 0.85) 0%, hsl(var(--foreground) / 0.4) 50%, transparent 100%)',
        }}
      />

      {/* Info overlay */}
      <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col gap-1 z-10">
        {/* Status message on hover */}
        <span
          className={`text-[11px] px-2 py-0.5 rounded-full self-start backdrop-blur-sm transition-all duration-300 ${
            hovered || isHero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
          style={{
            background: 'hsl(var(--primary) / 0.2)',
            color: 'hsl(var(--primary))',
            border: '1px solid hsl(var(--primary) / 0.3)',
          }}
        >
          {member.statusMessage}
        </span>

        <div className="flex items-center gap-2">
          {/* Pulsing active dot */}
          <span className="relative flex h-2 w-2 shrink-0">
            <span
              className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
              style={{ backgroundColor: '#22c55e' }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: '#22c55e' }}
            />
          </span>

          <span
            className={`font-semibold truncate ${isHero ? 'text-sm' : 'text-xs'}`}
            style={{ color: 'hsl(var(--background) / 0.95)' }}
          >
            {member.name}
          </span>
        </div>

        <span
          className={`truncate ${isHero ? 'text-xs' : 'text-[10px]'}`}
          style={{ color: 'hsl(var(--background) / 0.5)' }}
        >
          {member.role}
        </span>
      </div>

      {/* Hero glow border */}
      {isHero && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 0 1px hsl(var(--primary) / 0.3), 0 0 30px -5px hsl(var(--primary) / 0.15)',
          }}
        />
      )}
    </div>
  );
}

export function TeamVideoInterlude() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [parallaxY, setParallaxY] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleScroll = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const viewH = window.innerHeight;
    if (rect.bottom < 0 || rect.top > viewH) return;
    const progress = (viewH - rect.top) / (viewH + rect.height);
    setParallaxY((progress - 0.5) * 40);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const heroMember = TEAM_MEMBERS[HERO_INDEX];

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ background: 'hsl(var(--foreground) / 0.97)' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Header */}
        <div
          className={`text-center mb-10 md:mb-14 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p
            className="text-sm font-medium tracking-widest uppercase mb-3"
            style={{ color: 'hsl(var(--primary))' }}
          >
            AI Studio Team
          </p>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight"
            style={{ color: 'hsl(var(--background))' }}
          >
            Your team. Always on.
          </h2>
          <p
            className="mt-4 text-base md:text-lg max-w-xl mx-auto"
            style={{ color: 'hsl(var(--background) / 0.5)' }}
          >
            10 AI specialists working on every visual you create — from lighting to retouching to export.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 auto-rows-auto">
          {/* Row 1 left: members 0,1 */}
          {SMALL_MEMBERS.slice(0, 2).map((m, i) => (
            <VideoTile key={m.name} member={m} index={i} isVisible={isVisible} />
          ))}

          {/* Hero center — spans 2 rows on desktop, full width col on mobile */}
          <div className="col-span-2 md:col-span-1 md:col-start-3 md:row-start-1 md:row-span-2 rounded-xl overflow-hidden">
            <VideoTile
              member={heroMember}
              index={2}
              isVisible={isVisible}
              isHero
              parallaxY={parallaxY}
            />
          </div>

          {/* Row 1 right: members 2,3 */}
          {SMALL_MEMBERS.slice(2, 4).map((m, i) => (
            <VideoTile key={m.name} member={m} index={i + 3} isVisible={isVisible} />
          ))}

          {/* Row 2 left: members 4,5 */}
          {SMALL_MEMBERS.slice(4, 6).map((m, i) => (
            <VideoTile key={m.name} member={m} index={i + 5} isVisible={isVisible} />
          ))}

          {/* Row 2 right: members 6,7,8 — last 3 */}
          {SMALL_MEMBERS.slice(6, 9).map((m, i) => (
            <VideoTile key={m.name} member={m} index={i + 7} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
}
