import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLearnRead } from '@/hooks/useLearnRead';
import type { LearnGuide } from '@/data/learnContent';

interface Props {
  guide: LearnGuide;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 first:mt-0">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function GuideLayout({ guide }: Props) {
  const navigate = useNavigate();
  const { markRead } = useLearnRead();

  useEffect(() => {
    markRead(guide.section, guide.slug);
  }, [guide.section, guide.slug, markRead]);

  return (
    <div className="max-w-2xl mx-auto pt-2 pb-24 animate-in fade-in duration-300">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/app/learn')}
        className="gap-1.5 -ml-2 mb-8 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Learn
      </Button>

      {/* Title */}
      <header className="mb-12">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
          {guide.title}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mt-3">{guide.tagline}</p>
        <div className="mt-5">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted text-[12px] text-muted-foreground tabular-nums">
            {guide.readMin} min read
          </span>
        </div>
      </header>

      {/* Body */}
      <div>
        <Section title="What it does">
          <p className="text-[15px] text-foreground/90 leading-relaxed">{guide.whatItDoes}</p>
        </Section>

        <Section title="Best for">
          <ul className="space-y-2">
            {guide.bestFor.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[15px] text-foreground/90 leading-relaxed">
                <span className="mt-2 w-1 h-1 rounded-full bg-foreground/40 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="What you need">
          <ul className="space-y-2">
            {guide.whatYouNeed.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[15px] text-foreground/90 leading-relaxed">
                <span className="mt-2 w-1 h-1 rounded-full bg-foreground/40 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="What you get back">
          <ul className="space-y-2">
            {guide.whatYouGet.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[15px] text-foreground/90 leading-relaxed">
                <span className="mt-2 w-1 h-1 rounded-full bg-foreground/40 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Quick start">
          <ol className="space-y-3.5">
            {guide.quickStart.map((step, i) => (
              <li key={i} className="flex items-start gap-3.5">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted text-foreground/70 text-[12px] font-semibold flex items-center justify-center mt-0.5 tabular-nums">
                  {i + 1}
                </span>
                <div className="flex-1 pt-0.5">
                  <p className="text-[15px] font-medium text-foreground leading-snug">{step.label}</p>
                  {step.detail && (
                    <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">{step.detail}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Tips & best practices">
          <ul className="space-y-3">
            {guide.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span
                  className={cn(
                    'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5',
                    tip.type === 'do'
                      ? 'bg-foreground/5 text-foreground/70'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {tip.type === 'do' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                </span>
                <span className="text-[15px] text-foreground/90 leading-relaxed">{tip.text}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {/* CTAs */}
      <div className="mt-16 pt-10">
        <p className="text-[13px] text-muted-foreground mb-4">Ready to try it?</p>
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
    </div>
  );
}
