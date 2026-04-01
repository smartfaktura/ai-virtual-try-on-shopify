import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { SITE_URL } from '@/lib/constants';
import { Megaphone, Download, Mail, Palette, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/brandedToast';

const LOGO_DARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 60" fill="none">
  <text x="0" y="46" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="800" letter-spacing="4" fill="#1a2332">VOVV</text>
  <text x="195" y="46" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="800" letter-spacing="2" fill="#1a2332">.AI</text>
</svg>`;

const LOGO_WHITE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 60" fill="none">
  <text x="0" y="46" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="800" letter-spacing="4" fill="#ffffff">VOVV</text>
  <text x="195" y="46" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="800" letter-spacing="2" fill="#ffffff">.AI</text>
</svg>`;

const brandColors = [
  { name: 'Navy', hsl: 'hsl(217, 33%, 17%)', hex: '#1D2B3A' },
  { name: 'Steel', hsl: 'hsl(210, 17%, 70%)', hex: '#A3B1C2' },
  { name: 'Slate', hsl: 'hsl(215, 20%, 45%)', hex: '#5A6E82' },
  { name: 'Ivory', hsl: 'hsl(40, 33%, 96%)', hex: '#F7F4EF' },
  { name: 'White', hsl: 'hsl(0, 0%, 100%)', hex: '#FFFFFF' },
];

function downloadBlob(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success(`Downloaded ${fileName}`);
}

function downloadBrandColors() {
  const json = JSON.stringify({ brand: 'VOVV.AI', colors: brandColors }, null, 2);
  downloadBlob(json, 'vovv-brand-colors.json', 'application/json');
}

export default function Press() {
  return (
    <PageLayout>
      <SEOHead
        title="Press & Media Resources — VOVV AI"
        description="Download VOVV AI brand assets, logos, and color palette. Media inquiries welcome."
        canonical={`${SITE_URL}/press`}
      />

      {/* Hero */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Megaphone className="w-4 h-4" />
            Press & Media
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-6 leading-[1.1]">
            Media Resources
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Everything journalists and partners need — brand assets, product information, and contact details.
          </p>
        </div>
      </section>

      {/* What is VOVV.AI */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">What is VOVV.AI?</h2>
          <div className="space-y-4 text-muted-foreground text-base sm:text-lg leading-relaxed">
            <p>
              VOVV.AI is an AI-powered visual studio built for e-commerce brands. Upload a product photo and generate studio-quality images across multiple templates — from virtual try-on to lifestyle scenes to product listing shots — in seconds.
            </p>
            <p>
              The platform helps brands create professional visual content without traditional photoshoots, reducing time and cost while maintaining high-quality, on-brand imagery.
            </p>
          </div>
        </div>
      </section>

      {/* Brand Assets */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Download className="w-8 h-8 text-primary mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Brand Assets</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Download official logos and brand colors for media use.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {/* Logo Dark */}
            <Card className="group bg-card border-border hover:border-primary/30 transition-all hover:shadow-lg">
              <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
                <div className="w-full h-24 rounded-lg bg-muted/50 flex items-center justify-center p-4">
                  <span className="text-2xl font-extrabold tracking-widest text-foreground">VOVV.AI</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">Logo — Dark</p>
                  <p className="text-xs text-muted-foreground mt-1">SVG, transparent background</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-full gap-2"
                  onClick={() => downloadBlob(LOGO_DARK_SVG, 'vovv-logo-dark.svg', 'image/svg+xml')}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </Button>
              </CardContent>
            </Card>

            {/* Logo White */}
            <Card className="group bg-card border-border hover:border-primary/30 transition-all hover:shadow-lg">
              <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
                <div className="w-full h-24 rounded-lg bg-foreground flex items-center justify-center p-4">
                  <span className="text-2xl font-extrabold tracking-widest text-white">VOVV.AI</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">Logo — White</p>
                  <p className="text-xs text-muted-foreground mt-1">SVG, transparent background</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-full gap-2"
                  onClick={() => downloadBlob(LOGO_WHITE_SVG, 'vovv-logo-white.svg', 'image/svg+xml')}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </Button>
              </CardContent>
            </Card>

            {/* Brand Colors */}
            <Card className="group bg-card border-border hover:border-primary/30 transition-all hover:shadow-lg">
              <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
                <div className="w-full h-24 rounded-lg overflow-hidden flex">
                  {brandColors.map((c) => (
                    <div key={c.name} className="flex-1 relative group/swatch" style={{ backgroundColor: c.hex }}>
                      <span className="absolute inset-0 flex items-end justify-center pb-1 text-[9px] font-mono opacity-0 group-hover/swatch:opacity-100 transition-opacity"
                        style={{ color: c.name === 'Navy' || c.name === 'Slate' ? '#fff' : '#1D2B3A' }}>
                        {c.hex}
                      </span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">Brand Colors</p>
                  <p className="text-xs text-muted-foreground mt-1">JSON with HSL & HEX values</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-full gap-2"
                  onClick={downloadBrandColors}
                >
                  <Palette className="w-3.5 h-3.5" />
                  Download
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Brand Guidelines */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-10">Brand Guidelines</h2>
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

      {/* Press Inquiries */}
      <section className="py-20 sm:py-24 bg-muted/30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-10 sm:p-14 rounded-2xl bg-card border border-border shadow-sm">
            <Mail className="w-10 h-10 text-primary mx-auto mb-5" />
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Press Inquiries</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              For interviews, commentary, product demos, or media partnerships — we'd love to hear from you.
            </p>
            <Button asChild className="rounded-full px-8 gap-2 text-base h-12">
              <a href="mailto:hello@vovv.ai">
                <Mail className="w-4 h-4" />
                hello@vovv.ai
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
