

# Product Images Flow — Major Overhaul Plan

This is a large architectural change touching the data model, scene library, product analysis, refine logic, scene assignment, and review step. The plan is split into **4 phases** to keep each implementation manageable.

---

## Current State

- 7-step wizard: Products → Scenes → Refine → Settings → Review → Generate → Results
- Flat scene selection (global + category collections)
- Single flat `DetailSettings` object for all refine/settings
- No scene-to-product assignment logic — every scene applies to every product
- No product analysis (category, size, material)
- Refine is scene-block-triggered chips, not a global aesthetic layer

## Target State

- 6-step wizard: Products → Scenes → Refine → Review → Generate → Results (merge Settings into Refine)
- Scene assignment with scopes: `ALL`, `CATEGORY_GROUP`, `INDIVIDUAL_PRODUCT`
- Product metadata analysis (category, size, color, material)
- Refine = global aesthetic layer + person styling + scene-specific details
- Expanded scene library (~80 category-specific scenes)

---

## Phase 1: Data Model & Product Analysis

### 1A. New types (`types.ts`)

Add new interfaces:

```typescript
// Product categories
export type ProductCategory =
  | 'fragrance' | 'beauty-skincare' | 'makeup-lipsticks'
  | 'bags-accessories' | 'hats-small' | 'shoes'
  | 'garments' | 'home-decor' | 'tech-devices'
  | 'food-beverage' | 'supplements-wellness' | 'other';

// Product analysis metadata (persisted to DB)
export interface ProductAnalysis {
  category: ProductCategory;
  sizeClass: 'very-small' | 'small' | 'medium' | 'large' | 'extra-large';
  colorFamily: string;
  materialFamily: string;
  finish: string;
  packagingRelevant: boolean;
  personCompatible: boolean;
}

// Scene assignment
export type SceneScope = 'all' | 'category_group' | 'individual_product';

export interface SceneSelection {
  sceneId: string;
  scope: SceneScope;
  scopeValue: string | null; // category slug or product ID
}

// Refine structure (replaces flat DetailSettings for aesthetic)
export interface OverallAesthetic {
  consistency: string;
  colorWorld: string;
  backgroundFamily: string;
  surfaceMaterial: string;
  lightingFamily: string;
  shadowStyle: string;
  stylingDirection: string;
  accentColor: string;
  accentCustom?: string;
  aestheticSource?: 'auto-balance' | 'anchor-first' | 'manual';
}

export interface PersonStyling {
  presentation: string;
  ageRange: string;
  skinTone: string;
  modelSelectionMode: string;
  outfitStyle: string;
  outfitColorDirection: string;
  handStyle: string;
  nails: string;
  jewelryVisibility: string;
  expression: string;
  hairVisibility: string;
  selectedModelId?: string;
}

export interface RefineSettings {
  aesthetic: OverallAesthetic;
  person?: PersonStyling;
  sceneDetails: Record<string, Record<string, string>>; // sceneId -> field -> value
  advanced?: Record<string, string>;
  customNote?: string;
  packagingReferenceUrl?: string;
}

// Updated generation plan
export interface GenerationPlan {
  products: UserProduct[];
  productAnalyses: Record<string, ProductAnalysis>;
  sceneSelections: SceneSelection[];
  refine: RefineSettings;
  aspectRatio: string;
  quality: string;
  imageCount: string;
  sceneAspectOverrides?: Record<string, string>;
  sceneProps?: Record<string, string[]>;
  totalImages: number;
  totalCredits: number;
}
```

Keep the existing `DetailSettings` temporarily for backward compatibility but mark deprecated.

### 1B. Product analysis via edge function

**New file**: `supabase/functions/analyze-product-category/index.ts`

Uses Lovable AI (Gemini Flash) to analyze a product image and return `ProductAnalysis`. Called once per product; results cached.

### 1C. Database migration

Add `analysis_json` (jsonb, nullable) column to `user_products` table. Once analyzed, the result is stored so we don't re-analyze.

### 1D. Auto-analysis hook

**New file**: `src/hooks/useProductAnalysis.ts`

After product selection (Step 1 → Step 2 transition), check which selected products lack `analysis_json`. Call the edge function for those. Show a brief "Analyzing products..." loading state. Allow user to correct category via a small dropdown.

**Files**: `types.ts`, new edge function, new hook, DB migration

---

## Phase 2: Scene Library Expansion & Assignment

### 2A. Expanded scene data (`sceneData.ts`)

Replace current scenes with the full set from the spec:

- **Global scenes** (~11): Clean Studio Shot, Marketplace Listing, Editorial on Surface, Product on Pedestal, Tabletop Lifestyle, In-Hand Studio, In-Hand Lifestyle, Close-Up Detail, More Angles, Product + Packaging, Packaging Detail
- **Category-specific scenes** (~70): All scenes listed in the spec per category (Fragrance ×7, Beauty ×7, Makeup ×7, Bags ×8, Hats ×6, Shoes ×7, Apparel ×7, Home ×6, Tech ×6, Food ×7, Supplements ×7, Other ×5)

Each scene gets the internal ID from the spec (e.g., `fragrance_hero_surface`).

