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
    initials: 'M.L.',
    name: 'Maya L.',
    role: 'Jewelry founder',
  },
  {
    quote:
      'Locking one visual direction across my skincare line keeps the catalog feeling like one brand.',
    initials: 'D.K.',
    name: 'Daniel K.',
    role: 'Skincare brand owner',
  },
  {
    quote:
      'I mock up entire campaign ideas before booking the real shoot. Saves a ton of back-and-forth.',
    initials: 'A.R.',
    name: 'Alex R.',
    role: 'Ecommerce photographer',
  },
];

export function HomeTrustBlock() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-20 lg:py-28 bg-[#FAFAF8]">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Early access
          </p>
          <h2 className="text-foreground text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
            Early users are saying it works
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            A few notes from creators and brands testing VOVV right now.
          </p>
        </div>

        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {TESTIMONIALS.map((t, i) => (
            <figure
              key={t.initials}
              className={`bg-white rounded-2xl border border-[#ececea] p-7 flex flex-col transition-all duration-500 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <blockquote className="text-foreground/80 text-[15px] leading-relaxed flex-1">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 pt-5 border-t border-[#f0efed] flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#f0efed] text-foreground/60 text-[11px] font-semibold flex items-center justify-center tracking-wide">
                  {t.initials}
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-medium text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground/70">
          Early-access feedback · Names anonymized.
        </p>
      </div>
    </section>
  );
}
