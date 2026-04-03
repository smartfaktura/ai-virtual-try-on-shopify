import { useScrollReveal } from '@/hooks/useScrollReveal';

const proofs = [
  {
    label: 'Original',
    sublabel: 'Uploaded product',
    color: 'from-[#f5f0eb] to-[#e8e3dd]',
    span: 'col-span-1 row-span-2',
  },
  {
    label: 'Generated',
    sublabel: 'Product page ready',
    color: 'from-amber-50 to-orange-50',
    span: 'col-span-1 row-span-1',
  },
  {
    label: 'Detail crop',
    sublabel: 'Texture & quality',
    color: 'from-stone-100 to-neutral-50',
    span: 'col-span-1 row-span-1',
  },
  {
    label: 'Ad use',
    sublabel: 'Campaign placement',
    color: 'from-rose-50 to-pink-50',
    span: 'col-span-1 row-span-1',
  },
  {
    label: 'Product page use',
    sublabel: 'Storefront ready',
    color: 'from-sky-50 to-blue-50',
    span: 'col-span-1 row-span-1',
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
              className={`${p.span} rounded-2xl bg-gradient-to-br ${p.color} shadow-sm relative overflow-hidden group min-h-[200px]`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="absolute bottom-4 left-4 z-10">
                <span className="block text-xs font-medium text-[#475569] bg-white/80 backdrop-blur px-2.5 py-1 rounded-md">
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
