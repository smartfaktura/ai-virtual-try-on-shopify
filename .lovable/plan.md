# Footer Restructure Plan

Reorganize `src/components/landing/LandingFooter.tsx` to add visual grouping inside Solutions and Resources columns, reorder Product links, and move legal links to the bottom row. **No links added, removed, or URL-changed.**

## Data structure change

Replace the flat `footerLinks` object with a grouped structure that supports optional subheadings:

```ts
const productLinks = [
  { label: 'AI Product Photography', to: '/ai-product-photography' },
  { label: 'AI Product Photo Generator', to: '/ai-product-photo-generator' },
  { label: 'Visual Studio', to: '/features/workflows' },
  { label: 'Freestyle Studio', to: '/features/freestyle' },
  { label: 'Virtual Try-On', to: '/features/virtual-try-on' },
  { label: 'Product Perspectives', to: '/features/perspectives' },
  { label: 'Image Upscaling', to: '/features/upscale' },
  { label: 'Pricing', to: '/pricing' },
];

const solutionsGroups = [
  { subheading: 'Platforms', links: [Shopify, Etsy] },
  { subheading: 'Categories', links: [Fashion, Footwear, Beauty, Fragrance, Jewelry, Food, Home, Electronics] },
  { subheading: 'Compare', links: [AI vs Photoshoot, VOVV.AI vs Studio] },
];

const resourcesGroups = [
  { subheading: 'Learn', links: [Why VOVV.AI, How It Works, FAQ, Roadmap, Help Center, Blog] },
  { subheading: 'Company', links: [About, Careers, Press, Contact] },
];

const legalLinks = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Cookie Policy', to: '/cookies' },
];
```

Note: "Why VOVV.AI" and "Roadmap" stay under Learn (they were in Resources already; only legal moves out).

## Visual treatment

- Main column heading: keep current `text-xs font-semibold uppercase tracking-[0.14em] text-foreground/90`
- New subheading inside columns: `text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/70` with `mb-2 mt-5` (no top margin on first group)
- Link list spacing: reduce from `space-y-2` to `space-y-1.5`
- Column gap: keep `gap-10`

## Bottom row

Three-part flex layout:
- Left: `© {year} VOVV.AI. All rights reserved.`
- Middle: legal links separated by `·` (rendered as real `<Link>` anchors), muted small text
- Right: `A product by 123Presets`

Stack vertically on mobile, with legal links wrapping cleanly.

## Mobile

Update the `<details>` collapsibles to render grouped subheadings inside Solutions and Resources accordions. Each subheading renders as a small muted label above its sub-list. Product accordion stays flat. Legal links stay in bottom row (no accordion).

## Implementation

Single file edit: `src/components/landing/LandingFooter.tsx`. Bump `public/version.json` patch.

## Audit confirmation (post-edit)

All current footer hrefs preserved 1:1: `/ai-product-photography`, `/ai-product-photo-generator`, `/features/workflows`, `/features/freestyle`, `/features/virtual-try-on`, `/features/upscale`, `/features/perspectives`, `/pricing`, `/shopify-product-photography-ai`, `/etsy-product-photography-ai`, 8 category routes, `/ai-product-photography-vs-photoshoot`, `/ai-product-photography-vs-studio`, `/why-vovv`, `/how-it-works`, `/faq`, `/roadmap`, `/help`, `/blog`, `/about`, `/careers`, `/press`, `/contact`, `/privacy`, `/terms`, `/cookies`. All remain real `<Link to=>` (crawlable `<a href>` after render).
