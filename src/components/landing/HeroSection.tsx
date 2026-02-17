import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CreditCard, Shield, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const h = (file: string) => getLandingAssetUrl(`hero/${file}`);

const trustBadges = [
  { icon: CreditCard, text: 'No credit card required' },
  { icon: Sparkles, text: '5 free visuals' },
  { icon: Shield, text: 'Cancel anytime' },
];

interface ProductShowcase {
  product: { img: string; label: string; subtitle: string };
  outputs: { img: string; label: string }[];
  caption: string;
}

const showcases: ProductShowcase[] = [
  {
    product: { img: h('hero-product-tshirt.jpg'), label: 'Cropped Tee', subtitle: '1 product photo' },
    outputs: [
      { img: h('hero-output-studio.jpg'), label: 'Studio Portrait' },
      { img: h('hero-output-park.jpg'), label: 'Park Lifestyle' },
      { img: h('hero-output-coffee.jpg'), label: 'Coffee Shop' },
      { img: h('hero-output-rooftop.jpg'), label: 'Rooftop Editorial' },
      { img: h('hero-output-yoga.jpg'), label: 'Yoga Studio' },
      { img: h('hero-output-urban.jpg'), label: 'Urban Street' },
      { img: h('hero-output-beach.jpg'), label: 'Beach Sunset' },
      { img: h('hero-output-home.jpg'), label: 'At Home' },
    ],
    caption: 'Same tee — ∞ environments — 12 seconds',
  },
  {
    product: { img: h('hero-product-serum.jpg'), label: 'Face Serum', subtitle: '1 product photo' },
    outputs: [
      { img: h('hero-serum-studio.jpg'), label: 'Studio Lighting' },
      { img: h('hero-serum-shadows.jpg'), label: 'Window Shadows' },
      { img: h('hero-serum-table.jpg'), label: 'On the Table' },
      { img: h('hero-serum-bathroom.jpg'), label: 'Bathroom Spa' },
      { img: h('hero-serum-shelf.jpg'), label: 'Shelf Display' },
      { img: h('hero-serum-flatlay.jpg'), label: 'Flatlay' },
      { img: h('hero-serum-garden.jpg'), label: 'Garden' },
      { img: h('hero-serum-moody.jpg'), label: 'Moody Dark' },
    ],
    caption: 'Same serum — ∞ scenes — 12 seconds',
  },
  {
    product: { img: h('hero-product-ring.jpg'), label: 'Gold Ring', subtitle: '1 product photo' },
    outputs: [
      { img: h('hero-ring-model1.jpg'), label: 'Model Close-Up' },
      { img: h('hero-ring-model2.jpg'), label: 'Golden Light' },
      { img: h('hero-ring-flatlay.jpg'), label: 'Flatlay' },
      { img: h('hero-ring-macro.jpg'), label: 'Macro Detail' },
      { img: h('hero-ring-model3.jpg'), label: 'Editorial' },
      { img: h('hero-ring-velvet.jpg'), label: 'Velvet Display' },
      { img: h('hero-ring-water.jpg'), label: 'Water Reflection' },
      { img: h('hero-ring-golden.jpg'), label: 'Golden Hour' },
    ],
    caption: 'Same ring — ∞ shots — 12 seconds',
  },
];

const SLOGANS = [
  'Ready When You Are.',
  'No Studio Needed.',
  'Instant Brand Visuals.',
  'Every Product. Every Scene.',
  'Ads That Convert.',
  'Scale Without Limits.',
];

function useTypewriter(phrases: string[], typingSpeed = 55, deletingSpeed = 30, pauseDuration = 2400) {
  const [displayText, setDisplayText] = useState('');
  const state = useRef({
    phraseIndex: 0,
    charIndex: 0,
    phase: 'typing' as 'typing' | 'pausing' | 'deleting',
  });

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout>;

    const tick = () => {
      const s = state.current;
      const currentPhrase = phrases[s.phraseIndex];

      if (s.phase === 'typing') {
        s.charIndex++;
        setDisplayText(currentPhrase.slice(0, s.charIndex));
        if (s.charIndex >= currentPhrase.length) {
          s.phase = 'pausing';
          timerId = setTimeout(tick, pauseDuration);
        } else {
          timerId = setTimeout(tick, typingSpeed + Math.random() * 40);
        }
      } else if (s.phase === 'pausing') {
        s.phase = 'deleting';
        timerId = setTimeout(tick, deletingSpeed);
      } else if (s.phase === 'deleting') {
        s.charIndex--;
        setDisplayText(currentPhrase.slice(0, s.charIndex));
        if (s.charIndex <= 0) {
          s.phase = 'typing';
          s.phraseIndex = (s.phraseIndex + 1) % phrases.length;
          timerId = setTimeout(tick, typingSpeed + 200);
        } else {
          timerId = setTimeout(tick, deletingSpeed + Math.random() * 15);
        }
      }
    };

    timerId = setTimeout(tick, typingSpeed);
    return () => clearTimeout(timerId);
  }, [phrases, typingSpeed, deletingSpeed, pauseDuration]);

  return displayText;
}

const optimizeProduct = (url: string) => getOptimizedUrl(url, { quality: 70 });
const optimizeOutput = (url: string) => getOptimizedUrl(url, { quality: 70 });

