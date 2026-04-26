import {
  ShoppingBag,
  Megaphone,
  Mail,
  LayoutGrid,
  Sparkles,
  Image as ImageIcon,
  Camera,
  Calendar,
  ZoomIn,
  Rocket,
  Instagram,
  ImagePlus,
  Wand2,
  ShieldCheck,
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, DEFAULT_OG_IMAGE } from '@/lib/constants';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingHeroSEO } from '@/components/seo/landing/LandingHeroSEO';
import { LandingValueCards } from '@/components/seo/landing/LandingValueCards';
import { LandingOneToManyShowcase } from '@/components/seo/landing/LandingOneToManyShowcase';
import { LandingHowItWorksSteps } from '@/components/seo/landing/LandingHowItWorksSteps';
import { LandingCategoryGrid } from '@/components/seo/landing/LandingCategoryGrid';
import { LandingComparisonTable } from '@/components/seo/landing/LandingComparisonTable';
import { LandingFAQConfig } from '@/components/seo/landing/LandingFAQConfig';
import { LandingFinalCTASEO } from '@/components/seo/landing/LandingFinalCTASEO';

const PAGE_PATH = '/shopify-product-photography-ai';
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const TITLE = 'AI Product Photos for Shopify Stores | VOVV.AI';
const DESCRIPTION =
  'Create AI product photos for Shopify. Upload one product image and generate product page visuals, lifestyle scenes, ad creatives, banners, and campaign-ready content for your store.';

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Shopify Product Photography AI', item: PAGE_URL },
  ],
};

const softwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'VOVV.AI — AI Product Photos for Shopify',
  url: PAGE_URL,
  description: DESCRIPTION,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export default function ShopifyProductPhotography() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <SEOHead title={TITLE} description={DESCRIPTION} canonical={PAGE_URL} ogImage={DEFAULT_OG_IMAGE} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={softwareJsonLd} />

      <LandingNav />
      <main>
        <LandingHeroSEO
          eyebrow="Shopify Product Photography AI"
          pageId="shopify"
          headline={
            <>
              AI Product Photos for
              <br />
              <span className="text-[#4a5578]">Shopify Stores</span>
            </>
          }
          subheadline="Upload one product photo and create Shopify-ready product page images, lifestyle visuals, ads, banners, and campaign content in minutes."
          trustLine="Built for ecommerce brands · No photoshoot needed · Create from one product photo"
          primaryCta={{ label: 'Create your first Shopify visuals free', to: '/app/generate/product-images' }}
          secondaryCta={{ label: 'Explore AI product photography', to: '/ai-product-photography' }}
          altPrefix="AI Shopify product photography example"
          tiles={[
            { id: '1776770347820-s3qwmr', label: 'PDP Hero' },
            { id: '1776664924644-8pmju4', label: 'Lifestyle' },
            { id: '1776841027943-vetumj', label: 'Detail Shot' },
            { id: '1776102204479-9rlc0n', label: 'Ad Creative' },
            { id: '1776524132929-q8upyp', label: 'Banner' },
            { id: '1776691906436-3fe7l9', label: 'Email Hero' },
            { id: 'editorial-office-flash-eyewear-1776150153576', label: 'Social Post' },
            { id: '1776664933175-rjlbn6', label: 'Collection' },
            { id: '1776574228066-oyklfz', label: 'Seasonal' },
            { id: '1776691911049-gsxycu', label: 'Lookbook' },
          ]}
        />

        <LandingValueCards
          eyebrow="Shopify visual needs"
          headline="Your Shopify store needs more than one product photo"
          intro="A good Shopify product page needs clean product images, lifestyle visuals, detail shots, collection imagery, banners, and ad creatives that all feel consistent."
          background="background"
          cards={[
            { title: 'Product page gallery', text: 'Hero shots, alternates, and details for every PDP.', Icon: ShoppingBag },
            { title: 'Collection imagery', text: 'On-brand visuals across every collection page.', Icon: LayoutGrid },
            { title: 'Lifestyle scenes', text: 'In-context product photos that feel real.', Icon: Sparkles },
            { title: 'Detail close-ups', text: 'Texture and craftsmanship customers can trust.', Icon: ZoomIn },
            { title: 'Homepage banners', text: 'Hero banners that change with every drop.', Icon: ImageIcon },
            { title: 'Meta & Google ads', text: 'High-CTR creative variations to test fast.', Icon: Megaphone },
            { title: 'Email campaigns', text: 'On-brand hero imagery for every send.', Icon: Mail },
            { title: 'Seasonal launches', text: 'Refresh visuals for every season and promo.', Icon: Calendar },
          ]}
        />

        <LandingOneToManyShowcase
          eyebrow="One photo · Full Shopify set"
          headline="Turn one product photo into a full Shopify creative set"
          intro="Upload once. Generate every visual your storefront, ads, and marketing channels need."
          items={[
            {
              title: 'Product page',
              text: 'Clean PDP hero shots & alternates.',
              Icon: ShoppingBag,
              imageIds: ['1776770347820-s3qwmr', '1776841027943-vetumj', '1776664933175-rjlbn6'],
            },
            {
              title: 'Lifestyle',
              text: 'Editorial real-world scenes.',
              Icon: Sparkles,
              imageIds: ['1776664924644-8pmju4', '1776524131703-gvh4bb', '1776524128011-dcnlpo'],
            },
            {
              title: 'Detail',
              text: 'Macro texture & craftsmanship.',
              Icon: ZoomIn,
              imageIds: ['1776243905045-8aw72b', '1776244136599-8gw62e', '1776243682026-h1itvm'],
            },
            {
              title: 'Ad creative',
              text: 'Meta & Google variations to test.',
              Icon: Megaphone,
              imageIds: ['1776102204479-9rlc0n', '1776606017719-zzhgy7', '1776239826550-uaopmt'],
            },
            {
              title: 'Banners',
              text: 'Homepage and email hero imagery.',
              Icon: ImageIcon,
              imageIds: ['1776524132929-q8upyp', '1776574228066-oyklfz', '1776018020221-aehe8n'],
            },
            {
              title: 'Social',
              text: 'IG, TikTok & Pinterest content.',
              Icon: Instagram,
              imageIds: ['1776691906436-3fe7l9', '1776102190563-dioke2', '1776691907477-77vt46'],
            },
          ]}
        />

        <LandingHowItWorksSteps
          headline="Create Shopify product photos in minutes"
          pageId="shopify"
          steps={[
            { title: 'Upload your product photo', text: 'Start with one clean product image.', Icon: ImagePlus },
            { title: 'Choose your visual direction', text: 'Pick PDP shots, lifestyle scenes, ads, banners, or category-specific styles.', Icon: Wand2 },
            { title: 'Generate Shopify-ready visuals', text: 'Use the results across product pages, ads, emails, and campaigns.', Icon: Sparkles },
          ]}
          ctaLabel="Create your first Shopify visuals free"
        />

        <LandingCategoryGrid
          eyebrow="Best categories for Shopify"
          headline="Built for the products Shopify brands sell every day"
          intro="Category-specific visual systems that match how your customers actually shop."
          slugs={['fashion', 'beauty-skincare', 'jewelry', 'footwear', 'food-beverage', 'home-furniture']}
          background="soft"
        />

        <LandingValueCards
          eyebrow="Shopify use cases"
          headline="Use VOVV.AI across your Shopify store and marketing"
          background="background"
          cards={[
            { title: 'Product pages', text: 'Hero, alternate, and detail imagery.', Icon: ShoppingBag },
            { title: 'Collection pages', text: 'Consistent on-brand category visuals.', Icon: LayoutGrid },
            { title: 'Homepage banners', text: 'Hero imagery for every campaign.', Icon: ImageIcon },
            { title: 'Meta ads', text: 'Variations built for performance testing.', Icon: Megaphone },
            { title: 'Google ads', text: 'Shopping-ready creative at scale.', Icon: Megaphone },
            { title: 'Email campaigns', text: 'On-brand hero imagery for every send.', Icon: Mail },
            { title: 'Seasonal launches', text: 'Refresh visuals for every drop.', Icon: Calendar },
            { title: 'Social content', text: 'IG, TikTok & Pinterest assets.', Icon: Instagram },
          ]}
        />

        <LandingComparisonTable
          eyebrow="Shopify shoot vs VOVV.AI"
          headline="Traditional Shopify product shoots vs VOVV.AI"
          leftTitle="Traditional Shopify shoot"
          leftSubtitle="Higher cost and longer turnaround"
          leftItems={[
            'Plan shoot, brief, and concept',
            'Ship products to studio or location',
            'Hire photographer and crew',
            'Wait for editing and approvals',
            'Repeat for every campaign',
          ]}
          rightTitle="VOVV.AI"
          rightSubtitle="Fast, flexible, repeatable"
          rightItems={[
            'Upload product photo',
            'Choose Shopify visual direction',
            'Generate many variations',
            'Test creatives quickly',
            'Refresh assets whenever needed',
          ]}
          background="soft"
        />

        <LandingFAQConfig
          headline="Shopify product photography FAQ"
          faqs={[
            { q: 'Can I use VOVV.AI for Shopify product photos?', a: 'Yes. VOVV.AI is built for ecommerce brands and creates product page images, lifestyle visuals, banners, and ad creatives that work across Shopify themes.' },
            { q: 'What types of Shopify images can I create?', a: 'Product page hero shots, alternates, lifestyle scenes, detail close-ups, collection imagery, homepage banners, Meta and Google ad creatives, email banners, and social posts.' },
            { q: 'Do I need professional product photos to start?', a: 'No. A clean product photo is enough to begin. Better input images usually create better AI results.' },
            { q: 'Can I create Shopify product page and ad visuals from the same product image?', a: 'Yes. The same product photo can power product page, lifestyle, detail, ad, banner, and social outputs from a single upload.' },
            { q: 'Can AI product photos replace a Shopify photoshoot?', a: 'AI can cover most Shopify visuals — product pages, ads, social, and seasonal campaigns. For exact fit, sizing, or product claims, brands should review final visuals before publishing.' },
            { q: 'What product categories work best for Shopify AI product photography?', a: 'Fashion, beauty and skincare, jewelry, footwear, food and beverage, home and furniture, and most other DTC categories.' },
          ]}
        />

        <section className="pt-2 pb-12 lg:pb-20 bg-background">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed">
              Weighing your options? Compare{' '}
              <a href="/ai-product-photography-vs-photoshoot" className="text-foreground font-medium underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground/70 transition-colors">
                AI product photography vs a traditional photoshoot
              </a>{' '}
              or read about the{' '}
              <a href="/ai-product-photography-vs-studio" className="text-foreground font-medium underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground/70 transition-colors">
                VOVV.AI vs studio workflow
              </a>
              .
            </p>
          </div>
        </section>

        <LandingFinalCTASEO
          headline="Create Shopify product visuals from one photo"
          copy="Generate product page images, lifestyle visuals, ads, banners, and campaign-ready content for your Shopify store with VOVV.AI."
          primaryCta={{ label: 'Create your first Shopify visuals free', to: '/app/generate/product-images' }}
          secondaryCta={{ label: 'Try the AI product photo generator', to: '/ai-product-photo-generator' }}
          pageId="shopify"
        />
      </main>
      <LandingFooter />
    </div>
  );
}
