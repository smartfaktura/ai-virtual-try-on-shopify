import { Link } from 'react-router-dom';
import {
  Sparkles,
  Wand2,
  Layers,
  Palette,
  Image as ImageIcon,
  Zap,
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, DEFAULT_OG_IMAGE } from '@/lib/constants';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { ComparisonHero } from '@/components/seo/compare/ComparisonHero';
import { QuickVerdictCards } from '@/components/seo/compare/QuickVerdictCards';
import { ComparisonTable } from '@/components/seo/compare/ComparisonTable';
import { CompetitorStrengthsSection } from '@/components/seo/compare/CompetitorStrengthsSection';
import { VOVVDifferenceSection } from '@/components/seo/compare/VOVVDifferenceSection';
import { LandingValueCards } from '@/components/seo/landing/LandingValueCards';
import { WhoShouldChooseWhich } from '@/components/seo/compare/WhoShouldChooseWhich';
import { ComparisonFAQ } from '@/components/seo/compare/ComparisonFAQ';
import { ComparisonFinalCTA } from '@/components/seo/compare/ComparisonFinalCTA';
import { DiscoverGalleryStrip } from '@/components/seo/compare/DiscoverGalleryStrip';

const PAGE_PATH = '/compare/vovv-vs-claid-ai';
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const TITLE = 'VOVV vs Claid AI: Which AI Product Image Tool Is Best for E-commerce Brands?';
const DESCRIPTION =
  'Compare VOVV and Claid AI for AI product photography, image enhancement, upscaling, product page visuals, social content, ads, and campaign-ready e-commerce creative.';

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Compare', item: `${SITE_URL}/compare` },
    { '@type': 'ListItem', position: 3, name: 'VOVV vs Claid AI', item: PAGE_URL },
  ],
};

const webPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: TITLE,
  description: DESCRIPTION,
  url: PAGE_URL,
  isPartOf: { '@type': 'WebSite', name: 'VOVV.AI', url: SITE_URL },
  about: [
    { '@type': 'Thing', name: 'AI product photography' },
    { '@type': 'Thing', name: 'VOVV.AI' },
    { '@type': 'Thing', name: 'Claid AI' },
  ],
};

const tableRows = [
  { feature: 'Image upscaling', left: 'Strong', right: 'Included where relevant' },
  { feature: 'Product image enhancement', left: 'Strong', right: 'Yes, focused on creation workflow' },
  { feature: 'Background generation', left: 'Yes', right: 'Yes, with category-specific scene systems' },
  { feature: 'Product cleanup', left: 'Strong', right: 'Yes, where needed' },
  { feature: 'API automation', left: 'Strong', right: 'Not the main focus' },
  { feature: 'Product page visuals', left: 'Yes', right: 'Strong' },
  { feature: 'Social media visuals', left: 'Limited compared to full creative workflow', right: 'Strong' },
  { feature: 'Ad creatives', left: 'Limited compared to full creative workflow', right: 'Strong' },
  { feature: 'Campaign / editorial visuals', left: 'Limited', right: 'Strong' },
  { feature: 'On-model / try-on style visuals', left: 'Not the main focus', right: 'Strong focus with dedicated visual types' },
  { feature: 'Category-specific e-commerce scenes', left: 'General image tools', right: 'Built around e-commerce categories and scene families' },
  { feature: 'One product photo to a full visual set', left: 'Mainly enhancement and background workflows', right: 'Core workflow' },
  { feature: 'Best fit', left: 'Teams needing scalable image enhancement and API automation', right: 'Brands needing scalable product visuals and campaign-ready creative' },
];

