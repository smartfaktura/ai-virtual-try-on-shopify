import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    q: 'What is a Visual Set?',
    a: 'A Visual Set is a collection of 6–20 brand-ready images generated from a single product photo. Each set is tied to a workflow — like Ad Refresh, Product Listing, or Website Hero — so you get images sized and styled for a specific purpose.',
  },
  {
    q: 'What are Creative Drops?',
    a: 'Creative Drops are automated, recurring visual runs. You choose your products, select your workflows, and set a schedule (monthly or biweekly). Fresh visuals arrive on autopilot — no manual work needed. Available on Growth plans and above.',
  },
  {
    q: 'How is the image quality compared to a real photoshoot?',
    a: 'Our AI generates studio-quality images that match professional photography for most e-commerce use cases. Combined with your Brand Profile, every image maintains consistent lighting, tone, and composition across your entire catalog.',
  },
  {
    q: 'How does Brand Memory work?',
    a: 'When you create a Brand Profile, you set your preferred tone, lighting style, background, color temperature, and composition rules. Every future generation uses this profile automatically — so your visuals stay on-brand without manual adjustments.',
  },
  {
    q: 'What image formats and sizes are supported?',
    a: 'We support all common aspect ratios (1:1, 4:5, 16:9, 9:16) and output high-resolution images suitable for e-commerce, social media, ads, and print. You can download in JPEG or PNG format.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Every new account gets 5 free visuals — no credit card required. That\'s enough to create your first Visual Set and see the quality before committing to a plan.',
  },
  {
    q: 'How does Virtual Try-On work?',
    a: 'Upload a clothing item and choose from our library of 34 diverse AI models across different ethnicities, body types, and ages. Select a pose and scene, and the AI generates realistic photos of the model wearing your product.',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Absolutely. You can cancel, upgrade, or downgrade your plan at any time. There are no long-term contracts or cancellation fees. Unused monthly visuals don\'t roll over, but top-up credits never expire.',
  },
];

export function LandingFAQ() {
  return (
    <section id="faq" className="py-20 sm:py-28 bg-muted/20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know to get started.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="border border-border rounded-xl px-5 bg-card data-[state=open]:shadow-sm"
            >
              <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:no-underline py-4">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
