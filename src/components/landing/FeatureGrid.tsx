import {
  Library,
  Users,
  SlidersHorizontal,
  Camera,
  Repeat,
  Sparkles,
} from 'lucide-react';

import featureLibrary from '@/assets/templates/clothing-streetwear.jpg';
import featureModels from '@/assets/features/feature-ai-models.jpg';
import featureBrandMemory from '@/assets/features/feature-brand-memory.jpg';
import featureCampaigns from '@/assets/features/feature-campaigns.jpg';
import featureAutoDrops from '@/assets/features/feature-auto-drops.jpg';
import featureTryOn from '@/assets/features/feature-tryon.jpg';

const features = [
  {
    icon: Library,
    label: 'Content Library',
    headline: 'Studio-grade visuals. Every month.',
    description:
      'Curated product shots, lifestyle scenes, and ad creatives delivered automatically.',
    image: featureLibrary,
    span: 'lg:col-span-4 lg:row-span-2',
    imageClass: 'h-full',
    tall: true,
  },
  {
    icon: Users,
    label: 'AI Models',
    headline: '34+ diverse models. Zero casting calls.',
    description:
      'Every body type, ethnicity, and style — pre-configured and ready for your brand.',
    image: featureModels,
    span: 'lg:col-span-4',
    imageClass: 'h-48 sm:h-56',
    tall: false,
  },
  {
    icon: SlidersHorizontal,
    label: 'Brand Memory',
    headline: 'Your style. Remembered forever.',
    description:
      'Lighting, tone, backgrounds — locked into a Brand Profile that guides every visual.',
    image: featureBrandMemory,
    span: 'lg:col-span-4',
    imageClass: 'h-48 sm:h-56',
    tall: false,
  },
  {
    icon: Camera,
    label: 'Campaigns',
    headline: 'Full campaigns in minutes.',
    description:
      'Valentine\'s Day, Summer Sale, product launches — styled scenes across every ratio.',
    image: featureCampaigns,
    span: 'lg:col-span-4',
    imageClass: 'h-48 sm:h-56',
    tall: false,
  },
  {
    icon: Repeat,
    label: 'Auto Drops',
    headline: 'Fresh content on autopilot.',
    description:
      'Schedule once — new visuals generated weekly or monthly, tied to your catalog.',
    image: featureAutoDrops,
    span: 'lg:col-span-4',
    imageClass: 'h-48 sm:h-56',
    tall: false,
  },
  {
    icon: Sparkles,
    label: 'Try-On',
    headline: 'Your garments on supermodels. Instantly.',
    description:
      'Upload any clothing item and see it on AI models in editorial poses and environments.',
    image: featureTryOn,
    span: 'lg:col-span-4 lg:row-span-2',
    imageClass: 'h-full',
    tall: true,
  },
];

function FeatureCard({
  feature,
}: {
  feature: (typeof features)[0];
}) {
  const Icon = feature.icon;

  return (
    <div
      className={`group relative rounded-2xl overflow-hidden border border-border bg-card ${feature.span} flex flex-col`}
    >
      {/* Image area */}
      <div
        className={`relative overflow-hidden ${
          feature.tall ? 'flex-1 min-h-[280px]' : feature.imageClass
        }`}
      >
        <img
          src={feature.image}
          alt={feature.headline}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

        {/* Floating badge */}
        <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card/80 backdrop-blur-sm border border-border text-xs font-medium text-foreground">
          <Icon className="w-3.5 h-3.5 text-primary" />
          {feature.label}
        </div>
      </div>

      {/* Text content */}
      <div className="p-6">
        <h3 className="text-lg font-bold leading-snug mb-2 text-foreground">
          {feature.headline}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {feature.description}
        </p>
      </div>
    </div>
  );
}

export function FeatureGrid() {
  return (
    <section className="relative py-24 sm:py-32 bg-background text-foreground overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary opacity-[0.04] blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-secondary text-xs font-medium tracking-wide uppercase text-primary mb-6">
            <Sparkles className="w-3 h-3" />
            AI-Powered Studio
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 leading-[1.1]">
            What Brandframe.ai Delivers
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-base sm:text-lg">
            Your AI photography team handles everything &mdash; from monthly
            libraries to one-off editorial campaigns.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-5 auto-rows-auto">
          {/* Row 1+2: Content Library (tall left) + AI Models + Brand Memory */}
          <FeatureCard feature={features[0]} />
          <FeatureCard feature={features[1]} />
          <FeatureCard feature={features[2]} />

          {/* Row 3+4: Campaigns + Auto Drops + Try-On (tall right) */}
          <FeatureCard feature={features[3]} />
          <FeatureCard feature={features[4]} />
          <FeatureCard feature={features[5]} />
        </div>
      </div>
    </section>
  );
}
