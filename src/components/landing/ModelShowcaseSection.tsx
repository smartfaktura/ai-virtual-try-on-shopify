import { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';

// Models — diverse selection alternating gender, body type, ethnicity, age
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

interface ModelCard {
  name: string;
  image: string;
}

const ROW_1: ModelCard[] = [
  { name: 'Yuki', image: modelYuki },
  { name: 'Marcus', image: modelMarcus },
  { name: 'Elena', image: modelElena },
  { name: 'Arjun', image: modelArjun },
  { name: 'Amara', image: modelAmara },
  { name: 'Kenji', image: modelKenji },
  { name: 'Sienna', image: modelSienna },
  { name: 'Wei', image: modelWei },
  { name: 'Charlotte', image: modelCharlotte },
];

const ROW_2: ModelCard[] = [
  { name: 'Diego', image: modelDiego },
  { name: 'Hana', image: modelHana },
  { name: 'Max', image: modelMax },
  { name: 'Priya', image: modelPriya },
  { name: 'Erik', image: modelErik },
  { name: 'Isabella', image: modelIsabella },
  { name: 'Callum', image: modelCallum },
  { name: 'Astrid', image: modelAstrid },
  { name: 'Carlos', image: modelCarlos },
];

function MarqueeRow({ items, direction = 'left', speed = 35 }: { items: ModelCard[]; direction?: 'left' | 'right'; speed?: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationId: number;
    let position = 0;
    const totalWidth = el.scrollWidth / 2; // we duplicate items

    const step = () => {
      position += direction === 'left' ? 0.5 : -0.5;
      if (direction === 'left' && position >= totalWidth) position = 0;
      if (direction === 'right' && position <= -totalWidth) position = 0;
      el.style.transform = `translateX(${direction === 'left' ? -position : -position + totalWidth}px)`;
      animationId = requestAnimationFrame(step);
    };

    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [direction]);

  // Duplicate items for seamless loop
  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden">
      <div ref={scrollRef} className="flex gap-4 will-change-transform" style={{ width: 'max-content' }}>
        {doubled.map((model, i) => (
          <div key={`${model.name}-${i}`} className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="w-28 h-36 sm:w-32 sm:h-40 lg:w-36 lg:h-44 rounded-xl overflow-hidden border border-border bg-card shadow-sm">
              <img
                src={model.image}
                alt={model.name}
                className="w-full h-full object-cover object-top"
                loading="lazy"
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
    <section className="py-20 lg:py-28 bg-muted/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center">
          <Badge variant="secondary" className="mb-4 text-xs tracking-wide uppercase">
            34+ AI Models
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Professional Models. Every Look.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Diverse models across every body type, ethnicity, and age — ready for your next campaign.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <MarqueeRow items={ROW_1} direction="left" />
        <MarqueeRow items={ROW_2} direction="right" />
      </div>
    </section>
  );
}
