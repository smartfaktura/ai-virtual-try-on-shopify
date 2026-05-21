# Brand Scenes — Outfit Direction questionnaire

Triggered only when `people_mode != "product_only"` (Section A Q5 = "Product worn / used by a person", "Full model with face", or "Hands / partial body").

Outputs a structured `outfit_direction` object that the prompt builder injects into the OUTFIT block of the rendered scene prompt. Replayed verbatim on reuse so wardrobe stays consistent across regenerations.

Rendered as a single collapsible "Outfit Direction" sub-step between Section B and the camera/aspect questions. Defaults are pre-filled from Section A Q1 (vibe) + Q3 (mood) so the user can accept everything in one click.

---

## G.1 — Universal outfit questions (12)

### O1. Wardrobe vibe *(single)*
Defaults to scene vibe from A1.
- Quiet luxury
- Minimal modern
- Editorial fashion
- Streetwear
- Athleisure / sportswear
- Workwear / tailored
- Bohemian
- Romantic / feminine
- Classic preppy
- Avant-garde
- Cozy loungewear
- Resort / vacation

### O2. Silhouette *(single)*
- Tailored & structured
- Relaxed & flowy
- Oversized
- Body-conscious / fitted
- Layered
- Mixed (top fitted / bottom relaxed or vice versa)

### O3. Top *(single — skipped if O4 = "Dress" or "Jumpsuit")*
- T-shirt
- Tank / camisole
- Button-down shirt
- Blouse
- Knit sweater
- Hoodie / sweatshirt
- Crop top
- Blazer-only (no inner top)
- Turtleneck
- Bralette / bra top
- Matches product *(footwear & bag categories use this as default)*

### O4. Bottom *(single — skipped if "Dress" or "Jumpsuit" picked)*
- Jeans (straight / wide / skinny — sub-select)
- Trousers / tailored pants
- Chinos
- Shorts
- Mini skirt
- Midi skirt
- Maxi skirt
- Leggings / activewear
- Dress *(collapses O3)*
- Jumpsuit *(collapses O3)*

### O5. Footwear *(single)*
- Sneakers
- Heels
- Loafers / flats
- Boots (ankle / knee — sub-select)
- Sandals
- Mules
- Athletic / running
- Barefoot
- Matches product *(locked for Footwear category)*

### O6. Outerwear *(single, optional)*
- None
- Blazer
- Trench coat
- Wool coat
- Leather jacket
- Bomber / varsity
- Cardigan
- Puffer
- Denim jacket

### O7. Color palette *(multi-select, max 4)*
Defaults pulled from scene mood (A3).
- Black
- White / cream
- Beige / camel
- Grey
- Navy
- Brown / chocolate
- Olive / sage
- Burgundy / wine
- Terracotta / rust
- Pastel (blush, sky, mint)
- Bold accent (red, cobalt, emerald)
- Metallic (gold, silver)

### O8. Fabric & texture *(multi-select, max 3)*
- Cotton
- Linen
- Silk / satin
- Wool / cashmere
- Denim
- Leather
- Knit / ribbed
- Technical / nylon
- Sheer / lace
- Velvet

