

# Fix Packaging Detail — Remove Product Image to Prevent Hallucination

## Problem
The "Packaging Detail" scene starts with `[PRODUCT IMAGE]`, which sends the bottle photo to the AI model. The AI then renders the bottle alongside or inside the packaging box shot, creating hallucinated compositions with incorrect product appearance. This scene should focus **exclusively** on the packaging (box, carton, label) — not the product itself.

## Fix
Update the `packaging-detail-fragrance` prompt template to:
- Remove `[PRODUCT IMAGE]` anchor — the bottle should NOT appear in this shot
- Keep `[PACKAGING REFERENCE]` as the sole visual reference
- Make the directive packaging-only: "Do NOT show the product bottle/container in the frame"
- Keep `{{productName}}` for text context only (brand name, label text)

## Database Migration

```sql
UPDATE product_image_scenes
SET prompt_template = '{{productName}} packaging — tight macro close-up of ONLY the product packaging box or carton, cropped closely around a key packaging detail such as the printed logo, embossed branding, foil stamp, paper texture, edge construction, corner finish, label application, or other premium structural element. Do NOT show the product bottle, container, or any vessel in the frame — this is a packaging-only shot focused entirely on the box, carton, or outer packaging material. If a [PACKAGING REFERENCE] image is provided, reproduce its design, typography, colors, and construction EXACTLY — do not hallucinate or invent packaging elements. Show ONLY the packaging. Do NOT generate the product itself, multiple items, or duplicates. BACKGROUND: {{background}} — use ONLY this background. Do NOT place packaging on any surface or table unless explicitly part of the background directive. Lit with soft controlled studio lighting that reveals fine print detail, subtle embossing, material grain, carton finish, and realistic surface depth without harsh glare or artificial shine. Shadows should remain delicate and natural, helping define the packaging texture and structure while keeping the image clean and luxurious. Preserve crisp typography, believable paper or carton material behavior, refined finish transitions, and premium commercial macro realism. Tight crop, packaging dominant, no product bottle visible. {{packagingDirective}}'
WHERE scene_id = 'packaging-detail-fragrance';
```

## Files Modified
Database only — one `UPDATE` to `product_image_scenes`.

