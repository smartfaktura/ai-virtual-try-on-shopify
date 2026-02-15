

## Customize Flat Lay Set Wizard

### Overview
Transform the Flat Lay Set from a generic workflow into a dedicated flat lay experience with multi-product selection, visual surface picking, and optional aesthetic/prop customization.

### Current State
The Flat Lay Set currently uses the generic workflow path with 4 surface "variations" (Marble Luxe, Natural Wood, Linen Minimal, Color Pop) shown as small selectable cards. It only supports single product selection and has no way to specify additional styling details like props or mood.

### Changes

#### 1. Enable Multi-Product Selection for Flat Lay
**File: `src/pages/Generate.tsx`**

- Add `isFlatLay` detection: `const isFlatLay = activeWorkflow?.name === 'Flat Lay Set';`
- In the Product step, allow multi-select for Flat Lay (similar to how bulk generation works) -- users can pick 2-5 products to arrange together in the flat lay
- Pass all selected product IDs and images to the generation payload

#### 2. Dedicated Flat Lay Wizard Steps
**File: `src/pages/Generate.tsx`**

Introduce a `flatLayPhase` state (similar to `mirrorSettingsPhase`) with two phases:
- **Phase 1: "Surfaces"** -- Visual grid of surface options (like scene selection for Product Listing Set). Change the variation strategy type from `surface` to `scene` in the DB so it uses the visual card grid with preview images
- **Phase 2: "Details"** -- Optional aesthetic/prop customization + quality settings

Step flow: **Product(s) --> Brand Profile --> Surfaces --> Details --> Generate**

Progress steps will show: Product(s) | Brand | Surface | Details | Results

#### 3. Add Aesthetic/Props Input
**File: `src/pages/Generate.tsx`**

In the "Details" phase, add:
- A textarea for "Styling Notes" where users can describe additional props or aesthetic preferences (e.g., "eucalyptus leaves, gold jewelry, coffee cup")
- Quick-select chips for common flat lay aesthetics: "Minimal", "Botanical", "Coffee & Books", "Travel", "Beauty", "Food Styling", "Holiday/Seasonal"
- These get appended to the generation prompt

#### 4. Expand Surfaces in Database + Add Preview Images
**Database update** to the Flat Lay Set workflow (`id: 24effc2d-32f2-4f04-86d4-96dafab30c73`):

Change `variation_strategy.type` from `surface` to `scene` (so it uses the visual grid UI).

Add new surfaces to the variations array (expanding from 4 to ~12):
- **Existing**: Marble Luxe, Natural Wood, Linen Minimal, Color Pop
- **New**: Concrete / Industrial, Terrazzo, Pastel Paper, Dark Moody (black/charcoal surface), Rattan / Wicker, Tile / Moroccan, Leather, Brushed Metal

Each variation gets `category` tags: "Classic", "Natural", "Bold", "Textured"

#### 5. Generate Surface Preview Images
**File: `supabase/functions/generate-scene-previews/index.ts`**

Add flat lay surface preview prompts for all 12 surfaces. Each preview shows a styled overhead flat lay on that surface with curated props (cosmetics, accessories, botanicals) -- no specific product, just the surface and styling.

#### 6. Update Generation Payload for Multi-Product + Styling Notes
**File: `src/pages/Generate.tsx`** and **`supabase/functions/generate-workflow/index.ts`**

- Send `products` array (multiple product images + metadata) instead of single `product`
- Send `styling_notes` string from the aesthetic input
- The edge function incorporates styling notes into the prompt and arranges multiple products in the composition

### Technical Details

**New state variables:**
```text
const isFlatLay = activeWorkflow?.name === 'Flat Lay Set';
const [flatLayPhase, setFlatLayPhase] = useState<'surfaces' | 'details'>('surfaces');
const [stylingNotes, setStylingNotes] = useState('');
const [selectedAesthetics, setSelectedAesthetics] = useState<string[]>([]);
```

**Aesthetic quick-chips:**
```text
const FLAT_LAY_AESTHETICS = [
  { id: 'minimal', label: 'Minimal', hint: 'clean, few props, whitespace' },
  { id: 'botanical', label: 'Botanical', hint: 'dried flowers, eucalyptus, greenery' },
  { id: 'coffee-books', label: 'Coffee & Books', hint: 'coffee cup, open book, reading glasses' },
  { id: 'travel', label: 'Travel', hint: 'passport, sunglasses, map, boarding pass' },
  { id: 'beauty', label: 'Beauty', hint: 'makeup brushes, lipstick, mirror, perfume' },
  { id: 'cozy', label: 'Cozy', hint: 'knit blanket, candle, warm tones' },
  { id: 'seasonal', label: 'Seasonal', hint: 'seasonal elements matching current time of year' },
];
```

**Product step changes for flat lay:**
- Show `ProductMultiSelect` for flat lay with a note: "Select 1-5 products to arrange in your flat lay"
- Map first selected product as `selectedProduct` for backward compatibility
- Store all selected products in a `selectedFlatLayProducts` array

**Surface grid:**
- Uses the same visual card grid as Product Listing Set (square aspect ratio cards)
- 4-column grid on desktop: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`

**Database variation_strategy update:**
```text
type: "scene"  (changed from "surface")
variations: [12 items with label, instruction, category, aspect_ratio: "1:1"]
```

### Sequence
1. Add `isFlatLay` detection and `flatLayPhase` state
2. Update product step to allow multi-select for flat lay
3. Add flat lay-specific wizard flow (surfaces phase + details phase)
4. Add aesthetic chips + styling notes textarea in details phase
5. Update database: change strategy type to `scene`, add 8 new surface variations with categories
6. Add surface preview prompts to edge function
7. Update `generate-workflow` edge function to accept multi-product + styling notes
8. Deploy edge function and generate surface previews
