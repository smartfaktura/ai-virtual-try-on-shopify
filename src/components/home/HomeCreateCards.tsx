import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Button } from '@/components/ui/button';
import { getOptimizedUrl, getResizedSrcSet } from '@/lib/imageOptimization';
import productVideoLoop from '@/assets/home-create-product-videos.mp4';

const SUPABASE_PUBLIC =
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads';
const PREVIEW = (id: string) =>
  `${SUPABASE_PUBLIC}/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/${id}.jpg`;

type CardData =
  | { title: string; text: string; type: 'image'; image: string }
  | { title: string; text: string; type: 'video'; video: string };

type CardWithLink = CardData & { linkLabel?: string; linkTo?: string };

const cards: CardWithLink[] = [
  {
    title: 'Product page images',
    text: 'Clean, high-converting visuals for Shopify, Amazon, and product pages.',
    image: PREVIEW('1776688965090-edaogg'),
    type: 'image',
    linkLabel: 'Explore AI product photography',
    linkTo: '/ai-product-photography',
  },
  {
    title: 'Social & ad creatives',
    text: 'Campaign-ready visuals for Instagram, Meta ads, launches, and promotions.',
    image: PREVIEW('1776689318257-yahkye'),
    type: 'image',
    linkLabel: 'Create Shopify product photos',
    linkTo: '/shopify-product-photography-ai',
  },
  {
    title: 'Product videos',
    text: 'Short motion content for reels, ads, and product storytelling.',
    video: productVideoLoop,
    type: 'video',
  },
];

function CardVisual({ card }: { card: CardData }) {
  if (card.type === 'video') {
    return (
      <div className="relative aspect-[4/5] overflow-hidden bg-muted/30">
        <video
          src={card.video}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    );
  }
  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-muted/30">
      <img
        src={getOptimizedUrl(card.image, { width: 960, height: 1200, quality: 72, resize: 'cover' })}
        srcSet={getResizedSrcSet(card.image, { widths: [480, 720, 960], aspect: [4, 5], quality: 72 })}
        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 440px"
        alt={card.title}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}

export function HomeCreateCards() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-16 lg:py-32 bg-background">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            What you can create
          </p>
          <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
            What do you want to create first?
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Pick the format you need most. Reuse the same product image for everything else.
          </p>
        </div>

        <div ref={ref} className="grid sm:grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <div
              key={card.title}
              className={`group bg-white rounded-3xl shadow-sm border border-[#f0efed] overflow-hidden transition-all duration-700 hover:-translate-y-1 hover:shadow-md ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <CardVisual card={card} />
              <div className="p-6 lg:p-8">
                <h3 className="text-foreground text-xl font-semibold mb-2">{card.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{card.text}</p>
                {card.linkTo && card.linkLabel && (
                  <Link
                    to={card.linkTo}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {card.linkLabel}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Single CTA */}
        <div className="flex flex-col items-center gap-3 mt-12 lg:mt-16">
          <Button asChild size="lg" className="rounded-full h-[3.25rem] px-8 text-base font-semibold shadow-lg shadow-primary/25">
            <Link to="/auth">
              Start creating free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            Free credits · No card required
          </p>
        </div>
      </div>
    </section>
  );
}
