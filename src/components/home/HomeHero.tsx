import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const outputCards = [
  { label: 'Product page', rotation: '-rotate-3', pos: '-top-4 -left-4', color: 'from-amber-100 to-orange-50' },
  { label: 'Social ad', rotation: 'rotate-2', pos: '-top-4 -right-4', color: 'from-rose-100 to-pink-50' },
  { label: 'Lifestyle', rotation: '-rotate-2', pos: '-bottom-4 -left-4', color: 'from-emerald-100 to-teal-50' },
  { label: 'Video', rotation: 'rotate-3', pos: '-bottom-4 -right-4', color: 'from-sky-100 to-blue-50' },
];

export function HomeHero() {
  return (
    <section className="pt-28 pb-20 lg:pt-36 lg:pb-28">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
        {/* Left — Copy */}
        <div className="max-w-xl">
          <p className="text-[13px] font-medium text-[#475569] tracking-wide uppercase mb-4">
            AI product images &amp; videos for ecommerce brands
          </p>
          <h1 className="text-[#1a1a2e] text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.1] font-semibold tracking-tight mb-6">
            Turn one product photo into ready‑to‑use product images, ads, and videos
          </h1>
          <p className="text-[#6b7280] text-lg leading-relaxed mb-8 max-w-md">
            Create ecommerce visuals, social creatives, and short product videos in minutes — without booking another shoot.
          </p>

          <div className="flex flex-wrap gap-3 mb-4">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-[#1a1a2e] text-white text-[15px] font-medium hover:bg-[#2a2a3e] transition-colors"
            >
              Try it on my product
              <ArrowRight size={16} />
            </Link>
            <a
              href="#examples"
              className="inline-flex items-center gap-2 h-12 px-7 rounded-xl border border-[#d4d4d4] text-[#1a1a2e] text-[15px] font-medium hover:bg-[#f5f5f3] transition-colors"
            >
              See real examples
            </a>
          </div>
          <p className="text-[13px] text-[#9ca3af]">
            20 free credits · No credit card required
          </p>
        </div>

        {/* Right — Visual */}
        <div className="relative flex items-center justify-center">
          {/* Center card — Original */}
          <div className="relative z-10 w-52 h-64 rounded-2xl bg-gradient-to-br from-[#f5f0eb] to-[#e8e3dd] shadow-xl flex items-end p-4">
            <span className="text-xs font-medium text-[#6b7280] bg-white/80 backdrop-blur px-2.5 py-1 rounded-md">
              Original
            </span>
          </div>

          {/* Output cards */}
          {outputCards.map((card) => (
            <div
              key={card.label}
              className={`absolute z-20 w-36 h-44 rounded-2xl bg-gradient-to-br ${card.color} shadow-lg ${card.rotation} ${card.pos} flex items-end p-3 transition-transform hover:scale-105`}
            >
              <span className="text-[11px] font-medium text-[#475569] bg-white/80 backdrop-blur px-2 py-0.5 rounded-md">
                {card.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
