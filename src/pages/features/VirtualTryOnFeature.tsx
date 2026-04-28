import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shirt, Users, ScanFace, Maximize, Sparkles, Camera, Activity, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from '@/lib/seo/schema';
import { SITE_URL } from '@/lib/constants';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { FaqSection, WhyVovvSection, FinalCtaDark } from './PerspectivesFeature';

const benefits = [
  { icon: Users, title: '40+ diverse AI models', description: 'Every body type, ethnicity and age range — or upload your own custom models for full brand consistency.' },
  { icon: ScanFace, title: 'Realistic fitting', description: 'Fabric drape, body proportion and garment construction handled by the AI for true-to-life results.' },
  { icon: Maximize, title: 'Every angle, every framing', description: 'Full body, upper body, close-up — generate the angles you need from a single product image.' },
];

const steps = [
  { number: '01', title: 'Upload your garment', description: 'Drop in a flat lay, hanger shot or ghost mannequin. The AI isolates the garment automatically.' },
  { number: '02', title: 'Choose your models', description: 'Pick from the diverse model library, or use your own. Lock body type, pose and framing.' },
  { number: '03', title: 'Get on-model shots', description: 'Photo-realistic on-model imagery, ready for PDPs, ads and social — in minutes.' },
];

const useCases = [
  { icon: Shirt, title: 'Apparel brands', text: 'Refresh seasonal collections without booking another model day.' },
  { icon: Sparkles, title: 'Lingerie & swimwear', text: 'Diverse body representation without the casting overhead.' },
  { icon: Activity, title: 'Activewear', text: 'Action framings and lifestyle environments with consistent model identity.' },
  { icon: ShoppingBag, title: 'DTC catalog refresh', text: 'Update last season\'s on-model shots overnight, brand-consistent.' },
];

const whyCards = [
  { title: 'Faster than booking a shoot', text: 'Skip the casting, studio and reshoots. New on-model shots in minutes.' },
  { title: 'A fraction of the cost', text: 'A studio day can cost thousands. Generate the same set for credits.' },
  { title: 'Consistent across SKUs', text: 'Lock the model and lighting once — every product follows the same look.' },
];

const faqs = [
  { q: 'Can I upload my own model?', a: 'Yes. Custom Brand Models stay in your library and can be reused across every garment and scene.' },
  { q: 'Does it preserve the garment exactly?', a: 'Garment fidelity is the core of the engine — colors, prints, trims and seams are preserved on the model.' },
  { q: 'What does each shot cost?', a: 'On-model shots start at standard generation pricing — see the in-app credit panel for live rates.' },
];

export default function VirtualTryOnFeature() {
  const navigate = useNavigate();
  const benefitsReveal = useScrollReveal();
  const stepsReveal = useScrollReveal();
  const useCasesReveal = useScrollReveal();

  return (
    <PageLayout>
      <SEOHead
        title="Virtual Try-On for Fashion Brands | VOVV.AI"
        description="AI-powered virtual try-on with 40+ diverse models. Upload a garment, get realistic on-model photography in minutes. Skip the photoshoot."
        canonical={`${SITE_URL}/features/virtual-try-on`}
      />
      <JsonLd data={buildBreadcrumbJsonLd([{ name: 'Features', path: '/features/workflows' }, { name: 'Virtual Try-On', path: '/features/virtual-try-on' }])} />
      <JsonLd data={buildWebPageJsonLd({ name: 'Virtual Try-On', description: 'AI-powered virtual try-on with 40+ diverse models. Upload a garment, get realistic on-model photography in minutes.', path: '/features/virtual-try-on' })} />

      <div className="bg-[#FAFAF8]">
        {/* Hero */}
        <section className="pt-20 pb-16 lg:pt-28 lg:pb-24">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-foreground/[0.06] text-foreground text-sm font-medium mb-6">
              <Shirt className="w-4 h-4" />
              Virtual Try-On
            </div>
            <h1 className="text-foreground text-[2.5rem] sm:text-5xl lg:text-[3.5rem] leading-[1.08] font-semibold tracking-[-0.03em] mb-6">
              See your products on real
              <br />
              <span className="text-[#4a5578]">AI models.</span>
            </h1>
            <p className="max-w-xl mx-auto text-muted-foreground text-lg leading-relaxed mb-10">
              Skip the photoshoot. Upload a garment and instantly generate on-model shots — diverse models, realistic fitting, every angle.
            </p>
            <Button size="lg" className="rounded-full h-[3.25rem] px-8 text-base font-semibold gap-2 shadow-lg shadow-primary/25" onClick={() => navigate('/auth')}>
              Try it on a garment
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">Why Try-On</p>
              <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">Studio-grade on-model imagery</h2>
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
              <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">From garment to on-model in 3 steps</h2>
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">Built for fashion</p>
              <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">Made for the way you sell</h2>
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

      <WhyVovvSection cards={whyCards} eyebrow="Why VOVV" heading="Replace the studio day" />
      <FinalCtaDark heading="Try it on your collection" sub="Upload your first garment and generate on-model shots in minutes." />
    </PageLayout>
  );
}
