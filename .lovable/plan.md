# Plan: Premium Style & Outfit System (Step 3) + Scene Outfit Trigger Audit

No code changes yet. This plan answers your two questions and proposes the upgrade.

---

## Part A — Answers to your questions (audit only)

### Q1: "If we add outfit direction in `/app/admin/product-image-scenes`, will it trigger?"
**Yes, partially.** The `outfit_hint` column on a scene IS injected into the prompt when that scene is selected (see `mem://features/product-images/scene-controlled-outfit-system`). It's appended as a styling directive during prompt build.

**But:** today it does NOT compete cleanly with the user's Step 3 lock. Current behavior:
- Template has `{{outfitDirective}}` token → user's Step 3 lock wins.
- Template has no token but has `outfit_hint` → admin hint wins, user lock is silently dropped.
- Template has neither → nothing renders, AI freelances.

So admin `outfit_hint` IS a real trigger, but it overrides the user — the opposite of what you want for a "Style & Outfit" lock.

### Q2: "Will outfit directions show up in Step 3 Style & Outfit?"
**No.** Admin `outfit_hint` is invisible to the Step 3 UI. The user has no idea a scene already has a baked-in outfit, and no way to see/override it from the picker. It's a hidden backend field.

---

## Part B — Proposed Step 3 "Style & Outfit" overhaul

### B1. New outfit schema (extends `OutfitConfig` in `types.ts`)
Structured slots beyond top/bottom/shoes:

```
outerwear  (jacket, blazer, coat, cardigan)  — layers OVER top
top        (locked to product if product is a top)
midLayer   (vest, overshirt) — optional, between top and outerwear
bottom     (locked if product is a bottom)
dress      (full-body — auto-nullifies top + bottom)
shoes
socks      (optional)
belt
bag        (handheld / shoulder / crossbody)
hat
eyewear    (sunglasses / optical)
gloves
scarf
jewelry    (necklace, earrings, bracelet, ring — multi-select)
watch
```

Each slot stores a structured `OutfitPiece`:
```
{ garment, subtype, color, fit?, material?, wash?, detail? }
```
Plus a free-text `notes` field per slot for power users.

### B2. Sub-type vocabularies (premium control)
Per garment, a curated subtype list. Examples:
- **Trousers:** wide-leg, tapered, straight, cargo, pleated, tailored, jogger
- **Jeans:** raw indigo, washed, distressed, black, white, light wash, mid wash, baggy, slim, bootcut
- **Jacket:** denim, leather biker, bomber, blazer, trench, puffer, varsity, suede
- **Dress:** mini, midi, maxi, slip, wrap, shirt-dress, knit, evening
- **Shoes:** sneaker (low/high), loafer, boot (chelsea/combat/cowboy), heel, sandal, mule
- **Bag:** tote, shoulder, crossbody, clutch, baguette, bucket
- **Jewelry:** layered chains, hoop earrings, statement ring, tennis bracelet, etc.

Full vocab will live in a single `outfitVocabulary.ts` config — easy to extend.

### B3. Smart conflict resolution (per-product)
Replaces today's simple `getConflictingSlots()`:

| Product type | Auto-locked slot | Auto-nullified | User can still fill |
|---|---|---|---|
| Crop top, t-shirt, blouse, shirt | `top` = product | — | outerwear, bottom, shoes, accessories |
| Trousers, jeans, skirt, shorts | `bottom` = product | — | top, outerwear, shoes, accessories |
| Dress, jumpsuit, romper | `dress` = product | top, bottom | outerwear, shoes, accessories |
| Jacket, coat, blazer | `outerwear` = product | — | top, bottom, shoes, accessories |
| Swimwear (one-piece) | `dress` = product | top, bottom | shoes, accessories, hat, eyewear |
| Swimwear (bikini top) | `top` = product | — | bottom, accessories |
| Swimwear (bikini bottom) | `bottom` = product | — | top, accessories |
| Lingerie set | `top` + `bottom` = product | dress, outerwear | shoes, accessories |
| Shoes | `shoes` = product | — | everything else |
| Bag | `bag` = product | — | everything else |
| Hat | `hat` = product | — | everything else |
| Jewelry / watch / eyewear | matching slot | — | everything else |

Detection uses `analysis.category` + `analysis.garmentType` (already on `ProductAnalysis`).

### B4. Layering UX (your "jacket over crop top" problem)
Current "Filled by your crop top" badge stays — but next to it, an **"+ Add layer over"** button appears for top/bottom/dress slots. Clicking opens the outerwear/midLayer slot directly with a labeled hint: "Layer over your [Crop Top]".

Visual order in the picker mirrors how clothes stack: outerwear → top → midlayer → bottom → shoes → accessories row.

### B5. Presets (save & reuse)
New table `user_outfit_presets`:
```
id, user_id, name, config (jsonb OutfitConfig), category (optional),
gender (optional), thumbnail_seed, created_at
```
- "Save as preset" button at top of Step 3 → modal asks for name.
- "Load preset" dropdown shows user presets + built-in starters ("Quiet Luxury Neutral", "Streetwear Y2K", "Editorial Black", "Beach Linen", etc.).
- Loading respects locks: a preset that includes `top` while the product IS a top → that slot is ignored, rest applies.

### B6. Admin `outfit_hint` reconciliation
Two clean options — pick one in your reply:
- **Option A (recommended):** Admin `outfit_hint` becomes a *default* pre-filled in Step 3. User can edit/clear. User's edits always win.
- **Option B:** Admin `outfit_hint` becomes a *fallback* — only used when user leaves outfit empty. User locks always override silently.

Either way, the hidden-override behavior goes away.

---

## Part C — Files this would touch (when approved)
- `src/components/app/product-images/types.ts` — extended `OutfitConfig` + new slot types
- `src/components/app/product-images/ProductImagesStep3*.tsx` — new picker UI (layering, accessories grid, preset bar)
- `src/lib/outfitVocabulary.ts` — NEW (subtype lists per garment)
- `src/lib/productImagePromptBuilder.ts` — render new slots into `{{outfitDirective}}`, smarter conflict matrix
- `src/lib/outfitConflictResolver.ts` — NEW (replaces `getConflictingSlots`)
- DB migration: `user_outfit_presets` table + RLS
- (Optional) Admin scenes UI — surface `outfit_hint` as visible default vs. fallback per A/B

## Out of scope
- Patching the ~509 templates missing `{{outfitDirective}}` — separate plan when you say go.
- Changing how generation actually wears layered pieces (prompt fidelity tuning comes after).

## Questions before I code
1. **Admin `outfit_hint` policy** — Option A (visible default) or Option B (silent fallback)?
2. **Presets** — DB-backed (synced across devices) or localStorage only for v1?
3. **Layering depth** — just `outerwear` over top, or also `midLayer` (vest/overshirt)?
4. **Scope of v1** — full schema (all 14 slots) at once, or phase 1 = clothing+shoes+bag+jewelry, phase 2 = rest?
