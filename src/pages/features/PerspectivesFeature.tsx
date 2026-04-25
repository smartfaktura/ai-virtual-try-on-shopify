import { useNavigate } from 'react-router-dom';
import { ArrowRight, RotateCcw, Camera, Eye, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { SITE_URL } from '@/lib/constants';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const benefits = [
  {
    icon: RotateCcw,
    title: '8 angle types',
    description: 'Front, back, left side, right side, close-up, full body, upper body, three-quarter — all from one source photo.',
  },
  {
    icon: Eye,
    title: 'Scene-aware prompting',
    description: 'Detects on-model shots automatically and preserves pose, garment fit, and styling across every angle.',
  },
  {
    icon: Lightbulb,
    title: 'Matched lighting & background',
    description: 'Every perspective inherits the original background, surface and lighting setup for a cohesive PDP gallery.',
  },
];

const steps = [
  { number: '01', title: 'Upload your source', description: 'Drop in any product photo — flat lay, on-model, or lifestyle. The AI reads scene context automatically.' },
  { number: '02', title: 'Pick your angles', description: 'Choose individual angles or generate the full 8-perspective set in one click.' },
  { number: '03', title: 'Get a cohesive set', description: 'A matching gallery with consistent lighting, background and styling. 6 credits per angle.' },
];

const angles = ['Front', 'Back', 'Left side', 'Right side', 'Close-up', 'Full body', 'Upper body', 'Three-quarter'];

const whyCards = [
  { title: 'No reshoots for missing angles', text: "Don't reschedule a shoot just because the back view is missing." },
  { title: 'Cohesive PDP gallery', text: 'Every angle shares lighting, background and product fidelity by default.' },
  { title: 'Works with on-model + flat lay', text: 'Whether you start with a hanger shot or a runway frame, the angle set follows.' },
];

const faqs = [
  { q: 'Will the model and pose stay consistent?', a: 'Yes — when the source is on-model, the AI locks the model identity and adjusts only the camera viewpoint.' },
  { q: 'Can I generate just one angle?', a: 'Yes. Pick any single angle for 6 credits, or batch the full set in one go.' },
  { q: 'What inputs work best?', a: 'Sharp, evenly-lit source photos at 1024px+ produce the cleanest perspective shifts.' },
];

export default function PerspectivesFeature() {
  const navigate = useNavigate();
  const benefitsReveal = useScrollReveal();
  const stepsReveal = useScrollReveal();
  const anglesReveal = useScrollReveal();

  return (
    <PageLayout>
      <SEOHead
        title="Product Perspectives — Multi-Angle AI Photography | VOVV.AI"
        description="Generate every angle from one product photo. 8 perspective types with matching lighting and backgrounds. 6 credits per angle."
        canonical={`${SITE_URL}/features/perspectives`}
      />

      <div className="bg-[#FAFAF8]">
        {/* Hero */}
        <section className="pt-20 pb-16 lg:pt-28 lg:pb-24">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-foreground/[0.06] text-foreground text-sm font-medium mb-6">
              <Camera className="w-4 h-4" />
              Perspectives
            </div>
            <h1 className="text-foreground text-[2.5rem] sm:text-5xl lg:text-[3.5rem] leading-[1.08] font-semibold tracking-[-0.03em] mb-6">
              One photo.
              <br />
              <span className="text-[#4a5578]">Every angle.</span>
            </h1>
            <p className="max-w-xl mx-auto text-muted-foreground text-lg leading-relaxed mb-10">
              Front, back, side, close-up — generate a complete product gallery from a single image, with matching lighting and backgrounds.
            </p>
            <Button size="lg" className="rounded-full h-[3.25rem] px-8 text-base font-semibold gap-2 shadow-lg shadow-primary/25" onClick={() => navigate('/auth')}>
              Try Perspectives
              <ArrowRight className="w-4 h-4" />
            </Button>
            <p className="text-[11px] tracking-[0.12em] uppercase text-muted-foreground/60 font-medium mt-8">
              20 free credits · No card required
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 lg:py-24">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">Why Perspectives</p>
              <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">A complete gallery from one photo</h2>
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

        {/* Angle pills */}
        <section className="py-12 lg:py-16">
          <div className="max-w-[1000px] mx-auto px-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">8 perspective types</p>
            <h2 className="text-foreground text-2xl sm:text-3xl font-semibold tracking-tight mb-8">Pick one. Or get them all.</h2>
            <div ref={anglesReveal.ref} className={`flex flex-wrap justify-center gap-2 transition-all duration-700 ${anglesReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {angles.map((a) => (
                <span key={a} className="px-5 py-2 rounded-full bg-white border border-[#f0efed] text-sm font-medium text-foreground shadow-sm">
                  {a}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 lg:py-24">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">How it works</p>
              <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">Three steps to a full set</h2>
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

        {/* FAQ */}
        <FaqSection items={faqs} />
      </div>

      {/* Why VOVV — dark */}
      <WhyVovvSection cards={whyCards} eyebrow="Why VOVV" heading="Stop scheduling reshoots" />

      {/* Final CTA — dark */}
      <FinalCtaDark heading="One photo. Every angle." sub="Upload one image and get a complete perspective set in minutes." />
    </PageLayout>
  );
}

/* Shared light FAQ block */
function FaqSection({ items }: { items: { q: string; a: string }[] }) {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">FAQ</p>
          <h2 className="text-foreground text-3xl sm:text-4xl font-semibold tracking-tight">Common questions</h2>
        </div>
        <div className="bg-white rounded-3xl border border-[#f0efed] shadow-sm shadow-foreground/[0.04] divide-y divide-[#f0efed]">
          {items.map((it) => (
            <div key={it.q} className="p-6 sm:p-8">
              <h3 className="text-foreground text-base font-semibold mb-2">{it.q}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{it.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Shared dark "Why VOVV" block */
function WhyVovvSection({ cards, eyebrow, heading }: { cards: { title: string; text: string }[]; eyebrow: string; heading: string }) {
  const { ref, visible } = useScrollReveal();
  return (
    <section className="py-16 lg:py-32 bg-[#1a1a2e]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 mb-4">{eyebrow}</p>
          <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">{heading}</h2>
        </div>
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((c, i) => (
            <div
              key={c.title}
              className={`bg-white/5 border border-white/10 rounded-3xl p-7 sm:p-8 lg:p-10 transition-all duration-700 hover:bg-white/10 hover:border-white/20 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <h3 className="text-white text-lg font-semibold mb-3">{c.title}</h3>
              <p className="text-[#9ca3af] text-sm leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Shared dark Final CTA */
function FinalCtaDark({ heading, sub }: { heading: string; sub: string }) {
  return (
    <section className="py-16 lg:py-32 bg-[#1a1a2e] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#475569] blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#64748b] blur-3xl" />
      </div>
      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 mb-4">Get started</p>
        <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-5">{heading}</h2>
        <p className="text-[#9ca3af] text-base sm:text-lg leading-relaxed mb-10">{sub}</p>
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
          <a href="/auth" className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-white text-[#1a1a2e] text-base font-semibold hover:bg-white/90 transition-colors w-full sm:w-auto">
            Start free
            <ArrowRight size={16} />
          </a>
          <a href="/discover" className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full border border-white/20 text-white text-base font-semibold hover:bg-white/10 transition-colors w-full sm:w-auto">
            See real examples
          </a>
        </div>
      </div>
    </section>
  );
}

export { FaqSection, WhyVovvSection, FinalCtaDark };
