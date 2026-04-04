

# Product Images Flow — Scene & Step Polish

## Summary of Changes

8 distinct changes across 4 files to improve scene cards, reorder steps, clean up settings, and enhance the sticky bar.

---

## 1. Reorder Steps: Refine comes right after Scenes

**Files**: `ProductImages.tsx`, `ProductImagesStickyBar.tsx`

Swap steps 3 and 4 so the flow becomes: Products → Scenes → Refine → Settings → Review.

- Update `STEP_DEFS` array order (Refine at position 3, Settings at position 4)
- Update `handleNext`, `handleBack` — step 2 goes to 3 (Refine), step 3 goes to 4 (Settings)
- Update step rendering: `step === 3` renders `ProductImagesStep3Details`, `step === 4` renders `ProductImagesStep3Settings`
- Update `STEP_LABELS` in sticky bar accordingly
- Update CTA labels: step 2 → "Refine", step 3 → "Settings", step 4 → "Review"

## 2. Format Chips: Show ratio near names

**File**: `ProductImagesStep3Settings.tsx`

Change `ASPECT_RATIOS` labels to include ratio: `'Square 1:1'`, `'Portrait 4:5'`, `'Tall 3:4'`, `'Story 9:16'`, `'Landscape 16:9'`.

## 3. Remove Quality Setting

**File**: `ProductImagesStep3Settings.tsx`

Remove the Quality card entirely. The quality will stay hardcoded as `'high'` (Pro) from the initial state. Remove the `QUALITY_OPTIONS` array and the quality `Card`. Change grid from `grid-cols-3` to `grid-cols-2` (Format + Images per scene only). Update cost preview to use fixed 6 credits per image (no variable).

## 4. Scene Cards: Minimal, image-focused, 3:4 ratio

**File**: `ProductImagesStep2Scenes.tsx`

Redesign `SceneCard`:
- Change placeholder aspect ratio from `4/5` to `3/4`
- Remove chips entirely (no `Badge` tags)
- Shorten description to single `line-clamp-1` (one line max)
- Reduce padding from `p-3` to `p-2`
- Truncate title with `truncate` class
- Keep title font size at `text-xs` for compactness

## 5. Improve Universal Scene Naming + Add/Remove Scenes

**File**: `sceneData.ts`

**Remove** these 3 global scenes:
- `group-collection` (Group / Collection Shot)
- `social-media` (Social Media Ready)
- `seasonal-holiday` (Seasonal / Holiday)

**Remove** the `other-custom` category collection entirely from `CATEGORY_COLLECTIONS`.

**Add** 3 new global scenes:
- `material-closeup` — "Material Close-Up" — "Show fabric, leather, metal, or material quality up close." — triggers: `detailFocus`
- `product-closeup` — "Product Close-Up" — "Tight crop highlighting product details and finish." — triggers: `detailFocus`
- `on-body-wearing` — "On Body / Wearing" — "Product worn or held on the body for scale and context." — triggers: `personDetails`, `actionDetails`

**Rename** existing scenes for clarity:
- `clean-packshot` → "White Background" (description: "Clean cut-out on pure white for listings.")
- `soft-neutral-studio` → "Studio Soft Light" (description: "Soft depth and controlled studio lighting.")
- `marketplace-ready` → "Marketplace Listing" (description: "Optimized for Amazon, Etsy, Shopify storefronts.")
- `editorial-product` → "Editorial Hero" (description: "Elevated hero shot for campaigns and launches.")
- `lifestyle` → "Lifestyle Context" (description: "Product in a real-world styled environment.")
- `in-hand` → "Held in Hand" (description: "Product held in hand showing scale and use.")
- `detail-coverage` → "Multi-Angle Coverage" (description: "Front, back, and side angles for full coverage.")
- `packaging` → "With Packaging" (description: "Product with its box or packaging.")
- `flat-lay` → "Flat Lay Arrangement" (description: "Overhead styled arrangement with props.")
- `shadow-light` → "Dramatic Lighting" (description: "Bold shadow and light for premium feel.")
- `back-angle` → "Back View" (description: "Rear angle of the product.")
- `side-profile` → "Side View" (description: "Side angle showing depth and silhouette.")
- `top-down` → "Top-Down View" (description: "Direct overhead for catalogs and listings.")
- `macro-texture` → "Macro Detail" (description: "Extreme close-up of textures and micro-details.")
- `wide-environment` → "Wide Environment" (description: "Pulled-back shot with broader context.")
- `ghost-mannequin` → "Ghost / Invisible" (description: "Floating product effect, no mannequin visible.")
- `on-surface` → "Styled Surface" (description: "Placed naturally on marble, wood, or fabric.")

## 6. Packaging Reference Upload in Refine Step

**Files**: `types.ts`, `ProductImagesStep3Details.tsx`

- Add `packagingReferenceUrl?: string` to `DetailSettings`
- In the `packagingDetails` block within `BlockFields`, add a file upload input that lets users upload a packaging reference image. Use a simple `<input type="file">` that converts to base64 and stores in `details.packagingReferenceUrl`. Show a small preview thumbnail when uploaded.

## 7. Improve Sticky Bar UI/UX

**File**: `ProductImagesStickyBar.tsx`

Redesign the bar layout:
- Remove the verbose "Step X/5 —" label
- Show a compact pill-style progress indicator: dots or step numbers where completed steps are filled
- Simplify the summary: just show `"3 products · 5 scenes · 15 images"` with dot separators instead of × math notation
- Credits shown as a compact badge: `"90 cr"` with coin icon
- Buttons stay the same (Back + CTA)

## 8. Update ProductImages.tsx Step References

Ensure `canNavigateTo`, `canProceed`, `handleNext`, `handleBack`, and step rendering all reflect the new order (3=Refine, 4=Settings).

---

## Files Modified

| File | Changes |
|------|---------|
| `sceneData.ts` | Rename scenes, add 3, remove 3 scenes + remove other-custom category |
| `ProductImagesStep2Scenes.tsx` | Minimal scene cards (3:4, no chips, short text) |
| `ProductImagesStep3Settings.tsx` | Add ratios to labels, remove quality card |
| `ProductImagesStep3Details.tsx` | Add packaging reference upload |
| `types.ts` | Add `packagingReferenceUrl` field |
| `ProductImagesStickyBar.tsx` | Compact progress + summary redesign |
| `ProductImages.tsx` | Swap step 3/4 order, update all references |

