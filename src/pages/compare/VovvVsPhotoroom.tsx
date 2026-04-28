import { Link } from 'react-router-dom';
import {
  Scissors,
  Sparkles,
  Layers,
  Wand2,
  Image as ImageIcon,
  Palette,
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

const PAGE_PATH = '/compare/vovv-vs-photoroom';
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const TITLE = 'VOVV vs Photoroom: Which AI Product Visual Tool Is Best for E-commerce Brands?';
const DESCRIPTION =
  'Compare VOVV and Photoroom for AI product photography, background editing, product page visuals, social content, ads, and campaign-ready e-commerce creative.';

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Compare', item: `${SITE_URL}/compare` },
    { '@type': 'ListItem', position: 3, name: 'VOVV vs Photoroom', item: PAGE_URL },
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
    { '@type': 'Thing', name: 'Photoroom' },
  ],
};

const tableRows = [
  { feature: 'Background removal', left: 'Strong', right: 'Included where relevant' },
  { feature: 'Product cleanup & editing', left: 'Strong', right: 'Yes, focused on the visual creation workflow' },
  { feature: 'AI backgrounds', left: 'Yes', right: 'Yes, with category-specific scene systems' },
  { feature: 'Product page visuals', left: 'Yes', right: 'Strong' },
  { feature: 'Social media visuals', left: 'Yes', right: 'Strong' },
  { feature: 'Ad creatives', left: 'Yes', right: 'Strong' },
  { feature: 'Campaign & editorial visuals', left: 'Limited compared to a full generation workflow', right: 'Strong' },
  { feature: 'On-model / try-on style visuals', left: 'Available through AI tools', right: 'Strong focus with dedicated visual types' },
  { feature: 'Category-specific e-commerce scenes', left: 'General templates and AI backgrounds', right: 'Built around e-commerce categories and scene families' },
  { feature: 'One product photo to a full visual set', left: 'Possible for edits and backgrounds', right: 'Core workflow' },
  { feature: 'Best fit', left: 'Sellers needing fast edits and marketplace-ready images', right: 'Brands needing scalable product visuals and campaign-ready creative' },
];

