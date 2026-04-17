import { useEffect, useMemo } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLearnRead } from '@/hooks/useLearnRead';
import { LEARN_TRACKS, type LearnGuide } from '@/data/learnContent';
import { ProductVisualsGuide } from './ProductVisualsGuide';

interface Props {
  guide: LearnGuide;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-4">
      {children}
    </h2>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[14px] text-foreground/90 leading-relaxed">
          <span className="mt-[9px] w-1 h-1 rounded-full bg-foreground/40 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function GuideLayout({ guide }: Props) {
  const navigate = useNavigate();
  const { markRead } = useLearnRead();

  useEffect(() => {
    markRead(guide.section, guide.slug);
  }, [guide.section, guide.slug, markRead]);

  // Bespoke layout for the flagship Product Visuals guide
  if (guide.slug === 'product-images' && guide.section === 'visual-studio') {
    return <ProductVisualsGuide guide={guide} />;
  }

  const trackLabel = useMemo(() => {
    const primary = guide.tracks[0];
    return LEARN_TRACKS.find((t) => t.id === primary)?.label ?? 'Guide';
  }, [guide.tracks]);

  return (
    // Outer wrapper matches /app/learn hub width exactly
    <div className="max-w-3xl mx-auto pt-2 pb-24 animate-in fade-in duration-300">
      {/* Back — no negative margin so it lines up with hub list rows */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/app/learn')}
        className="gap-1.5 mb-8 text-muted-foreground hover:text-foreground px-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Learn
      </Button>

      {/* Inner reading column — left-aligned, anchored to same left rail as hub */}
      <div className="max-w-2xl">
        {/* Header (hero) */}
        <header className="pb-10 mb-12 border-b border-border/50">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-4">
            {trackLabel}
            <span className="mx-2 text-muted-foreground/40">·</span>
            <span className="tabular-nums">{guide.readMin} min read</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
            {guide.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mt-3 max-w-[58ch]">
            {guide.tagline}
          </p>
        </header>

        {/* When to use */}
        {guide.whenToUse && (
          <section className="mb-12">
            <SectionLabel>When to use this</SectionLabel>
            <p className="text-[16px] text-foreground/90 leading-relaxed">{guide.whenToUse}</p>
          </section>
        )}

        {/* What it does — lead paragraph */}
        <section className="mb-12">
          <SectionLabel>What it does</SectionLabel>
          <p className="text-[16px] text-foreground/90 leading-relaxed">{guide.whatItDoes}</p>
        </section>

        {/* vs Alternatives */}
        {guide.vsAlternatives && guide.vsAlternatives.length > 0 && (
          <section className="mb-12">
            <SectionLabel>Use this vs alternatives</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guide.vsAlternatives.map((alt, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border/50 bg-card/30 p-5"
                >
                  <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-foreground/70 mb-2">
                    {alt.label}
                  </p>
                  <p className="text-[14px] text-muted-foreground leading-relaxed">
                    {alt.useThisWhen}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Best for / What you need / What you get back — 3-up grid on md+ */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10">
            <div>
              <SectionLabel>Best for</SectionLabel>
              <BulletList items={guide.bestFor} />
            </div>
            <div>
              <SectionLabel>What you need</SectionLabel>
              <BulletList items={guide.whatYouNeed} />
            </div>
            <div>
              <SectionLabel>What you get back</SectionLabel>
              <BulletList items={guide.whatYouGet} />
            </div>
          </div>
        </section>

        {/* Quick start — soft panel */}
        <section className="mb-12">
          <SectionLabel>Quick start</SectionLabel>
          <ol className="rounded-xl border border-border/50 bg-card/30 divide-y divide-border/40 overflow-hidden">
            {guide.quickStart.map((step, i) => (
              <li key={i} className="flex items-start gap-4 p-5">
                <span className="flex-shrink-0 w-7 h-7 rounded-full border border-border/60 bg-background text-foreground/70 text-[12px] font-semibold flex items-center justify-center mt-0.5 tabular-nums">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-[15px] font-medium text-foreground leading-snug">{step.label}</p>
                  {step.detail && (
                    <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
                      {step.detail}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Tips — Do / Avoid two-column inside soft panel */}
        <section className="mb-12">
          <SectionLabel>Tips & best practices</SectionLabel>
          <div className="rounded-xl border border-border/50 bg-card/30 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/70 mb-3">
                  Do
                </p>
                <ul className="space-y-2.5">
                  {guide.tips
                    .filter((t) => t.type === 'do')
                    .map((tip, i) => (
                      <li
                        key={i}
                        className="text-[14px] text-foreground/90 leading-relaxed flex items-start gap-2.5"
                      >
                        <span className="mt-[9px] w-1 h-1 rounded-full bg-foreground/50 flex-shrink-0" />
                        <span>{tip.text}</span>
                      </li>
                    ))}
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
                  Avoid
                </p>
                <ul className="space-y-2.5">
                  {guide.tips
                    .filter((t) => t.type === 'dont')
                    .map((tip, i) => (
                      <li
                        key={i}
                        className="text-[14px] text-muted-foreground leading-relaxed flex items-start gap-2.5"
                      >
                        <span className="mt-[9px] w-1 h-1 rounded-full bg-muted-foreground/50 flex-shrink-0" />
                        <span>{tip.text}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA — soft panel */}
        <section className="mt-16">
          <div className="rounded-xl border border-border/50 bg-card/30 p-6">
            <p className="text-[13px] font-medium text-foreground/80 mb-4">Ready to try it?</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => navigate(guide.cta.route)} className="gap-2 rounded-full font-medium">
                {guide.cta.label}
                <ArrowRight className="w-4 h-4" />
              </Button>
              {guide.secondaryCta && (
                <Button
                  variant="outline"
                  onClick={() => navigate(guide.secondaryCta!.route)}
                  className="gap-2 rounded-full font-medium"
                >
                  {guide.secondaryCta.label}
                </Button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
