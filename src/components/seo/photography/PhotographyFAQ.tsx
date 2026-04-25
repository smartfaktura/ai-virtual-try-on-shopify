import { useMemo } from 'react';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { JsonLd } from '@/components/JsonLd';

const faqs = [
  {
    q: 'What is AI product photography?',
    a: 'AI product photography uses artificial intelligence to create product images, lifestyle scenes, campaign visuals, and e-commerce assets from a product photo.',
  },
  {
    q: 'How does VOVV.AI create product photos?',
    a: 'Upload a product image, choose the visual direction or category, and VOVV.AI generates product visuals for your store, ads, social media, and campaigns.',
  },
  {
    q: 'Can AI product photography replace a traditional photoshoot?',
    a: 'For many e-commerce visuals, yes. VOVV.AI is especially useful for product page images, lifestyle scenes, ads, social content, and campaign testing. For exact fit, sizing, or legal product claims, brands should still review final visuals carefully.',
  },
  {
    q: 'What product categories does VOVV.AI support?',
    a: 'VOVV.AI supports fashion, footwear, beauty and skincare, fragrance, jewelry, bags and accessories, home and furniture, food and beverage, supplements and wellness, electronics and gadgets, and more.',
  },
  {
    q: 'Can I create product photos for Shopify?',
    a: 'Yes. VOVV.AI can help create product page images, lifestyle visuals, banners, and ad creatives for Shopify and other e-commerce stores.',
  },
  {
    q: 'Do I need professional product photos to start?',
    a: 'No. A clean product photo is enough to begin. Better input images usually help create better AI results.',
  },
  {
    q: 'Can VOVV.AI preserve my product details?',
    a: 'VOVV.AI is designed to keep the product as the hero, but users should always review generated visuals before using them in ads or product pages.',
  },
];

export function PhotographyFAQ() {
  const faqJsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    }),
    [],
  );

  return (
    <section id="faq" className="py-16 lg:py-32 bg-background">
      <JsonLd data={faqJsonLd} />
      <div className="max-w-2xl mx-auto px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4 text-center">
          FAQ
        </p>
        <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-center mb-4">
          AI product photography FAQ
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg text-center mb-12 leading-relaxed">
          Quick answers to the most common questions.
        </p>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="bg-white rounded-2xl border border-[#f0efed] px-6 shadow-sm data-[state=open]:shadow-md transition-shadow"
            >
              <AccordionTrigger className="text-[#1a1a2e] text-base sm:text-[17px] font-semibold py-6 hover:no-underline text-left">
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
