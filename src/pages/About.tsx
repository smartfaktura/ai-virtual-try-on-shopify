import { PageLayout } from '@/components/landing/PageLayout';
import { Users, Lightbulb, Heart, Zap, Linkedin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { TEAM_MEMBERS } from '@/data/teamData';
import { TeamAvatarHoverCard } from '@/components/landing/TeamAvatarHoverCard';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { SEOHead } from '@/components/SEOHead';
import { SITE_URL } from '@/lib/constants';
import founderImg from '@/assets/founder-tomas.jpg';

const values = [
  {
    icon: Lightbulb,
    title: 'Innovation First',
    description:
      'We push the boundaries of generative AI to deliver product visuals that were impossible just a year ago.',
  },
  {
    icon: Heart,
    title: 'Inclusive by Design',
    description:
      'Our AI model library spans every body type, ethnicity, and age — because your customers are diverse.',
  },
  {
    icon: Zap,
    title: 'Radical Simplicity',
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

      {/* Hero */}
      <section className="py-24 sm:py-32 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-12 h-px bg-primary/40 mx-auto mb-8" />
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Users className="w-4 h-4" />
            About VOVV.AI
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-6">
            Studio-quality product photography, powered by AI
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            VOVV.AI is an AI-powered visual studio for e-commerce brands. Upload a product photo, generate professional images across Visual Types — from virtual try-on to lifestyle scenes — in seconds.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 border-t border-border/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight mb-4">The Problem</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Traditional product photography is expensive, slow, and doesn't scale. A single lifestyle shoot can cost thousands and take weeks — and you still only get a handful of images.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Brands need fresh content constantly — for listings, ads, social, and seasonal campaigns. The old model can't keep up.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight mb-4">Our Approach</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We built VOVV.AI to make professional product visuals accessible to every brand, regardless of size or budget.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                One product image is all it takes. Our AI Visual Types handle on-model shots, lifestyle scenes, flat lays, upscaling, and more — delivering studio-quality results in minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border/60 bg-card/50 backdrop-blur-sm p-8 sm:p-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
              <div className="shrink-0">
                <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-2xl overflow-hidden ring-1 ring-border shadow-xl">
                  <img
                    src={founderImg}
                    alt="Tomas Simkus — Founder of VOVV.AI"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <blockquote className="text-xl sm:text-2xl italic text-foreground/90 leading-relaxed border-l-4 border-primary/60 pl-6 mb-6">
                  "Every brand deserves visuals that look like they came from a professional studio — without the cost, the wait, or the complexity."
                </blockquote>
                <h3 className="text-lg font-semibold text-foreground tracking-tight">Tomas Simkus</h3>
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
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-12 h-px bg-primary/40 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-foreground tracking-tight">What Drives Us</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v) => (
              <Card key={v.title} className="bg-card/60 border-border/60 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <v.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground tracking-tight mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Team */}
      <section className="py-20 border-t border-border/40 bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-12 h-px bg-primary/40 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-foreground tracking-tight mb-3">Meet the AI Team</h2>
            <p className="text-muted-foreground">
              A diverse crew of AI-powered specialists — each trained to handle a different aspect of product imagery.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {TEAM_MEMBERS.map((member) => (
              <TeamAvatarHoverCard key={member.name} member={member} side="top">
                <div className="text-center group cursor-pointer">
                  <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-3 ring-2 ring-border group-hover:ring-primary/50 transition-all">
                    <img src={getOptimizedUrl(member.avatar, { quality: 60 })} alt={member.fullName} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-sm font-medium text-foreground">{member.fullName}</h4>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </TeamAvatarHoverCard>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
