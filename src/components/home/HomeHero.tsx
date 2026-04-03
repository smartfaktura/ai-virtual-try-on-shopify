import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const outputCards = [
  { label: 'Product page', x: '-left-10', y: 'top-4', color: 'from-amber-100/80 to-orange-50/60', rotate: '-rotate-6', delay: '0s' },
  { label: 'Social ad', x: '-right-8', y: 'top-0', color: 'from-rose-100/80 to-pink-50/60', rotate: 'rotate-4', delay: '0.5s' },
  { label: 'Lifestyle', x: '-left-6', y: 'bottom-6', color: 'from-emerald-100/80 to-teal-50/60', rotate: '-rotate-3', delay: '1s' },
  { label: 'Video', x: '-right-10', y: 'bottom-2', color: 'from-sky-100/80 to-blue-50/60', rotate: 'rotate-6', delay: '1.5s' },
];

export function HomeHero() {
  return (
    <section className="pt-28 pb-16 lg:pt-36 lg:pb-24">
      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left — Copy */}
        <div className="max-w-lg">
          <span className="inline-block text-[11px] font-semibold tracking-[0.15em] uppercase text-[#94a3b8] bg-[#f1f0ee] px-3 py-1.5 rounded-full mb-6">
            AI product visuals
          </span>
          <h1 className="text-[#1a1a2e] text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.08] font-semibold tracking-tight mb-5">
            One product photo.<br />
            Every visual you need.
          </h1>
          <p className="text-[#6b7280] text-lg leading-relaxed mb-8 max-w-md">
            Create product images, social creatives, and short videos — without another photoshoot.
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
              See examples
            </a>
          </div>
          <p className="text-[13px] text-[#9ca3af]">
            20 free credits · No credit card required
          </p>
        </div>

        {/* Right — Visual composition */}
        <div className="relative flex items-center justify-center min-h-[420px] lg:min-h-[480px]">
          {/* Ambient glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-80 h-80 rounded-full bg-gradient-to-br from-amber-100/40 to-rose-100/30 blur-3xl" />
          </div>

          {/* Center card — Original product */}
          <div
            className="relative z-10 w-56 h-72 lg:w-64 lg:h-80 rounded-3xl shadow-2xl shadow-black/10 border border-white/60 overflow-hidden"
            style={{ background: 'linear-gradient(145deg, #f5f0eb 0%, #e8e3dd 50%, #ddd8d0 100%)' }}
          >
            {/* Faux product silhouette */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-32 lg:w-24 lg:h-36 rounded-2xl bg-gradient-to-b from-[#d4cfc8] to-[#c4bfb7] shadow-inner opacity-60" />
              <div className="absolute w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-[#c8c3bb] to-[#b8b3ab] shadow-inner opacity-40 -top-2 right-1/4" style={{ filter: 'blur(0.5px)' }} />
            </div>
            {/* Label */}
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <span className="text-xs font-medium text-[#6b7280] bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                Original
              </span>
            </div>
          </div>

          {/* Output cards */}
          {outputCards.map((card) => (
            <div
              key={card.label}
              className={`absolute z-20 w-32 h-40 lg:w-36 lg:h-44 rounded-2xl bg-gradient-to-br ${card.color} backdrop-blur-sm border border-white/50 shadow-lg shadow-black/5 ${card.rotate} ${card.x} ${card.y} flex flex-col items-center justify-center gap-2 transition-transform hover:scale-105`}
              style={{ animation: `heroFloat 4s ease-in-out infinite`, animationDelay: card.delay }}
            >
              {/* Inner faux visual */}
              <div className="w-16 h-20 lg:w-18 lg:h-22 rounded-xl bg-white/40 shadow-inner" />
              <span className="text-[10px] lg:text-[11px] font-medium text-[#475569] bg-white/70 backdrop-blur-sm px-2 py-0.5 rounded-md">
                {card.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
