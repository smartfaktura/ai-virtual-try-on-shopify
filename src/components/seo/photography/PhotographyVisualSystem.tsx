import { ShoppingBag, Sparkles, Instagram, Megaphone, ZoomIn, Camera } from 'lucide-react';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { useSeoVisualOverridesMap } from '@/hooks/useSeoVisualOverrides';
import { resolveSlotImageUrl } from '@/lib/resolveSlotImage';

const PAGE_ROUTE = '/ai-product-photography';

const PREVIEW = (id: string) =>
  `https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/${id}.jpg`;

// 3 on-topic vertical previews per output type. The slug below MUST match
// the slug used by buildVisualSystemSlots() in seoPageVisualSlots.ts so admin
// overrides resolve correctly.
const items = [
  {
    title: 'Product page',
    slug: 'product_page',
    text: 'Clean PDP hero shots.',
    Icon: ShoppingBag,
    imageIds: ['1776770347820-s3qwmr', '1776841027943-vetumj', '1776664933175-rjlbn6'],
  },
  {
    title: 'Lifestyle',
    slug: 'lifestyle',
    text: 'Editorial real-world scenes.',
    Icon: Sparkles,
    imageIds: ['1776664924644-8pmju4', '1776524131703-gvh4bb', '1776524128011-dcnlpo'],
  },
  {
    title: 'Social content',
    slug: 'social_content',
    text: 'IG, TikTok & Pinterest ready.',
    Icon: Instagram,
    imageIds: ['1776691906436-3fe7l9', '1776102190563-dioke2', '1776691907477-77vt46'],
  },
  {
    title: 'Paid ads',
    slug: 'paid_ads',
    text: 'High-CTR Meta & Google creative.',
    Icon: Megaphone,
    imageIds: ['1776102204479-9rlc0n', '1776606017719-zzhgy7', '1776239826550-uaopmt'],
  },
  {
    title: 'Detail shots',
    slug: 'detail_shots',
    text: 'Macro texture & craftsmanship.',
    Icon: ZoomIn,
    imageIds: ['1776243905045-8aw72b', '1776244136599-8gw62e', '1776243682026-h1itvm'],
  },
  {
    title: 'Campaigns',
    slug: 'campaigns',
    text: 'Seasonal launches & brand stories.',
    Icon: Camera,
    imageIds: ['1776524132929-q8upyp', '1776574228066-oyklfz', '1776018020221-aehe8n'],
  },
];

export function PhotographyVisualSystem() {
  const overrides = useSeoVisualOverridesMap();

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
          {items.map(({ title, slug, text, Icon, imageIds }) => {
            const thumbs = imageIds.map((id, idx) => {
              const slotKey = `visualSystem_${slug}_${idx + 1}`;
              return resolveSlotImageUrl(overrides, PAGE_ROUTE, slotKey, PREVIEW(id));
            });
            return (
              <div
                key={title}
                className="group bg-white rounded-3xl border border-[#f0efed] shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative aspect-[5/3] bg-muted/30 p-1.5">
                  <div className="absolute inset-1.5 grid grid-cols-3 gap-1.5">
                    {thumbs.map((src, idx) => (
                      <div
                        key={`${title}-${idx}`}
                        className="relative overflow-hidden rounded-xl bg-muted/40"
                      >
                        <img
                          src={getOptimizedUrl(src, { quality: 60 })}
                          alt={`${title} — AI product photography example ${idx + 1}`}
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
