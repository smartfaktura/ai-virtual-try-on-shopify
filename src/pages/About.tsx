import { PageLayout } from '@/components/landing/PageLayout';
import { Users, Sparkles, Globe, Lightbulb, Heart, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

import avatarAmara from '@/assets/team/avatar-amara.jpg';
import avatarKenji from '@/assets/team/avatar-kenji.jpg';
import avatarLeo from '@/assets/team/avatar-leo.jpg';
import avatarLuna from '@/assets/team/avatar-luna.jpg';
import avatarMax from '@/assets/team/avatar-max.jpg';
import avatarOmar from '@/assets/team/avatar-omar.jpg';
import avatarSienna from '@/assets/team/avatar-sienna.jpg';
import avatarSophia from '@/assets/team/avatar-sophia.jpg';
import avatarYuki from '@/assets/team/avatar-yuki.jpg';
import avatarZara from '@/assets/team/avatar-zara.jpg';

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

const team = [
  { name: 'Sophia Chen', role: 'CEO & Co-Founder', avatar: avatarSophia },
  { name: 'Kenji Tanaka', role: 'CTO & Co-Founder', avatar: avatarKenji },
  { name: 'Amara Osei', role: 'VP of Engineering', avatar: avatarAmara },
  { name: 'Leo Martínez', role: 'Head of Product', avatar: avatarLeo },
  { name: 'Luna Park', role: 'Lead ML Engineer', avatar: avatarLuna },
  { name: 'Omar Farouk', role: 'Head of Design', avatar: avatarOmar },
  { name: 'Sienna Russo', role: 'Growth Lead', avatar: avatarSienna },
  { name: 'Yuki Nakamura', role: 'Senior Engineer', avatar: avatarYuki },
  { name: 'Zara Ahmed', role: 'Brand Strategist', avatar: avatarZara },
  { name: 'Max Lindqvist', role: 'ML Researcher', avatar: avatarMax },
];

const stats = [
  { value: '2M+', label: 'Images Generated' },
  { value: '5,000+', label: 'Brands Served' },
  { value: '40+', label: 'AI Models Available' },
  { value: '99.9%', label: 'Platform Uptime' },
];

export default function About() {
  return (
    <PageLayout>
      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Users className="w-4 h-4" />
            Our Story
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-6">
            We're eliminating the bottleneck of product photography
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            VOVV.AI was founded with a simple belief: every e-commerce brand deserves stunning product visuals — without the cost, complexity, or delays of traditional photoshoots.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Traditional product photography is expensive, slow, and doesn't scale. A single lifestyle shoot can cost thousands and take weeks — and you still only get a handful of images.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We built VOVV.AI to change that. Our AI-powered visual studio generates professional product photography in minutes — on-model shots, lifestyle scenes, flat lays, and more. All from a single product image.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We envision a world where visual content creation is instant, unlimited, and accessible to brands of every size.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                From solo Etsy sellers to global fashion houses, VOVV.AI is the creative engine that powers the next generation of e-commerce imagery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted/30">
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

      {/* Team */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-3">Meet the Team</h2>
            <p className="text-muted-foreground">
              A diverse crew of engineers, designers, and creatives building the future of product imagery.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {team.map((member) => (
              <div key={member.name} className="text-center group">
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-3 ring-2 ring-border group-hover:ring-primary/50 transition-all">
                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="text-sm font-medium text-foreground">{member.name}</h4>
                <p className="text-xs text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
