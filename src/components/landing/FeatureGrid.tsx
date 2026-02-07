import { useState, useEffect, useCallback } from 'react';
import {
  Library,
  Users,
  SlidersHorizontal,
  Camera,
  Repeat,
  Sparkles,
  ChevronLeft,
  ChevronRight,
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
    title: 'Monthly Content Library',
    headline: 'A fresh library of studio-grade visuals every month.',
    description:
      "Stop scrambling for content. Brandframe.ai delivers curated product images, lifestyle shots, and ad creatives to your dashboard automatically. Always fresh, always on-brand.",
    image: templateStreetwear,
  },
  {
    icon: Users,
    title: 'Models Set Up for Your Brand',
    headline: 'Your models. Your look. Already configured.',
    description:
      "Choose from 34+ diverse AI models across body types and styles. Save your favourites and they appear in every generation \u2014 consistent representation without a single casting call.",
    image: templateCosmetics,
  },
  {
    icon: SlidersHorizontal,
    title: 'Brand Preferences',
    headline: 'Tell us your style once. We remember it forever.',
    description:
      "Set lighting, tone, backgrounds, and composition in a Brand Profile. Every visual \u2014 flat-lay or lifestyle \u2014 follows your creative direction automatically.",
    image: templateUniversal,
  },
  {
    icon: Camera,
    title: 'One-time Editorial Campaigns',
    headline: 'Full campaigns without a studio or timeline.',
    description:
      "Holiday collection? Seasonal rebrand? Generate an entire editorial campaign in minutes \u2014 styled scenes, model pairings, multiple ratios for ads, social, and web.",
    image: templateStudio,
  },
  {
    icon: Repeat,
    title: 'Automated Creative Drops',
    headline: 'Schedule once. Fresh visuals arrive on autopilot.',
    description:
      "Set up recurring drops tied to your catalog. Assign workflows and brand profiles, then Brandframe.ai generates and delivers new assets weekly or monthly \u2014 zero manual work.",
    image: templatePastel,
  },
  {
    icon: Sparkles,
    title: 'Virtual Try-On',
    headline: 'Your garments on real-looking models, instantly.',
    description:
      "Upload any clothing item and see it on AI models in natural poses. Lookbook-quality imagery for fashion brands without traditional photoshoot overhead.",
    image: templateRustic,
  },
];

export function FeatureGrid() {
  const [active, setActive] = useState(0);
  const total = features.length;

  const next = useCallback(() => setActive((p) => (p + 1) % total), [total]);
  const prev = useCallback(() => setActive((p) => (p - 1 + total) % total), [total]);

  useEffect(() => {
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next]);

  const current = features[active];

  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3">
            What Brandframe.ai Delivers
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Your AI photography team handles everything from monthly content to one-off campaigns.
          </p>
        </div>

        {/* Main carousel card */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
            {/* Image */}
            <div className="relative h-64 lg:h-auto overflow-hidden bg-muted">
              <img
                key={active}
                src={current.image}
                alt={current.title}
                className="w-full h-full object-cover animate-fade-in"
              />
            </div>

            {/* Content */}
            <div className="p-8 sm:p-10 flex flex-col justify-center" key={active}>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <current.icon className="w-[18px] h-[18px] text-primary" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {current.title}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-foreground leading-snug mb-3">
                {current.headline}
              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                {current.description}
              </p>

              {/* Nav */}
              <div className="flex items-center justify-between mt-auto">
                <div className="flex gap-1.5">
                  {features.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActive(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === active ? 'w-7 bg-primary' : 'w-1.5 bg-border hover:bg-muted-foreground/30'
                      }`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={prev}
                    className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={next}
                    className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
                    aria-label="Next"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
