import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, CreditCard, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

import productBefore from '@/assets/products/serum-vitamin-c.jpg';
import productAfter from '@/assets/templates/cosmetics-luxury.jpg';
import clothingBefore from '@/assets/products/hoodie-gray-1.jpg';
import clothingAfter from '@/assets/templates/clothing-studio.jpg';

const trustBadges = [
  { icon: CreditCard, text: 'No credit card required' },
  { icon: Sparkles, text: '5 free visuals' },
  { icon: Shield, text: 'Cancel anytime' },
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
            AI-powered visual studio for brands
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-6">
            Create New Product Visuals
            <br />
            <span className="text-primary">Without New Photoshoots</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Set your brand style once and get fresh, on-brand product visuals every month — automatically. No studio, no photographer, no hassle.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="rounded-full px-8 py-6 text-base font-semibold gap-2 shadow-lg shadow-primary/25" onClick={() => navigate('/auth')}>
              Start Free — 5 Visuals
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8 py-6 text-base font-semibold"
              onClick={() => document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See Examples
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

        {/* Before/After showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <ShowcaseCard
            beforeImg={productBefore}
            afterImg={productAfter}
            label="Skincare Product"
            category="Cosmetics"
          />
          <ShowcaseCard
            beforeImg={clothingBefore}
            afterImg={clothingAfter}
            label="Apparel"
            category="Fashion"
          />
        </div>
      </div>
    </section>
  );
}

function ShowcaseCard({
  beforeImg,
  afterImg,
  label,
  category,
}: {
  beforeImg: string;
  afterImg: string;
  label: string;
  category: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="grid grid-cols-2">
        <div className="relative">
          <img src={beforeImg} alt={`${label} before`} className="w-full h-48 object-cover" />
          <span className="absolute bottom-2 left-2 text-xs font-medium bg-foreground/70 text-background px-2 py-0.5 rounded">
            Before
          </span>
        </div>
        <div className="relative">
          <img src={afterImg} alt={`${label} after`} className="w-full h-48 object-cover" />
          <span className="absolute bottom-2 left-2 text-xs font-medium bg-primary text-primary-foreground px-2 py-0.5 rounded">
            After
          </span>
        </div>
      </div>
      <div className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{category}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-primary font-medium">
          <Clock className="w-3 h-3" />
          ~12s
        </div>
      </div>
    </div>
  );
}
