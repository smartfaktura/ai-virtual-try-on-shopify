

# Source Image Selection Feature

## Problem Identified

When a Shopify product has multiple images (1, 5, 10, or more), users currently have **no control over which image(s) the AI uses as the reference source** for generation. The system just shows thumbnails but doesn't let merchants choose.

This matters because:
- Different product images show different angles/details
- Some images may have better quality for AI reference
- Users may want to generate lifestyle shots based on a specific product angle
- Color variants may have different hero images

## Solution: Add Source Image Selection

Allow users to select one or more product images to use as the reference for AI generation.

---

## Implementation Plan

### 1. Add State for Selected Source Images

**File:** `src/pages/Generate.tsx`

Add new state to track which product images are selected as sources:

```typescript
const [selectedSourceImages, setSelectedSourceImages] = useState<Set<string>>(new Set());
```

When a product is selected, auto-select the first image by default (so existing workflow still works).

---

### 2. Update "Current Images" Display in Selected Product Card

**File:** `src/pages/Generate.tsx` (lines 451-461)

Transform the static thumbnail display into an interactive image selector:

**Current (read-only):**
```text
Current images (1)
[thumbnail]
```

**Improved (selectable):**
```text
Source images for generation (select 1 or more)
[✓ thumbnail] [thumbnail] [thumbnail] ...
Selected: 2 of 5 images
```

Changes:
- Add header text explaining the selection purpose
- Make each thumbnail clickable with selection indicator (checkmark overlay)
- Add visual feedback for selected vs unselected state
- Show count of selected images
- Add "Select All" / "Deselect All" quick actions for products with many images

---

### 3. Update Product Card UI Design

The product card section will become:

```text
┌─────────────────────────────────────────────────────┐
│ Selected Product                           [Change] │
├─────────────────────────────────────────────────────┤
│ [LARGE THUMB] Artisan Honey Granola                 │
│               Morning Harvest • Cereals             │
│               [organic] [breakfast] [honey]         │
├─────────────────────────────────────────────────────┤
│ Source images for generation                        │
│ Select which image(s) to use as reference:          │
│                                                     │
│ ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐   │
│ │  ✓   │  │      │  │  ✓   │  │      │  │      │   │
│ │ IMG1 │  │ IMG2 │  │ IMG3 │  │ IMG4 │  │ IMG5 │   │
│ └──────┘  └──────┘  └──────┘  └──────┘  └──────┘   │
│                                                     │
│ 2 of 5 selected          [Select All] [Clear All]  │
└─────────────────────────────────────────────────────┘
```

---

### 4. Update Types (Optional Enhancement)

**File:** `src/types/index.ts`

Add to `GenerationSettings` or create new interface:

```typescript
export interface GenerationSettings {
  count: 1 | 4 | 8;
  aspectRatio: AspectRatio;
  quality: ImageQuality;
  preserveAccuracy: boolean;
  sourceImageIds?: string[];  // NEW: Which product images to use as reference
}
```

---

### 5. Pass Selected Images to Generation

**File:** `src/pages/Generate.tsx`

Update `handleConfirmGenerate` and `GenerateConfirmModal` to include the selected source images in the generation request. The confirmation modal should show:

- Which product
- Which source image(s) will be used
- Which template
- How many images to generate
- Credit cost

---

### 6. Update Confirmation Modal

**File:** `src/components/app/GenerateConfirmModal.tsx`

Add a section showing the selected source images:

```text
Source Reference
[Selected thumbnails displayed here]
Using 2 images as reference
```

This gives users final confirmation of what the AI will use.

---

### 7. Handle Edge Cases

1. **Single image product**: Auto-select the only image, hide selection UI complexity
2. **No images product**: Show informative message that user needs to upload product images first
3. **Many images (10+)**: Add scroll container or pagination
4. **Reset on product change**: Clear selection and auto-select first image when switching products

---

## Code Changes Summary

### Files to Modify:

1. **`src/pages/Generate.tsx`**
   - Add `selectedSourceImages` state
   - Update product card section (lines 451-461) to show selectable images
   - Add image selection toggle handler
   - Auto-select first image on product selection
   - Pass selected images to confirmation modal and generation logic

2. **`src/components/app/GenerateConfirmModal.tsx`**
   - Add `sourceImages` prop to interface
   - Display selected source images in the confirmation summary

3. **`src/types/index.ts`** (optional)
   - Add `sourceImageIds` to GenerationSettings type

---

## Visual Behavior

### Selection Interaction:
- Click thumbnail → toggle selection
- Checkbox overlay appears on selected images
- Selected images have a colored border (shopify-green)
- Unselected images have standard border with hover effect

### Default Behavior:
- First image auto-selected when product is chosen
- At least one image must be selected to proceed
- Validation message if user tries to continue with zero images selected

---

## User Flow After Implementation

1. User selects product "Artisan Honey Granola" (has 5 images)
2. Product card expands showing all 5 images as selectable thumbnails
3. Image 1 is auto-selected by default
4. User clicks images 2 and 4 to add them as additional references
5. Counter shows "3 of 5 selected"
6. User proceeds to template selection
7. Confirmation modal shows the 3 selected source images
8. AI generates using those specific product angles

---

## Benefits

- **Better AI results**: Users can pick the clearest, best-lit product photo
- **Variant support**: Generate from specific color/style variant images
- **Multi-angle generation**: Select front + side view for comprehensive AI input
- **User confidence**: Clear visibility into what AI will reference

