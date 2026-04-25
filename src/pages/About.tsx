import { PageLayout } from '@/components/landing/PageLayout';
import { Link } from 'react-router-dom';
import { ArrowRight, Lightbulb, Heart, Zap, Linkedin } from 'lucide-react';
import { TEAM_MEMBERS } from '@/data/teamData';
import { TeamAvatarHoverCard } from '@/components/landing/TeamAvatarHoverCard';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { SEOHead } from '@/components/SEOHead';
import { SITE_URL } from '@/lib/constants';
import founderImg from '@/assets/founder-tomas.jpg';

const values = [
  {
    icon: Lightbulb,
    title: 'Innovation first',
    description:
      'We push the boundaries of generative AI to deliver product visuals that were impossible just a year ago.',
  },
  {
    icon: Heart,
    title: 'Inclusive by design',
    description:
      'Our AI model library spans every body type, ethnicity, and age — because your customers are diverse.',
  },
  {
    icon: Zap,
    title: 'Radical simplicity',
    description:
      'Complex technology, effortless experience. Upload a product, pick a Visual Type, get studio-quality results.',
  },
];

export default function About() {
  return (
    <PageLayout>
      <SEOHead
        title="About VOVV.AI — The Team Behind AI Product Photography"
        description="Meet the team building the future of e-commerce visual content with AI-powered photography and automation."
        canonical={`${SITE_URL}/about`}
      />

      <div className="bg-[#FAFAF8]">
        {/* Hero */}
        <section className="pt-20 pb-16 sm:pt-28 sm:pb-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
              About VOVV.AI
            </p>
            <h1 className="text-foreground text-[2.5rem] sm:text-5xl lg:text-[3.5rem] leading-[1.08] font-semibold tracking-[-0.03em] mb-6">
              Studio-quality product photography, powered by AI
            </h1>
            <p className="max-w-2xl mx-auto text-muted-foreground text-base sm:text-lg leading-relaxed">
              VOVV.AI is an AI-powered visual studio for e-commerce brands. Upload a product photo, generate professional images across Visual Types — from virtual try-on to lifestyle scenes — in seconds.
            </p>
          </div>
        </section>

        {/* Mission — Problem / Approach */}
        <section className="pb-16 sm:pb-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl border border-[#f0efed] shadow-sm p-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
                  The problem
                </p>
                <h2 className="text-[#1a1a2e] text-2xl font-semibold tracking-tight mb-4">
                  Old-school shoots don't scale
                </h2>
                <p className="text-foreground/70 leading-relaxed mb-3 text-[15px]">
                  Traditional product photography is expensive, slow, and doesn't scale. A single lifestyle shoot can cost thousands and take weeks — and you still only get a handful of images.
                </p>
                <p className="text-foreground/70 leading-relaxed text-[15px]">
                  Brands need fresh content constantly — for listings, ads, social, and seasonal campaigns. The old model can't keep up.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-[#f0efed] shadow-sm p-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
                  Our approach
                </p>
                <h2 className="text-[#1a1a2e] text-2xl font-semibold tracking-tight mb-4">
                  One photo, endless visuals
                </h2>
                <p className="text-foreground/70 leading-relaxed mb-3 text-[15px]">
                  We built VOVV.AI to make professional product visuals accessible to every brand, regardless of size or budget.
                </p>
                <p className="text-foreground/70 leading-relaxed text-[15px]">
                  One product image is all it takes. Our AI Visual Types handle on-model shots, lifestyle scenes, flat lays, upscaling, and more — delivering studio-quality results in minutes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Founder */}
        <section className="py-16 sm:py-20 bg-[#f5f5f3]">
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-white rounded-3xl border border-[#f0efed] shadow-sm p-8 sm:p-12">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
                <div className="shrink-0">
                  <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-2xl overflow-hidden ring-1 ring-[#f0efed]">
                    <img
                      src={founderImg}
                      alt="Tomas Simkus — Founder of VOVV.AI"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                    Founder note
                  </p>
                  <blockquote className="text-xl sm:text-2xl text-[#1a1a2e] leading-snug font-medium border-l-2 border-primary/50 pl-6 mb-6 tracking-tight">
                    "Every brand deserves visuals that look like they came from a professional studio — without the cost, the wait, or the complexity."
                  </blockquote>
                  <h3 className="text-base font-semibold text-[#1a1a2e] tracking-tight">Tomas Simkus</h3>
                  <p className="text-sm text-muted-foreground mb-3">Founder</p>
                  <a
                    href="https://www.linkedin.com/in/tomassimkusprofile/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 sm:py-24">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                What drives us
              </p>
              <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl font-semibold tracking-tight">
                Principles behind every pixel
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {values.map((v) => (
                <div
                  key={v.title}
                  className="bg-white rounded-2xl border border-[#f0efed] shadow-sm p-7"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <v.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-[#1a1a2e] text-[17px] font-semibold tracking-tight mb-2">
                    {v.title}
                  </h3>
                  <p className="text-[15px] text-foreground/70 leading-relaxed">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Team */}
        <section className="py-16 sm:py-24 bg-[#f5f5f3]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                The AI team
              </p>
              <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
                Meet your AI specialists
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-base">
                A diverse crew of AI-powered specialists — each trained to handle a different aspect of product imagery.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {TEAM_MEMBERS.map((member) => (
                <TeamAvatarHoverCard key={member.name} member={member} side="top">
                  <div className="text-center group cursor-pointer">
                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-3 ring-2 ring-white group-hover:ring-primary/40 transition-all shadow-sm">
                      <img src={getOptimizedUrl(member.avatar, { quality: 60 })} alt={member.fullName} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="text-sm font-semibold text-[#1a1a2e]">{member.fullName}</h4>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </TeamAvatarHoverCard>
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
            Start with one product photo
          </h2>
          <p className="text-[#9ca3af] text-base sm:text-lg leading-relaxed mb-10">
            See what VOVV.AI can create for your brand in under a minute.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-white text-[#1a1a2e] text-base font-semibold hover:bg-white/90 transition-colors w-full sm:w-auto"
            >
              Try free
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/discover"
              className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full border border-white/20 text-white text-base font-semibold hover:bg-white/10 transition-colors w-full sm:w-auto"
            >
              See examples
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
