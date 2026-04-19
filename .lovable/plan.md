
## Reorder Step 3 + polish AI Stylist card (with real team avatar)

### Three changes

**1. Background style FIRST in Step 3**
In `ProductImagesStep3Refine.tsx`, move the **Background style** card to render before the Model picker + Style & Outfit block. New order: Background → Model → Style & Outfit → rest.

**2. Fix product thumbnail framing in AI Stylist card**
In `AiStylistCard.tsx`, the row passes both `size="sm"` (forces `w-8 h-8` via SIZE_MAP) AND `className="w-9 h-9"` → conflict, image doesn't fill the visual frame.

Fix: render a self-contained 40×40 tile inside `AiStylistCard.tsx` (skip `ProductThumbnail`'s SIZE_MAP) using:
```tsx
<div className="w-10 h-10 rounded-md bg-muted/40 border border-border/40 p-1 flex-shrink-0">
  <img src={getOptimizedUrl(product.image_url, { quality: 70 })}
       className="w-full h-full object-contain" />
</div>
```
Quality-only optimization per `mem://style/image-optimization-no-crop`.

**3. Replace sparkle icon with real VOVV.AI stylist avatar + name**

Use an existing team member as the stylist persona — **Sienna** (already used as the Brand/Style tip author in `DashboardTipCard.tsx`, fits the styling role perfectly). Avatar lives at landing assets `team/avatar-sienna.jpg` accessed via `getLandingAssetUrl('team/avatar-sienna.jpg')` (same pattern as `DashboardTipCard`).

New header in `AiStylistCard.tsx`:
```
[ Sienna avatar 40x40 round ]   Sienna · VOVV.AI Stylist
                                 Personally curated this look for your product
                                 (or "for each of your N products" when multi)
```

- Avatar: `w-10 h-10 rounded-full object-cover ring-1 ring-primary/20`
- Name: `Sienna` bold + `· VOVV.AI Stylist` muted
- Tagline replaces both current lines

Keep Re-style + Customize buttons unchanged.

### Files to touch
- `src/components/app/product-images/AiStylistCard.tsx` — new header (Sienna avatar via `getLandingAssetUrl` + `getOptimizedUrl`), self-contained 40×40 product tile with `object-contain`, updated copy, drop sparkle/`Sparkles` import
- `src/components/app/product-images/ProductImagesStep3Refine.tsx` — move Background style block above Model + Style & Outfit

### Risk
Very low. UI-only. No new asset needed (Sienna avatar already in landing assets pipeline).

### Validation
1. Step 3 → Background style appears first
2. AI Stylist card shows Sienna's portrait + "Sienna · VOVV.AI Stylist" header, no sparkle icon
3. Crop top thumbnail fills its 40×40 frame edge-to-edge with small padding, no zoom
4. Multi-product copy reads "for each of your N products"
5. Re-style + Customize still work
