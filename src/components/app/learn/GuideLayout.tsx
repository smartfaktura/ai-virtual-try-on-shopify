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
    <section className="border-t border-border/40 pt-6 mt-6 first:border-t-0 first:pt-0 first:mt-0">
      <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
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
    <div className="max-w-2xl mx-auto pb-24 animate-in fade-in duration-300">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/app/learn')}
        className="gap-1.5 -ml-2 mb-6 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Learn
      </Button>

      {/* Title */}
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{guide.title}</h1>
        <p className="text-base text-muted-foreground leading-relaxed">{guide.tagline}</p>
        <p className="text-[12px] text-muted-foreground/70 mt-3 tabular-nums">{guide.readMin} min read</p>
      </header>

      {/* Body */}
      <div className="space-y-0">
        <Section title="What it does">
          <p className="text-[15px] text-foreground/90 leading-relaxed">{guide.whatItDoes}</p>
        </Section>

        <Section title="Best for">
          <ul className="space-y-2">
            {guide.bestFor.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[15px] text-foreground/90">
                <span className="mt-2 w-1 h-1 rounded-full bg-foreground/40 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="What you need">
          <ul className="space-y-2">
            {guide.whatYouNeed.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[15px] text-foreground/90">
                <span className="mt-2 w-1 h-1 rounded-full bg-foreground/40 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="What you get back">
          <ul className="space-y-2">
            {guide.whatYouGet.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[15px] text-foreground/90">
                <span className="mt-2 w-1 h-1 rounded-full bg-foreground/40 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Quick start">
          <ol className="space-y-3">
            {guide.quickStart.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted text-foreground/70 text-[12px] font-semibold flex items-center justify-center mt-0.5 tabular-nums">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-[15px] font-medium text-foreground">{step.label}</p>
                  {step.detail && (
                    <p className="text-[13px] text-muted-foreground mt-0.5">{step.detail}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Tips & best practices">
          <ul className="space-y-2.5">
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
      <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row gap-3">
        <Button onClick={() => navigate(guide.cta.route)} className="gap-2 rounded-md font-medium">
          {guide.cta.label}
          <ArrowRight className="w-4 h-4" />
        </Button>
        {guide.secondaryCta && (
          <Button
            variant="outline"
            onClick={() => navigate(guide.secondaryCta!.route)}
            className="gap-2 rounded-md font-medium"
          >
            {guide.secondaryCta.label}
          </Button>
        )}
      </div>
    </div>
  );
}
