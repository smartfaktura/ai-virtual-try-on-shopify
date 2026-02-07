import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

import productSerum from '@/assets/products/serum-vitamin-c.jpg';
import productHoodie from '@/assets/products/hoodie-gray-1.jpg';
import productGranola from '@/assets/products/granola-organic.jpg';
import productCandle from '@/assets/products/candle-soy.jpg';

const bullets = [
  'Choose your products once',
  'Pick your visual workflows',
  'Fresh visuals arrive every month',
];

const calendarThumbnails = [productSerum, productHoodie, productGranola, productCandle];

export function CreativeDropsSection() {
  const navigate = useNavigate();

  return (
    <section className="py-20 sm:py-28 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
              Your Visuals. Updated Automatically.
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Schedule monthly Creative Drops and receive fresh visuals for your products — without doing anything.
            </p>

            <ul className="space-y-4 mb-10">
              {bullets.map((bullet) => (
                <li key={bullet} className="flex items-center gap-3 text-sm font-medium text-foreground">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  {bullet}
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              className="rounded-full px-8 py-6 text-base font-semibold gap-2 shadow-lg shadow-primary/25"
              onClick={() => navigate('/auth')}
            >
              Set Up Monthly Creative Drops
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Right: Calendar mockup */}
          <div className="flex justify-center">
            <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
              {/* Calendar header */}
              <div className="p-5 border-b border-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">March Creative Drop</p>
                  <p className="text-xs text-muted-foreground">20 visuals · 4 products</p>
                </div>
              </div>

              {/* Thumbnail grid */}
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  {calendarThumbnails.map((thumb, i) => (
                    <div key={i} className="rounded-lg overflow-hidden border border-border">
                      <img src={thumb} alt="Product thumbnail" className="w-full h-24 object-cover" />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Scheduled: 1st of every month</span>
                  <span className="flex items-center gap-1 text-xs font-medium text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
