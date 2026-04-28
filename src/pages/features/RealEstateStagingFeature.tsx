import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Home, DollarSign, Clock, Palette, Camera, Building2, Sofa, BedDouble } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from '@/lib/seo/schema';
import { SITE_URL } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { FaqSection, WhyVovvSection, FinalCtaDark } from './PerspectivesFeature';

const stagingStyles = [
  { key: 'empty', label: 'Empty Room', image: '/images/staging/staging-empty.png' },
  { key: 'japandi', label: 'Japandi', image: '/images/staging/staging-japandi.png' },
  { key: 'contemporary', label: 'Contemporary', image: '/images/staging/staging-contemporary.png' },
  { key: 'eclectic', label: 'Eclectic', image: '/images/staging/staging-eclectic.png' },
];

const benefits = [
  { icon: DollarSign, title: 'Save thousands per room', description: 'Physical staging costs $2,000–$5,000 per room. AI staging delivers the same impact for a fraction.' },
  { icon: Palette, title: 'Multiple styles, one photo', description: 'Show buyers Japandi, Contemporary, Eclectic and more — without moving a single piece of furniture.' },
  { icon: Clock, title: 'Ready in seconds', description: 'No scheduling, no delivery, no setup. Staged photos in under a minute — perfect for fast listings.' },
];

const steps = [
  { number: '01', title: 'Upload room photo', description: 'Take a photo of any empty or unfurnished room. Bedrooms, living rooms, kitchens, offices — all supported.' },
  { number: '02', title: 'Pick a design style', description: 'Choose from Japandi, Contemporary, Eclectic, Scandinavian, Mid-Century Modern and more.' },
  { number: '03', title: 'Download staged images', description: 'Get photo-realistic results ready for MLS listings, portals, social and print.' },
];

const useCases = [
  { icon: Building2, title: 'Real estate listings', text: 'Stage vacant properties to sell faster — staged homes sell 73% faster on average.' },
  { icon: BedDouble, title: 'Airbnb & rentals', text: 'Show guests the furnished potential. Increase booking rates with aspirational interiors.' },
  { icon: Sofa, title: 'Interior design mockups', text: 'Present concepts before buying anything. Iterate styles in minutes, not weeks.' },
  { icon: Camera, title: 'Pre-construction marketing', text: 'Market properties before they\'re built. Furnished renders from architectural shells.' },
];

const whyCards = [
  { title: 'Faster than physical staging', text: 'No movers, no schedule. New rooms in seconds.' },
  { title: '90%+ cost savings', text: "Stage an entire property for less than one room of physical furniture." },
  { title: 'A/B test styles instantly', text: 'Try Japandi, Contemporary and Eclectic on the same room — pick the winner.' },
];

const faqs = [
  { q: 'What rooms are supported?', a: 'Bedrooms, living rooms, kitchens, dining rooms, offices and most empty residential spaces.' },
  { q: 'Can I keep existing furniture?', a: 'Best results come from empty rooms. The AI re-stages the full space rather than editing around existing pieces.' },
  { q: 'Is the output MLS-ready?', a: 'Yes — high-resolution outputs can be downloaded and used directly in MLS, portals and printed listings.' },
];

