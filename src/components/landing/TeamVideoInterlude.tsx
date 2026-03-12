import { useRef, useState, useEffect, useCallback } from 'react';
import { TEAM_MEMBERS } from '@/data/teamData';

const FEATURED_MEMBER = TEAM_MEMBERS[3]; // Kenji — Campaign Art Director

const CHAT_MEMBERS = [
  { member: TEAM_MEMBERS[0], msg: 'Lighting set up ✓', time: 'just now' },
  { member: TEAM_MEMBERS[3], msg: 'Reviewing composition…', time: '2s ago' },
  { member: TEAM_MEMBERS[2], msg: 'Retouching in progress', time: '5s ago' },
  { member: TEAM_MEMBERS[8], msg: 'Styling complete ✓', time: '8s ago' },
];

export function TeamVideoInterlude() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [parallaxY, setParallaxY] = useState(0);

  // Intersection Observer — trigger entrance once
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
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Play video when visible
  useEffect(() => {
    if (isVisible && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [isVisible]);

  // Parallax on scroll
  const handleScroll = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const viewH = window.innerHeight;
    // Only compute when section is near viewport
    if (rect.bottom < 0 || rect.top > viewH) return;
    const progress = (viewH - rect.top) / (viewH + rect.height);
    setParallaxY((progress - 0.5) * 60); // ±30px range
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ background: 'hsl(var(--foreground) / 0.97)' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left — Large cropped video */}
          <div className="relative w-full aspect-[3/4] md:aspect-[4/5] rounded-2xl overflow-hidden">
            <video
              ref={videoRef}
              src={FEATURED_MEMBER.videoUrl}
              poster={FEATURED_MEMBER.avatar}
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover scale-[1.15]"
              style={{
                transform: `scale(1.15) translateY(${parallaxY}px)`,
                transition: 'transform 0.1s linear',
              }}
            />
            {/* Gradient overlay at bottom */}
            <div
              className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
              style={{ background: 'linear-gradient(to top, hsl(var(--foreground) / 0.8), transparent)' }}
            />
          </div>

          {/* Right — Chat bubbles + tagline */}
          <div className="flex flex-col justify-center gap-6 md:gap-8">
            {/* Tagline */}
            <div
              className={`transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <p className="text-sm font-medium tracking-widest uppercase mb-3" style={{ color: 'hsl(var(--primary))' }}>
                AI Studio Team
              </p>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight"
                style={{ color: 'hsl(var(--background))' }}
              >
                Your team.
                <br />
                Always on.
              </h2>
              <p className="mt-4 text-base md:text-lg leading-relaxed" style={{ color: 'hsl(var(--background) / 0.55)' }}>
                10 AI specialists work on every visual you create — from lighting to retouching to export.
              </p>
            </div>

            {/* Chat bubbles */}
            <div className="flex flex-col gap-3">
              {CHAT_MEMBERS.map((chat, i) => (
                <div
                  key={chat.member.name}
                  className={`flex items-start gap-3 rounded-xl px-4 py-3 transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'
                  }`}
                  style={{
                    transitionDelay: isVisible ? `${200 + i * 150}ms` : '0ms',
                    background: 'hsl(var(--background) / 0.07)',
                    border: '1px solid hsl(var(--background) / 0.08)',
                  }}
                >
                  <img
                    src={chat.member.avatar}
                    alt={chat.member.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-white/10"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-semibold truncate"
                        style={{ color: 'hsl(var(--background) / 0.9)' }}
                      >
                        {chat.member.name}
                      </span>
                      <span
                        className="text-[10px] flex-shrink-0"
                        style={{ color: 'hsl(var(--background) / 0.3)' }}
                      >
                        {chat.time}
                      </span>
                    </div>
                    <p
                      className="text-sm mt-0.5"
                      style={{ color: 'hsl(var(--background) / 0.55)' }}
                    >
                      {chat.msg}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
