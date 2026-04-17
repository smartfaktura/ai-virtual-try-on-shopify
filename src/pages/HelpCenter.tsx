import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { SITE_URL } from '@/lib/constants';
import { HelpCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useState, useMemo } from 'react';

const faqCategories = [
  {
    name: 'Getting Started',
    questions: [
      {
        q: 'How do I create my first product image?',
        a: 'Upload your product photo in the Products section, then head to Workflows. Choose from seven core workflows — Virtual Try-On, Product Listing, Selfie / UGC, Flat Lay, Mirror Selfie, Interior / Exterior Staging, or Picture Perspectives — select your product, and hit Generate. Your images will be ready in about 60 seconds at 2K resolution in PNG format.',
      },
      {
        q: 'What image formats are supported for uploads?',
        a: 'We accept JPG, PNG, and WebP files. For best results, use images with clean backgrounds and at least 1024×1024 resolution.',
      },
      {
        q: 'Do I need to remove the background from my product photos?',
        a: 'No — our AI handles background removal automatically. However, starting with a clean, well-lit product photo on a simple background will give you the best results.',
      },
      {
        q: 'What is Freestyle mode?',
        a: 'Freestyle is our open-ended generation mode. Write any prompt, attach product photos or reference images, apply a Brand Profile and style presets, then generate. It gives you full creative control when none of the standard Workflows fit your vision. Freestyle costs 4 credits per image at Standard quality, or 6 credits at Pro quality or when you add a model or scene.',
      },
      {
        q: 'What is a Brand Profile and why should I create one?',
        a: 'A Brand Profile teaches our AI your visual identity — your preferred colors, lighting style, scenes, tone, color temperature, and composition rules. Once set up, every image you generate across Workflows and Freestyle will automatically align with your brand aesthetic. Create one under Brand Profiles in the sidebar.',
      },
    ],
  },
  {
    name: 'Credits & Billing',
    questions: [
      {
        q: 'How do credits work?',
        a: 'Each generation costs credits based on the mode: Workflows cost 6 credits per image. Freestyle costs 4 credits per image at Standard quality, or 6 credits at Pro quality or when you add a model or scene. Video generation costs 30 credits. Every new account gets 20 free credits — no credit card required. Your dashboard always shows the exact cost before you generate.',
      },
      {
        q: 'What happens if I run out of credits?',
        a: 'You\'ll see a notification when your credits are running low. You can purchase additional credit packs from Settings > Plans & Credits at any time. Monthly plan credits reset each billing cycle and do not roll over, but top-up credit packs never expire.',
      },
      {
        q: 'Is there a free trial?',
        a: 'Every new account gets 20 free credits — no credit card required. That\'s enough to run your first Workflow or try Freestyle and see the quality before committing to a plan.',
      },
      {
        q: 'Can I change my plan?',
        a: 'Yes, you can upgrade or downgrade your plan at any time from Settings > Plans & Credits. Upgrades take effect immediately. Downgrades take effect at the start of your next billing cycle.',
      },
      {
        q: 'Do you offer refunds?',
        a: 'We offer refunds for unused credit packs purchased within the last 14 days. Monthly plan charges are non-refundable, but you can cancel anytime to prevent future charges. There are no long-term contracts or cancellation fees. Contact hello@vovv.ai for refund requests.',
      },
    ],
  },
  {
    name: 'Workflows & Generation',
    questions: [
      {
        q: 'What Workflows are available?',
        a: 'VOVV.AI offers seven core Workflows, each pre-configured with the right prompts, aspect ratios, and model settings: Virtual Try-On (clothing on AI models), Product Listing (clean e-commerce shots), Selfie / UGC (user-generated-style content), Flat Lay (top-down product arrangements), Mirror Selfie (casual mirror-style shots), Interior / Exterior Staging (room and environment staging), and Picture Perspectives (multi-angle product sets).',
      },
      {
        q: 'How does Virtual Try-On work?',
        a: 'Upload a clothing item and choose from our library of 40+ diverse AI models across different ethnicities, body types, and ages. Select a pose, framing, and scene, and the AI generates realistic photos of the model wearing your product. Works best with tops, dresses, and outerwear. Costs 6 credits per image.',
      },
      {
        q: 'What is Picture Perspectives?',
        a: 'Picture Perspectives generates a cohesive set of branded angles — front, back, sides, and close-ups — from a single source image. The AI detects the environment and lighting from your source photo and ensures all angles match. Costs 6 credits per angle. You select which perspectives you want before generating.',
      },
      {
        q: 'Can I generate images in bulk?',
        a: 'Yes! Workflows support batch generation for multiple products at once. Select your products, choose a workflow, set your quality and count preferences, and let VOVV.AI process them all. You can track progress in the Workflows activity section.',
      },
      {
        q: 'What is the Content Calendar?',
        a: 'The Content Calendar automates recurring visual runs. Choose your products, select your Templates, and set a schedule (monthly or biweekly). Fresh visuals arrive on autopilot — no manual work needed. Available on Growth plans and above.',
      },
      {
        q: 'Can I upscale my images?',
        a: 'Yes — the Upscale feature lets you enhance any generated image to higher resolution. You can access it from the Library by selecting an image and choosing Upscale. Great for hero banners, print materials, and large-format displays.',
      },
    ],
  },
  {
    name: 'Image Quality',
    questions: [
      {
        q: 'What resolution and format are generated images?',
        a: 'All generated images are output at 2K resolution in PNG format by default. We support common aspect ratios (1:1, 4:5, 16:9, 9:16) suitable for e-commerce listings, social media, ads, and print. You can also upscale images for even higher resolution.',
      },
      {
        q: 'What\'s the difference between Standard and High Quality?',
        a: 'Standard uses fast generation suitable for social media and web listings. High Quality uses a more advanced model for higher detail and realism — ideal for hero banners, marketing materials, and large-format displays. Both quality levels cost the same number of credits.',
      },
      {
        q: 'My generated images don\'t look right. What can I do?',
        a: 'Try these tips: 1) Use a higher-quality source image with good lighting. 2) Create a Brand Profile to guide the AI\'s style decisions. 3) Use negative prompts to exclude unwanted elements. 4) Try different workflows — some work better for certain product types. 5) Try Freestyle mode for full creative control with a custom prompt.',
      },
    ],
  },
  {
    name: 'Account & Data',
    questions: [
      {
        q: 'How is my product data stored?',
        a: 'All product images and data are stored securely in our cloud infrastructure with encryption at rest and in transit. Your images are private and never used to train our AI models. Contact hello@vovv.ai to request data deletion.',
      },
      {
        q: 'How do I export my generated images?',
        a: 'You can download individual images from the Library or Jobs view. Bulk export is available — select multiple images and download them as a ZIP file. All images are output in PNG format at 2K resolution by default.',
      },
      {
        q: 'Can I use generated images commercially?',
        a: 'Yes! All images generated through VOVV.AI are yours to use commercially — for product listings, advertisements, social media, print materials, and any other business purpose. No attribution required.',
      },
    ],
  },
];
export default function HelpCenter() {
  const [search, setSearch] = useState('');

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return faqCategories;
    const term = search.toLowerCase();
    return faqCategories
      .map((cat) => ({
        ...cat,
        questions: cat.questions.filter(
          (q) =>
            q.q.toLowerCase().includes(term) || q.a.toLowerCase().includes(term)
        ),
      }))
      .filter((cat) => cat.questions.length > 0);
  }, [search]);

  return (
    <PageLayout>
      <SEOHead title="Help Center — VOVV.AI Support & FAQ" description="Find answers to common questions about VOVV.AI. Learn about workflows, credits, brand profiles, and getting started with AI product photography." canonical={`${SITE_URL}/help`} />
      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <HelpCircle className="w-4 h-4" />
            Help Center
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-6">
            How can we help?
          </h1>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for answers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No results found for "{search}". Try a different search term or{' '}
                <a href="/contact" className="text-primary hover:underline">
                  contact support
                </a>
                .
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {filteredCategories.map((category) => (
                <div key={category.name}>
                  <h2 className="text-lg font-semibold text-foreground mb-4">{category.name}</h2>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((item, idx) => (
                      <AccordionItem key={idx} value={`${category.name}-${idx}`}>
                        <AccordionTrigger className="text-left text-sm">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-16 p-8 rounded-2xl bg-muted/50 border border-border">
            <h3 className="font-semibold text-foreground mb-2">Still need help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Our support team typically responds within 2 hours during business hours.
            </p>
            <a href="/contact">
              <button className="inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                Contact Support
              </button>
            </a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
