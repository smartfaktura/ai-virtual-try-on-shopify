import { Badge } from '@/components/ui/badge';

// Models — full library, 34 diverse models
import modelYuki from '@/assets/models/model-female-slim-asian.jpg';
import modelMarcus from '@/assets/models/model-male-athletic-black.jpg';
import modelElena from '@/assets/models/model-female-athletic-european.jpg';
import modelArjun from '@/assets/models/model-male-slim-indian.jpg';
import modelAmara from '@/assets/models/model-female-plussize-african.jpg';
import modelKenji from '@/assets/models/model-male-athletic-japanese.jpg';
import modelSienna from '@/assets/models/model-female-average-irish.jpg';
import modelWei from '@/assets/models/model-male-average-chinese.jpg';
import modelCharlotte from '@/assets/models/model-female-mature-european.jpg';
import modelDiego from '@/assets/models/model-male-athletic-latino.jpg';
import modelHana from '@/assets/models/model-female-petite-korean.jpg';
import modelMax from '@/assets/models/model-male-plussize-european.jpg';
import modelPriya from '@/assets/models/model-female-athletic-indian.jpg';
import modelErik from '@/assets/models/model-male-slim-nordic.jpg';
import modelIsabella from '@/assets/models/model-female-plussize-latina.jpg';
import modelCallum from '@/assets/models/model-male-athletic-scottish.jpg';
import modelAstrid from '@/assets/models/model-female-average-nordic.jpg';
import modelCarlos from '@/assets/models/model-male-average-latino.jpg';
import modelMadison from '@/assets/models/model-female-slim-american-blonde.jpg';
import modelJake from '@/assets/models/model-male-athletic-american.jpg';
import modelOlivia from '@/assets/models/model-female-athletic-american-brunette.jpg';
import modelTyler from '@/assets/models/model-male-slim-american-blonde.jpg';
import modelAubrey from '@/assets/models/model-female-average-american-redhead.jpg';
import modelJordan from '@/assets/models/model-male-athletic-american-mixed.jpg';
import modelZoe from '@/assets/models/model-female-athletic-american-black.jpg';
import modelBrandon from '@/assets/models/model-male-average-american-beard.jpg';
import modelValeria from '@/assets/models/model-female-slim-american-latina.jpg';
import modelRyan from '@/assets/models/model-male-athletic-american-classic.jpg';

// Additional models for fuller rows
import modelNiamh from '@/assets/models/model-female-athletic-mixed.jpg';
import modelAisha from '@/assets/models/model-female-average-african.jpg';
import modelSophie from '@/assets/models/model-female-average-european.jpg';
import modelLeila from '@/assets/models/model-female-average-middleeast.jpg';
import modelMei from '@/assets/models/model-female-slim-chinese.jpg';
import modelFreya from '@/assets/models/model-female-slim-nordic.jpg';
import modelSakura from '@/assets/models/model-female-plussize-japanese.jpg';
import modelFatima from '@/assets/models/model-female-plussize-middleeast.jpg';
import modelLuca from '@/assets/models/model-male-athletic-european.jpg';
import modelJamal from '@/assets/models/model-male-athletic-mixed.jpg';
import modelHiro from '@/assets/models/model-male-average-asian.jpg';
import modelKwame from '@/assets/models/model-male-plussize-african.jpg';
import modelMarco from '@/assets/models/model-male-plussize-latino.jpg';
import modelOmar from '@/assets/models/model-male-slim-middleeast.jpg';
import modelCamila from '@/assets/models/model-female-athletic-latina.jpg';
import modelNadia from '@/assets/models/model-female-athletic-black.jpg';
import modelSophie2 from '@/assets/models/model-female-average-middleeast.jpg';

interface ModelCard {
  name: string;
  image: string;
}

// 22 unique models in row 1 — no overlap with row 2
const ROW_1: ModelCard[] = [
  { name: 'Madison', image: modelMadison },
  { name: 'Marcus', image: modelMarcus },
  { name: 'Olivia', image: modelOlivia },
  { name: 'Arjun', image: modelArjun },
  { name: 'Zoe', image: modelZoe },
  { name: 'Luca', image: modelLuca },
  { name: 'Elena', image: modelElena },
  { name: 'Tyler', image: modelTyler },
  { name: 'Amara', image: modelAmara },
  { name: 'Ryan', image: modelRyan },
  { name: 'Yuki', image: modelYuki },
  { name: 'Brandon', image: modelBrandon },
  { name: 'Mei', image: modelMei },
  { name: 'Kenji', image: modelKenji },
  { name: 'Aubrey', image: modelAubrey },
  { name: 'Omar', image: modelOmar },
  { name: 'Niamh', image: modelNiamh },
  { name: 'Kwame', image: modelKwame },
  { name: 'Sophie', image: modelSophie },
  { name: 'Hiro', image: modelHiro },
  { name: 'Camila', image: modelCamila },
  { name: 'Marco', image: modelMarco },
];

// 22 unique models in row 2
const ROW_2: ModelCard[] = [
  { name: 'Jordan', image: modelJordan },
  { name: 'Sienna', image: modelSienna },
  { name: 'Diego', image: modelDiego },
  { name: 'Valeria', image: modelValeria },
  { name: 'Wei', image: modelWei },
  { name: 'Charlotte', image: modelCharlotte },
  { name: 'Hana', image: modelHana },
  { name: 'Max', image: modelMax },
  { name: 'Priya', image: modelPriya },
  { name: 'Erik', image: modelErik },
  { name: 'Isabella', image: modelIsabella },
  { name: 'Callum', image: modelCallum },
  { name: 'Aisha', image: modelAisha },
  { name: 'Carlos', image: modelCarlos },
  { name: 'Freya', image: modelFreya },
  { name: 'Jamal', image: modelJamal },
  { name: 'Sakura', image: modelSakura },
  { name: 'Nadia', image: modelNadia },
  { name: 'Astrid', image: modelAstrid },
  { name: 'Leila', image: modelLeila },
  { name: 'Fatima', image: modelFatima },
  { name: 'Jake', image: modelJake },
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
              <img
                src={model.image}
                alt={model.name}
                className="w-full h-full object-cover object-top"
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
            44+ AI Models
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
