import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export type FAQGroup = {
  eyebrow: string;
  title: string;
  items: { q: string; a: string }[];
};

export const FAQ_GROUPS: FAQGroup[] = [
  {
    title: 'Getting started',
    items: [
      {
        q: 'What can I create with VOVV.AI?',
        a: 'Product photography, virtual try-ons, lifestyle imagery, flat lays, interior staging, videos, and more — all from a single product photo.',
      },
      {
        q: 'Do I need photography experience?',
        a: 'Not at all. Choose a scene, upload your product, and the AI handles lighting, composition, and styling automatically.',
      },
      {
        q: 'Is there a free trial?',
        a: 'Every new account gets 20 free credits — no credit card required. Enough to try multiple Visual Types and see the quality.',
      },
      {
        q: 'What file formats can I upload?',
        a: 'PNG, JPG, and WEBP. Higher-resolution source photos give cleaner results, but VOVV works well even with phone shots as long as the product is clearly visible.',
      },
    ],
  },
  {
    title: 'Plans & credits',
    items: [
      {
        q: 'How many credits does each generation cost?',
        a: 'A standard image is ~4–6 credits depending on complexity. Video runs 30–60 credits per clip. 4K upscaling is ~5 credits. Brand Model training is a one-time ~50 credits. You always see the cost before you generate.',
      },
      {
        q: 'Do unused credits roll over?',
        a: "Monthly subscription credits don't roll over — they reset each billing cycle. Top-up credits you purchase separately never expire.",
      },
      {
        q: 'Can I cancel my subscription anytime?',
        a: 'Yes. Cancel, upgrade, or downgrade at any time — no contracts or fees. You keep access through the end of the current billing period.',
      },
      {
        q: 'Do you offer refunds?',
        a: 'Subscription fees are non-refundable, but you can cancel anytime to stop future billing. For unused top-up credits or special cases, contact support and we\'ll review.',
      },
      {
        q: 'Can I use VOVV with a team?',
        a: 'Growth and Pro plans support shared brand assets and libraries. For dedicated team seats, role-based access, and SSO, the Enterprise plan is the best fit.',
      },
    ],
  },
  {
    title: 'Generation & quality',
    items: [
      {
        q: 'What image formats and sizes are supported?',
        a: 'All common aspect ratios (1:1, 4:5, 3:4, 16:9, 9:16) at 2K resolution by default, with 4K upscaling on paid plans. Files export as PNG or JPG, ready for e-commerce, social, ads, and print.',
      },
      {
        q: 'How long does a generation take?',
        a: 'Most images render in 20–60 seconds. Video and Short Films can take a few minutes depending on complexity and queue. Higher tiers get priority queue speed.',
      },
      {
        q: 'Can I bulk-generate across many products and scenes?',
        a: 'Yes. Bulk generation is included from Starter and above. Pick multiple products, multiple scenes, and run them as one batch — outputs are grouped together in your library.',
      },
      {
        q: 'Why does the same product sometimes look different across shots?',
        a: 'Color, packaging, and material details are extracted from your photo and locked across generations. If you need stricter consistency for hero shots, use multi-angle references and Brand Models.',
      },
    ],
  },
  {
    title: 'Brand & assets',
    items: [
      {
        q: 'How does Brand Profile work?',
        a: 'Set your preferred tone, lighting, background, and composition rules. Every future generation uses this profile automatically so visuals stay on-brand.',
      },
      {
        q: 'What are Brand Models?',
        a: 'Custom AI models trained on your brand aesthetic so the same face, styling, and mood carries across every shoot. Available on Growth and Pro plans.',
      },
      {
        q: 'Can I export everything as a ZIP?',
        a: 'Yes. Bulk export to ZIP is included from Starter and above — useful for handing off batches to your design or merchandising team.',
      },
      {
        q: 'What is the Content Calendar / Creative Drops?',
        a: 'Automated recurring visual runs. Pick products and Visual Types, set a schedule, and fresh visuals arrive on autopilot. Available on Growth and above.',
      },
    ],
  },
  {
    title: 'Ownership & privacy',
    items: [
      {
        q: 'Can I use the visuals commercially?',
        a: 'Yes. Everything you generate on a paid plan is yours to use across product pages, paid ads, social, email, and print campaigns.',
      },
      {
        q: 'Who owns the images I generate?',
        a: 'You do. VOVV grants you full commercial rights to outputs created on a paid plan. We do not resell or repurpose your generated assets.',
      },
      {
        q: 'Is my product data and photography private?',
        a: 'Yes. Uploaded products and generated assets are private to your account by default and protected with row-level security. We never share your assets with other users.',
      },
      {
        q: 'How do I delete my account or assets?',
        a: 'You can delete individual assets from your library at any time. To delete your full account and all associated data, contact support and we\'ll process the request.',
      },
    ],
  },
];

export function FAQAccordion() {
  return (
    <section className="py-16 lg:py-24 bg-[#FAFAF8]">
      <div className="max-w-3xl mx-auto px-6 space-y-14 lg:space-y-20">
        {FAQ_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-5">
              {group.title}
            </p>
            <Accordion type="single" collapsible className="flex flex-col gap-3">
              {group.items.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`${group.title}-${i}`}
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
        ))}
      </div>
    </section>
  );
}
