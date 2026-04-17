import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { SITE_URL } from '@/lib/constants';
import { TEAM_MEMBERS } from '@/data/teamData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Upload, ScanSearch, Wand2, Zap, Sparkles, CreditCard, X } from 'lucide-react';
import { getOptimizedUrl } from '@/lib/imageOptimization';

/* ─── Staggered-fade hook via IntersectionObserver ─── */
function useStaggeredReveal(count: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState<boolean[]>(new Array(count).fill(false));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // stagger each card 100ms apart
          for (let i = 0; i < count; i++) {
            setTimeout(() => {
              setVisible((prev) => {
                const next = [...prev];
                next[i] = true;
                return next;
              });
            }, i * 100);
          }
          observer.disconnect();
        }
      },
      { threshold: 0.05 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [count]);

  return { containerRef, visible };
}

/* ─── How-it-works steps ─── */
const STEPS = [
  { icon: Upload, title: 'Upload your product image', description: 'Drop in any product photo — flat-lay, mannequin, or hanger.' },
  { icon: ScanSearch, title: 'AI team analyzes style & brand', description: 'Your AI specialists read the product, brand profile, and intent.' },
  { icon: Wand2, title: 'Scenes & compositions generated', description: 'Lighting, backgrounds, poses, and styling come together automatically.' },
  { icon: Zap, title: 'Studio-grade visuals delivered', description: 'Download-ready images in seconds — no editing, no retouching.' },
];

export default function Team() {
  const { containerRef, visible } = useStaggeredReveal(TEAM_MEMBERS.length);

  return (
    <PageLayout>
      <SEOHead
        title="Meet the VOVV.AI Studio Team — Your AI Creative Crew"
        description="10 AI professionals, zero overhead. Meet the virtual creative team powering your e-commerce product photography at VOVV.AI."
        canonical={`${SITE_URL}/team`}
      />

      {/* ── Hero ── */}
      <section className="py-24 sm:py-32 text-center px-4">
        <Badge variant="secondary" className="mb-6 text-xs tracking-widest uppercase px-4 py-1.5">
          Your AI Creative Studio
        </Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground max-w-3xl mx-auto leading-[1.1]">
          Your AI Creative Studio
        </h1>
        <p className="mt-3 text-2xl sm:text-3xl font-semibold text-primary">
          10 Specialists. Zero Overhead.
        </p>
        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          A dedicated AI-powered creative team that never sleeps, never misses deadlines,
          and delivers studio-quality product visuals on demand.
        </p>
        <p className="mt-3 text-sm text-muted-foreground/70 italic">
          Powered by advanced generative AI models trained for e-commerce visual production.
        </p>
      </section>

      {/* ── Team Grid ── */}
      <section className="pb-24 sm:pb-32 px-4 sm:px-6 lg:px-8">
        <div
          ref={containerRef}
          className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 lg:gap-10"
        >
          {TEAM_MEMBERS.map((member, i) => (
            <div
              key={member.name}
              className="group rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
              style={{
                opacity: visible[i] ? 1 : 0,
                transform: visible[i] ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 0.5s ease-out, transform 0.5s ease-out, box-shadow 0.3s, border-color 0.3s',
              }}
            >
              <div className="aspect-[4/5] overflow-hidden bg-muted">
                <video
                  src={member.videoUrl}
                  poster={getOptimizedUrl(member.avatar, { quality: 60 })}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="none"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
              </div>
              <div className="p-4 sm:p-5 space-y-1.5">
                <h3 className="font-semibold text-foreground">{member.fullName}</h3>
                <p className="text-sm font-medium text-primary">{member.role}</p>
                <p className="text-xs text-muted-foreground leading-relaxed pt-1">{member.description}</p>
                {/* Expertise tag — fades in on hover */}
                <Badge
                  variant="outline"
                  className="mt-2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  {member.expertiseTag}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How Your AI Studio Team Works ── */}
      <section className="py-20 sm:py-28 border-t border-border bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            How Your AI Studio Team Works
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
            From upload to download-ready visuals in four simple steps.
          </p>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {STEPS.map((step, idx) => (
              <div key={step.title} className="flex flex-col items-center text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xs font-bold text-muted-foreground tracking-widest uppercase">
                  Step {idx + 1}
                </span>
                <h3 className="text-base font-semibold text-foreground leading-snug">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 sm:py-28 border-t border-border bg-muted/30">
        <div className="max-w-2xl mx-auto text-center px-4 space-y-8">
          {/* Trust signal */}
          <p className="text-sm text-muted-foreground">
            Perfect for Shopify brands, Amazon sellers, and modern e-commerce teams.
          </p>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Your AI Studio Team Is Ready
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Generate professional product visuals in seconds — without photoshoots, studios, or editing.
          </p>

          <Button asChild size="lg" className="rounded-xl text-base px-8 min-h-[48px]">
            <Link to="/auth">
              Start Creating Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-2">
            <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Free to try</span>
            <span className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><X className="h-3.5 w-3.5" /> Cancel anytime</span>
          </div>

          <div className="pt-4">
            <p className="text-sm text-muted-foreground">
              Questions? Reach out at{' '}
              <a href="mailto:hello@vovv.ai" className="text-primary hover:underline font-medium">
                hello@vovv.ai
              </a>
            </p>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
