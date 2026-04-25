import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { SITE_URL } from '@/lib/constants';
import { TEAM_MEMBERS } from '@/data/teamData';
import { ArrowRight, Upload, ScanSearch, Wand2, Zap } from 'lucide-react';
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

      <div className="bg-[#FAFAF8]">
        {/* Hero */}
        <section className="pt-20 pb-16 sm:pt-28 sm:pb-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Your AI Creative Studio
            </p>
            <h1 className="text-foreground text-[2.5rem] sm:text-5xl lg:text-[3.5rem] leading-[1.08] font-semibold tracking-[-0.03em] mb-6">
              10 specialists.
              <br />
              <span className="text-[#4a5578]">Zero overhead.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-muted-foreground text-base sm:text-lg leading-relaxed">
              A dedicated AI-powered creative team that never sleeps, never misses deadlines, and delivers studio-quality product visuals on demand.
            </p>
          </div>
        </section>

        {/* Team grid */}
        <section className="pb-20 sm:pb-28">
          <div
            ref={containerRef}
            className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
          >
            {TEAM_MEMBERS.map((member, i) => (
              <div
                key={member.name}
                className="group rounded-2xl border border-[#f0efed] bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                style={{
                  opacity: visible[i] ? 1 : 0,
                  transform: visible[i] ? 'translateY(0)' : 'translateY(16px)',
                  transition: 'opacity 0.5s ease-out, transform 0.5s ease-out, box-shadow 0.3s',
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
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                </div>
                <div className="p-5 space-y-1">
                  <h3 className="text-[15px] font-semibold text-[#1a1a2e] tracking-tight">
                    {member.fullName}
                  </h3>
                  <p className="text-[12px] font-medium text-primary uppercase tracking-wider">
                    {member.role}
                  </p>
                  <p className="text-[13px] text-foreground/60 leading-relaxed pt-1.5">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 sm:py-24 bg-[#f5f5f3]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-14">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                How it works
              </p>
              <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
                From upload to download in four steps
              </h2>
              <p className="text-muted-foreground text-base max-w-xl mx-auto">
                Your AI studio team handles every step — you just review and download.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map((step, idx) => (
                <div
                  key={step.title}
                  className="bg-white rounded-2xl border border-[#f0efed] shadow-sm p-6 text-left"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    Step {idx + 1}
                  </p>
                  <h3 className="text-[#1a1a2e] text-[16px] font-semibold leading-snug tracking-tight mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[14px] text-foreground/70 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Final dark CTA */}
      <section className="py-16 lg:py-28 bg-[#1a1a2e] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#475569] blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#64748b] blur-3xl" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 mb-4">
            Get started
          </p>
          <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-5">
            Your AI studio team is ready
          </h2>
          <p className="text-[#9ca3af] text-base sm:text-lg leading-relaxed mb-10">
            Generate professional product visuals in seconds — no photoshoots, studios, or editing.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-white text-[#1a1a2e] text-base font-semibold hover:bg-white/90 transition-colors w-full sm:w-auto"
            >
              Start free
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/discover"
              className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full border border-white/20 text-white text-base font-semibold hover:bg-white/10 transition-colors w-full sm:w-auto"
            >
              See examples
            </Link>
          </div>
          <p className="text-[11px] tracking-[0.12em] uppercase text-white/40 font-medium mt-8">
            Free to try · No credit card required
          </p>
        </div>
      </section>
    </PageLayout>
  );
}
