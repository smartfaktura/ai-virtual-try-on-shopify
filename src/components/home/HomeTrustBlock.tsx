import { useScrollReveal } from '@/hooks/useScrollReveal';

type Testimonial = {
  quote: string;
  initials: string;
  name: string;
  role: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'I can test ten angles for one ring in minutes. It used to take a full afternoon to set up a single shoot.',
    initials: 'ML',
    name: 'Maya L.',
    role: 'Jewelry founder',
  },
  {
    quote:
      'Locking one visual direction across my skincare line keeps the catalog feeling like one brand.',
    initials: 'DK',
    name: 'Daniel K.',
    role: 'Skincare brand owner',
  },
  {
    quote:
      'I mock up entire campaign ideas before booking the real shoot. Saves a ton of back-and-forth.',
    initials: 'AR',
    name: 'Alex R.',
    role: 'Ecommerce photographer',
  },
];

const STATS = [
  { value: '1000+', label: 'Editorial scenes' },
  { value: '35+',   label: 'Product categories' },
  { value: '<60s',  label: 'Per generation' },
  { value: '1:1',   label: 'Brand consistency' },
];

export function HomeTrustBlock() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="relative py-24 lg:py-36 bg-[#0E1116] text-white overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[680px] h-[680px] rounded-full bg-white/[0.04] blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full bg-amber-200/[0.05] blur-3xl" />
      </div>

      {/* Hairline grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative max-w-[1180px] mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/[0.03] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">
              Early access · live now
            </span>
          </div>
          <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
            Built for brands that ship&nbsp;fast.
          </h2>
          <p className="text-white/60 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
            Early users replacing entire shoot days with a single afternoon on VOVV.
          </p>
        </div>

        {/* Testimonials */}
        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 mb-14 lg:mb-20"
        >
          {TESTIMONIALS.map((t, i) => (
            <figure
              key={t.initials}
              className={`group relative rounded-3xl bg-white/[0.04] border border-white/10 hover:border-white/20 hover:bg-white/[0.06] backdrop-blur-sm p-8 lg:p-9 flex flex-col transition-all duration-500 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              {/* Oversized quote glyph */}
              <span
                aria-hidden
                className="absolute top-5 right-6 text-6xl leading-none font-serif text-white/[0.08] select-none"
              >
                ”
              </span>

              <blockquote className="text-white/85 text-[15px] lg:text-base leading-[1.65] flex-1 font-light">
                {t.quote}
              </blockquote>

              <figcaption className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/15 to-white/[0.04] border border-white/10 text-white/90 text-[11px] font-semibold flex items-center justify-center tracking-wider">
                  {t.initials}
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-medium text-white">{t.name}</div>
                  <div className="text-xs text-white/50 mt-0.5">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Stats strip */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
            {STATS.map((s) => (
              <div key={s.label} className="px-6 py-7 lg:py-8 text-center">
                <div className="text-2xl lg:text-3xl font-semibold tracking-tight text-white">
                  {s.value}
                </div>
                <div className="mt-1.5 text-[11px] uppercase tracking-[0.18em] text-white/50 font-medium">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-white/40 tracking-wide">
          Early-access feedback · Names anonymized to protect brand pipelines.
        </p>
      </div>
    </section>
  );
}
