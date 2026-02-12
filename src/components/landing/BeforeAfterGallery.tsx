import { useState } from 'react';
import { getLandingAssetUrl } from '@/lib/landingAssets';

const comparisons = [
  { original: getLandingAssetUrl('products/serum-vitamin-c.jpg'), output: getLandingAssetUrl('templates/cosmetics-luxury.jpg'), label: 'Instagram Ad', category: 'Ads' },
  { original: getLandingAssetUrl('products/hoodie-gray-1.jpg'), output: getLandingAssetUrl('templates/clothing-studio.jpg'), label: 'Amazon Listing', category: 'Listing' },
  { original: getLandingAssetUrl('products/granola-organic.jpg'), output: getLandingAssetUrl('templates/food-rustic.jpg'), label: 'Website Hero', category: 'Website' },
  { original: getLandingAssetUrl('products/collagen-powder.jpg'), output: getLandingAssetUrl('templates/supplements-luxury.jpg'), label: 'Seasonal Campaign', category: 'Seasonal' },
  { original: getLandingAssetUrl('products/candle-soy.jpg'), output: getLandingAssetUrl('templates/home-japandi.jpg'), label: 'Lifestyle Blog', category: 'Lifestyle' },
  { original: getLandingAssetUrl('products/leggings-black-1.jpg'), output: getLandingAssetUrl('templates/clothing-streetwear.jpg'), label: 'TikTok Ad', category: 'Ads' },
];

const categories = ['All', 'Ads', 'Website', 'Listing', 'Seasonal', 'Lifestyle'];

export function BeforeAfterGallery() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All'
    ? comparisons
    : comparisons.filter((c) => c.category === activeFilter);

  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
            One Product. Every Channel.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            One upload creates visuals for every channel and campaign.
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeFilter === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((comp) => (
            <div
              key={comp.label}
              className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* PiP layout: large output image with small inset original */}
              <div className="relative">
                <img
                  src={comp.output}
                  alt={`${comp.label} visual`}
                  className="w-full h-52 object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
                {/* Inset original (PiP) */}
                <div className="absolute top-3 left-3 w-14 h-14 rounded-lg border-2 border-background/80 shadow-lg overflow-hidden">
                  <img
                    src={comp.original}
                    alt="Original product"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold text-foreground">{comp.label}</p>
                <p className="text-xs text-muted-foreground">{comp.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
