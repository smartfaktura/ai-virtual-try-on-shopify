import { Link } from 'react-router-dom';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { ArrowRight, Sparkles, Clock, TrendingUp } from 'lucide-react';

const badges = [
  { icon: Sparkles, label: 'Built for ecommerce brands' },
  { icon: Clock, label: 'Fast setup' },
  { icon: TrendingUp, label: 'Upgrade only when needed' },
];

export function HomePricingTeaser() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-16 lg:py-32" id="pricing">
      <div
        ref={ref}
        className={`max-w-2xl mx-auto px-6 text-center transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          Start free, upgrade when you're ready
        </h2>
        <p className="text-[#6b7280] text-lg leading-relaxed mb-2">
          Create your first visuals before choosing a plan.
        </p>
        <p className="text-[13px] text-[#9ca3af] mb-8">
          20 free credits · No credit card required
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 mb-10">
          <Link
            to="/auth"
            className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-[#1a1a2e] text-white text-[15px] font-medium hover:bg-[#2a2a3e] transition-colors w-full sm:w-auto"
          >
            Start free
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/pricing"
            className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full border border-[#d4d4d4] text-[#1a1a2e] text-[15px] font-medium hover:bg-[#f5f5f3] transition-colors w-full sm:w-auto"
          >
            View pricing
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {badges.map((b) => (
            <div key={b.label} className="flex items-center gap-2 text-[13px] text-[#6b7280]">
              <b.icon size={14} className="text-[#475569]" />
              {b.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
