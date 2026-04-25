import { getOptimizedUrl } from '@/lib/imageOptimization';
import { Check } from 'lucide-react';

const PREVIEW = (id: string) =>
  `https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/${id}.jpg`;

const ROWS = [
  {
    eyebrow: 'Step 1',
    title: 'Smart product analysis',
    description:
      'Upload one photo and AI reads the category, materials, packaging, and brand cues automatically. No tagging, no setup.',
    bullets: [
      'Detects 70+ visual tokens per product',
      'Locks color, texture, and packaging fidelity',
      'Routes to the right scene library for your category',
    ],
    image: PREVIEW('1776688965090-edaogg'),
    alt: 'AI analyzing a product photo to extract category and visual tokens',
  },
  {
    eyebrow: 'Step 2',
    title: 'Pick your visual direction',
    description:
      'Browse 1600+ ready-made scenes across studio, lifestyle, editorial, and campaign styles. Or train a brand model and lock your aesthetic across every shot.',
    bullets: [
      '1600+ scenes across 35+ categories',
      '40+ ready-to-shoot AI models, all body types',
      'Custom aspect ratios for product page, ads, and social',
    ],
    image: PREVIEW('1776689318257-yahkye'),
    alt: 'Selecting from a grid of editorial, studio, and lifestyle scenes',
  },
  {
    eyebrow: 'Step 3',
    title: 'Brand-grade generation',
    description:
      'Multi-model generation pipeline ships visuals at 2K resolution with consistent product, color, and model identity across every output.',
    bullets: [
      '2K resolution, lossless output',
      'Consistent model and product across the whole set',
      'Triple-fallback engine so jobs never get stuck',
    ],
    image: PREVIEW('1776840733386-n4bc6x'),
    alt: 'A grid of brand-ready generated product images',
  },
];

export function HowItWorksDeepDive() {
  return (
    <section className="py-16 lg:py-32 bg-background">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Behind each step
          </p>
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
            What's actually happening under the hood.
          </h2>
        </div>

        <div className="flex flex-col gap-16 lg:gap-24">
          {ROWS.map((row, i) => (
            <div
              key={row.title}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
                i % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
              }`}
            >
              <div className="relative rounded-3xl overflow-hidden bg-muted/30 aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] shadow-sm border border-[#f0efed]">
                <img
                  src={getOptimizedUrl(row.image, { quality: 65 })}
                  alt={row.alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="lg:px-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                  {row.eyebrow}
                </p>
                <h3 className="text-[#1a1a2e] text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight mb-5">
                  {row.title}
                </h3>
                <p className="text-[#6b7280] text-base sm:text-lg leading-relaxed mb-7">
                  {row.description}
                </p>
                <ul className="flex flex-col gap-3">
                  {row.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-[#1a1a2e] text-sm sm:text-base">
                      <span className="mt-0.5 inline-flex w-5 h-5 rounded-full bg-foreground text-background items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
