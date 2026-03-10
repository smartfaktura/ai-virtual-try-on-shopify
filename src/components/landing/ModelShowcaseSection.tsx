import { Badge } from '@/components/ui/badge';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getLandingAssetUrl } from '@/lib/landingAssets';

interface ModelCard {
  name: string;
  image: string;
}

const m = (name: string, file: string): ModelCard => ({ name, image: getLandingAssetUrl(`models/${file}`) });

const ROW_1: ModelCard[] = [
  m('Freya', 'model-female-average-nordic.jpg'),
  m('Zara', 'model-female-athletic-mixed.jpg'),
  m('Anders', 'model-male-slim-nordic.jpg'),
  m('Sienna', 'model-female-average-irish.jpg'),
  m('Jordan', 'models/model-051-jordan.jpg'),
  m('Hannah', 'models/model-050-hannah.jpg'),
  m('Kai', 'models/model-049-kai.jpg'),
  m('Valeria', 'model-female-slim-american-latina.jpg'),
  m('Fatima', 'model-female-plussize-middleeast.jpg'),
  m('Akiko', 'model-female-plussize-japanese.jpg'),
  m('Olivia', 'model-female-athletic-american-brunette.jpg'),
  m('Marcus', 'model-male-athletic-black.jpg'),
  m('Isabella', 'model-female-plussize-latina.jpg'),
  m('Luca', 'model-male-athletic-european.jpg'),
  m('Charlotte', 'model-female-mature-european.jpg'),
  m('Tyler', 'model-male-slim-american-blonde.jpg'),
  m('Amara', 'model-female-plussize-african.jpg'),
  m('Omar', 'model-male-slim-middleeast.jpg'),
  m('Priya', 'model-female-athletic-indian.jpg'),
  m('Brandon', 'model-male-average-american-beard.jpg'),
  m('Natalie', 'models/model-054-natalie.jpg'),
  m('Hiro', 'model-male-average-asian.jpg'),
];

const ROW_2: ModelCard[] = [
  m('Elena', 'model-female-athletic-european.jpg'),
  m('Arjun', 'model-male-slim-indian.jpg'),
  m('Madison', 'model-female-slim-american-blonde.jpg'),
  m('Diego', 'model-male-athletic-latino.jpg'),
  m('Sophie', 'model-female-average-european.jpg'),
  m('Callum', 'model-male-athletic-scottish.jpg'),
  m('Nadia', 'model-female-athletic-black.jpg'),
  m('Max', 'model-male-plussize-european.jpg'),
  m('Aubrey', 'model-female-average-american-redhead.jpg'),
  m('Kenji', 'model-male-athletic-japanese.jpg'),
  m('Zoe', 'model-female-athletic-american-black.jpg'),
  m('Marco', 'model-male-plussize-latino.jpg'),
  m('Niamh', 'model-female-athletic-mixed.jpg'),
  m('Kwame', 'model-male-plussize-african.jpg'),
  m('Mei', 'model-female-slim-chinese.jpg'),
  m('Ryan', 'model-male-athletic-american-classic.jpg'),
  m('Aisha', 'model-female-average-african.jpg'),
  m('Carlos', 'model-male-average-latino.jpg'),
  m('Leila', 'model-female-average-middleeast.jpg'),
  m('Erik', 'model-male-slim-nordic.jpg'),
  m('Yuki', 'model-female-slim-asian.jpg'),
  m('Astrid', 'model-female-average-nordic.jpg'),
  m('Emma', 'models/model-052-emma.jpg'),
  m('Hana', 'model-female-petite-korean.jpg'),
  m('Jamal', 'model-male-athletic-mixed.jpg'),
];

function MarqueeRow({ items, direction = 'left', durationSeconds = 120 }: { items: ModelCard[]; direction?: 'left' | 'right'; durationSeconds?: number }) {
  // Triple the items to ensure seamless looping with plenty of content
  const tripled = [...items, ...items, ...items];

  return (
    <div className="relative overflow-hidden">
      {/* Gradient fade edges */}
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
          <div key={`${model.name}-${i}`} className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="w-28 h-36 sm:w-32 sm:h-40 lg:w-36 lg:h-44 rounded-xl overflow-hidden border border-border bg-card shadow-sm">
              <ShimmerImage
                src={model.image}
                alt={model.name}
                className="w-full h-full object-cover object-top"
                aspectRatio="3/4"
              />
            </div>
            <span className="text-xs sm:text-sm font-medium text-foreground">{model.name}</span>
          </div>
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
            Diverse models across every body type, ethnicity, and age — ready for your next campaign.
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
