

# Product Image Categories Expansion Plan

## Summary
Expand from 12 to ~30+ category collections. Each new category **inherits** scenes from its parent and gets 2-3 unique shots. Product classification (AI + keyword fallback) updated to detect all new types.

---

## Phase 1: Type System + Classification Updates

### 1a. `types.ts` — Add new ProductCategory values
New categories added to the union type:
`backpacks`, `wallets-cardholders`, `belts`, `scarves`, `jewellery-necklaces`, `jewellery-earrings`, `jewellery-bracelets`, `jewellery-rings`, `watches`, `dresses`, `hoodies`, `streetwear`, `sneakers`, `boots`, `high-heels`, `activewear`, `eyewear`, `swimwear`, `lingerie`, `kidswear`, `jeans`, `jackets`

### 1b. `ProductImagesStep2Scenes.tsx` — Update `CATEGORY_KEYWORDS`
Add keyword arrays for each new category. **Specific categories match before generic ones** (e.g., `sneakers` keywords checked before `shoes`).

### 1c. Edge function `analyze-product-category` — Update AI prompt + regex fallback
- Add all new categories to `VALID CATEGORIES` in system prompt
- Add `TITLE_CATEGORY_PATTERNS` regex entries ordered specific-first
- Fix beauty/makeup split: ensure "lip", "cheek" → makeup; "shampoo", "serum" → skincare

### 1d. `categoryUtils.ts` — Update old-style detection keywords

---

## Phase 2: Database Scenes (inherit + extend)

Each new category gets:
1. **Cloned** parent scenes (same prompt templates, new `category_collection` value)
2. **2-3 unique** scenes specific to that product type

### From `bags-accessories`:
| Category | Unique Shots |
|---|---|
| `backpacks` | Back Panel Detail, Straps & Harness, Packed/Loaded Shot |
| `wallets-cardholders` | Open Interior Layout, Card Slot Detail, Pocket Fit Shot |
| `belts` | Buckle Close-Up, Coiled Display, On-Waist Crop |
| `scarves` | Draped Fabric Flow, Knot/Wrap Detail, Folded Display |

### New jewellery collections (shared base scenes + unique):
| Category | Unique Shots |
|---|---|
| `jewellery-necklaces` | On-Neck Décolletage, Clasp Detail, Pendant Close-Up |
| `jewellery-earrings` | On-Ear Close-Up, Drop/Dangle Detail, Pair Display |
| `jewellery-bracelets` | On-Wrist Stack, Clasp Mechanism, Charm Detail |
| `jewellery-rings` | On-Finger Portrait, Band Interior, Stone Setting Macro |

### `watches` and `eyewear` (from `hats-small`):
| Category | Unique Shots |
|---|---|
| `watches` | Dial Macro, On-Wrist Crop, Crown & Pushers Detail |
| `eyewear` | Lens Detail, On-Face Portrait, Folded Temple Shot |

### From `shoes`:
| Category | Unique Shots |
|---|---|
| `sneakers` | Tongue & Lace Detail, On-Foot Streetwear, Stacked Pair |
| `boots` | Shaft & Zipper Detail, Ankle Crop, Rugged Context |
| `high-heels` | Heel Silhouette, Arch & Sole, Walking Editorial |

### From `garments`:
| Category | Unique Shots |
|---|---|
| `dresses` | Full-Length Flow, Bodice Detail, Back Detail |
| `hoodies` | Hood Detail, Drawstring Macro, Oversized Fit Shot |
| `streetwear` | Print/Graphic Detail, Urban Context, Outfit Stack |
| `jeans` | Wash Detail Macro, Back Pocket Branding, Stacked Hem |
| `jackets` | Collar/Lapel Detail, Lining Interior, Layered Look |
| `activewear` | Stretch/Movement, Fabric Tech Detail, Gym Context |
| `swimwear` | Fabric Stretch Detail, Poolside Scene, Body Crop |
| `lingerie` | Lace Detail Macro, Boudoir Scene, Strap Detail |
| `kidswear` | Child Model Portrait, Play Scene, Detail & Label |

---

## Phase 3: Support Systems
- **Outfit preset fallbacks**: Map each new category to appropriate preset source
- **`hats-small`** stays for hats only; jewellery/watches/eyewear keywords removed from it

---

## Scale
- ~20 new category collections
- ~60 unique new scene records + ~300 cloned scene records
- 4 files updated (types, Step2, edge function, categoryUtils)
- Multiple implementation messages due to volume of DB inserts

