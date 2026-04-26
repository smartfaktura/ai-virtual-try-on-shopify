import {
  ShoppingBag,
  Megaphone,
  Instagram,
  Mail,
  Calendar,
  Rocket,
  LayoutGrid,
  Sparkles,
  Camera,
  ZoomIn,
  Image as ImageIcon,
  ImagePlus,
  Wand2,
  Target,
  Layers,
  Gauge,
  CheckCircle2,
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
import { LandingFAQConfig } from '@/components/seo/landing/LandingFAQConfig';
import { LandingFinalCTASEO } from '@/components/seo/landing/LandingFinalCTASEO';

const PAGE_PATH = '/ai-product-photo-generator';
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const TITLE = 'AI Product Photo Generator for E-commerce Brands | VOVV.AI';
const DESCRIPTION =
  'Generate AI product photos from one product image. Create product page images, lifestyle scenes, ads, social content, banners, and campaign-ready visuals in minutes.';

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'AI Product Photo Generator', item: PAGE_URL },
  ],
};

const softwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'VOVV.AI — AI Product Photo Generator',
  url: PAGE_URL,
  description: DESCRIPTION,
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export default function AIProductPhotoGenerator() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <SEOHead title={TITLE} description={DESCRIPTION} canonical={PAGE_URL} ogImage={DEFAULT_OG_IMAGE} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={softwareJsonLd} />

      <LandingNav />
      <main>
        <LandingHeroSEO
          eyebrow="AI Product Photo Generator"
          pageId="generator"
          headline={
            <>
              AI Product Photo Generator
              <br />
              <span className="text-[#4a5578]">for E-commerce Brands</span>
            </>
          }
          subheadline="Upload one product image and generate product photos for your store, ads, social media, email campaigns, and product launches."
          trustLine="One product photo · Multiple visual styles · Built for ecommerce"
          primaryCta={{ label: 'Generate free', to: '/app/generate/product-images' }}
          secondaryCta={{ label: 'See examples', to: '/ai-product-photography' }}
          altPrefix="AI product photo generator example"
          tiles={[
            { id: '1776770347820-s3qwmr', label: 'Studio Hero' },
            { id: '1776664924644-8pmju4', label: 'Lifestyle' },
            { id: '1776102204479-9rlc0n', label: 'Ad Creative' },
            { id: '1776691906436-3fe7l9', label: 'Social Visual' },
            { id: '1776524132929-q8upyp', label: 'Campaign Hero' },
            { id: '1776243905045-8aw72b', label: 'Detail Shot' },
            { id: '1776574228066-oyklfz', label: 'Editorial' },
            { id: '1776018020221-aehe8n', label: 'Dark Mood' },
            { id: 'editorial-office-flash-eyewear-1776150153576', label: 'Office Flash' },
            { id: '1776691911049-gsxycu', label: 'Lookbook' },
          ]}
        />

        <LandingValueCards
          eyebrow="More than one image"
          headline="Generate more than one product image"
          intro="VOVV.AI helps you create full visual sets from a single product photo, so your brand can move faster across product pages, ads, social content, and campaigns."
          cards={[
            { title: 'Clean studio shots', text: 'PDP-ready product imagery.', Icon: ShoppingBag },
            { title: 'Lifestyle scenes', text: 'In-context editorial visuals.', Icon: Sparkles },
            { title: 'Campaign visuals', text: 'Launch and seasonal hero imagery.', Icon: Rocket },
            { title: 'Social images', text: 'IG, TikTok & Pinterest content.', Icon: Instagram },
            { title: 'Ad creatives', text: 'High-CTR Meta & Google variations.', Icon: Megaphone },
            { title: 'Detail shots', text: 'Macro texture & craftsmanship.', Icon: ZoomIn },
            { title: 'Website banners', text: 'Hero imagery for homepage & email.', Icon: ImageIcon },
            { title: 'Launch assets', text: 'Day-one creative for every drop.', Icon: Calendar },
          ]}
        />

        <LandingOneToManyShowcase
          eyebrow="Before · After"
          headline="From one product photo to many brand-ready visuals"
          intro="One upload becomes a full visual library — built around your product."
          background="soft"
          items={[
            { title: 'Product page', text: 'Clean PDP hero shots.', Icon: ShoppingBag, imageIds: ['1776770347820-s3qwmr', '1776841027943-vetumj', '1776664933175-rjlbn6'] },
            { title: 'Lifestyle', text: 'Editorial real-world scenes.', Icon: Sparkles, imageIds: ['1776664924644-8pmju4', '1776524131703-gvh4bb', '1776524128011-dcnlpo'] },
            { title: 'Social', text: 'IG, TikTok & Pinterest ready.', Icon: Instagram, imageIds: ['1776691906436-3fe7l9', '1776102190563-dioke2', '1776691907477-77vt46'] },
            { title: 'Paid ads', text: 'Meta & Google creative variations.', Icon: Megaphone, imageIds: ['1776102204479-9rlc0n', '1776606017719-zzhgy7', '1776239826550-uaopmt'] },
            { title: 'Detail', text: 'Macro texture & material.', Icon: ZoomIn, imageIds: ['1776243905045-8aw72b', '1776244136599-8gw62e', '1776243682026-h1itvm'] },
            { title: 'Campaigns', text: 'Seasonal & brand stories.', Icon: Camera, imageIds: ['1776524132929-q8upyp', '1776574228066-oyklfz', '1776018020221-aehe8n'] },
          ]}
        />

        <LandingHowItWorksSteps
          headline="How the AI product photo generator works"
          steps={[
            { title: 'Upload your product photo', text: 'Start with one clean product image.', Icon: ImagePlus },
            { title: 'Choose your direction', text: 'Pick a category, scene, or campaign style.', Icon: Wand2 },
            { title: 'Generate product photos', text: 'Use them across your store, ads, social, and campaigns.', Icon: Sparkles },
          ]}
          ctaLabel="Generate product photos free"
          pageId="generator"

        />
        <LandingCategoryGrid
          eyebrow="All 10 product verticals"
          headline="Generate product photos for every ecommerce category"
          intro="Category-specific visual systems for the products you actually sell."
          background="background"
        />

        <LandingValueCards
          eyebrow="Use cases"
          headline="Made for ecommerce teams that need visuals every week"
          background="soft"
          cards={[
            { title: 'Product pages', text: 'Always-on PDP imagery.', Icon: ShoppingBag },
            { title: 'Paid ads', text: 'Variations for performance testing.', Icon: Megaphone },
            { title: 'Social content', text: 'Weekly assets for every channel.', Icon: Instagram },
            { title: 'Email campaigns', text: 'Hero banners for every send.', Icon: Mail },
            { title: 'Product launches', text: 'Day-one creative ready early.', Icon: Rocket },
            { title: 'Seasonal campaigns', text: 'Refresh visuals on demand.', Icon: Calendar },
            { title: 'Catalog consistency', text: 'A unified look across SKUs.', Icon: LayoutGrid },
            { title: 'A/B testing creatives', text: 'Test more, faster, smarter.', Icon: Target },
          ]}
        />

        <LandingValueCards
          eyebrow="Why VOVV.AI"
          headline="A product photo generator built for brand-ready results"
          columns={3}
          cards={[
            { title: 'Product stays the hero', text: 'Visual systems that protect your product details.', Icon: CheckCircle2 },
            { title: 'Category-specific direction', text: '10 product verticals with editorial-grade scenes.', Icon: LayoutGrid },
            { title: 'Fast creative testing', text: 'Generate multiple directions in one session.', Icon: Gauge },
            { title: 'Multiple outputs per image', text: 'One upload powers an entire visual library.', Icon: Layers },
            { title: 'Built for ecommerce workflows', text: 'PDP, ads, social, email and campaigns covered.', Icon: ShoppingBag },
            { title: 'Visuals for every channel', text: 'From storefront to launch week to social.', Icon: Sparkles },
          ]}
        />

        <LandingFAQConfig
          headline="AI product photo generator FAQ"
          faqs={[
            { q: 'What is an AI product photo generator?', a: 'An AI product photo generator turns a product image into multiple ecommerce-ready visuals — product pages, lifestyle scenes, ads, social content, and campaign assets — without a traditional photoshoot.' },
            { q: 'How does VOVV.AI generate product photos?', a: 'Upload a product image, choose a category or visual direction, and VOVV.AI generates brand-ready product photos for your store and marketing channels.' },
            { q: 'Can I generate lifestyle product photos?', a: 'Yes. VOVV.AI includes editorial lifestyle scenes for fashion, beauty, jewelry, footwear, home, food, and more.' },
            { q: 'Can I create product photos for ecommerce?', a: 'Yes. The generator is built specifically for ecommerce brands — Shopify, DTC sites, Etsy, Amazon, and beyond.' },
            { q: 'Do I need professional photos to start?', a: 'No. A clean product photo is enough to begin. Better input images typically create better AI results.' },
            { q: 'What product categories does VOVV.AI support?', a: 'Fashion, footwear, beauty and skincare, fragrance, jewelry, bags and accessories, home and furniture, food and beverage, supplements and wellness, and electronics and gadgets.' },
            { q: 'Can I use generated product photos in ads?', a: 'Yes. The output is designed to work across Meta and Google ads, social, email, and product page creative — review final visuals before publishing.' },
          ]}
        />

        <section className="pt-2 pb-12 lg:pb-20 bg-background">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed">
              Selling on a specific platform? See dedicated pages for{' '}
              <a href="/shopify-product-photography-ai" className="text-foreground font-medium underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground/70 transition-colors">
                Shopify product photography
              </a>{' '}
              and{' '}
              <a href="/etsy-product-photography-ai" className="text-foreground font-medium underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground/70 transition-colors">
                Etsy product photography
              </a>
              , or compare AI vs a{' '}
              <a href="/ai-product-photography-vs-studio" className="text-foreground font-medium underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground/70 transition-colors">
                product photography studio
              </a>
              .
            </p>
          </div>
        </section>

        <LandingFinalCTASEO
          headline="Generate your first product visuals today"
          copy="Upload one product photo and create studio images, lifestyle visuals, ads, social content, and campaign-ready creative with VOVV.AI."
          primaryCta={{ label: 'Generate free', to: '/app/generate/product-images' }}
          secondaryCta={{ label: 'vs Photoshoot', to: '/ai-product-photography-vs-photoshoot' }}
          pageId="generator"
        />
      </main>
      <LandingFooter />
    </div>
  );
}
