Update the Brand Scenes promo banner on `/app/generate/product-images`.

File: `src/components/app/product-images/BrandScenesPromoCard.tsx`

Changes:
- Heading: "Your brand's own scene library" → "Want personalized scenes for your brand?"
- Subtitle: "Built from your references. Reused across every shoot." → "Create custom Brand Scenes once, then reuse them across every shoot" (no terminal period per project style)
- CTA button: "See how it works" → "Create Brand Scenes"
- CTA behavior: instead of opening the `BrandScenesInfoModal`, navigate to `/app/brand-scenes/new` (the Brand Scene wizard). Drop the modal import and `useState`.