export default function RealEstateStagingFeature() {
  const navigate = useNavigate();
  const [activeStyle, setActiveStyle] = useState('japandi');
  const benefitsReveal = useScrollReveal();
  const stepsReveal = useScrollReveal();
  const useCasesReveal = useScrollReveal();

  return (
    <PageLayout>
      <SEOHead
        title="AI Virtual Staging for Real Estate | VOVV.AI"
        description="Stage any empty room with AI in seconds. Generate Japandi, Contemporary and Eclectic interiors from one photo. Save thousands vs physical staging."
        canonical={`${SITE_URL}/features/real-estate-staging`}
      />
      <JsonLd data={buildBreadcrumbJsonLd([{ name: 'Features', path: '/features/workflows' }, { name: 'Real Estate Staging', path: '/features/real-estate-staging' }])} />
      <JsonLd data={buildWebPageJsonLd({ name: 'AI Virtual Staging', description: 'Stage any empty room with AI in seconds. Generate Japandi, Contemporary and Eclectic interiors from one photo.', path: '/features/real-estate-staging' })} />

      <div className="bg-[#FAFAF8]">
        {/* Hero */}
        <section className="pt-20 pb-16 lg:pt-28 lg:pb-24">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-foreground/[0.06] text-foreground text-sm font-medium mb-6">
              <Home className="w-4 h-4" />
              Real Estate Staging
            </div>
            <h1 className="text-foreground text-[2.5rem] sm:text-5xl lg:text-[3.5rem] leading-[1.08] font-semibold tracking-[-0.03em] mb-6">
              Stage any room.
              <br />
              <span className="text-[#4a5578]">In seconds.</span>
            </h1>
            <p className="max-w-xl mx-auto text-muted-foreground text-lg leading-relaxed mb-10">
              Transform empty rooms into beautifully furnished spaces. Multiple design styles, photo-realistic results, no furniture moved.
            </p>
            <Button size="lg" className="rounded-full h-[3.25rem] px-8 text-base font-semibold gap-2 shadow-lg shadow-primary/25" onClick={() => navigate('/auth')}>
              Stage your first room free
              <ArrowRight className="w-4 h-4" />
            </Button>
            <p className="text-[11px] tracking-[0.12em] uppercase text-muted-foreground/60 font-medium mt-8">
              20 free credits · No card required
            </p>
          </div>
        </section>

        {/* Interactive Showcase */}
        <section className="py-12 lg:py-20">
          <div className="max-w-5xl mx-auto px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">One photo · Endless styles</p>
              <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-3">See the same room transform.</h2>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">Switch styles in a single click.</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {stagingStyles.map((style) => (
                <button
                  key={style.key}
                  onClick={() => setActiveStyle(style.key)}
                  className={cn(
                    'px-5 py-2 rounded-full text-sm font-medium transition-all duration-200',
                    activeStyle === style.key
                      ? 'bg-foreground text-background shadow-sm'
                      : 'bg-white text-muted-foreground hover:text-foreground border border-[#f0efed]'
                  )}
                >
                  {style.label}
                </button>
              ))}
            </div>

            <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-muted border border-[#f0efed] shadow-sm shadow-foreground/[0.04]">
              {stagingStyles.map((style) => (
                <img
                  key={style.key}
                  src={style.image}
                  alt={`Room staged in ${style.label} style`}
                  className={cn(
                    'absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out',
                    activeStyle === style.key ? 'opacity-100' : 'opacity-0'
                  )}
                  loading="lazy"
                />
              ))}
              <div className="absolute bottom-4 left-4 px-4 py-2 rounded-xl bg-background/80 backdrop-blur-sm border border-[#f0efed]">
                <span className="text-sm font-medium text-foreground">
                  {activeStyle === 'empty' ? 'Before — Empty Room' : `After — ${stagingStyles.find(s => s.key === activeStyle)?.label}`}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 lg:py-24">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">Why AI staging</p>
              <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">Everything physical staging does, instantly</h2>
            </div>
            <div ref={benefitsReveal.ref} className="grid md:grid-cols-3 gap-6">
              {benefits.map((b, i) => (
                <div
                  key={b.title}
                  className={`bg-white rounded-3xl border border-[#f0efed] shadow-sm shadow-foreground/[0.04] p-7 sm:p-8 lg:p-10 transition-all duration-700 ${benefitsReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  <div className="w-11 h-11 rounded-xl bg-foreground/[0.06] flex items-center justify-center mb-5">
                    <b.icon className="w-5 h-5 text-foreground/70" />
                  </div>
                  <h3 className="text-foreground text-lg font-semibold mb-3">{b.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 lg:py-24">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">How it works</p>
              <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">From empty to staged</h2>
            </div>
            <div ref={stepsReveal.ref} className={`grid md:grid-cols-3 gap-8 transition-all duration-700 ${stepsReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {steps.map((s) => (
                <div key={s.number} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-foreground/[0.06] text-foreground font-semibold text-base flex items-center justify-center mx-auto mb-5">{s.number}</div>
                  <h3 className="text-foreground text-lg font-semibold mb-2">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="py-16 lg:py-24">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">Built for the industry</p>
              <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">Made for real estate professionals</h2>
            </div>
            <div ref={useCasesReveal.ref} className="grid sm:grid-cols-2 gap-6">
              {useCases.map((uc, i) => (
                <div
                  key={uc.title}
                  className={`bg-white rounded-3xl border border-[#f0efed] shadow-sm shadow-foreground/[0.04] p-7 sm:p-8 flex gap-5 transition-all duration-700 ${useCasesReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="w-11 h-11 rounded-xl bg-foreground/[0.06] flex items-center justify-center shrink-0">
                    <uc.icon className="w-5 h-5 text-foreground/70" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-base font-semibold mb-1.5">{uc.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{uc.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FaqSection items={faqs} />
      </div>

      <WhyVovvSection cards={whyCards} eyebrow="Why VOVV" heading="Stage smarter, sell faster" />
      <FinalCtaDark heading="Stage your first room free" sub="Upload an empty room photo and get a beautifully staged result in seconds — no card required." />
    </PageLayout>
  );
}
