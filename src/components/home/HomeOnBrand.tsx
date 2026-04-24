import { useScrollReveal } from '@/hooks/useScrollReveal';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const SUPABASE_PUBLIC =
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public';

const settings = [
  'Scene · Amber Glow Studio',
  'Lighting · Warm directional spotlight',
  'Palette · Amber, charcoal, cream',
  'Composition · Centered hero',
  'Mood · Editorial luxury',
];

// Same scene ("Amber Glow Studio") rendered with 4 different products
const consistentSet = [
  { src: `${SUPABASE_PUBLIC}/freestyle-images/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/2026-04-02_8de3c91b-4553-4517-971f-a06e4ace4fb4.jpg`, label: 'Obsidian Veil Fragrance' },
  { src: `${SUPABASE_PUBLIC}/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/1776835737956-an8971.jpg`, label: 'Amber Studio Frost' },
  { src: `${SUPABASE_PUBLIC}/freestyle-images/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/702a108f-1262-428c-a921-c7525aaf19bd.png`, label: 'Bleu de Chanel' },
  { src: `${SUPABASE_PUBLIC}/freestyle-images/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/2026-04-02_aac4c8f5-2c3f-4065-964a-383453499f36.jpg`, label: 'Suede Shoulder Bag' },
];

export function HomeOnBrand() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-16 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            One scene, every product.
          </h2>
          <p className="text-[#6b7280] text-lg leading-relaxed">
            Lock the look once. Every product drops into the same scene.
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
          </div>

          {/* Right — Consistent output grid */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
              Same scene · 4 products
            </p>
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
      </div>
    </section>
  );
}
