import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const homeFaqs = [
  {
    q: 'What is VOVV.AI?',
    a: 'VOVV.AI is an AI product visual platform for e-commerce brands. Upload one product photo and create product page images, lifestyle visuals, ads, social content, and campaign-ready creative — without booking a photoshoot.',
  },
  {
    q: 'Who is VOVV.AI for?',
    a: 'VOVV.AI is built for e-commerce brands, DTC founders, marketing teams, and creative agencies that need a steady supply of on-brand product visuals — without the cost or schedule of traditional photoshoots.',
  },
  {
    q: 'How fast can I get my first visual?',
    a: 'Under a minute. Drop a product photo, pick a shot, hit generate — your first brand-ready image lands before your coffee cools.',
  },
  {
    q: 'Will my visuals actually look on-brand?',
    a: 'Yes. Lock your scene, lighting and palette once, and every new product slots into the same world. Your catalog stays consistent without re-shoots.',
  },
  {
    q: 'What can I create from a single product photo?',
    a: 'Product page hero shots, lifestyle scenes, social creatives, ad campaigns, on-model try-ons and short product videos — all from one upload.',
  },
  {
    q: 'Which product categories does VOVV.AI support?',
    a: 'Fashion, footwear, beauty and skincare, fragrance, jewelry, bags and accessories, home and furniture, food and beverage, supplements and wellness, electronics, and more — 35+ categories with 1000+ ready-made shots.',
  },
  {
    q: 'Can I use the visuals on Shopify, ads and marketplaces?',
    a: 'Absolutely. Outputs are commercial-ready and built for Shopify, Amazon, Meta and TikTok ads, email, and DTC product pages.',
  },
  {
    q: 'Do I need design or photography skills?',
    a: 'None. If you can upload an image, you can use VOVV. Our 1000+ ready-made shots do the art-directing for you.',
  },
  {
    q: 'Is there a free way to try it?',
    a: 'Yes — start with free credits, no card required. Generate a few visuals, see if it clicks, then upgrade only when you’re ready.',
  },
];

export function HomeFAQ() {
  return (
    <section className="py-16 lg:py-32 bg-[#FAFAF8]" id="faq">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            FAQ
          </p>
          <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
            Common questions
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Quick answers before you start creating.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {homeFaqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="bg-white rounded-2xl border border-[#f0efed] px-6 shadow-sm data-[state=open]:shadow-md transition-shadow"
            >
              <AccordionTrigger className="text-foreground text-base sm:text-[17px] font-semibold py-6 hover:no-underline text-left">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-foreground/70 text-[15px] sm:text-base leading-relaxed pb-6">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
