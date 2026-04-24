import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Zap, Layers, TrendingUp } from 'lucide-react';

const cards = [
  {
    icon: Zap,
    title: 'Faster than organizing a new shoot',
    text: 'No studio booking, no reshoots, no waiting weeks for final assets.',
  },
  {
    icon: Layers,
    title: 'Easier than building everything manually',
    text: 'Generate multiple directions quickly instead of editing each visual from scratch.',
  },
  {
    icon: TrendingUp,
    title: 'More scalable for launches and campaigns',
    text: 'Create fresh content across product pages, ads, and social from the same product image.',
  },
];

export function HomeWhySwitch() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-16 lg:py-32 bg-[#1a1a2e]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <h2 className="text-white text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            Built to replace slow content production
          </h2>
          <p className="text-[#9ca3af] text-lg leading-relaxed">
            Generate new product visuals in minutes — no shoots, no edits, no waiting.
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <div
              key={card.title}
              className={`bg-white/5 border border-white/10 rounded-3xl p-7 sm:p-8 lg:p-10 transition-all duration-700 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-white/5 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center mb-5">
                <card.icon size={20} className="text-[#94a3b8]" />
              </div>
              <h3 className="text-white text-lg font-semibold mb-3">{card.title}</h3>
              <p className="text-[#9ca3af] text-sm leading-relaxed">{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
