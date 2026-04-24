import { Quote } from 'lucide-react';
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
      'Testing 10 angles for one bag in five minutes — that alone replaces a whole afternoon of shooting.',
    initials: 'M.L.',
    name: 'Maya L.',
    role: 'Jewelry founder',
  },
  {
    quote:
      'Locking one visual direction across my skincare line keeps the catalog feeling like one brand, not a Frankenstein.',
    initials: 'D.K.',
    name: 'Daniel K.',
    role: 'Skincare brand owner',
  },
  {
    quote:
      'I use it to mock up campaign ideas before committing to a real shoot. Saves a ton of back-and-forth.',
    initials: 'A.R.',
    name: 'Alex R.',
    role: 'Ecommerce photographer',
  },
];

export function HomeTrustBlock() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-16 lg:py-32 bg-[#f5f5f3]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Early users
          </p>
          <h2 className="text-foreground text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            What early users are saying
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Sample feedback from creators and brands testing VOVV during early access.
          </p>
        </div>

        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6"
        >
          {TESTIMONIALS.map((t, i) => (
            <figure
              key={t.initials}
              className={`bg-white rounded-3xl border border-[#ececea] p-7 lg:p-8 flex flex-col transition-all duration-700 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <Quote
                size={22}
                className="text-foreground/15 mb-5"
                strokeWidth={2}
              />
              <blockquote className="text-foreground/90 text-[15px] leading-relaxed flex-1">
                {t.quote}
              </blockquote>
              <figcaption className="mt-7 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f0efed] text-foreground/70 text-xs font-semibold flex items-center justify-center tracking-wide">
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
          * Early-access feedback from beta testers.
        </p>
      </div>
    </section>
  );
}
