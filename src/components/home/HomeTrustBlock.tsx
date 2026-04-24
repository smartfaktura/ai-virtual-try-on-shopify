import { Quote, Star } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

type Testimonial = {
  quote: string;
  initials: string;
  name: string;
  role: string;
  avatarBg: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Testing 10 angles for one bag in five minutes — that alone replaces a whole afternoon of shooting.',
    initials: 'M.L.',
    name: 'Maya L.',
    role: 'Jewelry founder',
    avatarBg: 'bg-gradient-to-br from-amber-200 to-orange-300 text-orange-900',
  },
  {
    quote:
      'Locking one visual direction across my skincare line keeps the whole catalog feeling like one brand.',
    initials: 'D.K.',
    name: 'Daniel K.',
    role: 'Skincare brand owner',
    avatarBg: 'bg-gradient-to-br from-emerald-200 to-teal-300 text-emerald-900',
  },
  {
    quote:
      'I mock up entire campaign concepts before booking the real shoot. Saves a ton of back-and-forth.',
    initials: 'A.R.',
    name: 'Alex R.',
    role: 'Ecommerce photographer',
    avatarBg: 'bg-gradient-to-br from-sky-200 to-indigo-300 text-indigo-900',
  },
];

const STATS = [
  'Free credits to start',
  '1000+ ready-made shots',
  'From upload to result in <1 min',
];

export function HomeTrustBlock() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="relative py-24 lg:py-40 bg-gradient-to-b from-[#FAFAF8] via-[#f5f5f3] to-[#FAFAF8] overflow-hidden">
      {/* Decorative glow blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-amber-200/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-32 w-[520px] h-[520px] rounded-full bg-indigo-200/20 blur-3xl"
      />

      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-14 lg:mb-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-5">
            Early access · Beta
          </p>
          <h2 className="text-foreground text-4xl sm:text-5xl font-semibold tracking-tight mb-5 leading-[1.05]">
            Loved by the brands building first
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Early creators and DTC teams are already using VOVV to ship visuals faster — here’s what they’re telling us.
          </p>
        </div>

        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10"
        >
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.initials}
              className={`bg-gradient-to-br from-amber-200/50 via-white to-indigo-200/40 rounded-[28px] p-[1px] transition-all duration-500 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              } hover:-translate-y-1 hover:shadow-[0_24px_70px_-30px_rgba(15,23,42,0.28)]`}
              style={{ transitionDelay: `${i * 140}ms` }}
            >
              <figure className="bg-white rounded-[27px] p-9 lg:p-10 h-full flex flex-col">
                <Quote
                  size={28}
                  className="text-amber-400/40 mb-6"
                  fill="currentColor"
                  strokeWidth={0}
                />
                <blockquote className="text-foreground/85 text-[17px] leading-[1.6] font-[450] flex-1">
                  “{t.quote}”
                </blockquote>

                <div className="flex items-center gap-1 mt-7 mb-5 text-amber-400/90">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={14} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>

                <figcaption className="flex items-center gap-3.5 pt-5 border-t border-[#f0efed]">
                  <div
                    className={`w-12 h-12 rounded-full ${t.avatarBg} text-[13px] font-semibold flex items-center justify-center tracking-wide shadow-sm`}
                  >
                    {t.initials}
                  </div>
                  <div className="leading-tight">
                    <div className="text-[15px] font-medium text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
          {STATS.map((s) => (
            <span
              key={s}
              className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-[#ececea] text-[11px] font-semibold uppercase tracking-wider text-foreground/70"
            >
              {s}
            </span>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground/70">
          Early-access feedback from beta testers · Names anonymized.
        </p>
      </div>
    </section>
  );
}
