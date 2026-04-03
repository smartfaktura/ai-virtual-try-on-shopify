import { useScrollReveal } from '@/hooks/useScrollReveal';
import { ArrowRight } from 'lucide-react';

const steps = [
  { label: 'Original', color: 'from-[#f5f0eb] to-[#e8e3dd]' },
  { label: 'Product page', color: 'from-amber-50 to-orange-50' },
  { label: 'Social ad', color: 'from-rose-50 to-pink-50' },
  { label: 'Lifestyle', color: 'from-emerald-50 to-teal-50' },
  { label: 'Video', color: 'from-sky-50 to-blue-50' },
];

export function HomeTransformStrip() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-24 lg:py-32 bg-[#f5f5f3]" id="examples">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            From one product photo to every asset you need
          </h2>
          <p className="text-[#6b7280] text-lg leading-relaxed">
            Use the same product to create clean store images, social creatives, campaign visuals, and short videos.
          </p>
        </div>

        <div
          ref={ref}
          className="flex flex-wrap lg:flex-nowrap items-center justify-center gap-4 lg:gap-3"
        >
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-3">
              <div
                className={`w-44 h-56 sm:w-48 sm:h-60 rounded-2xl bg-gradient-to-br ${step.color} shadow-sm flex flex-col items-center justify-end p-4 transition-all duration-700 ${
                  visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <span className="text-xs font-medium text-[#475569] bg-white/80 backdrop-blur px-2.5 py-1 rounded-md">
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight size={16} className="text-[#cbd5e1] hidden lg:block shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
