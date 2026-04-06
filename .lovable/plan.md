

# Pro-Level Styling & Outfit System for Product Images

## Current State Analysis

The system has a functional but basic outfit mechanism:
- **OutfitLockPanel**: 4 text inputs (top, bottom, shoes, accessories) with category defaults
- **Prompt builder**: `defaultOutfitDirective()` reads these fields, falls back to hardcoded category defaults
- **No persistence**: Settings reset every session — users re-enter the same outfit every time
- **No presets**: No way to save a "look" and reuse it across shoots
- **Flat structure**: Each piece is just a free-text string — no structured color/material/fit breakdown
- **No "last used" memory**: The `INITIAL_DETAILS` in `ProductImages.tsx` is hardcoded every mount

## Problems

1. **No memory** — B2B users run 50+ shoots/month. Re-entering "slim beige trousers, white sneakers" every time is painful.
2. **No outfit presets** — A fashion brand has 2-3 standard looks (e.g., "ASOS Clean", "Editorial Dark", "Summer Casual"). No way to define and reuse them.
3. **Free-text is imprecise** — "beige trousers" gives inconsistent results. Structured fields (color: beige, fit: slim, material: cotton) produce better prompts.
4. **Outfit doesn't adapt to gender** — The same "plain white t-shirt" default is used regardless of whether the selected model is male or female.
5. **No per-piece detail** — Missing color, material, and fit for each garment piece, which the prompt builder needs for consistency.

## Plan

### 1. Structured Outfit Pieces (types.ts + promptBuilder)

Replace flat string fields with structured objects per piece:

```ts
interface OutfitPiece {
  garment: string;    // "t-shirt", "turtleneck", "blouse"
  color: string;      // "white", "black", "beige"
  fit?: string;       // "slim", "relaxed", "cropped"
  material?: string;  // "cotton", "silk", "denim"
}

interface OutfitConfig {
  top?: OutfitPiece;
  bottom?: OutfitPiece;
  shoes?: OutfitPiece;
  accessories?: string;
  name?: string;       // for saved presets
}
```

**File: `types.ts`** — Add `OutfitConfig` type and `outfitConfig?: OutfitConfig` to `DetailSettings` (keep old `outfitTop/Bottom/Shoes/Accessories` for backward compat).

**File: `productImagePromptBuilder.ts`** — Update `defaultOutfitDirective` to read structured pieces first, building precise strings like "slim-fit white cotton t-shirt, cropped beige linen trousers, minimal white leather sneakers".

### 2. Gender-Aware Outfit Defaults

**File: `productImagePromptBuilder.ts`** — `categoryOutfitDefaults` gains a gender parameter. When a model is selected, read their `gender` field and switch defaults:
- Male garments: "plain white crew-neck tee, slim navy chinos, white leather sneakers"
- Female garments: "fitted white t-shirt, slim light beige trousers, minimal white sneakers"

**File: `ProductImagesStep3Refine.tsx`** — Pass selected model's gender to OutfitLockPanel so placeholders adapt.

### 3. Outfit Presets (Save & Load)

**Storage**: `localStorage` key `pi_outfit_presets` — array of `{ id, name, config: OutfitConfig, category, gender, createdAt }`. No DB table needed initially; keeps it fast and frictionless.

**File: `ProductImagesStep3Refine.tsx`** — New `OutfitPresetBar` sub-component above the OutfitLockPanel:
- Horizontal chip row of saved presets (e.g., "ASOS Clean", "Editorial Dark")
- Click to load → fills the outfit fields
- "Save current" button → prompts for name, saves to localStorage
- "Delete" on hover
- 3 built-in templates per category that can't be deleted (e.g., "Studio Standard", "Editorial", "Minimal")

### 4. Last Used Settings Memory

**File: `ProductImages.tsx`** — On step transition from Refine → Review, save `details` to `localStorage` key `pi_last_details_{category}` (keyed by primary category so garment settings don't bleed into fragrance).

On component mount, if `localStorage` has a saved config for the current category, show a subtle banner: **"Load your last settings?"** with Apply / Dismiss. Clicking Apply fills `details` state. Dismissed = use fresh defaults.

### 5. Improved OutfitLockPanel UI

**File: `ProductImagesStep3Refine.tsx`** — Restructure the panel:

```text
┌─────────────────────────────────────────────────┐
│ 🔒 Outfit Lock                                  │
│                                                  │
│ Presets: [Studio Standard] [Editorial] [+ Save]  │
│                                                  │
│ ┌─── Top ───────────────────────────────────┐   │
│ │ Garment: [t-shirt ▾]  Color: [white ▾]    │   │
│ │ Fit: [slim ▾]         Material: [cotton ▾] │   │
│ └────────────────────────────────────────────┘   │
│ ┌─── Bottom ────────────────────────────────┐   │
│ │ Garment: [trousers ▾]  Color: [beige ▾]   │   │
│ │ Fit: [slim ▾]          Material: [cotton ▾]│   │
│ └────────────────────────────────────────────┘   │
│ ┌─── Shoes ─────────────────────────────────┐   │
│ │ Garment: [sneakers ▾]  Color: [white ▾]   │   │
│ └────────────────────────────────────────────┘   │
│ Accessories: [none ▾]                            │
└─────────────────────────────────────────────────┘
```

Each sub-field uses a `ChipSelector` with common options (not free text), plus an "Other" option that opens a text input. This gives structure while preserving flexibility.

### 6. Prompt Builder Enhancement

**File: `productImagePromptBuilder.ts`** — New `buildStructuredOutfitString(config: OutfitConfig)`:
- Concatenates each piece as: `{fit} {color} {material} {garment}` (skipping empty)
- Example output: "slim-fit white cotton t-shirt, cropped beige linen trousers, minimal white leather sneakers"
- Appends: "Same exact outfit in every shot. Clothing must NOT compete with the product."

## Files to Update

| File | Change |
|------|--------|
| `src/components/app/product-images/types.ts` | Add `OutfitPiece`, `OutfitConfig` types; add `outfitConfig` to `DetailSettings` |
| `src/components/app/product-images/ProductImagesStep3Refine.tsx` | Restructure OutfitLockPanel with structured fields, preset bar, gender awareness |
| `src/lib/productImagePromptBuilder.ts` | Gender-aware defaults, structured outfit string builder, read `outfitConfig` |
| `src/pages/ProductImages.tsx` | Save/load last settings per category via localStorage, "Load last settings?" banner |

## What This Achieves

- **Consistency**: Structured fields produce deterministic prompt strings → same outfit every time
- **Speed**: Presets + last-used memory → 2 clicks instead of re-typing everything
- **Pro control**: Per-piece color/fit/material gives B2B users the granularity they expect
- **Gender intelligence**: Defaults adapt to the selected model automatically

