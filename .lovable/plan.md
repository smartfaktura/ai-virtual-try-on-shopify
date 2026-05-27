Add a small "NEW" pill badge to the Brand Scenes promo banner (and the matching Brand Models promo banner for consistency).

**Change**
In `src/components/app/product-images/BrandScenesPromoCard.tsx`, add a small uppercase pill above (or inline with) the headline:

```tsx
<span className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[10px] font-semibold tracking-[0.15em] uppercase px-2 py-0.5 mb-1.5">
  New
</span>
```

Placed just before the "Want personalized scenes for your brand?" headline.

**Optional**
Apply the same badge to the Brand Models promo banner in `ProductImagesStep3Refine.tsx` so both promos read as new features.

No other layout, color, or copy changes.