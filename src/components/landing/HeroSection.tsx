import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, CreditCard, Shield, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

import productUpload from '@/assets/hero/hero-product-tshirt.jpg';
import outputStudio from '@/assets/hero/hero-output-studio.jpg';
import outputPark from '@/assets/hero/hero-output-park.jpg';
import outputCoffee from '@/assets/hero/hero-output-coffee.jpg';
import outputRooftop from '@/assets/hero/hero-output-rooftop.jpg';
import outputYoga from '@/assets/hero/hero-output-yoga.jpg';
import outputUrban from '@/assets/hero/hero-output-urban.jpg';
import outputBeach from '@/assets/hero/hero-output-beach.jpg';
import outputHome from '@/assets/hero/hero-output-home.jpg';

const trustBadges = [
  { icon: CreditCard, text: 'No credit card required' },
  { icon: Sparkles, text: '5 free visuals' },
  { icon: Shield, text: 'Cancel anytime' },
];

const heroOutputs = [
  { img: outputStudio, label: 'Studio Portrait' },
  { img: outputPark, label: 'Park Lifestyle' },
  { img: outputCoffee, label: 'Coffee Shop' },
  { img: outputRooftop, label: 'Rooftop Editorial' },
  { img: outputYoga, label: 'Yoga Studio' },
  { img: outputUrban, label: 'Urban Street' },
  { img: outputBeach, label: 'Beach Sunset' },
  { img: outputHome, label: 'At Home' },
];

export function HeroSection() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

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
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Your AI photography team
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-6">
            Your AI Photography Team.
            <br />
            <span className="text-primary">Ready When You Are.</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload a product photo. Your team of photographers, art directors, and retouchers delivers 20 brand-ready visuals in seconds — for ads, listings, and campaigns.
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

        {/* Visual showcase: Upload → Carousel of portrait outputs */}
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-6 md:gap-8">
            {/* Left: Original upload */}
            <div className="flex-shrink-0 w-[180px] sm:w-[200px]">
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
                <div className="relative aspect-[3/4]">
                  <img src={productUpload} alt="Your uploaded product" className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full bg-background/90 text-foreground backdrop-blur-sm">
                    Your Upload
                  </span>
                </div>
                <div className="p-3 text-center">
                  <p className="text-xs sm:text-sm font-semibold text-foreground">1 product photo</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">That's all you need</p>
                </div>
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
                {heroOutputs.map((output) => (
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
                Same t-shirt — 8 environments — 12 seconds
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
