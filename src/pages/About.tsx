import { PageLayout } from '@/components/landing/PageLayout';
import { Users, Lightbulb, Heart, Zap, Linkedin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { TEAM_MEMBERS } from '@/data/teamData';
import { TeamAvatarHoverCard } from '@/components/landing/TeamAvatarHoverCard';
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
      'Complex technology, effortless experience. Upload a product, pick a workflow, get studio-quality results.',
  },
];

export default function About() {
  return (
    <PageLayout>
      <SEOHead
        title="About VOVV AI — The Team Behind AI Product Photography"
        description="Meet the team building the future of e-commerce visual content with AI-powered photography and automation."
        canonical={`${SITE_URL}/about`}
      />

      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Users className="w-4 h-4" />
            About VOVV.AI
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-6">
            Studio-quality product photography, powered by AI
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            VOVV.AI is an AI-powered visual studio for e-commerce brands. Upload a product photo, generate professional images across workflows — from virtual try-on to lifestyle scenes — in seconds.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">The Problem</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Traditional product photography is expensive, slow, and doesn't scale. A single lifestyle shoot can cost thousands and take weeks — and you still only get a handful of images.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Brands need fresh content constantly — for listings, ads, social, and seasonal campaigns. The old model can't keep up.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Our Approach</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We built VOVV.AI to make professional product visuals accessible to every brand, regardless of size or budget.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                One product image is all it takes. Our AI workflows handle on-model shots, lifestyle scenes, flat lays, upscaling, and more — delivering studio-quality results in minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">What Drives Us</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v) => (
              <Card key={v.title} className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <v.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Team */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-3">Meet the AI Team</h2>
            <p className="text-muted-foreground">
              A diverse crew of AI-powered specialists — each trained to handle a different aspect of product imagery.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {TEAM_MEMBERS.map((member) => (
              <TeamAvatarHoverCard key={member.name} member={member} side="top">
                <div className="text-center group cursor-pointer">
                  <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-3 ring-2 ring-border group-hover:ring-primary/50 transition-all">
                    <img src={member.avatar} alt={member.fullName} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-sm font-medium text-foreground">{member.fullName}</h4>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </TeamAvatarHoverCard>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-border mb-4">
              <img
                src={founderImg}
                alt="Tomas Simkus"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Tomas Simkus</h3>
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
      </section>
    </PageLayout>
  );
}
