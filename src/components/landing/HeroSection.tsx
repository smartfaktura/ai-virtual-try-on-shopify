import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CreditCard, Shield, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

import productTshirt from '@/assets/hero/hero-product-tshirt.jpg';
import outputStudio from '@/assets/hero/hero-output-studio.jpg';
import outputPark from '@/assets/hero/hero-output-park.jpg';
import outputCoffee from '@/assets/hero/hero-output-coffee.jpg';
import outputRooftop from '@/assets/hero/hero-output-rooftop.jpg';
import outputYoga from '@/assets/hero/hero-output-yoga.jpg';
import outputUrban from '@/assets/hero/hero-output-urban.jpg';
import outputBeach from '@/assets/hero/hero-output-beach.jpg';
import outputHome from '@/assets/hero/hero-output-home.jpg';

import productSerum from '@/assets/hero/hero-product-serum.jpg';
import serumStudio from '@/assets/hero/hero-serum-studio.jpg';
import serumShadows from '@/assets/hero/hero-serum-shadows.jpg';
import serumTable from '@/assets/hero/hero-serum-table.jpg';
import serumBathroom from '@/assets/hero/hero-serum-bathroom.jpg';
import serumShelf from '@/assets/hero/hero-serum-shelf.jpg';
import serumFlatlay from '@/assets/hero/hero-serum-flatlay.jpg';
import serumGarden from '@/assets/hero/hero-serum-garden.jpg';
import serumMoody from '@/assets/hero/hero-serum-moody.jpg';

import productRing from '@/assets/hero/hero-product-ring.jpg';
import ringModel1 from '@/assets/hero/hero-ring-model1.jpg';
import ringModel2 from '@/assets/hero/hero-ring-model2.jpg';
import ringFlatlay from '@/assets/hero/hero-ring-flatlay.jpg';
import ringMacro from '@/assets/hero/hero-ring-macro.jpg';
import ringModel3 from '@/assets/hero/hero-ring-model3.jpg';
import ringVelvet from '@/assets/hero/hero-ring-velvet.jpg';
import ringWater from '@/assets/hero/hero-ring-water.jpg';
import ringGolden from '@/assets/hero/hero-ring-golden.jpg';

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
    product: { img: productTshirt, label: 'Cropped Tee', subtitle: '1 product photo' },
    outputs: [
      { img: outputStudio, label: 'Studio Portrait' },
      { img: outputPark, label: 'Park Lifestyle' },
      { img: outputCoffee, label: 'Coffee Shop' },
      { img: outputRooftop, label: 'Rooftop Editorial' },
      { img: outputYoga, label: 'Yoga Studio' },
      { img: outputUrban, label: 'Urban Street' },
      { img: outputBeach, label: 'Beach Sunset' },
      { img: outputHome, label: 'At Home' },
    ],
    caption: 'Same tee — ∞ environments — 12 seconds',
  },
  {
    product: { img: productSerum, label: 'Face Serum', subtitle: '1 product photo' },
    outputs: [
      { img: serumStudio, label: 'Studio Lighting' },
      { img: serumShadows, label: 'Window Shadows' },
      { img: serumTable, label: 'On the Table' },
      { img: serumBathroom, label: 'Bathroom Spa' },
      { img: serumShelf, label: 'Shelf Display' },
      { img: serumFlatlay, label: 'Flatlay' },
      { img: serumGarden, label: 'Garden' },
      { img: serumMoody, label: 'Moody Dark' },
    ],
    caption: 'Same serum — ∞ scenes — 12 seconds',
  },
  {
    product: { img: productRing, label: 'Gold Ring', subtitle: '1 product photo' },
    outputs: [
      { img: ringModel1, label: 'Model Close-Up' },
      { img: ringModel2, label: 'Golden Light' },
      { img: ringFlatlay, label: 'Flatlay' },
      { img: ringMacro, label: 'Macro Detail' },
      { img: ringModel3, label: 'Editorial' },
      { img: ringVelvet, label: 'Velvet Display' },
      { img: ringWater, label: 'Water Reflection' },
      { img: ringGolden, label: 'Golden Hour' },
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
          // Add slight randomness for natural feel
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

export function HeroSection() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeScene, setActiveScene] = useState(0);
  const typedText = useTypewriter(SLOGANS);

  const current = showcases[activeScene];

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  // Reset scroll when switching scenes
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ left: 0 });
      // Delay state update for scroll width recalculation
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
                  <img
                    src={current.product.img}
                    alt={current.product.label}
                    className="w-full h-full object-cover transition-all duration-500"
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
                    className={`text-[10px] sm:text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                      activeScene === i
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                    }`}
                  >
                    {scene.product.label}
                  </button>
                ))}
              </div>
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
                className={`absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-card border border-border shadow-md flex items-center justify-center transition-all ${
                  canScrollLeft ? 'opacity-100 hover:bg-accent' : 'opacity-0 pointer-events-none'
                }`}
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4 text-foreground" />
              </button>
              <button
                onClick={() => scroll('right')}
                className={`absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-card border border-border shadow-md flex items-center justify-center transition-all ${
                  canScrollRight ? 'opacity-100 hover:bg-accent' : 'opacity-0 pointer-events-none'
                }`}
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>

              <div
                ref={scrollRef}
                onScroll={updateScrollState}
                className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-thin"
                style={{ scrollbarColor: 'hsl(var(--border)) transparent' }}
              >
                {current.outputs.map((output) => (
                  <div
                    key={output.label}
                    className="flex-shrink-0 w-[150px] sm:w-[180px] snap-start group"
                  >
                    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-md group-hover:shadow-lg group-hover:border-primary/30 transition-all duration-300">
                      <div className="relative aspect-[3/4]">
                        <img
                          src={output.img}
                          alt={output.label}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <span className="absolute bottom-2 left-2 text-[9px] sm:text-[10px] font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded">
                          {output.label}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Caption */}
              <p className="text-center text-xs text-muted-foreground mt-3">
                {current.caption}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
