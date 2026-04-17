import { ArrowLeft, ArrowRight, Check, Clock, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { LearnGuide } from '@/data/learnContent';

interface Props {
  guide: LearnGuide;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border/60 pt-6 mt-6 first:border-t-0 first:pt-0 first:mt-0">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">{title}</h2>
      {children}
    </section>
  );
}

export function GuideLayout({ guide }: Props) {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto pb-24 animate-in fade-in duration-300">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/learn')} className="gap-1.5 -ml-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Learn
        </Button>
        <Badge variant="outline" className="gap-1.5 text-[10px] font-medium text-muted-foreground border-border/60">
          <Clock className="w-3 h-3" />
          {guide.readMin} min read
        </Badge>
      </div>

      {/* Hero */}
      <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-gradient-to-br from-muted to-muted/40 mb-6 border border-border/40">
        {guide.heroImage ? (
          <img src={guide.heroImage} alt={guide.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* Title */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
          {guide.section === 'visual-studio' ? 'Visual Studio' : 'Freestyle Studio'}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">{guide.title}</h1>
        <p className="text-base text-muted-foreground leading-relaxed">{guide.tagline}</p>
      </div>

      {/* Body sections */}
      <div className="space-y-0">
        <Section title="What it does">
          <p className="text-[15px] text-foreground/90 leading-relaxed">{guide.whatItDoes}</p>
        </Section>

        <Section title="Best for">
          <div className="flex flex-wrap gap-2">
            {guide.bestFor.map((item) => (
              <Badge key={item} variant="secondary" className="font-normal text-xs px-3 py-1 rounded-full">
                {item}
              </Badge>
            ))}
          </div>
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
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-[15px] font-medium text-foreground">{step.label}</p>
                  {step.detail && <p className="text-sm text-muted-foreground mt-0.5">{step.detail}</p>}
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
                    tip.type === 'do' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'
                  )}
                >
                  {tip.type === 'do' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                </span>
                <span className="text-[15px] text-foreground/90 leading-relaxed">{tip.text}</span>
              </li>
            ))}
          </ul>
        </Section>

        {guide.examples && guide.examples.length > 0 && (
          <Section title="Visual examples">
            <div className="grid grid-cols-3 gap-3">
              {guide.examples.map((src, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden bg-muted border border-border/40">
                  <img src={src} alt={`Example ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* CTAs */}
      <div className="mt-10 pt-8 border-t border-border/60 flex flex-col sm:flex-row gap-3">
        <Button size="lg" onClick={() => navigate(guide.cta.route)} className="gap-2 rounded-full font-semibold">
          {guide.cta.label}
          <ArrowRight className="w-4 h-4" />
        </Button>
        {guide.secondaryCta && (
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate(guide.secondaryCta!.route)}
            className="gap-2 rounded-full font-semibold"
          >
            {guide.secondaryCta.label}
          </Button>
        )}
      </div>
    </div>
  );
}
