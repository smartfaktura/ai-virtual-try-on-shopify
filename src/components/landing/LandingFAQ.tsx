import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    q: 'What are credits and how do they work?',
    a: 'Each credit generates one AI image. Standard product photos cost 1-2 credits, while Virtual Try-On images cost 3 credits. You get 5 free credits to start, and credits from top-up packs never expire.',
  },
  {
    q: 'Do I need a Shopify store to use nanobanna?',
    a: 'Not at all! While we have a native Shopify integration, you can upload any product image directly. nanobanna works for anyone who needs professional product images — whether you sell on Amazon, Etsy, your own website, or social media.',
  },
  {
    q: 'How is the image quality compared to a real photoshoot?',
    a: 'Our AI generates studio-quality images that are indistinguishable from professional photography for most use cases. We use advanced models trained on millions of professional product photos to ensure consistent, high-quality results.',
  },
  {
    q: 'Can I generate images in bulk?',
    a: 'Yes! Our Growth and Pro plans include bulk generation. Upload your entire catalog, select templates, and generate hundreds of images with one click. Perfect for seasonal refreshes or new product launches.',
  },
  {
    q: 'What image formats and sizes are supported?',
    a: 'We support all common aspect ratios (1:1, 4:5, 16:9, 9:16) and output high-resolution images suitable for e-commerce, social media, ads, and print. You can download in JPEG or PNG format.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Every new account gets 5 free credits — no credit card required. That\'s enough to generate several images and see the quality for yourself before committing to a plan.',
  },
  {
    q: 'How does Virtual Try-On work?',
    a: 'Upload a clothing item and choose from our library of 34 diverse AI models across different ethnicities, body types, and ages. Select a pose and scene, and our AI generates realistic photos of the model wearing your product.',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Absolutely. You can cancel, upgrade, or downgrade your plan at any time. There are no long-term contracts or cancellation fees. Unused monthly credits don\'t roll over, but top-up credits never expire.',
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
