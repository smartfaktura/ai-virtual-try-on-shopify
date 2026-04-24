import { useScrollReveal } from '@/hooks/useScrollReveal';
import { ZoomIn } from 'lucide-react';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const SUPABASE_PUBLIC =
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads';
const PREVIEW = (id: string) =>
  `${SUPABASE_PUBLIC}/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/${id}.jpg`;

const proofs = [
  {
    label: 'Original',
    sublabel: 'Uploaded product',
    src: PREVIEW('1776523219756-c5vnc7'), // Ghost Mannequin Swimwear
    span: 'col-span-1 row-span-2',
  },
  {
    label: 'Generated',
    sublabel: 'Product page ready',
    src: PREVIEW('1776524131703-gvh4bb'), // Sunbathing Editorial
    span: 'col-span-1 row-span-1',
  },
  {
    label: 'Detail crop',
    sublabel: 'Texture & quality',
    src: PREVIEW('1776574265735-cvu5sc'), // Textured Bikini Back
    span: 'col-span-1 row-span-1',
  },
  {
    label: 'Ad use',
    sublabel: 'Campaign placement',
    src: PREVIEW('1776524132929-q8upyp'), // Yacht Bow Editorial
    span: 'col-span-1 row-span-1',
  },
  {
    label: 'Product page use',
    sublabel: 'Storefront ready',
    src: PREVIEW('1776574228066-oyklfz'), // Golden Horizon
    span: 'col-span-1 row-span-1',
  },
];

export function HomeQualityProof() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-16 lg:py-32 bg-[#f5f5f3]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            See the quality before you commit
          </h2>
          <p className="text-[#6b7280] text-lg leading-relaxed">
            Inspect the detail, texture, and commercial quality of VOVV outputs.
          </p>
        </div>

        <div
          ref={ref}
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {proofs.map((p, i) => (
            <div
              key={p.label}
              className={`${p.span} rounded-2xl overflow-hidden shadow-sm border border-white/50 relative group min-h-[260px] bg-muted/30`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <img
                src={getOptimizedUrl(p.src, { quality: 60 })}
                alt={p.label}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                <ZoomIn size={26} className="text-white opacity-0 group-hover:opacity-90 transition-opacity drop-shadow" />
              </div>

              <div className="absolute bottom-4 left-4 z-10">
                <span className="block text-xs font-medium text-[#475569] bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md">
                  {p.label}
                </span>
                <span className="block text-[11px] text-white mt-1 ml-0.5 drop-shadow">{p.sublabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
