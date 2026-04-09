
# Product Image Categories Expansion

## Overview
Expand from 12 to ~30+ category collections. New categories **inherit** scenes from their parent + get 2-3 unique shots. Update product classification (AI + keyword fallback) to detect them.

---

## Phase 1: Type System + Classification

### 1a. Update `ProductCategory` type (`types.ts`)
Add new categories:
```
backpacks, wallets-cardholders, belts, scarves,
jewellery-necklaces, jewellery-earrings, jewellery-bracelets, jewellery-rings, watches,
dresses, hoodies, streetwear, sneakers, boots, high-heels,
activewear, eyewear, swimwear, lingerie, kidswear, jeans, jackets
```

### 1b. Update `CATEGORY_KEYWORDS` (Step2 scene matching)
Add keyword arrays for each new category. Example:
- `sneakers`: sneaker, trainer, air max, nike dunk, jordan...
- `jewellery-earrings`: earring, stud, hoop, drop earring...
- `kidswear`: kids, children, baby, toddler, infant...
- etc.

**Priority order matters** — specific categories must match before generic ones (e.g., `sneakers` before `shoes`).

### 1c. Update edge function `analyze-product-category`
- Add all new categories to `VALID CATEGORIES` in AI system prompt
- Add new `TITLE_CATEGORY_PATTERNS` regex entries (specific before generic)
- Order: sneakers → boots → high-heels → shoes (general), dresses → hoodies → jeans → jackets → streetwear → activewear → swimwear → lingerie → kidswear → garments (general)

### 1d. Update `categoryUtils.ts` detection
Add new keywords to `detectProductCategory()` for the old-style detection used elsewhere.

---

## Phase 2: Database Scenes (inherit + extend)

For each new category, we:
1. **Clone** the parent's DB scenes into the new `category_collection`
2. **Add** 2-3 category-specific unique scenes

### From `bags-accessories` (parent):
| New Category | Unique Scenes |
|---|---|
| `backpacks` | Back Panel Detail, Straps & Harness, Packed/Loaded Shot |
| `wallets-cardholders` | Open Interior Layout, Card Slot Detail, Pocket Fit Shot |
| `belts` | Buckle Close-Up, Coiled Display, On-Waist Crop |
| `scarves` | Draped Fabric Flow, Knot/Wrap Detail, Folded Display |

### From `hats-small` → renamed to just `hats`:
| New Category | Unique Scenes |
|---|---|
| `eyewear` | Lens Detail, On-Face Portrait, Folded Temple Shot |
| `watches` | Dial Macro, On-Wrist Crop, Crown & Pushers Detail |

### Jewellery (4 new — inheriting from a new shared base):
| Category | Unique Scenes |
|---|---|
| `jewellery-necklaces` | On-Neck Décolletage, Clasp Detail, Pendant Close-Up |
| `jewellery-earrings` | On-Ear Close-Up, Drop/Dangle Detail, Pair Display |
| `jewellery-bracelets` | On-Wrist Stack, Clasp Mechanism, Charm Detail |
| `jewellery-rings` | On-Finger Portrait, Band Interior, Stone Setting Macro |

### From `shoes` (parent stays as fallback):
| New Category | Unique Scenes |
|---|---|
| `sneakers` | Tongue & Lace Detail, On-Foot Streetwear, Stacked Pair |
| `boots` | Shaft & Zipper Detail, Ankle Crop, Rugged Context |
| `high-heels` | Heel Silhouette, Arch & Sole Detail, Walking Editorial |

### From `garments` (parent stays as fallback):
| New Category | Unique Scenes |
|---|---|
| `dresses` | Full-Length Flow, Bodice Detail, Back Detail |
| `hoodies` | Hood Detail, Drawstring Macro, Oversized Fit Shot |
| `streetwear` | Print/Graphic Detail, Urban Context, Outfit Stack |
| `jeans` | Wash Detail Macro, Back Pocket Branding, Stacked Hem |
| `jackets` | Collar/Lapel Detail, Lining Interior, Layered Look |
| `activewear` | Stretch/Movement Shot, Fabric Tech Detail, Gym Context |
| `swimwear` | Fabric Stretch Detail, Poolside Scene, Body Crop |
| `lingerie` | Lace Detail Macro, Boudoir Scene, Strap Detail |
| `kidswear` | Child Model Portrait (special: kids models), Play Scene, Detail & Label |

### Beauty detection fix:
Verify `beauty-skincare` vs `makeup-lipsticks` keyword split is correct. Move any misplaced keywords (e.g., "lip" should be in makeup, "shampoo"/"conditioner" should be in skincare).

---

## Phase 3: Outfit Preset Fallbacks

Map each new category to an appropriate outfit preset source so the "Style & Outfit" section in Step 3 always has presets. Fashion categories → `garments`, accessories → `bags-accessories`, etc.

---

## Implementation Order
1. Types + classification (1 PR — frontend types, keywords, edge function)
2. DB scenes — batch INSERT via insert tool (parent scenes cloned + unique scenes added per category)
3. Outfit preset fallback mapping
4. Test end-to-end with sample products

---

## Scale
- ~20 new category_collections
- ~60 unique new scene records + ~300 cloned/inherited scene records
- 3 files updated (types.ts, Step2Scenes, edge function)
- 1 file minor update (categoryUtils.ts)

This will be done in multiple implementation messages due to the volume of DB inserts.
