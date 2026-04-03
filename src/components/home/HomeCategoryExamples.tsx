import { useScrollReveal } from '@/hooks/useScrollReveal';

const categories = [
  {
    title: 'Beauty & skincare',
    text: 'Premium packshots, campaign visuals, and social content for serums, creams, and beauty products.',
    colors: ['from-rose-100 to-pink-50', 'from-amber-100 to-orange-50', 'from-fuchsia-100 to-purple-50'],
  },
  {
    title: 'Fashion & accessories',
    text: 'Editorial content, ecommerce visuals, and creator-style assets for fashion brands.',
    colors: ['from-slate-200 to-gray-100', 'from-stone-200 to-neutral-100', 'from-zinc-200 to-gray-100'],
  },
  {
    title: 'Jewelry',
    text: 'Luxury product images, detail-rich close-ups, and polished campaign visuals.',
    colors: ['from-amber-200 to-yellow-100', 'from-orange-100 to-amber-50', 'from-yellow-100 to-amber-50'],
  },
  {
    title: 'Home & lifestyle',
    text: 'Clean product visuals and elevated lifestyle imagery for candles, decor, and home brands.',
    colors: ['from-emerald-100 to-teal-50', 'from-lime-100 to-green-50', 'from-cyan-100 to-sky-50'],
  },
];

export function HomeCategoryExamples() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-24 lg:py-32 bg-[#f5f5f3]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            Built for visually demanding products
          </h2>
          <p className="text-[#6b7280] text-lg leading-relaxed">
            Explore how VOVV creates premium visuals across different product categories.
          </p>
        </div>

        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <div
              key={cat.title}
              className={`bg-white rounded-3xl shadow-sm border border-[#f0efed] overflow-hidden transition-all duration-700 hover:-translate-y-1 hover:shadow-md ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              {/* Example visuals */}
              <div className="grid grid-cols-3 gap-1.5 p-3">
                {cat.colors.map((c, j) => (
                  <div key={j} className={`aspect-[3/4] rounded-xl bg-gradient-to-br ${c}`} />
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
