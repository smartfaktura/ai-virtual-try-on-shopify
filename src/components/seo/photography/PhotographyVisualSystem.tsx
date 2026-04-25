import { ShoppingBag, Sparkles, Instagram, Megaphone, ZoomIn, Camera } from 'lucide-react';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const PREVIEW = (id: string) =>
  `https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/${id}.jpg`;

const items = [
  { title: 'Product page',   text: 'Clean PDP hero shots.',                Icon: ShoppingBag, imageId: '1776770347820-s3qwmr' },
  { title: 'Lifestyle',      text: 'Editorial real-world scenes.',         Icon: Sparkles,    imageId: '1776664924644-8pmju4' },
  { title: 'Social content', text: 'IG, TikTok & Pinterest ready.',        Icon: Instagram,   imageId: '1776691906436-3fe7l9' },
  { title: 'Paid ads',       text: 'High-CTR Meta & Google creative.',     Icon: Megaphone,   imageId: '1776102204479-9rlc0n' },
  { title: 'Detail shots',   text: 'Macro texture & craftsmanship.',       Icon: ZoomIn,      imageId: '1776243905045-8aw72b' },
  { title: 'Campaigns',      text: 'Seasonal launches & brand stories.',   Icon: Camera,      imageId: '1776524132929-q8upyp' },
];

export function PhotographyVisualSystem() {
  return (
    <section className="py-16 lg:py-32 bg-[#f5f5f3]">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-14 lg:mb-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            One photo · Many outputs
          </p>
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
            One product photo. A full visual system.
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Upload once. Generate every visual you need.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {items.map(({ title, text, Icon, imageId }) => (
            <div
              key={title}
              className="group bg-white rounded-3xl border border-[#f0efed] shadow-sm overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-[16/10] bg-muted/30 overflow-hidden">
                <img
                  src={getOptimizedUrl(PREVIEW(imageId), { quality: 60 })}
                  alt={`${title} — AI product photography example`}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <div className="p-5 lg:p-6 flex items-start gap-3">
                <div className="w-9 h-9 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon size={16} strokeWidth={1.75} />
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
