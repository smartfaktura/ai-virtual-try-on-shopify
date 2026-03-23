

# "Start with a Workflow" Modal - Multi-Step Onboarding Flow

## Overview

Clicking "Start with a Workflow" on the dashboard opens a multi-step modal that guides users from workflow selection to product selection to the generation page.

## Modal Flow

```text
Step 1: "What do you want to create?"
┌──────────────────────────────────────────────┐
│  [ Virtual Try-On ]                          │
│  Show your product on real models             │
│                                              │
│  [ Product Editorial ]                       │
│  High-end lifestyle & studio shots            │
│                                              │
│  [ Selfie / UGC Set ]                        │
│  High-quality content like UGC creators       │
└──────────────────────────────────────────────┘
Cards styled like WorkflowCardCompact (image + title + subtitle)

Step 2: Product Selection (conditional)
┌──────────────────────────────────────────────┐
│  IF user has products → show product grid     │
│  IF no products → show two options:           │
│    [ Upload Your Product ] → inline upload    │
│    [ Use Sample Product ] → auto-selects:     │
│       Try-On → Ribbed Crop Top               │
│       Editorial → Bottle of Skincare          │
│       UGC → Ice Roller                        │
└──────────────────────────────────────────────┘

Step 3: Navigate to workflow page
  → Product pre-selected, skip brand profile
  → For Try-On: go to model selection step
```

## Files Changed

### New: `src/components/app/StartWorkflowModal.tsx` (~200 lines)

Multi-step Dialog component:

**Step 1 - Workflow selection:**
- Three cards with workflow preview images, names, and subtitles
- Clicking a card advances to step 2
- Uses existing workflow preview images from the database query (already fetched in Dashboard)

**Step 2 - Product selection (if user has products):**
- Grid of user's products (reuse existing product query from dashboard `dashboard-product-count`)
- Fetch actual products with `useQuery` on `user_products`
- Select one, then navigate to the workflow

**Step 2 - Product selection (if user has NO products):**
- Two options side by side:
  - "Upload Your Product" - shows inline simplified upload form (image drop + title + type + Add Product button). On success, navigates with that product selected.
  - "Use Sample Product" - shows the context-appropriate sample card:
    - Virtual Try-On → Ribbed Crop Top (`/images/samples/sample-crop-top.png`)
    - Product Editorial → Skincare Serum (using the existing sample ring image or a suitable one)
    - UGC → Ice Roller (`/images/samples/sample-ice-roller.png`)
  - Clicking sample navigates directly to the workflow with sample product

**Navigation on completion:**
- Navigate to `/app/generate/{workflow-slug}` with query param like `?product=sample_tryon_crop_top` or `?product={real-product-id}` so the Generate page can auto-select it
- The Generate page already handles sample products and product selection, so this should integrate naturally

### Modified: `src/components/app/DashboardPersonalizationHero.tsx` (~5 lines)
- Remove Sparkles icon from button
- Open the modal instead of navigating to `/app/workflows`
- Render `<StartWorkflowModal />` with open/close state

### Modified: `src/pages/Dashboard.tsx` (~2 lines)
- Pass `userProducts` data to Hero if needed (or let modal fetch its own)

### Simplified Upload in Modal
Rather than embedding the full `ManualProductTab` (898 lines), create a lightweight inline upload:
- Image dropzone (reuse pattern from ManualProductTab)
- Title field (auto-filled by AI analyze if available)
- Product type quick chips
- "Add Product" button
- On success: insert into `user_products`, then navigate to workflow with new product ID

### Workflow Slug Mapping
```ts
const WORKFLOW_OPTIONS = [
  { name: 'Virtual Try-On', slug: 'virtual-try-on-set', subtitle: 'Show your product on real models', sampleId: 'sample_tryon_crop_top' },
  { name: 'Product Editorial', slug: 'product-listing-set', subtitle: 'High-end lifestyle & studio shots', sampleId: 'sample_listing_ring' },
  { name: 'Selfie / UGC Set', slug: 'selfie-ugc-set', subtitle: 'High-quality content like UGC creators', sampleId: 'sample_ugc_ice_roller' },
];
```

## Technical Notes
- Modal uses existing `Dialog` component
- Products fetched via `useQuery(['user-products'])` inside the modal
- Sample products use the same IDs and images already defined in `Generate.tsx` (e.g., `sample_tryon_crop_top`, `sample_listing_ring`, `sample_ugc_ice_roller`)
- The Generate page already handles `null` product_id for sample products, so no backend changes needed
- Product upload uses existing Supabase storage bucket and `user_products` table insert pattern from `ManualProductTab`

