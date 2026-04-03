import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    q: 'How do I create my first product image?',
    a: 'Upload a product photo, choose what you want to create, and generate your first visuals in minutes.',
  },
  {
    q: 'Can I try VOVV for free?',
    a: 'Yes. You can start with free credits and no credit card required.',
  },
  {
    q: 'What can I create from one photo?',
    a: 'You can create product page images, social creatives, campaign visuals, and short product videos.',
  },
  {
    q: 'Will my visuals stay consistent?',
    a: 'Yes. VOVV helps you keep a consistent visual direction across products and campaigns.',
  },
  {
    q: 'Can I use the outputs for ads and product pages?',
    a: 'Yes. VOVV is designed for ecommerce visuals, campaign creatives, and other commercial brand content.',
  },
  {
    q: 'How long does it take?',
    a: 'You can generate your first visual in under a minute, then create more variations from the same product.',
  },
];

export function HomeFAQ() {
  return (
    <section className="py-24 lg:py-32 bg-[#f5f5f3]" id="faq">
      <div className="max-w-2xl mx-auto px-6">
        <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl font-semibold tracking-tight text-center mb-12">
          Frequently asked questions
        </h2>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="bg-white rounded-2xl border border-[#f0efed] px-6 shadow-sm"
            >
              <AccordionTrigger className="text-[#1a1a2e] text-[15px] font-medium py-5 hover:no-underline">
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
