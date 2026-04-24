import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Check } from 'lucide-react';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const SUPABASE_PUBLIC =
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public';

const settings = [
  'Scene · Mid-century lounge',
  'Lighting · Soft warm daylight',
  'Palette · Olive, cream, walnut',
  'Composition · Editorial wide',
  'Mood · Quiet luxury',
];

const points = [
  'One scene, infinite products',
  'Identical lighting and composition every time',
  'Catalog-wide visual consistency without re-shoots',
];

// Same scene ("Mid-century modern lounge") rendered with 4 different products
const consistentSet = [
  { src: `${SUPABASE_PUBLIC}/freestyle-images/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/46ac001d-4973-4d6d-a2a9-6df9f42ec685.png`, label: 'Minimalist Elegance' },
  { src: `${SUPABASE_PUBLIC}/freestyle-images/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/45ce1281-da04-429e-b661-34877e664516.jpg`, label: 'Sculptural Serenity' },
  { src: `${SUPABASE_PUBLIC}/tryon-images/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/5f0fd146-fc8d-43a4-a30e-1abbe67f4512.png`, label: 'Olive Set' },
  { src: `${SUPABASE_PUBLIC}/tryon-images/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/cd8b0f5c-4d27-4291-886b-5347b5a3417f.png`, label: 'Effortless Elegance' },
];

export function HomeOnBrand() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-16 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            One scene, every product — perfectly on‑brand
          </h2>
          <p className="text-[#6b7280] text-lg leading-relaxed">
            Lock your visual direction once. Every new product drops into the same scene, lighting, and mood — so your catalog always looks like one brand.
          </p>
        </div>

        <div
          ref={ref}
          className={`grid lg:grid-cols-2 gap-10 lg:gap-20 items-center transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Left — Brand settings panel */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#f0efed] p-6 sm:p-8">
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
            {consistentSet.map((item, i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-2xl overflow-hidden shadow-sm border border-white/60 bg-muted/30 relative"
              >
                <img
                  src={getOptimizedUrl(item.src, { quality: 60 })}
                  alt={item.label}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
