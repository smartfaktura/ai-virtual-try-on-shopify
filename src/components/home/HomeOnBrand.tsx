import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Check } from 'lucide-react';

const settings = [
  'Tone · Clean & editorial',
  'Background · Warm white',
  'Composition · Centered',
  'Lighting · Soft diffused',
  'Direction · Lifestyle premium',
];

const points = [
  'Consistent backgrounds and tone',
  'Repeatable output across products',
  'Easier approvals for teams and brands',
];

export function HomeOnBrand() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            Keep every visual on‑brand
          </h2>
          <p className="text-[#6b7280] text-lg leading-relaxed">
            Save your visual direction once, then create content that stays consistent across products, campaigns, and channels.
          </p>
        </div>

        <div
          ref={ref}
          className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Left — Brand settings panel mock */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#f0efed] p-8">
            <p className="text-[13px] font-medium text-[#475569] uppercase tracking-wide mb-5">
              Visual direction
            </p>
            <div className="space-y-3">
              {settings.map((s) => (
                <div
                  key={s}
                  className="flex items-center gap-3 py-2.5 px-4 rounded-xl bg-[#FAFAF8] text-sm text-[#1a1a2e]"
                >
                  <div className="w-2 h-2 rounded-full bg-[#475569]" />
                  {s}
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-2.5">
              {points.map((p) => (
                <div key={p} className="flex items-center gap-2 text-sm text-[#6b7280]">
                  <Check size={14} className="text-[#475569]" />
                  {p}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Consistent output grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              'from-amber-50 to-orange-50',
              'from-rose-50 to-pink-50',
              'from-amber-50 to-yellow-50',
              'from-orange-50 to-amber-50',
            ].map((c, i) => (
              <div
                key={i}
                className={`aspect-[3/4] rounded-2xl bg-gradient-to-br ${c} shadow-sm`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
