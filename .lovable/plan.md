

## Fix Outfit Direction generator + rewrite Apparel → Creative Shots hints to be product-aware

The problem: current hints (and the AI Analyze function) describe *the outfit visible in the reference image* (e.g. "linen tweed pants suit", "pastel blue tracksuit"). When a user uploads a **crop top**, the engine treats those as authoritative and stacks a blazer/sweater on top, fights the silhouette, and ignores product type.

Two fixes, both about making outfit direction **product-led, not reference-led**.

### 1. Rewrite `OUTFIT_DIRECTION_PROMPT` in `supabase/functions/describe-image/index.ts`

Replace the current prompt so it generates **generic, product-aware fashion styling rules** from a reference image — describing the *vibe, palette, silhouette logic, formality, footwear logic, and what to avoid* — without prescribing specific garments that would conflict with the user's product.

New prompt (functional intent):
- Treat `[PRODUCT IMAGE]` as the unknown hero piece — never name a specific garment as the hero.
- Extract from the reference: **mood/aesthetic** (editorial / street / resort / quiet luxury / sport / etc.), **color palette & contrast logic** (tonal, monochrome, complementary), **formality level**, **silhouette tendency** (oversized / tailored / fluid / cropped-friendly), **fabric family** (knit / tailoring / denim / technical / linen).
- Output conditional rules: *"If the product is a top, pair with… / If a bottom, pair with… / If a dress or one-piece, complement with outerwear or accessories only — no conflicting layers. If a crop top, keep layers open or omit them so the cropped silhouette stays visible."*
- Footwear logic by visible-leg / scene context.
- Hard "avoid" list: do not stack tops over crop tops, no denim if scene is elevated, no streetwear if editorial, no loud branding, no garments that hide the hero piece.
- Single paragraph, no preamble.

### 2. Rewrite `outfit_hint` for all 17 Apparel → Creative Shots scenes

Run a script that, for each of the 17 scenes (Brutalist Concrete, Canon G7X @Night, Fisheye Portrait, Geometric Blue Wall, Gradient Blue Studio, Greenhouse Elegance, Mid-Century Modern Lounge, Natural Field Serenity, Natural Light Loft, Pastel Blue Studio, Salt Flat Serenity, Skatepark Golden Hour, Stadium Seating Fashion, Terracotta Sunset, Translucent White Studio, Urban Crossroads, Urban NYC Street), calls Lovable AI (Gemini 2.5 Flash) with the `preview_image_url` and the **new** prompt above, then `UPDATE product_image_scenes SET outfit_hint = <result>` for that row.

This regenerates every hint using the corrected, product-aware logic — so a crop top stays a visible crop top, a dress doesn't get a sweater layered over it, and trousers don't get a second pair of pants.

The shared rules baked into every regenerated hint:
- Hero piece = user's product, never re-described
- Conditional pairing by product type (top / bottom / dress / outerwear / one-piece / crop)
- Crop-top rule: never layer over the cropped silhouette unless the layer is open or cropped itself
- Tonal / palette logic derived from the scene
- Footwear chosen only when full/lower body is visible and scene supports it
- Explicit avoids: denim in elevated scenes, streetwear in editorial, second top over a top, second bottom over a bottom, blazers that hide crop tops, accessories that obscure the hero

### Files touched
- `supabase/functions/describe-image/index.ts` — replace `OUTFIT_DIRECTION_PROMPT` constant.
- One-off regeneration script (run via exec, calls Lovable AI per scene + writes `outfit_hint` via SQL `UPDATE`). No new tables, no UI changes.

### Validation
- `/app/admin/product-image-scenes` → Garments (Clothing & Apparel) → Creative Shots → open any of the 17 scenes → **Outfit Hint** reads as product-agnostic styling rules with conditional logic, never naming a specific top/bottom as the hero.
- In the Import modal, click **Analyze** on any reference image → returned hint follows the same product-aware structure.
- Generate a crop-top product against `Urban NYC Street` and `Greenhouse Elegance` → no blazer/sweater stacked over the crop top; complementary bottoms + scene-appropriate footwear instead.
- Generate trousers against the same scenes → top is added, no second pair of pants.

### Out of scope
- Other Garments sub-categories (Editorial Studio Looks, Campaign Statement Images) — untouched.
- Other categories (Activewear, Dresses, etc.) — untouched.
- No prompt-builder, UI, or schema changes.

