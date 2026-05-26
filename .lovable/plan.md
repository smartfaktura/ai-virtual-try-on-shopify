## Goal

Align `/app/product-swap` page chrome with `/app/generate/product-images` so both share the same aesthetic.

## Diff today

| Element | Product Images (target) | Product Swap (now) |
| --- | --- | --- |
| Container | `space-y-6 pb-36 overflow-x-clip max-w-full min-w-0` (full width) | `max-w-4xl mx-auto px-4 py-6 sm:py-8 pb-36 space-y-6` (narrow, padded) |
| Header | `<PageHeader title subtitle>` — bold H1 `text-2xl sm:text-3xl tracking-tight`, plain `text-base text-muted-foreground` subtitle, no icon, no accent bar | Custom block with `Sparkles` icon tile + H1 + accent-bar styled subtitle |
| Back link | Provided via `PageHeader backAction` prop, sits inline with H1 | Standalone `Visual Studio` ghost button above the row |
| Stepper | Direct child below `PageHeader` | Nested inside the header block |

## Changes (only `src/pages/ProductSwap.tsx`)

1. Import `PageHeader` from `@/components/app/PageHeader`.
2. Replace the outer container's classes from `max-w-4xl mx-auto px-4 py-6 sm:py-8 pb-36 space-y-6` to `space-y-6 pb-36 overflow-x-clip max-w-full min-w-0` (matches ProductImages).
3. Replace the entire custom header block (back button + icon tile + H1 + accent-bar subtitle wrapper) with:
   ```tsx
   <PageHeader
     title="Product Swap"
     subtitle="Same scene, different product"
     backAction={{ content: 'Visual Studio', onAction: () => navigate('/app/workflows') }}
   >
     <span />
   </PageHeader>
   ```
4. Move the `<CatalogStepper>` out of the header wrapper so it sits as a sibling below `PageHeader`, exactly like ProductImages does.
5. Remove the now-unused `Sparkles` icon usage in the header (keep the import — it's still used elsewhere for generate CTA / step icons).

No behavioural changes — only layout/visual tokens. Stepper, scene picker, product selector, review and generation flow remain identical. The earlier empty-products guidance (Step 1 hint + Step 2 empty state) stays in place.