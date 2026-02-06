import { Camera, Users, Layers, Wand2 } from 'lucide-react';

import templateStudio from '@/assets/templates/clothing-studio.jpg';
import templateCosmetics from '@/assets/templates/cosmetics-luxury.jpg';
import modelPreview from '@/assets/models/model-female-athletic-european.jpg';
import templateUniversal from '@/assets/templates/universal-gradient.jpg';

const features = [
  {
    icon: Camera,
    title: 'Product Photography',
    description: 'Generate studio-quality product images across 17+ professional templates. From clean white backgrounds to lifestyle scenes.',
    image: templateStudio,
    badge: '17+ templates',
  },
  {
    icon: Users,
    title: 'Virtual Try-On',
    description: 'See your clothing on realistic AI models. 34 diverse models across multiple ethnicities, body types, and 24 pose options.',
    image: modelPreview,
    badge: '34 models',
  },
  {
    icon: Layers,
    title: 'Bulk Generation',
    description: 'Generate hundreds of images at once. Upload your catalog, select templates, and let AI do the work while you focus on selling.',
    image: templateUniversal,
    badge: 'Save hours',
  },
  {
    icon: Wand2,
    title: 'Smart Styling',
    description: 'AI auto-detects your product category and suggests the perfect template, lighting, and composition for maximum conversion.',
    image: templateCosmetics,
    badge: 'AI-powered',
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
            Everything You Need to Create
            <br />
            <span className="text-primary">Scroll-Stopping Product Images</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From product photos to virtual try-ons, one platform handles it all.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/30"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-background/90 text-foreground backdrop-blur-sm">
                    {feature.badge}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{feature.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
