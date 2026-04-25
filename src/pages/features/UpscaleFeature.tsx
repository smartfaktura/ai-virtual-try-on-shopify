import { useNavigate } from 'react-router-dom';
import { ArrowRight, Maximize2, Sparkles, Grid3X3, Image as ImageIcon, Printer, Search, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { SITE_URL } from '@/lib/constants';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { FaqSection, WhyVovvSection, FinalCtaDark } from './PerspectivesFeature';

const benefits = [
  { icon: Sparkles, title: 'Fabric & texture recovery', description: 'AI reconstructs thread patterns, weave textures and material grain that standard upscaling smears away.' },
  { icon: Maximize2, title: '2K & 4K resolution', description: '2K from 10 credits, 4K from 15 credits. Perfect for hero banners, print-ready assets and zoom listings.' },
  { icon: Grid3X3, title: 'Batch up to 10 images', description: 'Queue a full set, walk away, come back to a high-res library — no per-file babysitting.' },
];

const steps = [
  { number: '01', title: 'Pick your images', description: 'Choose from your library or upload new ones. Generated or original photos both work.' },
  { number: '02', title: 'Choose resolution', description: '2K for web-optimized quality, 4K for maximum detail — perfect for print and large displays.' },
  { number: '03', title: 'Get sharper assets', description: 'Recovered textures, sharper edges, richer detail — ready to ship.' },
];

const useCases = [
  { icon: ImageIcon, title: 'Hero banners', text: 'Pixel-perfect headers and homepage features at any viewport.' },
  { icon: Printer, title: 'Print-ready assets', text: 'Lookbooks, lookboards and lookups — ready for press.' },
  { icon: Search, title: 'Marketplace listings', text: 'Zoomable PDP imagery that holds up under inspection.' },
  { icon: Layers, title: 'Old catalog refresh', text: 'Bring last season\'s standard-res library back to current standards.' },
];

const whyCards = [
  { title: 'One-click upscale', text: 'No upscaler tooling, no plugins, no third-party services to manage.' },
  { title: 'Texture-aware, not just bigger', text: 'Reconstructs material detail instead of just enlarging pixels.' },
  { title: 'Works on generated + uploaded', text: 'Anything in your library can be enhanced — no source restrictions.' },
];

const faqs = [
  { q: 'What inputs work best?', a: 'Sharp originals at 1024px+ produce the cleanest results. Soft or compressed inputs still benefit but with less recovered detail.' },
  { q: 'Will it change colors?', a: 'No — color, white balance and tone are preserved. Only resolution and micro-detail change.' },
  { q: 'Does it preserve text and labels?', a: 'Yes — the engine keeps logos, text and packaging legibility intact during upscaling.' },
];

export default function UpscaleFeature() {
  const navigate = useNavigate();
  const benefitsReveal = useScrollReveal();
  const stepsReveal = useScrollReveal();
  const useCasesReveal = useScrollReveal();

  return (
    <PageLayout>
      <SEOHead
        title="AI Image Upscaling for E-Commerce | VOVV.AI"
        description="Upscale product images to 2K or 4K with AI texture recovery. Batch up to 10 at a time. Sharper details, richer textures, print-ready quality."
        canonical={`${SITE_URL}/features/upscale`}
      />

      <div className="bg-[#FAFAF8]">
        {/* Hero */}
        <section className="pt-20 pb-16 lg:pt-28 lg:pb-24">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-foreground/[0.06] text-foreground text-sm font-medium mb-6">
              <Maximize2 className="w-4 h-4" />
              Image Upscaling
            </div>
            <h1 className="text-foreground text-[2.5rem] sm:text-5xl lg:text-[3.5rem] leading-[1.08] font-semibold tracking-[-0.03em] mb-6">
              Upscale to 2K or 4K.
              <br />
              <span className="text-[#4a5578]">Recover real texture.</span>
            </h1>
            <p className="max-w-xl mx-auto text-muted-foreground text-lg leading-relaxed mb-10">
              Go from standard resolution to print-ready with AI-powered detail reconstruction. Recover fabric, sharpen edges, ship sharper.
            </p>
            <Button size="lg" className="rounded-full h-[3.25rem] px-8 text-base font-semibold gap-2 shadow-lg shadow-primary/25" onClick={() => navigate('/auth')}>
              Try upscaling
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">Why upscale</p>
              <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">More resolution, more detail</h2>
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
              <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">Three steps to high-res</h2>
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">Use cases</p>
              <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">Where the extra detail counts</h2>
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

      <WhyVovvSection cards={whyCards} eyebrow="Why VOVV" heading="Detail you can ship" />
      <FinalCtaDark heading="Make every pixel count" sub="Upscale your first images for free and see the difference AI-enhanced detail makes." />
    </PageLayout>
  );
}
