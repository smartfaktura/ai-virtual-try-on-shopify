import { Link } from 'react-router-dom';
import {
  Sparkles,
  Wand2,
  Layers,
  Palette,
  Image as ImageIcon,
  Camera,
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

const PAGE_PATH = '/compare/vovv-vs-pebblely';
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const TITLE = 'VOVV vs Pebblely: Which AI Product Photography Tool Is Best for E-commerce?';
const DESCRIPTION =
  'Compare VOVV and Pebblely for AI product photography, product scenes, ecommerce visuals, ads, social content, and campaign-ready product creative.';

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Compare', item: `${SITE_URL}/compare` },
    { '@type': 'ListItem', position: 3, name: 'VOVV vs Pebblely', item: PAGE_URL },
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
    { '@type': 'Thing', name: 'Pebblely' },
  ],
};

const tableRows = [
  { feature: 'AI product photography', left: 'Strong', right: 'Strong' },
  { feature: 'AI backgrounds', left: 'Strong', right: 'Strong, with category-specific scene systems' },
  { feature: 'Quick e-commerce visuals', left: 'Strong', right: 'Strong' },
  { feature: 'Product page visuals', left: 'Yes', right: 'Strong' },
  { feature: 'Social media visuals', left: 'Yes', right: 'Strong' },
  { feature: 'Ad creatives', left: 'Yes', right: 'Strong' },
  { feature: 'Campaign / editorial visuals', left: 'Limited compared to full visual workflow', right: 'Strong' },
  { feature: 'UGC-style visuals', left: 'Not the main focus', right: 'Strong focus' },
  { feature: 'On-model / try-on style visuals', left: 'Not the main focus', right: 'Strong focus with dedicated visual types' },
  { feature: 'Category-specific e-commerce scenes', left: 'General product scenes', right: 'Built around e-commerce categories and scene families' },
  { feature: 'One product photo to a full visual set', left: 'Mainly product photo scene generation', right: 'Core workflow' },
  { feature: 'Best fit', left: 'Sellers needing fast AI product photos and simple product scenes', right: 'Brands needing scalable product visuals, campaign assets, and creative variety' },
];

