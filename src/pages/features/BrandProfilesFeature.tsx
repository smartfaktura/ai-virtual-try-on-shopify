import { useNavigate } from 'react-router-dom';
import { ArrowRight, Palette, Paintbrush, BookmarkCheck, Users2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { SITE_URL } from '@/lib/constants';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { FaqSection, WhyVovvSection, FinalCtaDark } from './PerspectivesFeature';

const benefits = [
  { icon: Paintbrush, title: 'Color & style consistency', description: 'Define lighting, color temperature, background and tone. Every generation follows your rules.' },
  { icon: BookmarkCheck, title: 'Reusable across the studio', description: 'Apply your profile to any Visual Type, Content Calendar or Freestyle generation. Create once, use forever.' },
  { icon: Users2, title: 'Team sharing', description: "Your team generates on-brand visuals without keeping a style guide open — the AI knows your brand." },
];

const steps = [
  { number: '01', title: 'Define brand identity', description: 'Set tone, lighting, palette, target audience and "do not" rules in a quick wizard.' },
  { number: '02', title: 'Attach in Visual Studio', description: 'Link your profile to any workflow. The AI bakes your guidelines into every prompt.' },
  { number: '03', title: 'Get consistent results', description: 'Every image — PDP, ad, email banner — matches your visual identity.' },
];

const directionItems = [
  'Tone · Quiet luxury, editorial restraint',
  'Lighting · Warm directional, soft shadows',
  'Palette · Cream, charcoal, oxblood',
  'Composition · Centered hero, generous negative space',
  'Do not · Neon, busy backgrounds, harsh flash',
];

const whyCards = [
  { title: 'No style guide drift', text: 'Stop re-explaining your brand to every prompt. Lock it once.' },
  { title: 'No per-shot prompt rewrites', text: 'Brand rules apply automatically across every Visual Type and Freestyle.' },
  { title: 'One source of truth', text: 'Update your profile in one place — every future generation reflects it.' },
];

const faqs = [
  { q: 'What does a Brand Profile control?', a: 'Tone, lighting, color palette, composition preferences, target audience, and explicit "do not" rules — all baked into the prompt automatically.' },
  { q: 'Does it work with Freestyle?', a: 'Yes — Brand Profiles attach to Visual Types, Content Calendars, and Freestyle generations.' },
  { q: 'How many profiles can I have?', a: 'Create as many as you need — one per brand, sub-brand, campaign, or seasonal mood.' },
];

export default function BrandProfilesFeature() {
  const navigate = useNavigate();
  const benefitsReveal = useScrollReveal();
  const stepsReveal = useScrollReveal();
  const directionReveal = useScrollReveal();

  return (
    <PageLayout>
      <SEOHead
        title="Brand Profiles — Consistent AI Photography | VOVV.AI"
        description="Define your brand's visual identity once. Every AI-generated image automatically matches your lighting, colors, composition and tone."
        canonical={`${SITE_URL}/features/brand-profiles`}
      />

      <div className="bg-[#FAFAF8]">
        {/* Hero */}
        <section className="pt-20 pb-16 lg:pt-28 lg:pb-24">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-foreground/[0.06] text-foreground text-sm font-medium mb-6">
              <Palette className="w-4 h-4" />
              Brand Profiles
            </div>
            <h1 className="text-foreground text-[2.5rem] sm:text-5xl lg:text-[3.5rem] leading-[1.08] font-semibold tracking-[-0.03em] mb-6">
              Your brand guidelines,
              <br />
              <span className="text-[#4a5578]">in every image.</span>
            </h1>
            <p className="max-w-xl mx-auto text-muted-foreground text-lg leading-relaxed mb-10">
              Save your brand's visual identity — colors, tone, lighting, composition — and let the AI apply it consistently across every generation.
            </p>
            <Button size="lg" className="rounded-full h-[3.25rem] px-8 text-base font-semibold gap-2 shadow-lg shadow-primary/25" onClick={() => navigate('/auth')}>
              Build your profile
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">Why profiles</p>
              <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">A style guide the AI obeys</h2>
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

        {/* Visual direction signature row */}
        <section className="py-16 lg:py-24">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">What's inside</p>
              <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">Lock the look once</h2>
            </div>
            <div ref={directionReveal.ref} className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center transition-all duration-700 ${directionReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="bg-white rounded-3xl shadow-sm border border-[#f0efed] p-6 sm:p-8">
                <p className="text-[13px] font-medium text-[#475569] uppercase tracking-wide mb-5">Visual direction</p>
                <div className="space-y-3">
                  {directionItems.map((s) => (
                    <div key={s} className="flex items-center gap-3 py-2.5 px-4 rounded-xl bg-[#FAFAF8] text-sm text-[#1a1a2e]">
                      <div className="w-2 h-2 rounded-full bg-[#475569]" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">How it travels</p>
                <h3 className="text-foreground text-2xl sm:text-3xl font-semibold tracking-tight mb-5">Same brand, every workflow.</h3>
                <p className="text-muted-foreground text-base leading-relaxed mb-4">
                  Once your profile is set, every Visual Type — on-model, lifestyle, packaging, social — pulls from the same direction.
                </p>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Your team stops re-prompting. Your gallery stops drifting. Your brand stays itself.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 lg:py-24">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">How it works</p>
              <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">Three steps to a brand profile</h2>
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

        <FaqSection items={faqs} />
      </div>

      <WhyVovvSection cards={whyCards} eyebrow="Why VOVV" heading="On-brand, by default" />
      <FinalCtaDark heading="On-brand visuals, every time" sub="Create your Brand Profile in minutes and never worry about drift again." />
    </PageLayout>
  );
}
