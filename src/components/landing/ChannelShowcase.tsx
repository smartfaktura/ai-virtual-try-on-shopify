import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Category = 'All' | 'Ads' | 'Listing' | 'Website' | 'Seasonal' | 'Lifestyle';

interface ShowcaseItem {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  category: Category;
}

const ITEMS: ShowcaseItem[] = [
  { id: 'studio', image: '/images/try-showcase/studio-lookbook.png', title: 'Studio Lookbook', subtitle: 'Clean e-comm on white', category: 'Listing' },
  { id: 'cafe', image: '/images/try-showcase/cafe-lifestyle.png', title: 'Café Lifestyle', subtitle: 'Sun-drenched editorial', category: 'Lifestyle' },
  { id: 'pilates', image: '/images/try-showcase/pilates-studio.png', title: 'Pilates Studio', subtitle: 'Active lifestyle campaign', category: 'Ads' },
  { id: 'home', image: '/images/try-showcase/at-home-editorial.png', title: 'At-Home Editorial', subtitle: 'Cozy living room story', category: 'Website' },
  { id: 'golden', image: '/images/try-showcase/golden-hour.png', title: 'Golden Hour', subtitle: 'Warm outdoor portrait', category: 'Seasonal' },
  { id: 'urban', image: '/images/try-showcase/urban-edge.png', title: 'Urban Edge', subtitle: 'Street-style stairwell shoot', category: 'Lifestyle' },
];

const CATEGORIES: Category[] = ['All', 'Ads', 'Listing', 'Website', 'Seasonal', 'Lifestyle'];
const LOCAL_SOURCE = '/images/source-crop-top.jpg';

export function ChannelShowcase() {
  const [active, setActive] = useState<Category>('All');
  const filtered = active === 'All' ? ITEMS : ITEMS.filter(i => i.category === active);

  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-4 text-xs tracking-wide uppercase">
            Same Product, Infinite Possibilities
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            One Product. Every Channel.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            One upload creates visuals for every channel and campaign.
          </p>
        </div>

        {/* Source product callout */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-20 h-20 rounded-lg border-2 border-primary/30 overflow-hidden shadow-sm">
            <img src={LOCAL_SOURCE} alt="White Crop-Top product" className="w-full h-full object-cover" loading="lazy" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Your Product</p>
            <p className="text-xs text-muted-foreground">White Crop-Top · Flat Lay</p>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-colors border',
                active === cat
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => (
            <div
              key={item.id}
              className="group relative rounded-2xl overflow-hidden border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full aspect-square object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
