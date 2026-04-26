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
  Target,
  ScrollText,
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
import { LandingDecisionMatrix } from '@/components/seo/landing/LandingDecisionMatrix';
import { LandingFAQConfig } from '@/components/seo/landing/LandingFAQConfig';
import { LandingFinalCTASEO } from '@/components/seo/landing/LandingFinalCTASEO';

const PAGE_PATH = '/ai-product-photography-vs-photoshoot';
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const TITLE = 'AI Product Photography vs Traditional Photoshoot | VOVV.AI';
const DESCRIPTION =
  'AI product photography vs traditional photoshoots. When to use AI visuals, when to book a studio, and how VOVV.AI helps ecommerce brands ship faster.';

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'AI Product Photography vs Traditional Photoshoot', item: PAGE_URL },
  ],
};

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'AI Product Photography vs Traditional Photoshoot',
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
    { '@type': 'Thing', name: 'Traditional product photoshoot' },
  ],
};

export default function AIPhotographyVsPhotoshoot() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <SEOHead title={TITLE} description={DESCRIPTION} canonical={PAGE_URL} ogImage={DEFAULT_OG_IMAGE} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={articleJsonLd} />

      <LandingNav />
      <main>
        <LandingHeroSEO
          pageRoute="/ai-product-photography-vs-photoshoot"
          eyebrow="AI vs Traditional Photoshoot"
          pageId="vs-photoshoot"
          headline={
            <>
              AI Product Photography
              <br />
              <span className="text-[#4a5578]">vs Traditional Photoshoot</span>
            </>
          }
          subheadline="See when AI product photography is faster, more flexible, and more scalable — and when a traditional photoshoot still makes sense."
          trustLine="Compare cost · Speed · Flexibility · Creative output"
          primaryCta={{ label: 'Try VOVV.AI free', to: '/app/generate/product-images' }}
          secondaryCta={{ label: 'See examples', to: '/ai-product-photography' }}
          altPrefix="AI vs traditional photoshoot example"
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
          eyebrow="The simple difference"
          headline="The simple difference"
          leftTitle="Traditional photoshoot"
          leftSubtitle="Best for exact physical capture"
          leftItems={[
            'Best for exact physical capture',
            'Requires planning, shipping, location, photographer',
            'Higher cost per campaign',
            'Slower turnaround',
            'Harder to test many ideas',
          ]}
          rightTitle="VOVV.AI"
          rightSubtitle="Built for scalable visual creation"
          rightItems={[
            'Best for scalable product visuals & campaigns',
            'Starts from one product photo',
            'Faster creation across channels',
            'More visual directions per session',
            'Easier ad and campaign testing',
          ]}
          background="soft"
        />

        <LandingValueCards
          eyebrow="When AI works best"
          headline="When AI product photography makes sense"
          cards={[
            { title: 'You need visuals fast', text: 'New imagery in hours, not weeks.', Icon: Gauge },
            { title: 'You need many variations', text: 'Test dozens of creative directions.', Icon: Layers },
            { title: 'You want to test ads', text: 'Performance creative without booking a shoot.', Icon: Megaphone },
            { title: 'PDP & lifestyle imagery', text: 'Clean product and editorial scenes.', Icon: ShoppingBag },
            { title: 'You launch products often', text: 'Day-one creative for every drop.', Icon: Rocket },
            { title: 'Seasonal campaigns', text: 'Refresh visuals on demand.', Icon: Calendar },
            { title: 'Reduce shoot dependency', text: 'Free your team from production cycles.', Icon: Sparkles },
            { title: 'Weekly social content', text: 'Always-on content for every channel.', Icon: Instagram },
          ]}
        />

        <LandingValueCards
          eyebrow="When a shoot still makes sense"
          headline="When a traditional photoshoot may still be the right choice"
          background="soft"
          cards={[
            { title: 'Exact real-world capture', text: 'When physical accuracy is non-negotiable.', Icon: Camera },
            { title: 'Precise fit & sizing', text: 'For garments needing real model fit.', Icon: Ruler },
            { title: 'Human model validation', text: 'When real human nuance is required.', Icon: Camera },
            { title: 'Regulated product claims', text: 'For visuals tied to compliance.', Icon: ShieldCheck },
            { title: 'Physical usage demos', text: 'When motion or interaction is the point.', Icon: ScrollText },
            { title: 'Highly controlled capture', text: 'For tightly art-directed editorial shoots.', Icon: ImageIcon },
          ]}
        />

        <LandingWorkflowStrip
          headline="A traditional shoot is one production. VOVV.AI is a repeatable visual workflow."
          intro="Same product. Two very different operating models."
          leftTitle="Traditional shoot"
          leftSteps={['Plan', 'Ship', 'Shoot', 'Edit', 'Approve', 'Repeat']}
          rightTitle="VOVV.AI"
          rightSteps={['Upload', 'Choose direction', 'Generate', 'Test', 'Create more']}
        />

        <LandingValueCards
          eyebrow="What changes when you switch"
          headline="What changes when you switch to AI"
          columns={4}
          cards={[
            { title: 'Speed', text: 'New visuals in hours, not weeks.', Icon: Gauge },
            { title: 'Variations', text: 'Many directions per session.', Icon: Layers },
            { title: 'Cost flexibility', text: 'Lower cost as volume grows.', Icon: Target },
            { title: 'Channel coverage', text: 'PDP, ads, social, email, campaigns.', Icon: ShoppingBag },
          ]}
        />

        <LandingCategoryGrid
          pageRoute="/ai-product-photography-vs-photoshoot"
          eyebrow="Categories"
          headline="AI product photography works across product categories"
          intro="Category-specific visual systems for every kind of ecommerce brand."
          slugs={['fashion', 'beauty-skincare', 'fragrance', 'jewelry', 'footwear', 'home-furniture', 'food-beverage', 'electronics-gadgets']}
          background="soft"
        />

        <LandingDecisionMatrix
          headline="Which option is right for your brand?"
          intro="A simple way to decide based on your visual goals."
          leftTitle="Choose a traditional shoot if…"
          leftItems={[
            'You need exact physical documentation',
            'You need real human model fit validation',
            'You have a fixed campaign concept and budget',
            'Your visuals are tied to regulated claims',
          ]}
          rightTitle="Choose VOVV.AI if…"
          rightItems={[
            'You need more visuals faster',
            'You want to test multiple creative ideas',
            'You need ecommerce assets every week',
            'You want category-specific product scenes',
            'You want one product photo to become many outputs',
          ]}
        />

        <LandingFAQConfig
          headline="AI vs traditional photoshoot FAQ"
          faqs={[
            { q: 'Can AI product photography replace a traditional photoshoot?', a: 'For many ecommerce visuals — product pages, ads, social, seasonal campaigns — yes. For exact fit, regulated claims, or highly controlled physical capture, brands often still use a traditional shoot.' },
            { q: 'Is AI product photography good for ecommerce brands?', a: 'Yes. AI product photography is built for the speed and scale ecommerce brands need across PDPs, ads, social, and campaigns.' },
            { q: 'When should I still use a traditional product photoshoot?', a: 'When you need exact physical documentation, model fit validation, or visuals tied to compliance requirements.' },
            { q: 'Is AI product photography cheaper than a photoshoot?', a: 'Often yes — especially when you need many variations across channels. Final cost depends on volume, complexity, and how often visuals refresh.' },
            { q: 'Can I use AI product photography for ads and product pages?', a: 'Yes. The output is designed for Meta and Google ads, PDPs, social, email, and campaign creative.' },
            { q: 'Does VOVV.AI preserve product details?', a: 'VOVV.AI is built to keep the product as the hero, but users should always review final visuals before publishing.' },
          ]}
        />

        <LandingFinalCTASEO
          headline="Create more product visuals without planning another shoot"
          copy="Upload one product photo and generate product page images, lifestyle visuals, ads, social content, and campaign-ready creative with VOVV.AI."
          primaryCta={{ label: 'Try VOVV.AI free', to: '/app/generate/product-images' }}
          secondaryCta={{ label: 'vs Studio', to: '/ai-product-photography-vs-studio' }}
          pageId="vs-photoshoot"
        />
      </main>
      <LandingFooter />
    </div>
  );
}
