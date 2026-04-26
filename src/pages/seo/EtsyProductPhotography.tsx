import {
  ShoppingBag,
  Sparkles,
  Mail,
  Calendar,
  Gift,
  Heart,
  ZoomIn,
  Instagram,
  Image as ImageIcon,
  Camera,
  Rocket,
  Palette,
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
import { LandingFAQConfig } from '@/components/seo/landing/LandingFAQConfig';
import { LandingFinalCTASEO } from '@/components/seo/landing/LandingFinalCTASEO';

const PAGE_PATH = '/etsy-product-photography-ai';
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const TITLE = 'AI Product Photos for Etsy Sellers | VOVV.AI';
const DESCRIPTION =
  'Create AI product photos for Etsy listings. Upload one product image and generate listing visuals, lifestyle scenes, detail shots, banners, and social content for your shop.';

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Etsy Product Photography AI', item: PAGE_URL },
  ],
};

const softwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'VOVV.AI — AI Product Photos for Etsy',
  url: PAGE_URL,
  description: DESCRIPTION,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export default function EtsyProductPhotography() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <SEOHead title={TITLE} description={DESCRIPTION} canonical={PAGE_URL} ogImage={DEFAULT_OG_IMAGE} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={softwareJsonLd} />

      <LandingNav />
      <main>
        <LandingHeroSEO
          eyebrow="Etsy Product Photography AI"
          pageId="etsy"
          headline={
            <>
              AI Product Photos for
              <br />
              <span className="text-[#4a5578]">Etsy Sellers</span>
            </>
          }
          subheadline="Upload one product photo and create Etsy listing images, lifestyle visuals, detail shots, shop banners, and social content in minutes."
          trustLine="Made for small shops · No studio needed · Create from one product photo"
          primaryCta={{ label: 'Try it free', to: '/app/generate/product-images' }}
          secondaryCta={{ label: 'See examples', to: '/ai-product-photography' }}
          altPrefix="AI Etsy product photography example"
          tiles={[
            { id: '1776770347820-s3qwmr', label: 'Listing Hero' },
            { id: '1776664924644-8pmju4', label: 'Lifestyle' },
            { id: '1776243905045-8aw72b', label: 'Detail Shot' },
            { id: '1776691906436-3fe7l9', label: 'Styled Scene' },
            { id: '1776524132929-q8upyp', label: 'Shop Banner' },
            { id: '1776664933175-rjlbn6', label: 'Editorial' },
            { id: '1776102190563-dioke2', label: 'Social Post' },
            { id: '1776574228066-oyklfz', label: 'Seasonal' },
            { id: '1776691911049-gsxycu', label: 'Lookbook' },
            { id: '1776018020221-aehe8n', label: 'Mood' },
          ]}
        />

        <LandingValueCards
          eyebrow="Etsy listing visuals"
          headline="Create better visuals for your Etsy listings"
          intro="Etsy shoppers rely on visuals. VOVV.AI helps you create listing images that show your product clearly, style it in context, and give your shop a more polished brand feel."
          cards={[
            { title: 'Main listing image', text: 'A clean, scroll-stopping hero shot.', Icon: ShoppingBag },
            { title: 'Lifestyle scene', text: 'Show your product in a real setting.', Icon: Sparkles },
            { title: 'Detail close-up', text: 'Macro texture customers can trust.', Icon: ZoomIn },
            { title: 'Styled product image', text: 'Editorial flatlay or styled scene.', Icon: Palette },
            { title: 'Shop banner', text: 'On-brand banner for your shop header.', Icon: ImageIcon },
            { title: 'Social post', text: 'Pinterest, Instagram & TikTok ready.', Icon: Instagram },
            { title: 'Seasonal listing', text: 'Refresh visuals for each season.', Icon: Calendar },
            { title: 'Gift-ready imagery', text: 'Campaign visuals for gift drops.', Icon: Gift },
          ]}
        />

        <LandingOneToManyShowcase
          eyebrow="One photo · Full Etsy set"
          headline="Turn one product image into a complete Etsy listing set"
          intro="Upload once. Generate every visual your listings, banners, and social channels need."
          background="soft"
          items={[
            { title: 'Clean product', text: 'Listing-ready hero shot.', Icon: ShoppingBag, imageIds: ['1776770347820-s3qwmr', '1776841027943-vetumj', '1776664933175-rjlbn6'] },
            { title: 'Lifestyle', text: 'In-context editorial scene.', Icon: Sparkles, imageIds: ['1776664924644-8pmju4', '1776524131703-gvh4bb', '1776524128011-dcnlpo'] },
            { title: 'Detail', text: 'Texture & craftsmanship.', Icon: ZoomIn, imageIds: ['1776243905045-8aw72b', '1776244136599-8gw62e', '1776243682026-h1itvm'] },
            { title: 'Styled scene', text: 'Flatlay & editorial moods.', Icon: Palette, imageIds: ['1776664924644-8pmju4', '1776691911049-gsxycu', '1776691907477-77vt46'] },
            { title: 'Gift / banner', text: 'Seasonal & gift-ready visuals.', Icon: Gift, imageIds: ['1776524132929-q8upyp', '1776574228066-oyklfz', '1776018020221-aehe8n'] },
            { title: 'Social', text: 'Pinterest, IG & TikTok visuals.', Icon: Instagram, imageIds: ['1776691906436-3fe7l9', '1776102190563-dioke2', 'editorial-office-flash-eyewear-1776150153576'] },
          ]}
        />

        <LandingCategoryGrid
          eyebrow="Best categories for Etsy"
          headline="Built for handmade, creative, and lifestyle products"
          intro="Category-specific visual systems for the products Etsy sellers love to make."
          slugs={['jewelry', 'home-furniture', 'fashion', 'bags-accessories', 'beauty-skincare', 'food-beverage']}
          background="background"
        />

        <LandingHowItWorksSteps
          headline="Create Etsy product photos in minutes"
          pageId="etsy"
          steps={[
            { title: 'Upload your product photo', text: 'Start with one clean product image.', Icon: ImagePlus },
            { title: 'Choose a visual style or category', text: 'Pick listing, lifestyle, detail, or styled scenes.', Icon: Wand2 },
            { title: 'Generate listing-ready visuals', text: 'Use them across listings, banners, and social.', Icon: Sparkles },
          ]}
          ctaLabel="Create Etsy product visuals free"
        />

        <LandingValueCards
          eyebrow="Etsy use cases"
          headline="Use VOVV.AI across your Etsy shop"
          background="soft"
          cards={[
            { title: 'Listing photos', text: 'Hero, alternates, and details.', Icon: ShoppingBag },
            { title: 'Shop banners', text: 'On-brand banner for your shop.', Icon: ImageIcon },
            { title: 'Seasonal collections', text: 'Refresh visuals for every season.', Icon: Calendar },
            { title: 'Gift guides', text: 'Gift-ready campaign imagery.', Icon: Gift },
            { title: 'Social media posts', text: 'Pinterest, IG, TikTok content.', Icon: Instagram },
            { title: 'Detail images', text: 'Macro texture customers love.', Icon: ZoomIn },
            { title: 'Launch visuals', text: 'Day-one creative for new listings.', Icon: Rocket },
            { title: 'Brand consistency', text: 'A unified look across listings.', Icon: Heart },
          ]}
        />

        <section className="py-16 lg:py-32 bg-background">
          <div className="max-w-3xl mx-auto px-6">
            <div className="bg-white rounded-3xl border border-[#f0efed] shadow-sm p-7 lg:p-10">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 shrink-0 rounded-2xl bg-[#1a1a2e] text-white flex items-center justify-center shadow-sm">
                  <ShieldCheck size={20} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-2">
                    Keep your shop accurate
                  </p>
                  <h2 className="text-[#1a1a2e] text-2xl sm:text-3xl font-semibold tracking-tight mb-3">
                    Keep your product accurate and shop-ready
                  </h2>
                  <p className="text-foreground/70 text-base leading-relaxed">
                    VOVV.AI helps create visual concepts from your product photo, but sellers should always review images before publishing to make sure the product, materials, details, and listing expectations are accurate to what buyers will receive.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <LandingFAQConfig
          headline="Etsy product photography FAQ"
          faqs={[
            { q: 'Can I use VOVV.AI for Etsy product photos?', a: 'Yes. VOVV.AI is great for listing images, lifestyle scenes, detail shots, banners, and social content for Etsy shops.' },
            { q: 'Can AI create Etsy listing images from one product photo?', a: 'Yes. One clean product image can become listing hero shots, lifestyle scenes, detail close-ups, and styled flatlays.' },
            { q: 'What types of Etsy products work well?', a: 'Jewelry, home and furniture, fashion, bags and accessories, beauty and skincare, food and beverage, and most other handmade or lifestyle categories.' },
            { q: 'Can I create lifestyle images for handmade products?', a: 'Yes. The editorial lifestyle scenes are designed to make handmade and small-batch products feel premium and shoppable.' },
            { q: 'Can I create shop banners and social visuals?', a: 'Yes. The same product photo can power shop banners, gift-guide visuals, and Pinterest, Instagram, and TikTok content.' },
            { q: 'Should I review AI product photos before publishing?', a: 'Always. Etsy sellers should review every generated image to make sure the product, materials, and listing expectations match what buyers will receive.' },
          ]}
        />

        <section className="pt-2 pb-12 lg:pb-20 bg-background">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed">
              Curious how AI compares to a real photoshoot? Read{' '}
              <a href="/ai-product-photography-vs-photoshoot" className="text-foreground font-medium underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground/70 transition-colors">
                AI product photography vs traditional photoshoot
              </a>
              {' '}or explore the{' '}
              <a href="/ai-product-photography" className="text-foreground font-medium underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground/70 transition-colors">
                full AI product photography hub
              </a>
              .
            </p>
          </div>
        </section>

        <LandingFinalCTASEO
          headline="Create polished Etsy visuals from one product photo"
          copy="Generate listing images, lifestyle scenes, detail shots, banners, and social content for your Etsy shop."
          primaryCta={{ label: 'Try it free', to: '/app/generate/product-images' }}
          secondaryCta={{ label: 'Open generator', to: '/ai-product-photo-generator' }}
          pageId="etsy"
        />
      </main>
      <LandingFooter />
    </div>
  );
}
