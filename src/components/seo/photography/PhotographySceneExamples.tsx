import { getOptimizedUrl } from '@/lib/imageOptimization';

const PREVIEW = (id: string) =>
  `https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/${id}.jpg`;

const examples = [
  { label: 'Fashion editorial', category: 'Fashion', src: PREVIEW('1776689318257-yahkye') },
  { label: 'Sneaker streetwear', category: 'Footwear', src: PREVIEW('1776770347820-s3qwmr') },
  { label: 'Skincare bathroom shelf', category: 'Beauty & Skincare', src: PREVIEW('1776018015756-3xfquh') },
  { label: 'Fragrance luxury campaign', category: 'Fragrance', src: PREVIEW('1776018020221-aehe8n') },
  { label: 'Jewelry macro detail', category: 'Jewelry', src: PREVIEW('1776102204479-9rlc0n') },
  { label: 'Bag lifestyle scene', category: 'Bags & Accessories', src: PREVIEW('1776239449949-ygljai') },
  { label: 'Home interior', category: 'Home & Furniture', src: PREVIEW('1776688413055-z73arv') },
  { label: 'Food kitchen scene', category: 'Food & Beverage', src: PREVIEW('1776018027926-ua03bd') },
  { label: 'Supplement wellness scene', category: 'Supplements & Wellness', src: PREVIEW('1776018039712-1hifzr') },
  { label: 'Tech desk setup', category: 'Electronics & Gadgets', src: PREVIEW('1776102181320-jisnae') },
];

export function PhotographySceneExamples() {
  return (
    <section className="py-16 lg:py-32 bg-[#f5f5f3]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Scene examples
          </p>
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
            Explore hundreds of AI product photography scenes
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Choose from clean studio setups, lifestyle interiors, editorial campaigns, seasonal scenes, product detail shots, and category-specific visual directions.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
          {examples.map((ex) => (
            <div
              key={ex.label}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm bg-muted/30"
            >
              <img
                src={getOptimizedUrl(ex.src, { quality: 60 })}
                alt={`AI ${ex.category.toLowerCase()} product photography example: ${ex.label}.`}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/65 via-black/20 to-transparent">
                <span className="block text-[11px] uppercase tracking-wider text-white/70 font-semibold">
                  {ex.category}
                </span>
                <span className="block text-sm text-white font-medium leading-tight mt-0.5">
                  {ex.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <a
            href="#categories"
            className="inline-flex items-center justify-center gap-2 h-[3rem] px-7 rounded-full border border-border bg-white text-foreground text-sm font-semibold hover:bg-secondary transition-colors"
          >
            Explore product categories
          </a>
        </div>
      </div>
    </section>
  );
}
