
## Plan: ZARA-grade Style & Outfit (final)

### 1. Edge case: "What if user uploads a jacket?"

**Answer:** `outerwear` slot locks to the jacket. Below it, `top` slot opens with a friendly prompt: **"What's underneath your jacket?"** with quick-pick chips (Crop top, T-shirt, Shirt, Knit, Tank, Bodysuit, "Nothing — bare"). Same for `bottom`.

**If user picks nothing:** the AI gets a smart default written into the prompt — `"a simple white fitted t-shirt"` for tops, `"straight-leg neutral trousers"` for bottoms. We never send a half-empty outfit to the model (causes random/ugly results). Defaults are picked per product color: dark jacket → light tee, light jacket → black tee.

**Empty-slot defaults table** (used when user skips):
| Missing slot | Default |
|---|---|
| top | white fitted t-shirt |
| bottom | straight-leg neutral trousers (matches jacket tone) |
| shoes | clean white low-top sneakers |
| dress (if dress product) | n/a |

User sees these defaults as ghost-text placeholders ("Auto: white tee") so they know what'll happen — and can override with one click.

---

### 2. Conflict matrix — explained for non-coders

**What it is:** A simple rulebook the app follows so the picker never lets you make impossible outfits. Example: you can't wear two t-shirts at once, and you don't need pants under a dress.

**How it works in plain English:**

