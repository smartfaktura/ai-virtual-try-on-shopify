import {
  ShoppingBag,
  Megaphone,
  Instagram,
  Mail,
  Calendar,
  Rocket,
  ZoomIn,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Ruler,
  ShieldCheck,
  Layers,
  Gauge,
  LayoutGrid,
  Lightbulb,
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, DEFAULT_OG_IMAGE } from '@/lib/constants';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingHeroSEO } from '@/components/seo/landing/LandingHeroSEO';
import { LandingValueCards } from '@/components/seo/landing/LandingValueCards';
import { LandingComparisonTable } from '@/components/seo/landing/LandingComparisonTable';
import { LandingWorkflowStrip } from '@/components/seo/landing/LandingWorkflowStrip';
import { LandingCategoryGrid } from '@/components/seo/landing/LandingCategoryGrid';
import { LandingFAQConfig } from '@/components/seo/landing/LandingFAQConfig';
import { LandingFinalCTASEO } from '@/components/seo/landing/LandingFinalCTASEO';

const PAGE_PATH = '/ai-product-photography-vs-studio';
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const TITLE = 'VOVV.AI vs Product Photography Studio | AI Product Visuals';
const DESCRIPTION =
  'Compare VOVV.AI with a traditional product photography studio. See how ecommerce brands can create product page images, ads, lifestyle visuals, and campaign content faster with AI.';

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'VOVV.AI vs Product Photography Studio', item: PAGE_URL },
  ],
};

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'VOVV.AI vs Product Photography Studio',
  description: DESCRIPTION,
  url: PAGE_URL,
  mainEntityOfPage: PAGE_URL,
  image: DEFAULT_OG_IMAGE,
  author: { '@type': 'Organization', name: 'VOVV.AI', url: SITE_URL },
  publisher: {
    '@type': 'Organization',
    name: 'VOVV.AI',
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.svg` },
  },
  about: [
    { '@type': 'Thing', name: 'AI product photography' },
    { '@type': 'Thing', name: 'Product photography studio' },
  ],
};

export default function AIPhotographyVsStudio() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <SEOHead title={TITLE} description={DESCRIPTION} canonical={PAGE_URL} ogImage={DEFAULT_OG_IMAGE} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={articleJsonLd} />

      <LandingNav />
      <main>
        <LandingHeroSEO
          eyebrow="VOVV.AI vs Product Photography Studio"
          pageId="vs-studio"
          headline={
            <>
              VOVV.AI vs
              <br />
              <span className="text-[#4a5578]">Product Photography Studio</span>
            </>
          }
          subheadline="Compare a traditional product photography studio with an AI visual workflow built for ecommerce brands that need product images, ads, social content, and campaigns faster."
          trustLine="Studio-quality direction · Faster iteration · Built for ecommerce"
          primaryCta={{ label: 'Try VOVV.AI free', to: '/app/generate/product-images' }}
          secondaryCta={{ label: 'vs Photoshoot', to: '/ai-product-photography-vs-photoshoot' }}
          altPrefix="VOVV.AI vs studio comparison example"
          tiles={[
            { id: '1776770347820-s3qwmr', label: 'Studio Hero' },
            { id: '1776664924644-8pmju4', label: 'Lifestyle' },
            { id: '1776102204479-9rlc0n', label: 'Ad Creative' },
            { id: '1776524132929-q8upyp', label: 'Campaign' },
            { id: '1776691906436-3fe7l9', label: 'Social' },
            { id: '1776243905045-8aw72b', label: 'Detail' },
            { id: '1776574228066-oyklfz', label: 'Seasonal' },
            { id: '1776018020221-aehe8n', label: 'Editorial' },
          ]}
        />

        <LandingComparisonTable
          eyebrow="Studio shoot or AI workflow?"
          headline="Studio shoot or AI visual workflow?"
          leftTitle="Product photography studio"
          leftSubtitle="Strong for controlled physical capture"
          leftItems={[
            'Strong for controlled real-world capture',
            'Requires scheduling and production',
            'Limited concepts per shoot',
            'Higher cost per campaign',
            'Slower iteration cycles',
          ]}
          rightTitle="VOVV.AI"
          rightSubtitle="Built for ongoing visual creation"
          rightItems={[
            'Create from one product photo',
            'Generate many visual directions',
            'Test concepts quickly',
            'Create assets for every channel',
            'Built for ongoing ecommerce content',
          ]}
          background="soft"
        />

        <LandingValueCards
          eyebrow="What studios are great for"
          headline="When a product photography studio is valuable"
          cards={[
            { title: 'Exact real-world capture', text: 'When physical accuracy matters.', Icon: Camera },
            { title: 'Complex physical setups', text: 'For ambitious set design and crew.', Icon: ImageIcon },
            { title: 'Regulated documentation', text: 'When visuals tie to compliance.', Icon: ShieldCheck },
            { title: 'High-budget brand campaigns', text: 'Hero campaigns with full production.', Icon: Sparkles },
            { title: 'Precise model fit & sizing', text: 'Real human fit validation.', Icon: Ruler },
            { title: 'Physical lighting control', text: 'Tight art-directed studio lighting.', Icon: Lightbulb },
          ]}
        />

        <LandingValueCards
          eyebrow="What VOVV.AI is built for"
          headline="When VOVV.AI is the smarter workflow"
          background="soft"
          cards={[
            { title: 'PDP variations', text: 'Hero & alternates for every product.', Icon: ShoppingBag },
            { title: 'Lifestyle scenes', text: 'In-context editorial visuals.', Icon: Sparkles },
            { title: 'Ad creative testing', text: 'Variations for performance.', Icon: Megaphone },
            { title: 'Social content', text: 'IG, TikTok & Pinterest assets.', Icon: Instagram },
            { title: 'Email banners', text: 'Hero imagery for every send.', Icon: Mail },
            { title: 'Seasonal campaigns', text: 'Refresh visuals on demand.', Icon: Calendar },
            { title: 'Category-specific scenes', text: 'Editorial direction per vertical.', Icon: LayoutGrid },
            { title: 'Fast product launches', text: 'Day-one creative ready early.', Icon: Rocket },
          ]}
        />

        <LandingWorkflowStrip
          headline="From production schedule to always-on visual creation"
          intro="A studio is a project. VOVV.AI is a system you can run every week."
          leftTitle="Studio workflow"
          leftSteps={['Brief', 'Schedule', 'Ship', 'Shoot', 'Edit', 'Approve', 'Repeat']}
          rightTitle="VOVV.AI workflow"
          rightSteps={['Upload', 'Choose direction', 'Generate', 'Test', 'Create more']}
        />

        <LandingValueCards
          eyebrow="Output coverage"
          headline="What VOVV.AI helps create"
          cards={[
            { title: 'Product page images', text: 'PDP-ready hero & alternates.', Icon: ShoppingBag },
            { title: 'Lifestyle scenes', text: 'In-context editorial visuals.', Icon: Sparkles },
            { title: 'Meta ad creatives', text: 'Performance variations for testing.', Icon: Megaphone },
            { title: 'Google ad visuals', text: 'Shopping-ready creative.', Icon: Megaphone },
            { title: 'Social posts', text: 'Always-on content per channel.', Icon: Instagram },
            { title: 'Campaign banners', text: 'Hero imagery for every drop.', Icon: ImageIcon },
            { title: 'Detail shots', text: 'Macro texture & material.', Icon: ZoomIn },
            { title: 'Launch visuals', text: 'Day-one creative for new SKUs.', Icon: Rocket },
          ]}
        />

        <LandingCategoryGrid
          eyebrow="Best-fit categories"
          headline="Built for ecommerce product categories"
          intro="Category-specific visual systems across all 10 verticals."
          background="soft"
        />

        <section className="py-16 lg:py-32 bg-background">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Cost & speed
            </p>
            <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-5">
              A studio is a project. VOVV.AI is a repeatable creative system.
            </h2>
            <p className="text-foreground/70 text-base sm:text-lg leading-relaxed">
              A product photography studio can be valuable for controlled capture, but ecommerce brands also need fresh visuals constantly. VOVV.AI helps teams create new product visuals without starting a new production cycle every time.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-[#374151] text-sm">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/[0.04] border border-[#e5e4e0]"><Gauge size={14} /> Faster iteration</span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/[0.04] border border-[#e5e4e0]"><Layers size={14} /> More variations per session</span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/[0.04] border border-[#e5e4e0]"><ShoppingBag size={14} /> Built for ecommerce</span>
            </div>
          </div>
        </section>

        <LandingFAQConfig
          headline="VOVV.AI vs studio FAQ"
          faqs={[
            { q: 'Is VOVV.AI a replacement for a product photography studio?', a: 'For many ecommerce visuals, yes. For exact physical capture, regulated documentation, or high-production hero campaigns, a studio still has a role.' },
            { q: 'When should I use VOVV.AI instead of a studio?', a: 'Use VOVV.AI when you need ongoing PDP, ad, social, email, and seasonal visuals — especially when speed and iteration matter.' },
            { q: 'Can VOVV.AI create ecommerce product page images?', a: 'Yes. Clean PDP hero shots, alternates, lifestyle scenes, and detail close-ups are all part of the visual system.' },
            { q: 'Can I use VOVV.AI for ads and social content?', a: 'Yes. The output is designed for Meta and Google ads, social, email, and campaign creative.' },
            { q: 'Do I still need real product photos?', a: 'You need at least one clean product photo to start. Better input images create better AI results.' },
            { q: 'Is VOVV.AI useful for brands that already work with a studio?', a: 'Yes. Many teams use studio shoots for hero campaigns and VOVV.AI for ongoing PDP, ad, social, and seasonal visuals.' },
          ]}
        />

        <LandingFinalCTASEO
          headline="Create product visuals without starting a new studio shoot"
          copy="Use VOVV.AI to turn one product photo into product page images, lifestyle visuals, ads, social content, and campaign-ready creative."
          primaryCta={{ label: 'Try VOVV.AI free', to: '/app/generate/product-images' }}
          secondaryCta={{ label: 'Open generator', to: '/ai-product-photo-generator' }}
          pageId="vs-studio"
        />
      </main>
      <LandingFooter />
    </div>
  );
}