export default function VovvVsPebblely() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <SEOHead title={TITLE} description={DESCRIPTION} canonical={PAGE_URL} ogImage={DEFAULT_OG_IMAGE} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webPageJsonLd} />

      <LandingNav />

      <main>
        <ComparisonHero
          eyebrow="VOVV vs Pebblely"
          headline={
            <>
              VOVV vs Pebblely: product scenes
              <br className="hidden md:block" />
              <span className="text-[#475569]"> or complete e-commerce visual systems?</span>
            </>
          }
          subheadline="Pebblely is a strong choice for creating AI product photos, backgrounds, and quick e-commerce scenes. VOVV is built for brands that want to turn one product photo into complete visual sets for product pages, ads, social content, campaigns, lifestyle scenes, and category-specific creative."
          primaryCta={{ label: 'Try VOVV Free', to: '/auth' }}
          secondaryCta={{ label: 'See AI Product Visuals', to: '/ai-product-photography' }}
          pageId="vs-pebblely"
        />

        {/* Hero comparison cards strip */}
        <section className="pb-4 bg-[#FAFAF8]">
          <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 -mt-10 lg:-mt-14 relative z-20">
              <div className="bg-white rounded-3xl border border-[#f0efed] shadow-sm p-7 lg:p-8">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#1a1a2e]/5 text-[#1a1a2e]">
                    <Camera size={16} strokeWidth={2} />
                  </span>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Pebblely
                  </p>
                </div>
                <p className="text-[#1a1a2e] text-[15.5px] leading-relaxed">
                  Best for quick AI product photos, generated backgrounds, simple product scenes, and e-commerce-ready visuals.
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
                  Best for full brand-ready product visual creation across e-commerce, ads, social content, campaigns, UGC-style visuals, and category-specific scene systems.
                </p>
              </div>
            </div>
          </div>
        </section>

        <QuickVerdictCards
          eyebrow="The short answer"
          headline="The short answer"
          intro="Choose Pebblely if your main need is quick AI product photography: place a product into generated backgrounds, create simple e-commerce scenes, and produce product visuals without a traditional photoshoot. Choose VOVV if your goal is to build a complete product visual system: product page visuals, lifestyle images, editorial scenes, ad creatives, UGC-style content, on-model visuals, campaign assets, and social content from one product image."
          cards={[
            {
              eyebrow: 'Pebblely',
              title: 'Best for quick product scenes',
              items: [
                'Fast AI product photos with generated backgrounds',
                'Simple e-commerce scenes without a photoshoot',
                'Marketplace, store, and social-ready product visuals',
                'Lightweight workflow for sellers and small brands',
                'Quick scene generation for one-off product photos',
              ],
            },
            {
              eyebrow: 'VOVV',
              title: 'Best for full visual systems & campaign-ready creative',
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
          headline="VOVV vs Pebblely feature comparison"
          intro="A neutral, feature-by-feature look so you can pick the workflow that fits your team."
          leftLabel="Pebblely"
          rightLabel="VOVV.AI"
          rows={tableRows}
          background="soft"
        />

        <LandingValueCards
          eyebrow="Why brands choose VOVV"
          headline="Why e-commerce brands choose VOVV over simple product scene generation"
          intro="Quick product scenes help. A full visual system grows the brand."
          background="background"
          columns={4}
          cards={[
            { title: 'More than one-off product photos', text: 'VOVV helps brands create product page shots, lifestyle visuals, campaign assets, UGC-style content, social creatives, and ad-ready images from a single product photo.', Icon: Layers },
            { title: 'Built for brand-ready creative', text: 'VOVV focuses on visuals that feel ready for a store, product launch, campaign, collection, ad, or social content calendar.', Icon: Wand2 },
            { title: 'Creative variety across the full funnel', text: 'Hero shots, detail shots, lifestyle scenes, editorial visuals, UGC-style content, ads, and seasonal campaign assets — all in one place.', Icon: ImageIcon },
            { title: 'Designed around e-commerce categories', text: 'Visual directions for fashion, beauty, fragrance, food, home decor, jewelry, accessories, footwear, tech, supplements, and more.', Icon: Palette },
          ]}
        />

        <CompetitorStrengthsSection
          eyebrow="When Pebblely is a good choice"
          headline="When Pebblely may be the better fit"
          copy="Pebblely can be a strong option if your workflow is mainly about quickly creating AI product photos and simple product scenes."
          bullets={[
            'You need quick product images with generated backgrounds',
            'You want simple e-commerce scenes without a photoshoot',
            'You need visuals for marketplaces, stores, or social posts',
            'You prefer a lightweight product photography workflow',
            'You do not need a broader visual system across ads, UGC, campaigns, and on-model visuals',
          ]}
          background="soft"
        />

        <VOVVDifferenceSection
          eyebrow="When VOVV is the better fit"
          headline="When VOVV is the better fit"
          copy="VOVV is stronger when the goal is not just creating a few product scenes, but building a complete set of brand-ready visuals around a product."
          bullets={[
            'You want multiple product visuals from one upload',
            'You need product page images, ads, social content, and campaign visuals',
            'You want UGC-style, editorial, lifestyle, and on-model visual directions',
            'You need category-specific scene systems',
            'You want to test more creative angles faster',
            'You want visuals that feel closer to a creative team output, not only a simple product scene generator',
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
              Pebblely creates product scenes. VOVV builds product visual systems.
            </h2>
            <p className="text-[#9ca3af] text-base sm:text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
              Pebblely is strong for creating quick AI product photos and generated backgrounds. VOVV is built for brands that need complete visual coverage: clean product shots, lifestyle images, UGC-style content, on-model style visuals, campaign assets, ads, and social-first creative.
            </p>
            <Link
              to="/auth"
              data-cta="positioning-primary"
              data-page="vs-pebblely"
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
          leftTitle="Choose Pebblely if"
          leftItems={[
            'You mainly need quick AI product photos',
            'You want generated backgrounds and simple scenes',
            'You sell on marketplaces or run a small store',
            'You prefer a lightweight, one-off workflow',
            'You don’t need ads, UGC, or campaign-level creative',
          ]}
          rightTitle="Choose VOVV if"
          rightItems={[
            'You want a complete visual set from one product photo',
            'You need product page, ad, social, and campaign visuals',
            'You want UGC-style and on-model visual directions',
            'You need category-specific scene systems',
            'You want brand-ready creative, not just product scenes',
          ]}
        />

        <ComparisonFAQ
          eyebrow="Comparison FAQ"
          headline="VOVV vs Pebblely — common questions"
          intro="Quick answers to common questions about both tools."
          faqs={[
            { q: 'Is VOVV better than Pebblely?', a: 'It depends on the workflow. Pebblely is strong for quick AI product photos, generated backgrounds, and simple product scenes. VOVV is better suited for brands that want to generate full visual sets for product pages, ads, social content, UGC-style visuals, on-model visuals, and campaigns from one product image.' },
            { q: 'Is Pebblely good for e-commerce?', a: 'Yes. Pebblely can be useful for e-commerce sellers and small brands that need quick AI product photos, generated backgrounds, and simple product visuals without a traditional photoshoot.' },
            { q: 'What makes VOVV different from Pebblely?', a: 'VOVV focuses on full product visual creation. It helps brands turn one product photo into multiple brand-ready visuals across product pages, ads, social media, campaigns, lifestyle scenes, UGC-style content, and category-specific creative directions.' },
            { q: 'Can VOVV replace product photoshoots?', a: 'VOVV can reduce the need for many traditional product photoshoots by helping brands create product visuals, lifestyle scenes, and campaign-ready assets with AI. For some use cases, brands may still combine AI visuals with traditional photography.' },
            { q: 'Who should choose VOVV?', a: 'VOVV is best for e-commerce brands, agencies, marketers, and creative teams that need more visual variety, faster campaign production, and scalable product visuals from one product photo.' },
          ]}
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
          headline="Create more than simple product scenes"
          copy="Upload one product image and turn it into brand-ready visuals for your store, ads, social content, and campaigns."
          primaryCta={{ label: 'Try VOVV Free', to: '/auth' }}
          secondaryCta={{ label: 'Explore Product Visuals', to: '/ai-product-photography' }}
          pageId="vs-pebblely"
        />
      </main>

      <LandingFooter />
    </div>
  );
}
