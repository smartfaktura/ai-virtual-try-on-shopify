import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Image as ImageIcon, Layers, Gauge } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, DEFAULT_OG_IMAGE } from '@/lib/constants';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { ComparisonHero } from '@/components/seo/compare/ComparisonHero';
import { LandingValueCards } from '@/components/seo/landing/LandingValueCards';
import { ComparisonFinalCTA } from '@/components/seo/compare/ComparisonFinalCTA';

const PAGE_PATH = '/compare';
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const TITLE = 'Compare VOVV.AI With Other AI Product Photography Tools';
const DESCRIPTION =
  'Compare VOVV.AI with popular AI product photography tools for e-commerce product visuals, product page images, ads, social content, on-model visuals, and campaign-ready creative.';

interface ComparisonCard {
  competitor: string;
  tagline: string;
  to?: string; // omitted = coming soon
}

const COMPARISONS: ComparisonCard[] = [
  {
    competitor: 'Flair AI',
    tagline:
      'Drag-and-drop product photoshoot canvas vs structured e-commerce visual workflow.',
    to: '/compare/vovv-vs-flair-ai',
  },
  {
    competitor: 'Photoroom',
    tagline:
      'Quick photo editing & background removal vs full product visual generation.',
    to: '/compare/vovv-vs-photoroom',
  },
  {
    competitor: 'Claid AI',
    tagline:
      'Image enhancement & retouching vs end-to-end product visual creation.',
    to: '/compare/vovv-vs-claid-ai',
  },
  {
    competitor: 'Pebblely',
    tagline:
      'Template-based product backgrounds vs category-specific visual systems.',
  },
];

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Compare', item: PAGE_URL },
  ],
};

const collectionJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: TITLE,
  description: DESCRIPTION,
  url: PAGE_URL,
  isPartOf: { '@type': 'WebSite', name: 'VOVV.AI', url: SITE_URL },
};

export default function CompareHub() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <SEOHead
        title={TITLE}
        description={DESCRIPTION}
        canonical={PAGE_URL}
        ogImage={DEFAULT_OG_IMAGE}
      />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={collectionJsonLd} />

      <LandingNav />

      <main>
        <ComparisonHero
          eyebrow="AI Product Photography Comparisons"
          headline="Compare AI Product Photography Tools"
          subheadline="Explore objective comparisons between VOVV.AI and other AI product photography platforms, so you can choose the right workflow for your e-commerce brand."
          primaryCta={{ label: 'Start creating free', to: '/auth' }}
          secondaryCta={{ label: 'Explore examples', to: '/discover' }}
          pageId="compare-hub"
        />

        {/* Intro value section */}
        <section className="py-16 lg:py-28 bg-background">
          <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Why compare
            </p>
            <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
              Find the right AI visual workflow for your brand
            </h2>
            <p className="mt-5 text-[#475569] text-base sm:text-lg leading-relaxed">
              Some tools are better for quick editing. Some are better for manual design control.
              VOVV.AI is built for e-commerce teams that need product page visuals, social
              content, ads, on-model shots, and campaign-ready creative from one product photo.
            </p>
          </div>
        </section>

        {/* Comparison cards grid */}
        <section className="py-16 lg:py-28 bg-[#f5f5f3]">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-14">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Comparisons
              </p>
              <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
                VOVV.AI vs other AI product photography tools
              </h2>
              <p className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed">
                Balanced, factual comparisons — not marketing hype.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
              {COMPARISONS.map((card) => {
                const isLive = !!card.to;
                const inner = (
                  <div
                    className={[
                      'group relative h-full bg-white rounded-3xl border border-[#f0efed] shadow-sm p-7 lg:p-8 transition-all duration-300',
                      isLive
                        ? 'hover:-translate-y-1 hover:shadow-md cursor-pointer'
                        : 'opacity-70',
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Comparison
                      </p>
                      {!isLive && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#1a1a2e]/5 text-[#1a1a2e]/70 text-[10px] font-semibold uppercase tracking-[0.16em]">
                          Coming soon
                        </span>
                      )}
                    </div>
                    <h3 className="text-[#1a1a2e] text-xl lg:text-2xl font-semibold tracking-tight mb-2">
                      VOVV.AI vs {card.competitor}
                    </h3>
                    <p className="text-[#475569] text-[15px] leading-relaxed mb-6">
                      {card.tagline}
                    </p>
                    {isLive ? (
                      <span className="inline-flex items-center gap-1.5 text-[#1a1a2e] text-sm font-semibold">
                        Read comparison
                        <ArrowRight
                          size={14}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-muted-foreground text-sm font-medium">
                        We'll publish this soon
                      </span>
                    )}
                  </div>
                );
                return isLive ? (
                  <Link key={card.competitor} to={card.to!} className="block h-full">
                    {inner}
                  </Link>
                ) : (
                  <div key={card.competitor} aria-disabled className="h-full">
                    {inner}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How we compare tools */}
        <LandingValueCards
          eyebrow="Our framework"
          headline="How we compare tools"
          intro="Every comparison looks at the same four criteria so you can decide based on what actually matters for an e-commerce brand."
          background="background"
          columns={4}
          cards={[
            {
              title: 'E-commerce workflow fit',
              text: 'How well the tool slots into product page, ad, and campaign workflows.',
              Icon: ShoppingBag,
            },
            {
              title: 'Product visual quality',
              text: 'Detail fidelity, brand-readiness, and overall visual polish.',
              Icon: ImageIcon,
            },
            {
              title: 'Category coverage',
              text: 'Range of product categories and scene libraries supported.',
              Icon: Layers,
            },
            {
              title: 'Speed to usable content',
              text: 'How quickly one product photo becomes ready-to-publish creative.',
              Icon: Gauge,
            },
          ]}
        />

        <ComparisonFinalCTA
          headline="Create product visuals from one photo"
          copy="Upload one product photo and generate product page visuals, ads, social content, on-model shots, and campaign-ready creative with VOVV.AI."
          primaryCta={{ label: 'Try VOVV free', to: '/auth' }}
          secondaryCta={{ label: 'See examples', to: '/discover' }}
          pageId="compare-hub"
        />
      </main>

      <LandingFooter />
    </div>
  );
}
