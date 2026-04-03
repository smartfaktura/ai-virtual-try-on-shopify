import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Camera, ShoppingBag, Megaphone, Sparkles, Play } from 'lucide-react';

const steps = [
  { label: 'Original', icon: Camera, color: 'from-[#e8e3dd] to-[#d8d3cb]', silhouette: true },
  { label: 'Product page', icon: ShoppingBag, color: 'from-amber-100 to-orange-50' },
  { label: 'Social ad', icon: Megaphone, color: 'from-rose-100 to-pink-50' },
  { label: 'Lifestyle', icon: Sparkles, color: 'from-emerald-100 to-teal-50' },
  { label: 'Video', icon: Play, color: 'from-sky-100 to-blue-50' },
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
            Use the same product to create store images, social creatives, campaign visuals, and short videos.
          </p>
        </div>

        <div ref={ref} className="flex flex-wrap lg:flex-nowrap items-center justify-center gap-4 lg:gap-2">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              <div
                className={`w-44 h-60 sm:w-48 sm:h-64 rounded-2xl bg-gradient-to-br ${step.color} shadow-sm border border-white/60 flex flex-col items-center justify-between p-5 transition-all duration-700 hover:-translate-y-1 hover:shadow-md ${
                  visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                {/* Inner visual area */}
                <div className="w-full flex-1 rounded-xl bg-white/40 shadow-inner flex items-center justify-center mb-3 relative overflow-hidden">
                  {step.silhouette ? (
                    <div className="w-12 h-20 rounded-lg bg-gradient-to-b from-[#c4bfb7] to-[#b4afaa] opacity-50 shadow-inner" />
                  ) : (
                    <step.icon size={24} className="text-[#94a3b8] opacity-60" />
                  )}
                </div>
                <span className="text-xs font-medium text-[#475569] bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:flex flex-col items-center gap-0.5 shrink-0 mx-1">
                  <div className="w-6 h-px bg-[#cbd5e1]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#cbd5e1]" />
                  <div className="w-6 h-px bg-[#cbd5e1]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
