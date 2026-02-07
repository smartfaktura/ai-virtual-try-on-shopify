import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Calendar, Clock } from 'lucide-react';
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

const drops = [
  {
    month: 'March Drop',
    count: '20 visuals · 4 products',
    thumbnails: [productSerum, productHoodie, productGranola, productCandle],
    opacity: 'opacity-100',
    status: 'Delivered',
  },
  {
    month: 'February Drop',
    count: '16 visuals · 3 products',
    thumbnails: [productHoodie, productGranola, productCandle],
    opacity: 'opacity-70',
    status: 'Delivered',
  },
  {
    month: 'January Drop',
    count: '20 visuals · 4 products',
    thumbnails: [productSerum, productCandle, productGranola, productHoodie],
    opacity: 'opacity-40',
    status: 'Delivered',
  },
];

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

          {/* Right: Timeline of drops */}
          <div className="flex justify-center">
            <div className="w-full max-w-sm space-y-4">
              {/* Next drop indicator */}
              <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2 px-1">
                <Clock className="w-4 h-4" />
                Next drop in 12 days
              </div>

              {drops.map((drop) => (
                <div
                  key={drop.month}
                  className={`rounded-2xl border border-border bg-card shadow-sm overflow-hidden ${drop.opacity} transition-opacity`}
                >
                  <div className="p-4 border-b border-border flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">{drop.month}</p>
                      <p className="text-xs text-muted-foreground">{drop.count}</p>
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">{drop.status}</span>
                  </div>
                  <div className="p-3">
                    <div className="flex gap-1.5">
                      {drop.thumbnails.slice(0, 4).map((thumb, i) => (
                        <div key={i} className="rounded-md overflow-hidden border border-border flex-1">
                          <img src={thumb} alt="Product" className="w-full h-14 object-cover" />
                        </div>
                      ))}
                    </div>
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
