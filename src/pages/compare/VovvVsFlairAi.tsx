import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Megaphone,
  Sparkles,
  SlidersHorizontal,
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
import { UseCaseComparisonCards } from '@/components/seo/compare/UseCaseComparisonCards';
import { WhoShouldChooseWhich } from '@/components/seo/compare/WhoShouldChooseWhich';
import { ComparisonFAQ } from '@/components/seo/compare/ComparisonFAQ';
import { ComparisonFinalCTA } from '@/components/seo/compare/ComparisonFinalCTA';

const PAGE_PATH = '/compare/vovv-vs-flair-ai';
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const TITLE = 'VOVV vs Flair AI: AI Product Photography Comparison for E-commerce';
const DESCRIPTION =
  'Compare VOVV.AI and Flair AI for AI product photography, product visuals, on-model images, ads, social content, and e-commerce creative workflows.';
const OG_TITLE = 'VOVV vs Flair AI: Which AI Product Photography Tool Fits Your Workflow?';
const OG_DESCRIPTION =
  'A practical comparison of VOVV.AI and Flair AI for e-commerce brands creating product visuals, lifestyle images, on-model content, ads, and campaign-ready creative.';

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Compare', item: `${SITE_URL}/compare` },
    { '@type': 'ListItem', position: 3, name: 'VOVV vs Flair AI', item: PAGE_URL },
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
    { '@type': 'Thing', name: 'Flair AI' },
  ],
};

const tableRows = [
  {
    feature: 'Primary focus',
    left: 'AI design tool for product photoshoots and product content',
    right: 'AI product visual workflow for e-commerce brands',
  },
  {
    feature: 'Best for',
    left: 'Users who want drag-and-drop product photoshoot creation and template-based creative control',
    right: 'Brands that need product pages, ads, social, campaign visuals, and category-specific imagery',
  },
  {
    feature: 'Input',
    left: 'Product image plus manual scene/canvas setup',
    right: 'One product photo',
  },
  {
    feature: 'Product photography',
    left: 'Yes, with AI product photoshoots and templates',
    right: 'Yes, with category-specific scenes and visual types',
  },
  {
    feature: 'Drag-and-drop canvas',
    left: 'Yes, core workflow',
    right: 'Not the main workflow',
  },
  {
    feature: 'Templates',
    left: 'Template-based product photoshoot workflow',
    right: 'Uses Visual Types, scenes, and Discover inspiration',
  },
  {
    feature: 'On-model visuals',
    left: 'Yes, AI fashion photoshoots and AI models',
    right: 'Yes, via Virtual Try-On and on-model visual workflows',
  },
  {
    feature: 'Product listing images',
    left: 'Possible depending on workflow / setup',
    right: 'Yes, dedicated product listing and product page visual workflows',
  },
  {
    feature: 'Ads and social content',
    left: 'Yes, includes AI ad generation and product content tools',
    right: 'Yes, built into the wider product visual workflow',
  },
  {
    feature: 'Category coverage',
    left: 'Multiple categories such as beauty, CPG, jewelry, fashion, furniture, tech, handbags, and food',
    right: 'Broad category hub for fashion, jewelry, beauty, fragrance, footwear, bags, food, home, tech, and more',
  },
  {
    feature: 'Brand consistency',
    left: 'Supports on-brand content, reusable templates, and brand assets',
    right: 'Designed around repeatable brand-ready visual sets',
  },
  {
    feature: 'API / team workflow',
    left: 'Publicly positions team collaboration and API access',
    right: 'Available depending on current plan and workflow',
  },
  {
    feature: 'Best fit',
    left: 'Creative teams that prefer a canvas-based editing experience',
    right: 'E-commerce teams that want fast, structured product visual output',
  },
];

