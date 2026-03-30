import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';

interface ModelCard {
  name: string;
  image: string;
}

const m = (name: string, file: string): ModelCard => ({ name, image: getOptimizedUrl(getLandingAssetUrl(`models/${file}`), { quality: 60 }) });

const ROW_1: ModelCard[] = [
  m('Freya', 'model-female-average-nordic.jpg'),
  m('Zara', 'model-female-athletic-mixed.jpg'),
  m('Anders', 'model-male-slim-nordic.jpg'),
  m('Sienna', 'model-female-average-irish.jpg'),
  m('Jordan', 'model-051-jordan.jpg'),
  m('Hannah', 'model-050-hannah.jpg'),
  m('Kai', 'model-049-kai.jpg'),
  m('Valeria', 'model-female-slim-american-latina.jpg'),
  m('Fatima', 'model-female-plussize-middleeast.jpg'),
  m('Akiko', 'model-female-plussize-japanese.jpg'),
  m('Olivia', 'model-035-olivia.jpg'),
  m('Marcus', 'model-male-athletic-black.jpg'),
  m('Isabella', 'model-female-plussize-latina.jpg'),
  m('Liam', 'model-male-athletic-european.jpg'),
  m('Victoria', 'model-female-mature-european.jpg'),
  m('Tyler', 'model-male-athletic-mixed.jpg'),
  m('Nia', 'model-female-plussize-african.jpg'),
  m('Omar', 'model-male-slim-middleeast.jpg'),
  m('Priya', 'model-female-athletic-indian.jpg'),
  m('Ethan', 'model-040-ethan.jpg'),
  m('Natalie', 'model-054-natalie.jpg'),
  m('Jin', 'model-male-average-asian.jpg'),
];

const ROW_2: ModelCard[] = [
  m('Sofia', 'model-female-athletic-european.jpg'),
  m('Ravi', 'model-male-slim-indian.jpg'),
  m('Madison', 'model-female-slim-american-blonde.jpg'),
  m('Rafael', 'model-male-athletic-latino.jpg'),
  m('Charlotte', 'model-female-average-european.jpg'),
  m('Rowan', 'model-male-athletic-scottish.jpg'),
  m('Amara', 'model-female-athletic-black.jpg'),
  m('Henrik', 'model-male-plussize-european.jpg'),
  m('Aubrey', 'model-female-average-american-redhead.jpg'),
  m('Kenji', 'model-male-athletic-japanese.jpg'),
  m('Zoe', 'model-female-athletic-american-black.jpg'),
  m('Mateo', 'model-male-plussize-latino.jpg'),
  m('Daphne', 'model-046-daphne.jpg'),
  m('Jamal', 'model-male-plussize-african.jpg'),
  m('Mei', 'model-female-slim-chinese.jpg'),
  m('Leo', 'model-047-leo.jpg'),
  m('Maya', 'model-female-average-african.jpg'),
  m('Diego', 'model-male-average-latino.jpg'),
  m('Layla', 'model-female-average-middleeast.jpg'),
  m('Soo-Min', 'model-female-petite-korean.jpg'),
  m('Yuki', 'model-female-slim-asian.jpg'),
  m('Emma', 'model-052-emma.jpg'),
  m('Elena', 'model-female-athletic-latina.jpg'),
  m('Chen Wei', 'model-male-average-chinese.jpg'),
];

function ModelCardItem({ model }: { model: ModelCard }) {
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  return (
    <div className="flex flex-col items-center gap-2 flex-shrink-0">
      <div className="w-28 h-36 sm:w-32 sm:h-40 lg:w-36 lg:h-44 rounded-xl overflow-hidden border border-border bg-card shadow-sm">
        <ShimmerImage
          src={model.image}
          alt={model.name}
          loading="lazy"
          className="w-full h-full object-cover object-top"
          aspectRatio="3/4"
          onError={() => setHidden(true)}
        />
      </div>
      <span className="text-xs sm:text-sm font-medium text-foreground">{model.name}</span>
    </div>
  );
}

function MarqueeRow({ items, direction = 'left', durationSeconds = 120 }: { items: ModelCard[]; direction?: 'left' | 'right'; durationSeconds?: number }) {
  const tripled = [...items, ...items, ...items];

  return (
    <div className="relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 lg:w-32 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, hsl(var(--muted) / 0.3), transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 lg:w-32 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, hsl(var(--muted) / 0.3), transparent)' }} />
      <div
        className="flex gap-4"
        style={{
          width: 'max-content',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          animation: `marquee-${direction} ${durationSeconds}s linear infinite`,
        }}
      >
        {tripled.map((model, i) => (
          <ModelCardItem key={`${model.name}-${i}`} model={model} />
        ))}
      </div>
    </div>
  );
}

export function ModelShowcaseSection() {
  return (
    <section className="py-20 lg:py-24 bg-muted/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center">
          <Badge variant="secondary" className="mb-4 text-xs tracking-wide uppercase">
            49+ AI Models
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Professional Models. Every Look.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Diverse models across every body type, ethnicity, and age - ready for your next campaign.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <MarqueeRow items={ROW_1} direction="left" durationSeconds={120} />
        <MarqueeRow items={ROW_2} direction="right" durationSeconds={130} />
      </div>
    </section>
  );
}
