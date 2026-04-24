import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
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
    <section className="py-16 lg:py-32 bg-[#f5f5f3]" id="faq">
      <div className="max-w-2xl mx-auto px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4 text-center">
          FAQ
        </p>
        <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl font-semibold tracking-tight text-center mb-3">
          Everything you're wondering about VOVV
        </h2>
        <p className="text-[#6b7280] text-base sm:text-lg text-center mb-12 leading-relaxed">
          Quick answers before you start creating.
        </p>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="bg-white rounded-2xl border border-[#f0efed] px-6 shadow-sm data-[state=open]:shadow-md transition-shadow"
            >
              <AccordionTrigger className="text-[#1a1a2e] text-[15px] font-medium py-5 hover:no-underline text-left">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-[#6b7280] text-sm leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
