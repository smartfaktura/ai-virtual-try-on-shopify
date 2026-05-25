Add a "Brand Scenes" promo near the scene picker on `/app/generate/product-images` (Shots step). Mirrors the Brand Models pattern: a soft promo card that opens an info dialog with a plan-aware CTA — never navigates away unexpectedly.

**New component**

`src/components/app/product-images/BrandScenesInfoModal.tsx` — `Dialog` (shadcn), structured like `BrandModelsInfoModal`:
- Icon (`Wand2` or `Sparkles`) + title: "Design scenes that only belong to your brand"
- Description: custom AI-generated scenes built from your references and reused across every shoot
- 3 bullets:
  - Lock in a signature visual world for your brand
  - Build from a reference photo or a written brief
  - Reuse saved scenes across all future generations
- Plan-aware footer (read `plan` via `useCredits`, check against `canCreateBrandScenes` from `@/features/brand-scenes/access`):
  - Growth / Pro / Enterprise → primary "Create Brand Scene" → `navigate('/app/brand-scenes')` + close
  - Free / Starter → primary "Upgrade plan" → `openBuyModal('brand-scenes-gate')` + close
- Secondary "Maybe later"
- Small footnote when gated: "Brand Scenes are available on Growth and above"

**Promo card**

`src/components/app/product-images/BrandScenesPromoCard.tsx` — slim horizontal card matching the visual language of the "Create Your Brand Model" dashed card:
- Dashed primary-tinted border, rounded-xl, `p-3`
- Left: small `Wand2` icon in a primary-tinted circle
- Middle: "Want scenes unique to your brand?" / "Generate your own Brand Scenes from a reference or brief"
- Right: subtle `Learn more →` affordance
- Clicking anywhere on the card opens `BrandScenesInfoModal`

**Wire-up**

`src/components/app/product-images/ProductImagesStep2Scenes.tsx`:
- Import the promo card and render it once at the very top of the scenes list container (just before the first category section, inside the same wrapper that ends with `<SceneRequestBanner />`).
- Always visible — for Growth+ users it acts as a quick entry point, for Free/Starter it teases the feature. (Don't gate by "has any brand scene" — the scenes table isn't queried in this step and adding a lookup just for visibility isn't worth the round-trip.)

**Out of scope**

- No changes to scene data loading, brand-scenes wizard, or pricing logic.
- No new query against `product_image_scenes`.
- Catalog flow untouched.