export default function VovvVsClaidAi() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <SEOHead title={TITLE} description={DESCRIPTION} canonical={PAGE_URL} ogImage={DEFAULT_OG_IMAGE} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webPageJsonLd} />

      <LandingNav />

      <main>
        <ComparisonHero
          eyebrow="VOVV vs Claid AI"
          headline={
            <>
              VOVV vs Claid AI: image enhancement
              <br className="hidden md:block" />
              <span className="text-[#475569]"> or full product visual creation?</span>
            </>
          }
          subheadline="Claid AI is a strong choice for improving product images, generating backgrounds, upscaling visuals, and automating image enhancement workflows. VOVV is built for e-commerce brands that want to turn one product photo into complete visual sets for product pages, ads, social content, lifestyle scenes, and campaigns."
          primaryCta={{ label: 'Try VOVV Free', to: '/auth' }}
          secondaryCta={{ label: 'See AI Product Visuals', to: '/ai-product-photography' }}
          pageId="vs-claid-ai"
        />

        {/* Hero comparison cards strip */}
        <section className="pb-4 bg-[#FAFAF8]">
          <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 -mt-10 lg:-mt-14 relative z-20">
              <div className="bg-white rounded-3xl border border-[#f0efed] shadow-sm p-7 lg:p-8">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#1a1a2e]/5 text-[#1a1a2e]">
                    <Zap size={16} strokeWidth={2} />
                  </span>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Claid AI
                  </p>
                </div>
                <p className="text-[#1a1a2e] text-[15.5px] leading-relaxed">
                  Best for product image enhancement, upscaling, background generation, cleanup, and API-based image automation.
                </p>
              </div>
              <div className="bg-[#1a1a2e] text-white rounded-3xl shadow-md p-7 lg:p-8">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <Sparkles size={16} strokeWidth={2} />
                  </span>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                    VOVV
                  </p>
                </div>
                <p className="text-white/90 text-[15.5px] leading-relaxed">
                  Best for creating full brand-ready product visuals from one product photo across e-commerce, ads, social, campaigns, and category-specific scenes.
                </p>
              </div>
            </div>
          </div>
        </section>

        <QuickVerdictCards
          eyebrow="The short answer"
          headline="The short answer"
          intro="Choose Claid AI if your main need is image improvement: upscale product photos, enhance quality, clean images, generate simple backgrounds, and automate image processing at scale. Choose VOVV if your goal is to create a complete product visual system: product page visuals, lifestyle images, editorial scenes, ad creatives, UGC-style content, on-model visuals, campaign assets, and social content from one product image."
          cards={[
            {
              eyebrow: 'Claid AI',
              title: 'Best for image enhancement',
              items: [
                'Image upscaling and quality boost',
                'Product photo cleanup and retouching',
                'Background generation and removal',
                'API-based image processing at scale',
                'Automating enhancement workflows',
              ],
            },
            {
              eyebrow: 'VOVV',
              title: 'Best for product visual generation & campaign-ready creative',
              accent: true,
              items: [
                'Product page, lifestyle, and editorial scenes',
                'Ads, UGC-style shots, and on-model visuals',
                'Seasonal campaigns and social-first creative',
                'Category-specific scene generation',
                'A complete visual set from one product image',
              ],
            },
          ]}
        />

        <ComparisonTable
          eyebrow="Side by side"
          headline="VOVV vs Claid AI feature comparison"
          intro="A neutral, feature-by-feature look so you can pick the workflow that fits your team."
          leftLabel="Claid AI"
          rightLabel="VOVV.AI"
          rows={tableRows}
          background="soft"
        />

        <LandingValueCards
          eyebrow="Why brands choose VOVV"
          headline="Why e-commerce brands choose VOVV over image enhancement tools"
          intro="Polished images help. A full visual system grows the brand."
          background="background"
          columns={4}
          cards={[
            { title: 'Create more than polished images', text: 'VOVV helps brands create product page shots, lifestyle visuals, campaign assets, social content, and ad creatives from a single product photo.', Icon: Layers },
            { title: 'Built for brand-ready creative', text: 'Instead of only improving image quality, VOVV focuses on creating visuals that feel ready for a website, launch, campaign, collection, or paid ad.', Icon: Wand2 },
            { title: 'More creative variety from one upload', text: 'Growing brands need more than clean product images — hero shots, detail shots, lifestyle scenes, UGC-style content, editorial visuals, and seasonal campaigns.', Icon: ImageIcon },
            { title: 'Designed around e-commerce categories', text: 'Visual directions for fashion, beauty, fragrance, food, home decor, jewelry, accessories, footwear, tech, supplements, and more.', Icon: Palette },
          ]}
        />

        <CompetitorStrengthsSection
          eyebrow="When Claid AI is a good choice"
          headline="When Claid AI may be the better fit"
          copy="Claid AI can be a strong option if your workflow is mainly about improving, enhancing, and automating existing product images."
          bullets={[
            'You need image upscaling',
            'You want product photo enhancement',
            'You need background generation or cleanup',
            'You want API-based image processing',
            'You already have most creative assets and need to improve their quality',
            'You need scalable image automation for existing product photos',
          ]}
          background="soft"
        />

        <VOVVDifferenceSection
          eyebrow="When VOVV is the better fit"
          headline="When VOVV is the better fit"
          copy="VOVV is stronger when the goal is not just enhancing an image, but creating a full set of brand-ready visuals around a product."
          bullets={[
            'You want multiple product visuals from one upload',
            'You need product page images, ads, social content, and campaign visuals',
            'You want lifestyle, editorial, and UGC-style scenes',
            'You need category-specific visual directions',
            'You want to test more creative angles faster',
            'You want visuals that feel closer to a creative team output, not only an image enhancement workflow',
          ]}
          background="background"
        />

        {/* Positioning block */}
        <section className="py-16 lg:py-28 bg-[#1a1a2e] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-[#475569] blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#64748b] blur-3xl" />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 mb-4">
              The positioning
            </p>
            <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.1] mb-5">
              Claid AI enhances product images. VOVV creates product visual systems.
            </h2>
            <p className="text-[#9ca3af] text-base sm:text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
              Claid AI is strong for improving product image quality and automating enhancement workflows. VOVV is built for brands that need complete visual coverage: clean product shots, lifestyle images, on-model style visuals, campaign assets, and social-first creative.
            </p>
            <Link
              to="/auth"
              data-cta="positioning-primary"
              data-page="vs-claid-ai"
              className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-white text-[#1a1a2e] text-base font-semibold hover:bg-white/90 transition-colors"
            >
              Create Your First Product Visual
            </Link>
          </div>
        </section>

        <WhoShouldChooseWhich
          eyebrow="Decision"
          headline="Which tool should you choose?"
          intro="A quick gut-check based on the work you actually need to ship."
          leftTitle="Choose Claid AI if"
          leftItems={[
            'Your main job is enhancing existing product images',
            'You need scalable upscaling and quality improvements',
            'You rely on API-based image automation',
            'You need fast cleanup and background generation',
            'You already have creative assets and only need to polish them',
          ]}
          rightTitle="Choose VOVV if"
          rightItems={[
            'You want a complete visual set from one product photo',
            'You need product page, ad, social, and campaign visuals',
            'You want category-specific scene generation',
            'You need on-model and try-on style visuals',
            'You want brand-ready creative, not just enhanced photos',
          ]}
        />

        <ComparisonFAQ
          eyebrow="Comparison FAQ"
          headline="VOVV vs Claid AI — common questions"
          intro="Quick answers to common questions about both tools."
          faqs={[
            { q: 'Is VOVV better than Claid AI?', a: 'It depends on the workflow. Claid AI is strong for image enhancement, upscaling, background generation, cleanup, and API automation. VOVV is better suited for brands that want to generate full visual sets for product pages, ads, social content, and campaigns from one product image.' },
            { q: 'Is Claid AI good for e-commerce?', a: 'Yes. Claid AI can be useful for e-commerce teams that need product image enhancement, upscaling, background generation, cleanup, and automated image processing.' },
            { q: 'What makes VOVV different from Claid AI?', a: 'VOVV focuses on full product visual creation. It helps brands turn one product photo into multiple brand-ready visuals across product pages, ads, social media, campaigns, lifestyle scenes, and creative directions.' },
            { q: 'Can VOVV replace product photoshoots?', a: 'VOVV can reduce the need for many traditional product photoshoots by helping brands create product visuals, lifestyle scenes, and campaign-ready assets with AI. For some use cases, brands may still combine AI visuals with traditional photography.' },
            { q: 'Who should choose VOVV?', a: 'VOVV is best for e-commerce brands, agencies, marketers, and creative teams that need more visual variety, faster campaign production, and scalable product visuals from one product photo.' },
          ]}
        />

        <DiscoverGalleryStrip
          eyebrow="Made with VOVV.AI"
          headline="More than enhanced photos — visuals brands actually publish"
          intro="A small sample of product visuals generated with VOVV.AI from a single product photo."
          count={8}
          background="background"
          cta={{ label: 'Explore more on Discover', to: '/discover' }}
        />

        {/* Internal-link strip */}
        <section className="py-12 lg:py-16 bg-[#f5f5f3] border-t border-[#f0efed]">
          <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-5 text-center">
              Keep exploring
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {[
                { label: 'AI Product Photography', to: '/ai-product-photography' },
                { label: 'Pricing', to: '/pricing' },
                { label: 'All comparisons', to: '/compare' },
                { label: 'Start creating', to: '/app/generate/product-images' },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-[#f0efed] text-[#1a1a2e] text-sm font-medium shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <ComparisonFinalCTA
          eyebrow="Get started"
          headline="Create more than enhanced product images"
          copy="Upload one product image and turn it into brand-ready visuals for your store, ads, social content, and campaigns."
          primaryCta={{ label: 'Try VOVV Free', to: '/auth' }}
          secondaryCta={{ label: 'Explore Product Visuals', to: '/ai-product-photography' }}
          pageId="vs-claid-ai"
        />
      </main>

      <LandingFooter />
    </div>
  );
}
