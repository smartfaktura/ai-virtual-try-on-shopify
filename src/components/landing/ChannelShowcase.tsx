import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { cn } from '@/lib/utils';

type Category = 'All' | 'Ads' | 'Listing' | 'Website' | 'Seasonal' | 'Lifestyle';

interface ShowcaseItem {
  id: string;
  path: string;
  title: string;
  subtitle: string;
  category: Category;
}

const ITEMS: ShowcaseItem[] = [
  { id: 'instagram', path: 'try-showcase/instagram-ad.jpg', title: 'Instagram Ad', subtitle: 'Scroll-stopping social creative', category: 'Ads' },
  { id: 'amazon', path: 'try-showcase/amazon-listing.jpg', title: 'Amazon Listing', subtitle: 'Clean on-model product shot', category: 'Listing' },
  { id: 'hero', path: 'try-showcase/website-hero.jpg', title: 'Website Hero', subtitle: 'Dynamic lifestyle banner', category: 'Website' },
  { id: 'seasonal', path: 'try-showcase/seasonal-autumn.jpg', title: 'Autumn Campaign', subtitle: 'Seasonal field shoot', category: 'Seasonal' },
  { id: 'lifestyle', path: 'try-showcase/lifestyle-home.jpg', title: 'At-Home Lifestyle', subtitle: 'Cozy casual setting', category: 'Lifestyle' },
  { id: 'blog', path: 'try-showcase/blog-editorial.jpg', title: 'Blog Editorial', subtitle: 'Botanical garden story', category: 'Lifestyle' },
];

const CATEGORIES: Category[] = ['All', 'Ads', 'Listing', 'Website', 'Seasonal', 'Lifestyle'];
const SOURCE_PATH = 'try-showcase/source-product.png';
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
            Upload one photo — get visuals for Instagram, Amazon, your website, seasonal campaigns, and more.
          </p>
        </div>

        {/* Source product callout */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-16 h-16 p-1.5 rounded-lg border-2 border-primary/30 overflow-hidden bg-muted/50 shadow-sm">
            <img src={sourceUrl} alt="White Crop-Top product" className="w-full h-full object-contain" loading="lazy" />
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
          {filtered.map(item => {
            const url = getOptimizedUrl(getLandingAssetUrl(item.path), { width: 600, quality: 75 });
            return (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md"
              >
                <div className="relative">
                  <ShimmerImage
                    src={url}
                    alt={item.title}
                    className="w-full aspect-[4/5] object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    aspectRatio="4/5"
                  />
                  {/* Source thumbnail overlay */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg px-2 py-1.5 border border-border/50 shadow-sm">
                    <div className="w-8 h-8 rounded bg-muted/50 p-0.5 overflow-hidden">
                      <img src={sourceUrl} alt="Your Product" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">Your Product</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                    <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{item.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
