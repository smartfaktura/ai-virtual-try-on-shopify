import { useScrollReveal } from '@/hooks/useScrollReveal';
import { ArrowRight, Play } from 'lucide-react';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const SUPABASE_PUBLIC =
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads';
const PREVIEW = (id: string) =>
  `${SUPABASE_PUBLIC}/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/${id}.jpg`;

const cards = [
  {
    title: 'Product page images',
    text: 'Clean, high-converting visuals for Shopify, Amazon, and product pages.',
    cta: 'Explore product images',
    image: PREVIEW('1776688965090-edaogg'), // On-Model Front (dress studio)
    type: 'image' as const,
  },
  {
    title: 'Social & ad creatives',
    text: 'Campaign-ready visuals for Instagram, Meta ads, launches, and promotions.',
    cta: 'Explore ad creatives',
    image: PREVIEW('1776689318257-yahkye'), // Flash Night Fashion Campaign
    type: 'image' as const,
  },
  {
    title: 'Product videos',
    text: 'Short motion content for reels, ads, and product storytelling.',
    cta: 'Explore videos',
    image: PREVIEW('1776843776495-iyiigl'), // Earthy Botanicals (rich, premium)
    type: 'video' as const,
  },
];

function CardVisual({ image, type, alt }: { image: string; type: 'image' | 'video'; alt: string }) {
  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-muted/30">
      <img
        src={getOptimizedUrl(image, { quality: 60 })}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {type === 'video' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/90 shadow-lg flex items-center justify-center backdrop-blur-sm">
            <Play size={22} className="text-[#1a1a2e] ml-0.5" fill="currentColor" />
          </div>
        </div>
      )}
    </div>
  );
}

export function HomeCreateCards() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-16 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            What do you want to create first?
          </h2>
          <p className="text-[#6b7280] text-lg leading-relaxed">
            Start with the format you need most, then expand into more content from the same product.
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
              <CardVisual image={card.image} type={card.type} alt={card.title} />
              <div className="p-6 lg:p-8">
                <h3 className="text-[#1a1a2e] text-xl font-semibold mb-2">{card.title}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed mb-5">{card.text}</p>
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#475569] hover:text-[#1a1a2e] transition-colors"
                >
                  {card.cta}
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
