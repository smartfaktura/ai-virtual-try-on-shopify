import { useScrollReveal } from '@/hooks/useScrollReveal';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const SUPABASE_PUBLIC =
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads';
const PREVIEW = (id: string) =>
  `${SUPABASE_PUBLIC}/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/${id}.jpg`;

const categories = [
  {
    title: 'Beauty & skincare',
    text: 'Premium packshots and campaign visuals for serums, creams, and beauty products.',
    images: [
      PREVIEW('1776239819530-s8gl9m'), // Near Face Hold (beauty)
      PREVIEW('1776847150435-bnn7qq'), // Natural Light Backdrop
      PREVIEW('1776847155437-m5m0nq'), // Warm Neutral Studio
    ],
  },
  {
    title: 'Fashion & accessories',
    text: 'Editorial content and e-commerce visuals for fashion brands.',
    images: [
      PREVIEW('1776689318257-yahkye'), // Flash Night Fashion Campaign
      PREVIEW('1776840733386-n4bc6x'), // Greenhouse Elegance
      PREVIEW('1776688413055-z73arv'), // Quiet Luxury Museum Staircase
    ],
  },
  {
    title: 'Fragrance & jewelry',
    text: 'Luxury bottles, polished campaign visuals, and editorial product moments.',
    images: [
      PREVIEW('1776018021309-gfgfci'), // Earthy Botanicals Plinth
      PREVIEW('1776018015756-3xfquh'), // Dark Elegance
      PREVIEW('1776847680436-3svy5f'), // Volcanic Sunset
    ],
  },
  {
    title: 'Swimwear & lifestyle',
    text: 'Editorial swim, on-model lifestyle, and clean studio commerce visuals.',
    images: [
      PREVIEW('1776524132929-q8upyp'), // Yacht Bow Editorial
      PREVIEW('1776574228066-oyklfz'), // Golden Horizon
      PREVIEW('1776524131703-gvh4bb'), // Sunbathing Editorial
    ],
  },
];

export function HomeCategoryExamples() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-16 lg:py-32 bg-[#f5f5f3]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            Built for visually demanding products
          </h2>
          <p className="text-[#6b7280] text-lg leading-relaxed">
            Explore how VOVV creates premium visuals across different product categories.
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <div
              key={cat.title}
              className={`bg-white rounded-3xl shadow-sm border border-[#f0efed] overflow-hidden transition-all duration-700 hover:-translate-y-1 hover:shadow-md group ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div className="grid grid-cols-3 gap-2 p-3">
                {cat.images.map((src, j) => (
                  <div
                    key={j}
                    className={`aspect-square rounded-xl overflow-hidden bg-muted/30 transition-transform duration-300 ${j === 0 ? 'group-hover:scale-[1.03]' : ''}`}
                  >
                    <img
                      src={getOptimizedUrl(src, { quality: 60 })}
                      alt={`${cat.title} example ${j + 1}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>

              <div className="px-5 pb-6 pt-2">
                <h3 className="text-[#1a1a2e] font-semibold text-base mb-1.5">{cat.title}</h3>
                <p className="text-[#6b7280] text-[13px] leading-relaxed">{cat.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
