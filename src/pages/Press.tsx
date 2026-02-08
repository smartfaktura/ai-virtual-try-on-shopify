import { PageLayout } from '@/components/landing/PageLayout';
import { Megaphone, Download, Mail, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const brandFacts = [
  { label: 'Founded', value: '2024' },
  { label: 'Team Size', value: '25+' },
  { label: 'Images Generated', value: '2M+' },
  { label: 'Brands Using VOVV.AI', value: '5,000+' },
  { label: 'Headquarters', value: 'Remote-first (US/EU)' },
  { label: 'Funding', value: 'Seed Stage' },
];

const mediaMentions = [
  {
    outlet: 'TechCrunch',
    headline: 'VOVV.AI raises seed round to automate product photography with generative AI',
    date: 'December 2025',
  },
  {
    outlet: 'Retail Dive',
    headline: 'How AI-generated product images are transforming e-commerce listings',
    date: 'November 2025',
  },
  {
    outlet: 'The Verge',
    headline: 'This startup lets brands create studio-quality photos from a single product image',
    date: 'October 2025',
  },
];

export default function Press() {
  return (
    <PageLayout>
      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Megaphone className="w-4 h-4" />
            Press & Media
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-6">
            VOVV.AI in the News
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Resources for journalists, bloggers, and media partners covering VOVV.AI and the future of AI-powered visual commerce.
          </p>
        </div>
      </section>

      {/* Brand Facts */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">Company at a Glance</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {brandFacts.map((fact) => (
              <div key={fact.label} className="text-center p-4 rounded-xl bg-card border border-border">
                <div className="text-xl font-bold text-foreground">{fact.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{fact.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Kit */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-2xl bg-card border border-border text-center">
            <Download className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-3">Brand Assets</h2>
            <p className="text-muted-foreground mb-2 max-w-lg mx-auto">
              Download our official logos, brand colors, and product screenshots for media use. Please follow the included brand guidelines.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mt-6">
              <Button className="rounded-full px-6 gap-2" onClick={() => toast.info('Brand kit download coming soon')}>
                <Download className="w-4 h-4" />
                Download Brand Kit
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Includes: Logo (SVG, PNG), Colors, Screenshots</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Guidelines */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">Brand Guidelines</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground mb-3">Logo Usage</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Use "VOVV.AI" as the official brand name (all caps VOVV, followed by .AI)</li>
                  <li>• Maintain clear space around the logo equal to the height of the "V" mark</li>
                  <li>• Do not modify, recolor, or distort the logo</li>
                  <li>• Use the dark logo on light backgrounds, white logo on dark backgrounds</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground mb-3">Brand Voice</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Confident but approachable — professional without being corporate</li>
                  <li>• We refer to our product as "VOVV.AI" or "the VOVV.AI visual studio"</li>
                  <li>• Emphasize speed, quality, and accessibility in messaging</li>
                  <li>• Avoid jargon — our audience includes non-technical brand owners</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Media Mentions */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">Recent Coverage</h2>
          <div className="space-y-4">
            {mediaMentions.map((mention) => (
              <Card key={mention.headline} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="py-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <Badge variant="secondary" className="rounded-full text-xs">
                        {mention.outlet}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{mention.date}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{mention.headline}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Mail className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">Press Inquiries</h2>
          <p className="text-muted-foreground mb-4">
            For interviews, commentary, or media partnerships, reach out to our communications team.
          </p>
          <a
            href="mailto:press@vovv.ai"
            className="text-primary font-medium hover:underline"
          >
            press@vovv.ai
          </a>
        </div>
      </section>
    </PageLayout>
  );
}
