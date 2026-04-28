import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from '@/lib/seo/schema';
import { SITE_URL } from '@/lib/constants';
import { Download, Palette, ArrowRight } from 'lucide-react';
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
        title="Press & Media Resources — VOVV.AI"
        description="Download VOVV.AI brand assets, logos, and color palette. Media inquiries welcome."
        canonical={`${SITE_URL}/press`}
      />
      <JsonLd data={buildBreadcrumbJsonLd([{ name: 'Press', path: '/press' }])} />
      <JsonLd data={buildWebPageJsonLd({ name: 'Press & Media Resources', description: 'Download VOVV.AI brand assets, logos, and color palette. Media inquiries welcome.', path: '/press' })} />

      <div className="bg-[#FAFAF8]">
        {/* Hero */}
        <section className="pt-20 pb-16 sm:pt-28 sm:pb-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Press &amp; Media
            </p>
            <h1 className="text-foreground text-[2.5rem] sm:text-5xl lg:text-[3.5rem] leading-[1.08] font-semibold tracking-[-0.03em] mb-6">
              Media Resources
            </h1>
            <p className="max-w-2xl mx-auto text-muted-foreground text-base sm:text-lg leading-relaxed">
              Everything journalists and partners need — brand assets, product information, and contact details.
            </p>
          </div>
        </section>

        {/* About the company */}
        <section className="pb-16 sm:pb-20">
          <div className="max-w-3xl mx-auto px-6">
            <div className="bg-white rounded-2xl border border-[#f0efed] shadow-sm p-8 sm:p-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
                About the company
              </p>
              <h2 className="text-[#1a1a2e] text-2xl sm:text-3xl font-semibold tracking-tight mb-5">
                What is VOVV.AI?
              </h2>
              <div className="space-y-4 text-foreground/70 text-[15px] sm:text-base leading-relaxed">
                <p>
                  VOVV.AI is an AI-powered visual studio built for e-commerce brands. Upload a product photo and generate studio-quality images across multiple Visual Types — from virtual try-on to lifestyle scenes to product listing shots — in seconds.
                </p>
                <p>
                  The platform helps brands create professional visual content without traditional photoshoots, reducing time and cost while maintaining high-quality, on-brand imagery.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Brand assets */}
        <section className="py-16 sm:py-20 bg-[#f5f5f3]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Brand assets
              </p>
              <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
                Download our official kit
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto text-base">
                Logos and brand colors for editorial and partner use.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              {/* Logo Dark */}
              <div className="bg-white rounded-2xl border border-[#f0efed] shadow-sm p-6 flex flex-col items-center text-center gap-4">
                <div className="w-full h-28 rounded-xl bg-[#FAFAF8] flex items-center justify-center p-4">
                  <span className="text-2xl font-extrabold tracking-widest text-[#1a1a2e]">VOVV.AI</span>
                </div>
                <div>
                  <p className="font-semibold text-[#1a1a2e] text-sm">Logo — Dark</p>
                  <p className="text-xs text-muted-foreground mt-1">SVG, transparent background</p>
                </div>
                <button
                  onClick={() => downloadBlob(LOGO_DARK_SVG, 'vovv-logo-dark.svg', 'image/svg+xml')}
                  className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-full border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>

              {/* Logo White */}
              <div className="bg-white rounded-2xl border border-[#f0efed] shadow-sm p-6 flex flex-col items-center text-center gap-4">
                <div className="w-full h-28 rounded-xl bg-[#1a1a2e] flex items-center justify-center p-4">
                  <span className="text-2xl font-extrabold tracking-widest text-white">VOVV.AI</span>
                </div>
                <div>
                  <p className="font-semibold text-[#1a1a2e] text-sm">Logo — White</p>
                  <p className="text-xs text-muted-foreground mt-1">SVG, transparent background</p>
                </div>
                <button
                  onClick={() => downloadBlob(LOGO_WHITE_SVG, 'vovv-logo-white.svg', 'image/svg+xml')}
                  className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-full border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>

              {/* Brand colors */}
              <div className="bg-white rounded-2xl border border-[#f0efed] shadow-sm p-6 flex flex-col items-center text-center gap-4">
                <div className="w-full h-28 rounded-xl overflow-hidden flex">
                  {brandColors.map((c) => (
                    <div key={c.name} className="flex-1 relative group/swatch" style={{ backgroundColor: c.hex }}>
                      <span
                        className="absolute inset-0 flex items-end justify-center pb-1 text-[9px] font-mono opacity-0 group-hover/swatch:opacity-100 transition-opacity"
                        style={{ color: c.name === 'Navy' || c.name === 'Slate' ? '#fff' : '#1D2B3A' }}
                      >
                        {c.hex}
                      </span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-[#1a1a2e] text-sm">Brand colors</p>
                  <p className="text-xs text-muted-foreground mt-1">JSON with HSL &amp; HEX values</p>
                </div>
                <button
                  onClick={downloadBrandColors}
                  className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-full border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
                >
                  <Palette className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Brand guidelines */}
        <section className="py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Brand guidelines
              </p>
              <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl font-semibold tracking-tight">
                Using VOVV.AI in the wild
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl border border-[#f0efed] shadow-sm p-7">
                <h3 className="text-[#1a1a2e] text-[17px] font-semibold tracking-tight mb-4">Logo usage</h3>
                <ul className="space-y-2.5 text-[15px] text-foreground/70 leading-relaxed">
                  <li>• Use "VOVV.AI" as the official brand name (all caps VOVV, followed by .AI)</li>
                  <li>• Maintain clear space around the logo equal to the height of the "V" mark</li>
                  <li>• Do not modify, recolor, or distort the logo</li>
                  <li>• Use the dark logo on light backgrounds, white logo on dark backgrounds</li>
                </ul>
              </div>
              <div className="bg-white rounded-2xl border border-[#f0efed] shadow-sm p-7">
                <h3 className="text-[#1a1a2e] text-[17px] font-semibold tracking-tight mb-4">Brand voice</h3>
                <ul className="space-y-2.5 text-[15px] text-foreground/70 leading-relaxed">
                  <li>• Confident but approachable — professional without being corporate</li>
                  <li>• We refer to our product as "VOVV.AI" or "the VOVV.AI visual studio"</li>
                  <li>• Emphasize speed, quality, and accessibility in messaging</li>
                  <li>• Avoid jargon — our audience includes non-technical brand owners</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Final dark CTA — Press inquiries */}
      <section className="py-16 lg:py-28 bg-[#1a1a2e] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#475569] blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#64748b] blur-3xl" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 mb-4">
            Press &amp; partnerships
          </p>
          <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-5">
            Let's talk
          </h2>
          <p className="text-[#9ca3af] text-base sm:text-lg leading-relaxed mb-10">
            Interviews, commentary, demos, partnerships — we'd love to hear from you.
          </p>
          <a
            href="mailto:hello@vovv.ai"
            className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-white text-[#1a1a2e] text-base font-semibold hover:bg-white/90 transition-colors"
          >
            hello@vovv.ai
            <ArrowRight size={16} />
          </a>
        </div>
      </section>
    </PageLayout>
  );
}
