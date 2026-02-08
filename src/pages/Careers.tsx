import { PageLayout } from '@/components/landing/PageLayout';
import { Briefcase, Rocket, Users, Palette, MapPin, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const cultureValues = [
  {
    icon: Rocket,
    title: 'Ship Fast, Learn Faster',
    description:
      'We believe in rapid iteration. Ship early, gather feedback, and improve relentlessly.',
  },
  {
    icon: Users,
    title: 'Remote-First Culture',
    description:
      'Work from anywhere. Our team spans 8 time zones and we embrace async collaboration.',
  },
  {
    icon: Palette,
    title: 'Creativity Meets Engineering',
    description:
      'We sit at the intersection of art and technology. Every team member brings a creative lens.',
  },
];

const positions = [
  {
    title: 'Senior ML Engineer',
    team: 'AI / ML',
    location: 'Remote',
    type: 'Full-time',
    description:
      'Build and optimize our generative AI pipeline for product photography. Experience with diffusion models and image generation required.',
  },
  {
    title: 'Product Designer',
    team: 'Design',
    location: 'Remote',
    type: 'Full-time',
    description:
      'Design intuitive interfaces for our visual studio platform. Strong portfolio in SaaS or creative tools preferred.',
  },
  {
    title: 'Growth Lead',
    team: 'Marketing',
    location: 'Remote',
    type: 'Full-time',
    description:
      'Drive user acquisition and retention for VOVV.AI. Experience scaling B2B SaaS products from seed to Series A.',
  },
  {
    title: 'Full-Stack Engineer',
    team: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description:
      'Build features across our React frontend and serverless backend. TypeScript expertise and a passion for developer experience.',
  },
  {
    title: 'Customer Success Manager',
    team: 'Operations',
    location: 'Remote (US/EU)',
    type: 'Full-time',
    description:
      'Help e-commerce brands get the most from VOVV.AI. Strong communication skills and e-commerce background a plus.',
  },
];

export default function Careers() {
  return (
    <PageLayout>
      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Briefcase className="w-4 h-4" />
            Careers
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-6">
            Build the future of visual commerce
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Join a small, passionate team reimagining how brands create product imagery. We're remote-first, creativity-driven, and growing fast.
          </p>
        </div>
      </section>

      {/* Culture */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">Why VOVV.AI?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {cultureValues.map((v) => (
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

      {/* Open Positions */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground text-center mb-3">Open Positions</h2>
          <p className="text-muted-foreground text-center mb-10">
            {positions.length} roles open — all remote-friendly
          </p>
          <div className="space-y-4">
            {positions.map((pos) => (
              <Card key={pos.title} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="py-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <h3 className="font-semibold text-foreground text-lg">{pos.title}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="gap-1 rounded-full">
                        <Users className="w-3 h-3" />
                        {pos.team}
                      </Badge>
                      <Badge variant="outline" className="gap-1 rounded-full">
                        <MapPin className="w-3 h-3" />
                        {pos.location}
                      </Badge>
                      <Badge variant="outline" className="gap-1 rounded-full">
                        <Clock className="w-3 h-3" />
                        {pos.type}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{pos.description}</p>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => window.location.href = 'mailto:careers@vovv.ai?subject=Application: ' + pos.title}>
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12 p-8 rounded-2xl bg-muted/50 border border-border">
            <h3 className="font-semibold text-foreground mb-2">Don't see your role?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We're always looking for exceptional people. Send us your resume and tell us how you'd contribute.
            </p>
            <Button variant="outline" className="rounded-full" onClick={() => window.location.href = 'mailto:careers@vovv.ai'}>
              Send Open Application
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
