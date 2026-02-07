import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, CreditCard, Shield, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

import productUpload from '@/assets/hero/hero-product-tshirt.jpg';
import outputStudio from '@/assets/hero/hero-output-studio.jpg';
import outputPark from '@/assets/hero/hero-output-park.jpg';
import outputCoffee from '@/assets/hero/hero-output-coffee.jpg';
import outputRooftop from '@/assets/hero/hero-output-rooftop.jpg';

const trustBadges = [
  { icon: CreditCard, text: 'No credit card required' },
  { icon: Sparkles, text: '5 free visuals' },
  { icon: Shield, text: 'Cancel anytime' },
];

const visualContexts = [
  { img: outputStudio, label: 'Studio Portrait' },
  { img: outputPark, label: 'Lifestyle' },
  { img: outputCoffee, label: 'Coffee Shop' },
  { img: outputRooftop, label: 'Editorial' },
];

export function HeroSection() {
  const navigate = useNavigate();
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

        {/* Visual Set showcase: Upload → Multiple outputs */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[280px_auto_1fr] gap-4 items-center">
            {/* Left: Original upload */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
              <div className="relative">
                <img src={productUpload} alt="Your uploaded product" className="w-full h-64 object-cover" />
                <span className="absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full bg-background/90 text-foreground backdrop-blur-sm">
                  Your Upload
                </span>
              </div>
              <div className="p-4 text-center">
                <p className="text-sm font-semibold text-foreground">1 product photo</p>
                <p className="text-xs text-muted-foreground">That's all you need</p>
              </div>
            </div>

            {/* Flow arrow */}
            <div className="hidden md:flex flex-col items-center gap-1">
              <div className="w-12 h-px bg-border" />
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <ChevronRight className="w-4 h-4 text-primary" />
              </div>
              <div className="w-12 h-px bg-border" />
            </div>

            {/* Right: 2x2 generated contexts */}
            <div>
              <div className="grid grid-cols-2 gap-3">
                {visualContexts.map((ctx) => (
                  <div
                    key={ctx.label}
                    className="rounded-xl border border-border bg-card overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="relative">
                      <img src={ctx.img} alt={ctx.label} className="w-full h-32 sm:h-36 object-cover" />
                      <span className="absolute bottom-2 left-2 text-[10px] font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded">
                        {ctx.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Caption */}
              <p className="text-center text-xs text-muted-foreground mt-4">
                Same t-shirt — 4 environments — 12 seconds
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
