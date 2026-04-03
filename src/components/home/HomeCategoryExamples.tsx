import { useScrollReveal } from '@/hooks/useScrollReveal';

const categories = [
  {
    title: 'Beauty & skincare',
    text: 'Premium packshots and campaign visuals for serums, creams, and beauty products.',
    colors: ['from-rose-200/80 to-pink-100/60', 'from-amber-200/70 to-orange-100/50', 'from-fuchsia-200/70 to-purple-100/50'],
    shapes: ['rounded-full w-12 h-12', 'rounded-2xl w-10 h-16', 'rounded-xl w-12 h-14'],
  },
  {
    title: 'Fashion & accessories',
    text: 'Editorial content and ecommerce visuals for fashion brands.',
    colors: ['from-slate-300/60 to-gray-200/40', 'from-stone-300/60 to-neutral-200/40', 'from-zinc-300/50 to-gray-200/30'],
    shapes: ['rounded-xl w-12 h-20', 'rounded-lg w-14 h-14', 'rounded-2xl w-10 h-16'],
  },
  {
    title: 'Jewelry',
    text: 'Luxury product images and polished campaign visuals.',
    colors: ['from-amber-300/60 to-yellow-200/40', 'from-orange-200/60 to-amber-100/40', 'from-yellow-200/60 to-amber-100/40'],
    shapes: ['rounded-full w-14 h-14', 'rounded-full w-10 h-10', 'rounded-full w-12 h-12'],
  },
  {
    title: 'Home & lifestyle',
    text: 'Clean product visuals for candles, decor, and home brands.',
    colors: ['from-emerald-200/60 to-teal-100/40', 'from-lime-200/50 to-green-100/30', 'from-cyan-200/50 to-sky-100/30'],
    shapes: ['rounded-2xl w-14 h-16', 'rounded-xl w-12 h-12', 'rounded-lg w-10 h-14'],
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
                {cat.colors.map((c, j) => (
                  <div
                    key={j}
                    className={`aspect-square rounded-xl bg-gradient-to-br ${c} border border-white/40 shadow-inner flex items-center justify-center transition-transform duration-300 ${j === 0 ? 'group-hover:scale-105' : ''}`}
                  >
                    <div className={`${cat.shapes[j]} bg-white/30 shadow-inner`} />
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
