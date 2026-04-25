import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const QA = [
  {
    q: 'How many credits does one generation cost?',
    a: 'A single product image typically uses 1 credit. Brand-model variation sets and high-resolution video shots use more. New accounts start with 20 free credits — enough for around 20 visuals.',
  },
  {
    q: 'What file formats can I upload?',
    a: 'PNG, JPG, and WEBP. Higher-resolution source photos give cleaner results, but VOVV works well even with phone shots as long as the product is clearly visible.',
  },
  {
    q: 'How does VOVV keep my brand consistent?',
    a: 'Color, packaging, and material details are extracted from your photo and locked across every generation. You can also train a Brand Model so the same face and styling carries across every shoot.',
  },
  {
    q: 'Can I use the visuals commercially?',
    a: 'Yes. Everything you generate on a paid plan is yours to use across product pages, paid ads, social, email, and print campaigns.',
  },
];

export function HowItWorksFAQ() {
  return (
    <section className="py-16 lg:py-32 bg-background">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            FAQ
          </p>
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
            Common questions about the workflow.
          </h2>
        </div>

        <Accordion type="single" collapsible className="flex flex-col gap-3">
          {QA.map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border border-[#f0efed] bg-white rounded-2xl px-5 sm:px-6"
            >
              <AccordionTrigger className="text-left text-[#1a1a2e] text-base font-semibold py-5 hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-[#6b7280] text-sm sm:text-base leading-relaxed pb-5">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