| You uploaded | App auto-fills | App hides | You can still pick |
|---|---|---|---|
| **A t-shirt / crop top** | "Top = your shirt" | nothing hidden | jacket on top, pants, shoes, accessories |
| **Trousers / jeans / skirt** | "Bottom = your pants" | nothing hidden | top, jacket, shoes, accessories |
| **A dress** | "Dress = your dress" | top + bottom (you don't need them) | jacket, shoes, accessories |
| **A jacket / blazer / coat** | "Jacket = your jacket" | nothing hidden | what's underneath (top), pants, shoes, accessories |
| **Swimsuit (one-piece)** | "Outfit = your swimsuit" | top + bottom | shoes, hat, sunglasses, jewelry, bag |
| **Bikini top** | "Top = your bikini top" | nothing hidden | bikini bottom, accessories |
| **Lingerie set** | "Top + Bottom = your set" | dress, jacket | shoes, accessories |
| **Shoes / boots / heels** | "Shoes = your product" | nothing hidden | full outfit above |
| **Bag / hat / jewelry / sunglasses / watch / belt** | matching slot only | nothing hidden | full outfit |
| **Non-fashion (perfume, candle, tech)** | nothing | the whole outfit panel disappears | (model can wear free-text) |

**"Silent" means:** hidden slots don't appear at all in the UI — no greyed-out boxes, no error messages. You only see what makes sense for your product. Cleaner, less confusing.

---

### 3. Full accessory plan — every slot, every option

Each accessory has a **Type** picker → reveals **Sub-style** + **Color** + (sometimes) **Material**.

#### Hat
- **Type:** Cap, Bucket hat, Beanie, Wide-brim, Fedora, Beret, Visor, Cowboy, Straw
- **Sub-style:** (Cap → trucker / dad / 5-panel / snapback) · (Beanie → cuffed / slouchy / fisherman) · (Wide-brim → felt / straw / rancher)
- **Color:** swatches + custom
- **Material:** Cotton, Wool, Felt, Straw, Nylon, Leather

#### Bag
- **Type:** Tote, Shoulder, Crossbody, Clutch, Baguette, Bucket, Top-handle, Backpack, Belt-bag
- **Sub-style:** (Tote → structured / slouchy / mini) · (Crossbody → camera / saddle / messenger)
- **Color** + **Material:** Leather, Suede, Canvas, Nylon, Patent, Knit

#### Jewelry (multi-select)
- **Necklace:** Layered chains, Pendant, Choker, Pearl strand, Statement
- **Earrings:** Hoops (small/medium/large), Studs, Drops, Ear cuffs, Statement
- **Bracelet:** Tennis, Bangle, Cuff, Beaded, Charm
- **Ring:** Single statement, Stack, Signet, Band
- **Metal:** Gold, Silver, Rose-gold, Mixed metals

#### Eyewear
- **Type:** Sunglasses, Optical
- **Frame shape:** Aviator, Wayfarer, Cat-eye, Round, Oval, Square, Rimless, Shield, Oversized
- **Lens tint:** Black, Brown, Mirror, Gradient, Clear, Yellow, Blue
- **Frame color:** Tortoise, Black, Gold, Silver, Clear, White

#### Belt
- **Type:** Classic dress, Wide statement, Skinny, Chain, Western, Braided
- **Buckle:** Minimal, Logo plate, Western, Double-ring
- **Color** + **Material:** Leather, Suede, Fabric, Metal

#### Watch
- **Style:** Minimal dress, Sport/diver, Chronograph, Digital, Vintage, Smart
- **Strap:** Leather, Metal mesh, Steel link, Nylon NATO, Rubber
- **Face color** + **Case metal:** Gold, Silver, Black, Rose-gold

#### Scarf (optional v2)
- **Type:** Silk square, Long wool, Bandana, Pashmina
- **Pattern:** Solid, Stripes, Floral, Logo print, Animal

---

### 4. UI layout (Step 3) — locked design

```text
┌─ Style & Outfit ─────────────────────────────────────┐
│ Direction:  [Studio] [Editorial] [Minimal] [Street]  │
│                                                       │
│ ─ Outfit Presets ─────────────────────────────────── │
│ [Quiet Luxury] [Streetwear] [Editorial Black]        │
│ [Beach Linen]  [+ Save current]   My presets ▾       │
│                                                       │
│ ─ Outfit ─────────────────────────────────────────── │
│ ┌─ 🔒 OUTERWEAR ─── [thumb] Your Black Blazer ────┐ │
│ └────────────────────────────────────────────────┘ │
│ ┌─ TOP · "What's underneath?" ───── auto: white tee ┐│
│ │ Quick: [Crop top][T-shirt][Shirt][Knit][Tank]    ││
│ │ Sub: ◯◯◯◯  Color: ⚪⚫🟤  Material: ▾            ││
│ └─────────────────────────────────────────────────┘│
│ ┌─ BOTTOM ─────────── auto: straight trousers ────┐│
│ │ Type: [Trousers][Jeans][Skirt][Shorts]           ││
│ │ Style: [Wide][Tapered][Cargo]…  Color: ⚪⚫🟤    ││
│ └─────────────────────────────────────────────────┘│
│ ┌─ SHOES ──────────── auto: white sneakers ───────┐│
│ │ Type · Sub · Color                                ││
│ └─────────────────────────────────────────────────┘│
│                                                       │
│ ▸ Accessories  (Bag · Jewelry · Eyewear · Hat ·     │
│                Belt · Watch)         [tap to open]   │
└──────────────────────────────────────────────────────┘
```

When scene has admin `outfit_hint` → entire block replaced by:
```
🎬 This scene has a styled outfit
   "vintage tweed · brown loafers"   [Override]
```

---

### 5. Files touched
- `src/components/app/product-images/types.ts` — extend `OutfitConfig`
- NEW `src/lib/outfitVocabulary.ts` — all type/sub-style/color lists + smart defaults
- NEW `src/lib/outfitConflictResolver.ts` — the rulebook from §2
- NEW `src/components/app/product-images/OutfitSlotCard.tsx` — reusable slot
- NEW `src/components/app/product-images/OutfitPresetBar.tsx`
- `src/components/app/product-images/ProductImagesStep3Refine.tsx` — wire it all up
- `src/lib/productImagePromptBuilder.ts` — render new slots + apply defaults
- DB migration: `user_outfit_presets` table + RLS

### Risk
Low. Schema is additive, defaults prevent broken prompts, scene-hint takeover removes the silent-override bug.
