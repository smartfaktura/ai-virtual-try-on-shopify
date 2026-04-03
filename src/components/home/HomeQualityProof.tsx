import { useScrollReveal } from '@/hooks/useScrollReveal';
import { ZoomIn } from 'lucide-react';

const proofs = [
  {
    label: 'Original',
    sublabel: 'Uploaded product',
    color: 'from-[#e8e3dd] to-[#d8d3cb]',
    span: 'col-span-1 row-span-2',
    shape: 'w-16 h-28 rounded-2xl',
  },
  {
    label: 'Generated',
    sublabel: 'Product page ready',
    color: 'from-amber-100 to-orange-50',
    span: 'col-span-1 row-span-1',
    shape: 'w-12 h-18 rounded-xl',
  },
  {
    label: 'Detail crop',
    sublabel: 'Texture & quality',
    color: 'from-stone-200/60 to-neutral-100/40',
    span: 'col-span-1 row-span-1',
    shape: 'w-20 h-14 rounded-lg',
  },
  {
    label: 'Ad use',
    sublabel: 'Campaign placement',
    color: 'from-rose-100 to-pink-50',
    span: 'col-span-1 row-span-1',
    shape: 'w-14 h-14 rounded-xl',
  },
  {
    label: 'Product page use',
    sublabel: 'Storefront ready',
    color: 'from-sky-100 to-blue-50',
    span: 'col-span-1 row-span-1',
    shape: 'w-12 h-18 rounded-xl',
  },
];

export function HomeQualityProof() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-24 lg:py-32 bg-[#f5f5f3]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            See the quality before you commit
          </h2>
          <p className="text-[#6b7280] text-lg leading-relaxed">
            Inspect the detail, texture, and commercial quality of VOVV outputs.
          </p>
        </div>

        <div
          ref={ref}
          className={`grid grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {proofs.map((p, i) => (
            <div
              key={p.label}
              className={`${p.span} rounded-2xl bg-gradient-to-br ${p.color} shadow-sm border border-white/50 relative overflow-hidden group min-h-[200px] flex items-center justify-center`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Faux product silhouette */}
              <div className={`${p.shape} bg-gradient-to-b from-white/40 to-white/20 shadow-inner`} />

              {/* Zoom overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                <ZoomIn size={20} className="text-[#475569] opacity-0 group-hover:opacity-60 transition-opacity" />
              </div>

              <div className="absolute bottom-4 left-4 z-10">
                <span className="block text-xs font-medium text-[#475569] bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-md">
                  {p.label}
                </span>
                <span className="block text-[11px] text-[#9ca3af] mt-1 ml-0.5">{p.sublabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
