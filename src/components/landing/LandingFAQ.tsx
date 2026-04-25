import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { JsonLd } from '@/components/JsonLd';
import { useMemo } from 'react';

const faqs = [
  {
    q: 'How fast do I get my first set of visuals?',
    a: 'Under two minutes. Upload one product photo, pick your shots, and your AI studio team delivers a full set of brand-ready images while you wait — no booking, no briefing, no back-and-forth.',
  },
  {
    q: 'One product photo — what can I actually create?',
    a: 'From a single upload: product page hero shots, on-model try-ons, lifestyle scenes, social and ad creatives, UGC-style selfies, mirror shots, flat lays, and short product videos. Same product, endless scenes.',
  },
  {
    q: 'Will my visuals look on-brand and consistent?',
    a: 'Yes. Lock your scene, lighting, palette, and mood once in your Brand Profile — every new product drops into the same world automatically. Your catalog stays cohesive without art direction on every shot.',
  },
  {
    q: 'What is my AI Studio Team?',
    a: '10 AI specialists — photographer, stylist, model director, set designer, retoucher, and more — working together behind the scenes. You give the product; they handle composition, lighting, posing, and finishing.',
  },
  {
    q: 'Can I generate product videos too?',
    a: 'Absolutely. Turn any product image into short motion content for Reels, TikTok, Meta ads, and product pages. Cinematic camera moves, no shoot required.',
  },
  {
    q: 'How do I try it without paying?',
    a: 'Every account starts with 20 free credits — no credit card required. Enough to generate your first full visual set and see the quality before committing to a plan.',
  },
];

export function LandingFAQ() {
  const faqJsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }), []);

  return (
    <section id="faq" className="py-16 lg:py-32 bg-[#f5f5f3]">
      <JsonLd data={faqJsonLd} />
      <div className="max-w-2xl mx-auto px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4 text-center">
          FAQ
        </p>
        <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-center mb-4">
          Frequently asked questions
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg text-center mb-12 leading-relaxed">
          Quick answers before you commit.
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