export default function VovvVsPhotoroom() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <SEOHead title={TITLE} description={DESCRIPTION} canonical={PAGE_URL} ogImage={DEFAULT_OG_IMAGE} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webPageJsonLd} />

      <LandingNav />

      <main>
        <ComparisonHero
          eyebrow="VOVV vs Photoroom"
          headline={
            <>
              VOVV vs Photoroom: quick product edits
              <br className="hidden md:block" />
              <span className="text-[#475569]"> or full e-commerce visual creation?</span>
            </>
          }
          subheadline="Photoroom is a strong choice for background removal, product cleanups, templates, and fast marketplace-ready edits. VOVV is built for brands that want to turn one product photo into complete visual sets for product pages, ads, social content, campaigns, and on-brand creative."
          primaryCta={{ label: 'Try VOVV Free', to: '/auth' }}
          secondaryCta={{ label: 'See AI Product Visuals', to: '/ai-product-photography' }}
          pageId="vs-photoroom"
        />

        {/* Hero comparison cards strip */}
        <section className="pb-4 bg-[#FAFAF8]">
          <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 -mt-10 lg:-mt-14 relative z-20">
              <div className="bg-white rounded-3xl border border-[#f0efed] shadow-sm p-7 lg:p-8">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#1a1a2e]/5 text-[#1a1a2e]">
                    <Scissors size={16} strokeWidth={2} />
                  </span>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Photoroom
                  </p>
                </div>
                <p className="text-[#1a1a2e] text-[15.5px] leading-relaxed">
                  Best for fast background removal, clean product edits, templates, shadows, resizing, and batch image workflows.
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
          intro="Choose Photoroom if your main need is quick editing — backgrounds, cleanups, templates, and marketplace-ready images. Choose VOVV if your goal is to create a complete visual system around your product."
          cards={[
            {
              eyebrow: 'Photoroom',
              title: 'Best for quick edits',
              items: [
                'Fast background removal',
                'Marketplace-ready white background images',
                'Templates, resizing, and batch editing',
                'Polishing existing creative assets',
                'Lightweight workflow for sellers and small teams',
              ],
            },
            {
              eyebrow: 'VOVV',
              title: 'Best for product visual generation & brand campaigns',
              accent: true,
              items: [
                'Listing images, lifestyle visuals, and editorial scenes',
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
          headline="VOVV vs Photoroom feature comparison"
          intro="A neutral, feature-by-feature look so you can pick the workflow that fits."
          leftLabel="Photoroom"
          rightLabel="VOVV.AI"
          rows={tableRows}
          background="soft"
        />

        <LandingValueCards
          eyebrow="Why brands choose VOVV"
          headline="Why e-commerce brands choose VOVV over simple editing workflows"
          intro="Cleaner photos help. A full visual system grows the brand."
          background="background"
          columns={4}
          cards={[
            { title: 'One photo to many visuals', text: 'Create product page shots, lifestyle scenes, ad creatives, campaign visuals, and social content from a single product image.', Icon: Layers },
            { title: 'Built for brand-ready output', text: 'Visuals that feel ready for a website, launch, collection, ad campaign, or seasonal promotion — not just a cleaner background.', Icon: Wand2 },
            { title: 'More than marketplace cleanup', text: 'Hero images, detail shots, lifestyle visuals, UGC-style content, editorial scenes, and campaign assets in one place.', Icon: ImageIcon },
            { title: 'Designed around categories', text: 'Different visual directions for fashion, beauty, fragrance, food, home decor, jewelry, accessories, footwear, tech, and more.', Icon: Palette },
          ]}
        />

        <CompetitorStrengthsSection
          eyebrow="When Photoroom is a good choice"
          headline="When Photoroom may be the better fit"
          copy="Photoroom can be a great option if your workflow is mainly about fast photo editing and production cleanup."
          bullets={[
            'You need quick background removal',
            'You want marketplace-style white background images',
            'You need simple templates, resizing, and batch edits',
            'You already have most creative assets and only need to polish them',
            'You need a lightweight editing workflow for sellers or small teams',
          ]}
          background="soft"
        />

        <VOVVDifferenceSection
          eyebrow="When VOVV is the better fit"
          headline="When VOVV is the better fit"
          copy="VOVV is stronger when the goal is not just editing one image, but creating a complete set of visuals around your product."
          bullets={[
            'You want multiple product visuals from one upload',
            'You need product page images, ads, social content, and campaign visuals',
            'You want more premium, brand-led creative direction',
            'You need category-specific visual styles',
            'You want to test many creative angles faster',
            'You want visuals that feel closer to a creative team output, not only an editing tool',
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
              Photoroom edits product photos. VOVV builds product visual systems.
            </h2>
            <p className="text-[#9ca3af] text-base sm:text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
              Photoroom is excellent for speeding up repetitive product photo editing tasks. VOVV is built for brands that want to create more complete visual coverage — clean product shots, lifestyle images, on-model style visuals, campaign assets, and social-first creative.
            </p>
            <Link
              to="/auth"
              data-cta="positioning-primary"
              data-page="vs-photoroom"
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
          leftTitle="Choose Photoroom if"
          leftItems={[
            'Your main job is editing existing product photos',
            'You need fast, repeatable background removal',
            'You want marketplace-ready white background images',
            'You rely on templates, resizing, and batch processing',
            'You already have creative assets and only need to polish them',
          ]}
          rightTitle="Choose VOVV if"
          rightItems={[
            'You want a complete visual set from one product photo',
            'You need product page, ad, social, and campaign visuals',
            'You want category-specific scene generation',
            'You need on-model and try-on style visuals',
            'You want brand-ready creative, not just cleaner photos',
          ]}
        />

        <ComparisonFAQ
          eyebrow="Comparison FAQ"
          headline="VOVV vs Photoroom — common questions"
          intro="Quick answers to common questions about both tools."
          faqs={[
            { q: 'Is VOVV better than Photoroom?', a: 'It depends on the workflow. Photoroom is strong for fast edits, background removal, templates, and marketplace-ready product photos. VOVV is better suited for brands that want to generate full visual sets for product pages, ads, social content, and campaigns from one product image.' },
            { q: 'Is Photoroom good for e-commerce?', a: 'Yes. Photoroom is useful for e-commerce sellers who need background removal, resizing, shadows, templates, batch editing, and cleaner product images.' },
            { q: 'What makes VOVV different from Photoroom?', a: 'VOVV focuses on full product visual creation. It helps brands turn one product photo into multiple brand-ready visuals across product pages, ads, social media, campaigns, category scenes, and creative directions.' },
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
          headline="Create more than edited product photos"
          copy="Upload one product image and turn it into brand-ready visuals for your store, ads, social content, and campaigns."
          primaryCta={{ label: 'Try VOVV Free', to: '/auth' }}
          secondaryCta={{ label: 'Explore Product Visuals', to: '/ai-product-photography' }}
          pageId="vs-photoroom"
        />
      </main>

      <LandingFooter />
    </div>
  );
}