export default function VovvVsFlairAi() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <SEOHead
        title={TITLE}
        description={DESCRIPTION}
        canonical={PAGE_URL}
        ogImage={DEFAULT_OG_IMAGE}
      />
      {/* OG title/description override (page-specific). SEOHead emits the
          generic title/description; we add the comparison-specific OG strings here. */}
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webPageJsonLd} />

      <LandingNav />

      <main>
        <ComparisonHero
          eyebrow="AI Product Photography Comparison"
          headline={
            <>
              VOVV vs Flair AI: Which AI Product Photography Tool Is Better
              <br className="hidden md:block" />
              <span className="text-[#475569]"> for E-commerce Workflows?</span>
            </>
          }
          subheadline="Flair AI is known for its drag-and-drop product photoshoot canvas and template-based creative tools. VOVV.AI is built for e-commerce teams that want to turn one product photo into product page visuals, social content, on-model shots, ads, and campaign-ready creative."
          primaryCta={{ label: 'Try VOVV free', to: '/auth' }}
          secondaryCta={{ label: 'Explore AI product photography examples', to: '/ai-product-photography' }}
          pageId="vs-flair-ai"
        />

        <QuickVerdictCards
          eyebrow="Quick verdict"
          headline="Which one fits your workflow"
          intro="Both tools are useful — they're built for different operating models."
          cards={[
            {
              eyebrow: 'VOVV.AI',
              title: 'Choose VOVV.AI if you want',
              accent: true,
              items: [
                'A product visual workflow built for e-commerce brands',
                'Product page visuals, ads, social content, and campaign imagery from one product photo',
                'Category-specific product photography scenes',
                'On-model, lifestyle, editorial, listing, and campaign-ready visuals',
                'A faster way to create complete visual sets, not just individual images',
              ],
            },
            {
              eyebrow: 'Flair AI',
              title: 'Choose Flair AI if you want',
              items: [
                'A drag-and-drop AI design canvas',
                'Template-based product photoshoots',
                'Manual creative scene building with props and assets',
                'A visual editor style workflow',
                'Team collaboration and API-oriented workflows where relevant',
              ],
            },
          ]}
        />

        <ComparisonTable
          eyebrow="Side by side"
          headline="VOVV.AI vs Flair AI at a glance"
          intro="A neutral feature-by-feature look so you can pick the workflow that fits."
          leftLabel="Flair AI"
          rightLabel="VOVV.AI"
          rows={tableRows}
          background="soft"
        />

        <CompetitorStrengthsSection
          eyebrow="What Flair AI does well"
          headline="What Flair AI Does Well"
          copy="Flair AI is a strong option for teams that want a visual, canvas-based way to build product photoshoots. Its public positioning highlights drag-and-drop scene building, reusable templates, AI product photoshoots, on-model fashion imagery, AI ads, human model creation, team collaboration, and API access."
          bullets={[
            'Drag-and-drop scene building',
            'Reusable product photoshoot templates',
            'AI product photoshoots',
            'On-model fashion imagery & AI models',
            'AI ad generation tools',
            'Team collaboration and API access',
          ]}
          background="background"
        />

        <VOVVDifferenceSection
          eyebrow="Where VOVV.AI is different"
          headline="An AI product visual studio for e-commerce, not a blank canvas"
          copy="VOVV.AI is built less like a manual design canvas and more like an AI product visual studio for e-commerce workflows. Instead of starting from a blank canvas, users can upload one product photo and create structured visual outputs for product pages, ads, social content, on-model and editorial shots, listing images, and campaign-ready creative."
          bullets={[
            'One product photo can become multiple visual directions',
            'Product page, listing, social, ad, and campaign visuals in one ecosystem',
            'Category-specific scene library',
            'Visual Types for different e-commerce needs',
            'Designed for brands that need consistent output across many products',
            'Freestyle option for more custom creative exploration',
          ]}
          background="soft"
        />

        <UseCaseComparisonCards
          eyebrow="Use cases"
          headline="How each tool fits common e-commerce jobs"
          competitorLabel="Flair AI"
          background="background"
          cards={[
            {
              title: 'For e-commerce product pages',
              Icon: ShoppingBag,
              vovv: 'Better fit when the goal is to create complete product page visuals and product listing sets from one product image.',
              competitor: 'Good fit when the team wants manual control over product photoshoot composition.',
            },
            {
              title: 'For ads and social content',
              Icon: Megaphone,
              vovv: 'Good for generating multiple campaign-ready visual directions from the same product.',
              competitor: 'Good for creative ad generation and template-based product content.',
            },
            {
              title: 'For fashion and on-model visuals',
              Icon: Sparkles,
              vovv: 'Use Virtual Try-On and on-model visual workflows for fashion, apparel, accessories, and lifestyle imagery.',
              competitor: 'Flair AI also publicly highlights fashion photoshoots and AI-generated models.',
            },
            {
              title: 'For creative control',
              Icon: SlidersHorizontal,
              vovv: 'Good when the user wants faster structured outputs and Visual Types.',
              competitor: 'Good when the user prefers drag-and-drop canvas control.',
            },
          ]}
        />

        <WhoShouldChooseWhich
          eyebrow="Decision"
          headline="Which Tool Should You Choose?"
          intro="Both tools have a clear audience. Use this as a quick gut-check."
          leftTitle="Choose VOVV.AI if"
          leftItems={[
            'You run an e-commerce brand or product catalog',
            'You want to turn one product photo into multiple usable visual assets',
            'You need product page images, ads, social posts, and campaign visuals',
            'You want category-specific visual workflows',
            'You prefer fast structured generation over manual canvas building',
          ]}
          rightTitle="Choose Flair AI if"
          rightItems={[
            'You want a drag-and-drop canvas',
            'You like manually arranging product scenes',
            'You want reusable product photoshoot templates',
            'Your workflow is closer to design editing than structured product visual generation',
            'Team or API workflow is a key requirement for your use case',
          ]}
        />

        <ComparisonFAQ
          eyebrow="Comparison FAQ"
          headline="VOVV.AI vs Flair AI — common questions"
          intro="Quick answers to common questions about both tools."
          faqs={[
            {
              q: 'Is VOVV.AI a good alternative to Flair AI?',
              a: 'Yes, VOVV.AI can be a strong alternative if your main goal is to create e-commerce product visuals, product page images, ads, social content, on-model shots, and campaign visuals from one product photo. Flair AI may be a better fit if you specifically want a drag-and-drop canvas and template-based product photoshoot editor.',
            },
            {
              q: 'Which is better for e-commerce product photography, VOVV.AI or Flair AI?',
              a: 'It depends on the workflow. VOVV.AI is built around structured product visual generation for e-commerce brands. Flair AI is strong for canvas-based product photoshoot creation and visual editing.',
            },
            {
              q: 'Does VOVV.AI create on-model product visuals?',
              a: 'Yes, VOVV.AI supports on-model and try-on style visual workflows for fashion and product imagery.',
            },
            {
              q: 'Does Flair AI offer product photoshoot templates?',
              a: 'Flair AI publicly highlights template-based product photoshoot workflows and drag-and-drop scene creation.',
            },
            {
              q: 'Can VOVV.AI create product visuals for ads and social media?',
              a: 'Yes, VOVV.AI is designed to help brands create product page visuals, social content, ads, and campaign-ready creative from product images.',
            },
            {
              q: 'Which tool is better for users who want manual creative control?',
              a: 'Flair AI may be better for users who prefer a drag-and-drop canvas and manual scene building. VOVV.AI may be better for users who want faster structured visual outputs for e-commerce workflows.',
            },
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
                { label: 'Fashion Product Photography', to: '/ai-product-photography/fashion' },
                { label: 'Jewelry Product Photography', to: '/ai-product-photography/jewelry' },
                { label: 'Discover examples', to: '/discover' },
                { label: 'Pricing', to: '/pricing' },
                { label: 'Create your account', to: '/auth' },
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
          headline="Turn one product photo into a full visual set"
          copy="Create product page visuals, ads, social content, on-model shots, and campaign-ready creative — from one product image."
          primaryCta={{ label: 'Try VOVV free', to: '/auth' }}
          secondaryCta={{ label: 'See all comparisons', to: '/compare' }}
          pageId="vs-flair-ai"
        />
      </main>

      <LandingFooter />
    </div>
  );
}