### 2B. Scene assignment UI (`ProductImagesStep2Scenes.tsx`)

Major changes:
- Use product analyses to show **Recommended** categories with product thumbnails: "Selected for: [thumb] [thumb]"
- Global scenes get `scope: 'all'` automatically
- Category scenes get `scope: 'category_group'` automatically
- Add collapsible "Assign to specific products" option per scene for `scope: 'individual_product'`
- Output is `SceneSelection[]` instead of `Set<string>`

### 2C. Scene compatibility

Add `compatibleCategories?: ProductCategory[]` to `ProductImageScene`. When `scope: 'all'`, only generate for compatible products. Global scenes are compatible with all by default; category scenes are compatible with their category.

**Files**: `sceneData.ts`, `ProductImagesStep2Scenes.tsx`, `types.ts`

---

## Phase 3: Refine Overhaul

### 3A. New Refine step (`ProductImagesStep3Refine.tsx`)

Replace current `ProductImagesStep3Details.tsx` + `ProductImagesStep3Settings.tsx` with a unified Refine step:

**Section 1 — Overall Aesthetic** (always shown)
- Consistency: Natural / Strong / Strict
- Color world: Auto / Warm neutrals / Cool neutrals / Soft monochrome / Brand-led / Custom
- Background family: Pure white / Soft white / Light grey / Warm beige / Taupe / Stone / Accent / Custom / Auto
- Surface/material: Minimal studio / Stone-plaster / Warm wood / Fabric / Glossy / Auto
- Lighting: Soft diffused / Warm editorial / Crisp studio / Natural daylight / Side-lit premium
- Shadow: None / Soft / Natural / Defined
- Styling direction: Minimal luxury / Clean commercial / Fashion editorial / Beauty clean / Organic / Modern sleek / Auto
- Accent color: None / Product accent / Brand accent / Subtle / Strong / Custom
- **Aesthetic source** (shown only when multi-category selection): Auto-balance / Anchor first product / Manual

Auto-fill from product analysis.

**Section 2 — Visible Person Styling** (shown only when person-compatible scenes selected)
- All fields from spec: presentation, age, skin tone, model selection mode, outfit style, outfit color, hand style, nails, jewelry, expression, hair
- Model picker (existing component)
- Auto-fill from product category

**Section 3 — Scene-Specific Details** (collapsible per-scene)
- Triggered detail blocks based on scene type (keep existing trigger logic)
- Includes: detail focus, angle selection, packaging details, product size, branding, layout, props

**Section 4 — Advanced** (collapsed)
- Custom note
- Per-category or per-product overrides (future)

**Section 5 — Format & Output** (bottom card)
- Aspect ratio selector with per-scene overrides (existing from Settings)
- Image count
- Live credit preview
- Per-scene props (existing from Settings)

This merges the current Steps 3+4 into one step, reducing the wizard to 6 steps.

**Files**: New `ProductImagesStep3Refine.tsx`, update `ProductImages.tsx` step definitions

---

## Phase 4: Review, Generation & Admin

### 4A. Updated Review (`ProductImagesStep4Review.tsx`)

Show:
- Products grouped by category
- Scenes with scope badges: "All products" / "Fragrance" / "[product name]"
- Aesthetic summary card
- Person styling summary (if applicable)
- Output count: breakdown by product × scene
- Credits total
- Edit jump-links per section

### 4B. Updated Generation Logic (`ProductImages.tsx`)

When generating:
- For each `SceneSelection`, resolve which products it applies to based on scope
- Build instruction using `RefineSettings` aesthetic + person + scene details
- Pass per-scene aspect ratio overrides
- Pass per-scene props

### 4C. Admin Scene Management

Update `/admin/scenes` to:
- Manage global + category scenes
- Set compatible categories per scene
- Set which refine blocks each scene triggers
- Toggle active/inactive
- Manage preview images
- Set sort order within categories

**Files**: `ProductImagesStep4Review.tsx`, `ProductImages.tsx` generation logic, admin pages

---

## Step-by-Step Migration

The wizard changes from 7 steps to 6:

| # | Old | New |
|---|-----|-----|
| 1 | Products | Products (+ auto-analysis) |
| 2 | Scenes | Scenes (with scope assignment) |
| 3 | Refine (details) | Refine (aesthetic + person + details + format) |
| 4 | Settings (format) | Review |
| 5 | Review | Generate |
| 6 | Generate | Results |
| 7 | Results | — |

## What We Keep

- Product selection mechanism (grid/list, search, pagination, add product modal)
- Product context strip
- Sticky bar
- Generation queue/polling/results logic
- Credits calculation pattern
- Model picker component
- Base64 image conversion for generation

## Implementation Order

1. **Phase 1** — Data model + product analysis (foundation)
2. **Phase 2** — Scene library + assignment (core feature)
3. **Phase 3** — Refine overhaul (UX improvement)
4. **Phase 4** — Review + generation + admin (completion)

Each phase is independently deployable. Phase 1 can ship with the old UI still working. Phase 2-3 are the main UX changes. Phase 4 ties it all together.

## Estimated Scope

- ~15 files modified/created
- 1 edge function
- 1 DB migration
- Scene data file grows from ~270 lines to ~600+ lines

