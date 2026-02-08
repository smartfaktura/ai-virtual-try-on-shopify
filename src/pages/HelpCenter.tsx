import { PageLayout } from '@/components/landing/PageLayout';
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
        a: 'Upload your product photo in the Products section, then head to Workflows or Generate to choose a style. Select your product, pick a workflow (like Lifestyle or Studio), and hit Generate. Your images will be ready in about 60 seconds.',
      },
      {
        q: 'What image formats are supported for uploads?',
        a: 'We accept JPG, PNG, and WebP files. For best results, use images with clean backgrounds and at least 1024×1024 resolution. You can upload up to 5 images per product.',
      },
      {
        q: 'Do I need to remove the background from my product photos?',
        a: 'No — our AI handles background removal automatically. However, starting with a clean, well-lit product photo on a simple background will give you the best results.',
      },
      {
        q: 'What is a Brand Profile and why should I create one?',
        a: 'A Brand Profile teaches our AI your visual identity — your preferred colors, lighting style, scenes, and tone. Once set up, every image you generate will automatically align with your brand aesthetic. Create one under Brand Profiles in the sidebar.',
      },
    ],
  },
  {
    name: 'Credits & Billing',
    questions: [
      {
        q: 'How do credits work?',
        a: 'Each image generation costs credits. Standard quality uses 1 credit per image, HD uses 2 credits, and Ultra uses 3 credits. Video generation costs 5 credits. You receive credits monthly with your plan, and can purchase additional credit packs anytime.',
      },
      {
        q: 'What happens if I run out of credits?',
        a: 'You\'ll see a notification when your credits are running low. You can purchase additional credit packs from Settings > Plans & Credits at any time. Unused monthly credits roll over for one billing cycle.',
      },
      {
        q: 'Can I change my plan?',
        a: 'Yes, you can upgrade or downgrade your plan at any time from Settings > Plans & Credits. Upgrades take effect immediately. Downgrades take effect at the start of your next billing cycle.',
      },
      {
        q: 'Do you offer refunds?',
        a: 'We offer refunds for unused credit packs purchased within the last 14 days. Monthly plan charges are non-refundable, but you can cancel anytime to prevent future charges. Contact support@vovv.ai for refund requests.',
      },
    ],
  },
  {
    name: 'Workflows & Generation',
    questions: [
      {
        q: 'What\'s the difference between Workflows and Freestyle?',
        a: 'Workflows are pre-configured generation pipelines optimized for specific use cases (Lifestyle, Studio, Social Media, etc.). Freestyle gives you full control with a text prompt — describe exactly what you want and our AI will create it.',
      },
      {
        q: 'How does Virtual Try-On work?',
        a: 'Virtual Try-On places your clothing product on an AI model. Upload your garment image, select a model from our diverse library (40+ models across body types, ethnicities, and ages), choose a pose and scene, and generate. Works best with tops, dresses, and outerwear.',
      },
      {
        q: 'Can I generate images in bulk?',
        a: 'Yes! Use Bulk Generate to create images for multiple products at once. Select your products, choose workflows, set your quality and count preferences, and let VOVV.AI process them all. You can track progress in the Jobs section.',
      },
      {
        q: 'What are Creative Drops?',
        a: 'Creative Drops are automated monthly content deliveries. Set up a schedule with your preferred workflows and products, and VOVV.AI will generate fresh visual content for you every month — like having a studio on retainer.',
      },
    ],
  },
  {
    name: 'Image Quality',
    questions: [
      {
        q: 'What\'s the difference between Standard, HD, and Ultra quality?',
        a: 'Standard (1 credit) generates 1024×1024 images suitable for social media and web listings. HD (2 credits) produces 1536×1536 images ideal for hero banners and marketing materials. Ultra (3 credits) creates 2048×2048 images perfect for print and large-format displays.',
      },
      {
        q: 'My generated images don\'t look right. What can I do?',
        a: 'Try these tips: 1) Use a higher-quality source image with good lighting. 2) Create a Brand Profile to guide the AI\'s style decisions. 3) Use negative prompts to exclude unwanted elements. 4) Try different workflows — some work better for certain product types.',
      },
      {
        q: 'Can I edit or refine generated images?',
        a: 'Currently, you can regenerate with different settings or prompts. We\'re working on in-app editing tools including inpainting and outpainting. For now, you can download your images and edit them in your preferred tool.',
      },
    ],
  },
  {
    name: 'Account & Data',
    questions: [
      {
        q: 'How is my product data stored?',
        a: 'All product images and data are stored securely in our cloud infrastructure with encryption at rest and in transit. Your images are private and never used to train our AI models. You can delete your data at any time from Settings.',
      },
      {
        q: 'Can I invite team members?',
        a: 'Team collaboration features are available on Growth and Pro plans. You can manage team access and permissions from Settings > Team & Permissions.',
      },
      {
        q: 'How do I export my generated images?',
        a: 'You can download individual images from the Library or Jobs view. Bulk export is available — select multiple images and download them as a ZIP file. You can also set default export preferences (format, naming convention) in Settings.',
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
