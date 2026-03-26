# Fix Product Fidelity on Seedream + Investigate Nano Banana Slowness

## Problem 1: Seedream generates wrong clothing

**Root cause**: Seedream is a diffusion model — it uses reference images for "inspiration" but doesn't replicate products pixel-perfectly. The current IMAGE ROLES directive says "match exact shape, color, material" but Seedream fundamentally cannot do this. It will always approximate.

**Reality check**: No amount of prompt engineering will make Seedream replicate a product 100%. This is a model limitation, not a code bug. Seedream treats images as style/composition references, not as exact templates.

**What we CAN do to maximize product fidelity:**

1. **Strengthen the product directive** in `buildSeedreamRoleDirective()` — add explicit instructions about brand logos, zipper placement, collar shape, pocket details etc.
2. **Add product description to the Seedream prompt** — currently `productDimensions` is passed but only used in Gemini's polish. We should inject the product title and type (e.g. "Beige Collared Bomber Blouse") directly into the Seedream prompt so the text generation reinforces the visual reference.
3. **Increase product image weight** — reorder images to put product FIRST (before model) since Seedream weights earlier images more. Currently model comes first.

### Changes in `supabase/functions/generate-freestyle/index.ts`:

**A. Reorder images: product → model → scene → other** (line ~526)
Currently model is first. For product fidelity, product should be first since Seedream weights earlier images more heavily.

**B. Strengthen product role directive** (line ~485)

```
- Image {idx} is the PRODUCT: CRITICAL — replicate this item EXACTLY as shown.
  Match precise shape, silhouette, color, material texture, collar/neckline style,
  zipper/button placement, pockets, logos, tags, and all visible details.
  This is a specific real product that must be recognizable.
```

**C. Inject product metadata into Seedream prompt** — in `convertContentToSeedreamInput`, scan the prompt for product context and ensure product name/type from the polished prompt carries through after `cleanPromptForSeedream` strips directives.

---