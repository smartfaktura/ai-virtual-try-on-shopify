import { RefreshCw, ShoppingBag, Monitor, Fingerprint } from 'lucide-react';

import templateStreetwear from '@/assets/templates/clothing-streetwear.jpg';
import templateCosmetics from '@/assets/templates/cosmetics-luxury.jpg';
import templateUniversal from '@/assets/templates/universal-clean.jpg';
import templateStudio from '@/assets/templates/clothing-studio.jpg';

const workflows = [
  {
    icon: RefreshCw,
    title: 'Ad Refresh Sets',
    description: 'Never run ads with the same images again. Fresh creatives every month, automatically.',
    image: templateStreetwear,
    badge: '20 images',
  },
  {
    icon: ShoppingBag,
    title: 'Product Listing Sets',
    description: 'Marketplace-ready visuals, consistent every time. Clean backgrounds, perfect sizing.',
    image: templateCosmetics,
    badge: '10 images',
  },
  {
    icon: Monitor,
    title: 'Website & Hero Sets',
    description: 'Wide compositions with space for copy. Built for landing pages and banners.',
    image: templateUniversal,
    badge: '6 images',
  },
  {
    icon: Fingerprint,
    title: 'Brand Memory',
    description: 'Your lighting, tone, and style — remembered forever. Every visual stays on-brand.',
    image: templateStudio,
    badge: 'Always on',
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
            Visual Workflows Built for E-commerce
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose an outcome. Your studio team handles the rest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workflows.map((workflow) => (
            <div
              key={workflow.title}
              className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/30"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={workflow.image}
                  alt={workflow.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-background/90 text-foreground backdrop-blur-sm">
                    {workflow.badge}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <workflow.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{workflow.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{workflow.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
