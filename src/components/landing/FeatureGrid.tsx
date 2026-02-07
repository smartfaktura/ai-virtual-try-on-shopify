import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Library,
  Users,
  SlidersHorizontal,
  Camera,
  Repeat,
  Sparkles,
} from 'lucide-react';

import templateStreetwear from '@/assets/templates/clothing-streetwear.jpg';
import templateCosmetics from '@/assets/templates/cosmetics-luxury.jpg';
import templateUniversal from '@/assets/templates/universal-clean.jpg';
import templateStudio from '@/assets/templates/clothing-studio.jpg';
import templatePastel from '@/assets/templates/cosmetics-pastel.jpg';
import templateRustic from '@/assets/templates/food-rustic.jpg';

const features = [
  {
    icon: Library,
    label: 'Content Library',
    headline: 'A fresh library of studio-grade visuals. Every month.',
    description:
      'Curated product shots, lifestyle scenes, and ad creatives delivered to your dashboard automatically. Always fresh. Always on-brand.',
    image: templateStreetwear,
  },
  {
    icon: Users,
    label: 'AI Models',
    headline: 'Your models. Your look. Already configured.',
    description:
      '34+ diverse AI models across body types and styles. Save favourites \u2014 they appear in every generation without a single casting call.',
    image: templateCosmetics,
  },
  {
    icon: SlidersHorizontal,
    label: 'Brand Memory',
    headline: 'Tell us your style once. We remember it forever.',
    description:
      'Lighting, tone, backgrounds, composition \u2014 locked into a Brand Profile. Every visual follows your creative direction automatically.',
    image: templateUniversal,
  },
  {
    icon: Camera,
    label: 'Campaigns',
    headline: 'Full editorial campaigns. No studio. No timeline.',
    description:
      'Holiday collections, seasonal rebrands, product launches \u2014 generate an entire campaign in minutes with styled scenes and multiple ratios.',
    image: templateStudio,
  },
  {
    icon: Repeat,
    label: 'Auto Drops',
    headline: 'Schedule once. Fresh visuals arrive on autopilot.',
    description:
      'Recurring Creative Drops tied to your catalog. Assign workflows and brand profiles \u2014 new assets generated weekly or monthly.',
    image: templatePastel,
  },
  {
    icon: Sparkles,
    label: 'Try-On',
    headline: 'Your garments on real-looking models. Instantly.',
    description:
      'Upload any clothing item and see it on AI models in natural poses and environments. Lookbook-quality imagery without the overhead.',
    image: templateRustic,
  },
];

export function FeatureGrid() {
  const [active, setActive] = useState(0);
  const total = features.length;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((p) => (p + 1) % total);
    }, 5000);
  }, [total]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const handleSelect = (i: number) => {
    setActive(i);
    resetTimer();
  };

  const current = features[active];

  return (
    <section className="relative py-24 sm:py-32 bg-background text-foreground overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary opacity-[0.04] blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-secondary text-xs font-medium tracking-wide uppercase text-primary mb-6">
            <Sparkles className="w-3 h-3" />
            AI-Powered Studio
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 leading-[1.1]">
            What Brandframe.ai Delivers
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-base sm:text-lg">
            Your AI photography team handles everything &mdash; from monthly libraries to one-off editorial campaigns.
          </p>
        </div>

        {/* Feature tabs + content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0">
          {/* Left: Tab list */}
          <div className="lg:col-span-4 flex flex-col gap-1">
            {features.map((f, i) => {
              const isActive = i === active;
              return (
                <button
                  key={f.label}
                  onClick={() => handleSelect(i)}
                  className={`group relative flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all duration-300 ${
                    isActive
                      ? 'bg-[hsl(212,14%,16%)]'
                      : 'hover:bg-[hsl(212,14%,13%)]'
                  }`}
                >
                  {/* Active indicator bar */}
                  <div
                    className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-full transition-all duration-300 ${
                      isActive ? 'bg-[hsl(161,100%,45%)]' : 'bg-transparent'
                    }`}
                  />
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
                      isActive
                        ? 'bg-[hsl(161,100%,25%)] text-[hsl(0,0%,100%)]'
                        : 'bg-[hsl(212,14%,18%)] text-[hsl(210,14%,55%)] group-hover:text-[hsl(210,20%,80%)]'
                    }`}
                  >
                    <f.icon className="w-[18px] h-[18px]" />
                  </div>
                  <span
                    className={`text-sm font-semibold transition-colors duration-300 ${
                      isActive ? 'text-[hsl(210,20%,98%)]' : 'text-[hsl(210,14%,55%)] group-hover:text-[hsl(210,20%,80%)]'
                    }`}
                  >
                    {f.label}
                  </span>

                  {/* Progress bar for active */}
                  {isActive && (
                    <div className="absolute bottom-0 left-5 right-5 h-[2px] bg-[hsl(212,14%,22%)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[hsl(161,100%,45%)] rounded-full"
                        style={{
                          animation: 'progress-fill 5s linear forwards',
                        }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right: Content card */}
          <div className="lg:col-span-8 lg:pl-8">
            <div
              key={active}
              className="rounded-2xl overflow-hidden border border-[hsl(212,14%,20%)] bg-[hsl(212,14%,12%)]"
              style={{ animation: 'feature-enter 0.4s ease-out' }}
            >
              {/* Image */}
              <div className="relative h-64 sm:h-80 overflow-hidden">
                <img
                  src={current.image}
                  alt={current.headline}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(212,14%,12%)] via-transparent to-transparent" />

                {/* Floating counter */}
                <div className="absolute bottom-4 right-4 text-xs font-mono text-[hsl(210,14%,45%)] bg-[hsl(212,14%,12%)]/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[hsl(212,14%,22%)]">
                  {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                </div>
              </div>

              {/* Text */}
              <div className="p-8 sm:p-10">
                <h3 className="text-xl sm:text-2xl font-bold leading-snug mb-3 text-[hsl(210,20%,98%)]">
                  {current.headline}
                </h3>
                <p className="text-sm sm:text-base text-[hsl(210,14%,55%)] leading-relaxed max-w-lg">
                  {current.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes progress-fill {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes feature-enter {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </section>
  );
}