### O9. Accessories *(multi-select, optional)*
- None
- Sunglasses
- Hat (cap / wide-brim — sub-select)
- Belt
- Watch
- Jewelry (delicate / statement — sub-select)
- Scarf
- Bag *(hidden for Bag category — that's the product)*

### O10. Hair *(single)*
- Natural down
- Pulled back / ponytail
- Bun / updo
- Wet / slicked
- Curly / textured
- Short / cropped
- Covered (hat / scarf)

### O11. Makeup *(single)*
- Bare / no-makeup
- Soft natural
- Polished daytime
- Editorial bold
- Smoky / evening
- Matches product *(default for Beauty category)*

### O12. Outfit notes *(text, 200 chars, optional)*
Free-form override for nuance the picker can't capture (e.g. "untucked shirt, sleeves rolled to elbow, no socks visible").

---

## G.2 — Category overrides

Locked = field rendered read-only with the forced value visible.
Collapsed = section folded behind a "Customize outfit" disclosure; the default value still ships to the prompt.
Hidden = removed from the form and from the saved object.

| Subcategory | O3 Top | O4 Bottom | O5 Footwear | O9 Accessories | O11 Makeup | Extra behaviour |
|---|---|---|---|---|---|---|
| Footwear → all | normal | normal | **locked: Matches product** | normal | normal | Adds: hem above ankle, footwear fully visible |
| Fashion → Swimwear | merged into "Swim style" picker | merged | default Barefoot / Sandals | hidden (hat ok) | Bare/Soft | Hides outerwear unless beach cover-up chosen |
| Fashion → Lingerie / Loungewear | merged into "Lingerie style" picker | merged | default Barefoot | minimal | Soft natural | Outerwear → robe / kimono options |
| Fashion → Outerwear | required (visible under coat) | normal | normal | scarf default | normal | O6 locked to "Matches product" |
| Fashion → Activewear | filtered to athletic tops | filtered to leggings/shorts | locked: Athletic | watch default | Bare/Soft | Adds sweat/glow note in prompt |
| Bags & Accessories → all | normal | normal | normal | **bag hidden** (it's the product) | normal | Bag carry-style asked in Section B instead |
| Jewelry → all | defaults: neckline-friendly (turtleneck off) | normal | normal | jewelry hidden (it's the product) | normal | Hair defaults to Pulled back / Bun |
| Eyewear → all | normal | normal | normal | sunglasses hidden (it's the product) | normal | Hair defaults Pulled back; framing favours face crop |
| Beauty → Makeup | normal | normal | normal | minimal | **locked: Matches product** | Camera framing favours face/portrait |
| Beauty → Skincare | collapsed to "Soft neutral basics", expandable | collapsed | Barefoot default | none | Bare / no-makeup | Adds dewy-skin directive |
| Beauty → Haircare | normal | normal | normal | none | Soft natural | Hair question becomes primary (styled, washed, etc.) |
| Fragrance → all | "Soft neutral basics" default, expandable | collapsed | normal | minimal | Soft natural | Outfit framed as supporting, not hero |
| Home / Food / Pets / Tech (with person) | "Soft neutral basics" default | collapsed | normal | none | Bare/Soft | Whole section collapsed; user opens only if they want control |
| Kids & Baby | child-appropriate filter (no heels, no editorial bold) | filtered | filtered | minimal | locked: Bare | Replaces O11 with "Natural / playful" |

---

## G.3 — Saved structure

```jsonc
"outfit_direction": {
  "vibe": "Quiet luxury",
  "silhouette": "Relaxed & flowy",
  "top": "Knit sweater",
  "bottom": "Trousers / tailored pants",
  "footwear": "Loafers / flats",
  "outerwear": "Wool coat",
  "palette": ["Beige / camel", "Cream", "Brown / chocolate"],
  "fabrics": ["Wool / cashmere", "Cotton"],
  "accessories": ["Watch", "Delicate jewelry"],
  "hair": "Natural down",
  "makeup": "Soft natural",
  "notes": "Sleeves pushed up, coat draped over shoulders",
  "locked_fields": ["footwear"],
  "collapsed_sections": []
}
```

---

## G.4 — Prompt builder consumption

`buildPrompt(answers, outfit_direction, taxonomyEntry)` injects a dedicated OUTFIT block after the SUBJECT block:

```text
OUTFIT — wardrobe must read as {vibe}, {silhouette} silhouette.
Top: {top}. Bottom: {bottom}. Footwear: {footwear}. Outerwear: {outerwear or "none"}.
Palette: {palette joined}. Fabric: {fabrics joined}.
Accessories: {accessories joined or "none"}. Hair: {hair}. Makeup: {makeup}.
{notes if present}
SAUGIKLIS: do not add logos, do not add text on garments, do not change product colour, no fantasy garments.
```

Auto-applied saugikliai:
- Footwear category → "shoes fully visible, hem above ankle, no foot crop"
- Jewelry category → "neck, ears, and décolletage unobstructed"
- Eyewear category → "no other eyewear on face, hair away from temples"
- Beauty / Fragrance → "wardrobe is supporting; do not compete with product colour"
- Kids → "age-appropriate styling, no adult fashion cues"

---

## G.5 — Reuse rules

- Saved `outfit_direction` is replayed exactly when the scene is reused in Visual Studio — no re-asking.
- A small "Outfit" chip appears beside the scene summary card in Step 4 and on the tile in My Scenes, showing vibe + palette swatches.
- Editing a saved scene re-opens the questionnaire pre-filled — users iterate, not start over.
- If `people_mode` is later flipped to "product only", `outfit_direction` is preserved on the record but ignored by the prompt builder; flipping people back on restores it instantly.
