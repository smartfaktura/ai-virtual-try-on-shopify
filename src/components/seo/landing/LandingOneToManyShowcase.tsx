import { getOptimizedUrl } from '@/lib/imageOptimization';
import type { LucideIcon } from 'lucide-react';

const PREVIEW = (id: string) =>
  `https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/${id}.jpg`;

export interface OneToManyItem {
  title: string;
  text: string;
  Icon: LucideIcon;
  imageIds: [string, string, string];
}

export interface LandingOneToManyShowcaseProps {
  eyebrow: string;
  headline: string;
  intro?: string;
  items: OneToManyItem[];
  background?: 'background' | 'soft';
}

export function LandingOneToManyShowcase({
  eyebrow,
  headline,
  intro,
  items,
  background = 'soft',
}: LandingOneToManyShowcaseProps) {
  const bg = background === 'soft' ? 'bg-[#f5f5f3]' : 'bg-background';
  return (
    <section className={`py-16 lg:py-32 ${bg}`}>
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-14 lg:mb-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            {eyebrow}
          </p>
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
            {headline}
          </h2>
          {intro && (
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">{intro}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {items.map(({ title, text, Icon, imageIds }) => (
            <div
              key={title}
              className="group bg-white rounded-3xl border border-[#f0efed] shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative aspect-[5/3] bg-muted/30 p-1.5">
                <div className="absolute inset-1.5 grid grid-cols-3 gap-1.5">
                  {imageIds.map((id, idx) => (
                    <div key={`${id}-${idx}`} className="relative overflow-hidden rounded-xl bg-muted/40">
                      <img
                        src={getOptimizedUrl(PREVIEW(id), { quality: 60 })}
                        alt={`${title} — example ${idx + 1}`}
                        width={400}
                        height={400}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 lg:p-6 flex items-start gap-3">
                <div className="w-10 h-10 shrink-0 rounded-2xl bg-[#1a1a2e] text-white flex items-center justify-center shadow-sm">
                  <Icon size={18} strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-[#1a1a2e] text-base font-semibold leading-tight">{title}</h3>
                  <p className="text-[#6b7280] text-sm leading-snug mt-1">{text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
