import { useScrollReveal } from '@/hooks/useScrollReveal';
import { ArrowRight, Play } from 'lucide-react';

const cards = [
  {
    title: 'Product page images',
    text: 'Clean, high-converting visuals for Shopify, Amazon, and product pages.',
    cta: 'Explore product images',
    gradient: 'from-amber-50 to-orange-50',
    innerType: 'product' as const,
  },
  {
    title: 'Social & ad creatives',
    text: 'Campaign-ready visuals for Instagram, Meta ads, launches, and promotions.',
    cta: 'Explore ad creatives',
    gradient: 'from-rose-50 to-pink-50',
    innerType: 'social' as const,
  },
  {
    title: 'Product videos',
    text: 'Short motion content for reels, ads, and product storytelling.',
    cta: 'Explore videos',
    gradient: 'from-sky-50 to-blue-50',
    innerType: 'video' as const,
  },
];

function CardVisual({ type, gradient }: { type: 'product' | 'social' | 'video'; gradient: string }) {
  if (type === 'product') {
    return (
      <div className={`h-72 sm:h-80 bg-gradient-to-br ${gradient} relative flex items-center justify-center overflow-hidden`}>
        {/* Centered product on white card */}
        <div className="w-40 h-52 rounded-2xl bg-white/80 shadow-lg shadow-black/5 border border-white flex items-center justify-center">
          <div className="w-14 h-24 rounded-xl bg-gradient-to-b from-[#e8e3dd] to-[#d4cfc8] shadow-inner opacity-70" />
        </div>
        {/* Secondary floating card */}
        <div className="absolute -bottom-3 -right-3 w-24 h-32 rounded-xl bg-white/60 backdrop-blur border border-white/40 shadow-md rotate-6" />
      </div>
    );
  }
  if (type === 'social') {
    return (
      <div className={`h-72 sm:h-80 bg-gradient-to-br ${gradient} relative flex items-center justify-center overflow-hidden`}>
        {/* Square social format */}
        <div className="w-44 h-44 rounded-2xl bg-white/70 shadow-lg shadow-black/5 border border-white/60 flex flex-col items-center justify-center gap-3 p-4">
          <div className="w-12 h-18 rounded-lg bg-gradient-to-b from-rose-200/60 to-rose-100/40 shadow-inner" />
          <div className="space-y-1.5 w-full">
            <div className="h-2 w-3/4 mx-auto rounded-full bg-[#1a1a2e]/10" />
            <div className="h-2 w-1/2 mx-auto rounded-full bg-[#1a1a2e]/6" />
          </div>
        </div>
        {/* Overlap card */}
        <div className="absolute top-8 -left-2 w-20 h-28 rounded-xl bg-white/40 backdrop-blur border border-white/30 shadow-sm -rotate-6" />
      </div>
    );
  }
  return (
    <div className={`h-72 sm:h-80 bg-gradient-to-br ${gradient} relative flex items-center justify-center overflow-hidden`}>
      {/* 16:9 video frame */}
      <div className="w-52 h-32 rounded-2xl bg-white/70 shadow-lg shadow-black/5 border border-white/60 flex items-center justify-center relative">
        <div className="w-12 h-12 rounded-full bg-white/90 shadow-md flex items-center justify-center">
          <Play size={18} className="text-[#475569] ml-0.5" fill="currentColor" />
        </div>
        {/* Timeline bar */}
        <div className="absolute bottom-3 left-4 right-4 h-1 rounded-full bg-[#1a1a2e]/10">
          <div className="h-full w-1/3 rounded-full bg-[#475569]/40" />
        </div>
      </div>
    </div>
  );
}

export function HomeCreateCards() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            What do you want to create first?
          </h2>
          <p className="text-[#6b7280] text-lg leading-relaxed">
            Start with the format you need most, then expand into more content from the same product.
          </p>
        </div>

        <div ref={ref} className="grid md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <div
              key={card.title}
              className={`group bg-white rounded-3xl shadow-sm border border-[#f0efed] overflow-hidden transition-all duration-700 hover:-translate-y-1 hover:shadow-md ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <CardVisual type={card.innerType} gradient={card.gradient} />
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