export function HeroSection() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeScene, setActiveScene] = useState(0);
  const [pulsed, setPulsed] = useState(false);
  const [visibleDot, setVisibleDot] = useState(0);
  const typedText = useTypewriter(SLOGANS);

  const current = showcases[activeScene];

  // Preload all showcase images on mount
  useEffect(() => {
    showcases.forEach(scene => {
      new Image().src = optimizeProduct(scene.product.img);
      scene.outputs.forEach(o => {
        new Image().src = optimizeOutput(o.img);
      });
    });
  }, []);

  // One-time attention pulse on product pills after 2s
  useEffect(() => {
    const t = setTimeout(() => setPulsed(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    // Update active dot based on scroll position
    const itemWidth = 196; // ~180px + gap
    const idx = Math.round(el.scrollLeft / itemWidth);
    setVisibleDot(Math.min(idx, current.outputs.length - 1));
  }, [current.outputs.length]);

  // Reset scroll when switching scenes
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ left: 0 });
      setVisibleDot(0);
      requestAnimationFrame(updateScrollState);
    }
  }, [activeScene, updateScrollState]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 220;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/8 rounded-full blur-3xl opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-14">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-6">
            Your AI Photography Team.
            <br />
            <span className="text-primary">
              {typedText}
              <span className="inline-block w-[3px] h-[0.85em] bg-primary ml-0.5 align-middle animate-[blink_1s_step-end_infinite]" />
            </span>
          </h1>

          <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload a product photo. Your team of photographers, art directors, and retouchers delivers ∞ brand-ready visuals in seconds — for ads, listings, and campaigns.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="rounded-full px-8 py-6 text-base font-semibold gap-2 shadow-lg shadow-primary/25" onClick={() => navigate('/auth')}>
              Create My First Visual Set
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8 py-6 text-base font-semibold"
              onClick={() => document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See How It Works
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
            {trustBadges.map((badge) => (
              <div key={badge.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                <badge.icon className="w-4 h-4 text-primary" />
                {badge.text}
              </div>
            ))}
          </div>
        </div>

        {/* Visual showcase: Upload → Carousel of outputs */}
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-6 md:gap-8">
            {/* Left: Original upload with scene switcher */}
            <div className="flex-shrink-0 w-[180px] sm:w-[200px]">
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
                <div className="relative aspect-[3/4]">
                  <ShimmerImage
                    src={optimizeProduct(current.product.img)}
                    alt={current.product.label}
                    className="w-full h-full object-cover transition-all duration-500"
                    aspectRatio="3/4"
                  />
                  <span className="absolute top-3 left-3 text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full bg-background/90 text-foreground backdrop-blur-sm">
                    Your Upload
                  </span>
                </div>
                <div className="p-3 text-center">
                  <p className="text-xs sm:text-sm font-semibold text-foreground">{current.product.subtitle}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">That's all you need</p>
                </div>
              </div>

              {/* Scene switcher pills */}
              <div className="flex items-center justify-center gap-2 mt-3">
                {showcases.map((scene, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveScene(i)}
                    className={`text-[10px] sm:text-xs font-medium px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                      activeScene === i
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : `bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground ${
                            !pulsed ? 'animate-[pillPulse_1.5s_ease-in-out_2s_2]' : ''
                          }`
                    }`}
                  >
                    {scene.product.label}
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-muted-foreground/60 text-center mt-1.5">
                ↑ Tap to switch product
              </p>
            </div>

            {/* Flow arrow */}
            <div className="flex-shrink-0 hidden sm:flex flex-col items-center gap-1">
              <div className="w-10 h-px bg-border" />
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <ChevronRight className="w-4 h-4 text-primary" />
              </div>
              <div className="w-10 h-px bg-border" />
            </div>

            {/* Right: Portrait carousel */}
            <div className="flex-1 min-w-0 relative">
              {/* Carousel arrows */}
              <button
                onClick={() => scroll('left')}
                className={`absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-card border border-border shadow-md flex items-center justify-center transition-all ${
                  canScrollLeft ? 'opacity-100 hover:bg-accent' : 'opacity-0 pointer-events-none'
                }`}
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4 text-foreground" />
              </button>
              <button
                onClick={() => scroll('right')}
                className={`absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-card border border-border shadow-md flex items-center justify-center transition-all ${
                  canScrollRight ? 'opacity-100 hover:bg-accent' : 'opacity-0 pointer-events-none'
                }`}
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>

              {/* Right-edge gradient fade to signal scrollability */}
              {canScrollRight && (
                <div className="absolute right-0 top-0 bottom-3 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
              )}

              <div
                ref={scrollRef}
                onScroll={updateScrollState}
                className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-thin"
                style={{ scrollbarColor: 'hsl(var(--border)) transparent' }}
              >
                {current.outputs.map((output, idx) => (
                  <div
                    key={output.label}
                    className="flex-shrink-0 w-[150px] sm:w-[180px] snap-start group"
                  >
                    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-md group-hover:shadow-lg group-hover:border-primary/30 transition-all duration-300">
                      <div className="relative aspect-[3/4]">
                        <ShimmerImage
                           src={optimizeOutput(output.img)}
                           alt={output.label}
                           className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                           decoding="async"
                           loading={idx < 3 ? 'eager' : 'lazy'}
                           aspectRatio="3/4"
                         />
                        <span className="absolute bottom-2 left-2 text-[9px] sm:text-[10px] font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded">
                          {output.label}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dot indicators */}
              <div className="flex items-center justify-center gap-1.5 mt-2">
                {current.outputs.map((_, idx) => (
                  <div
                    key={idx}
                    className={`rounded-full transition-all duration-300 ${
                      idx === visibleDot
                        ? 'w-4 h-1.5 bg-primary'
                        : 'w-1.5 h-1.5 bg-border'
                    }`}
                  />
                ))}
              </div>

              {/* Caption */}
              <p className="text-center text-xs text-muted-foreground mt-2">
                {current.caption}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pillPulse {
          0%, 100% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0); }
          50% { box-shadow: 0 0 0 4px hsl(var(--primary) / 0.2); }
        }
      `}</style>
    </section>
  );
}
