

# Improve Product Images Flow — Comprehensive UX Overhaul

## Issues Identified

1. **No product context after Step 1** — Once products are selected, they disappear from view in Steps 2-4. Users lose context of what they're generating for.
2. **No floating sticky bar** — No persistent summary/CTA bar as user scrolls through scenes and details.
3. **No scene preview images** — Scene cards are text-only, no visual placeholders.
4. **Missing universal scenes** — Only 9 global scenes; missing important ones like Flat Lay, Group/Collection Shot, Seasonal/Holiday, Social Media Ready, etc.
5. **Wide/Banner scene should be removed** per user request.
6. **Step 3 (Details) poor flow** — All detail blocks are collapsed dropdowns. Person/hand details should surface inline when relevant scenes are selected, not hidden in collapsibles.
7. **No Format/Size selector** — Missing aspect ratio selection (1:1, 4:5, 9:16, 16:9) which exists in the main Generate flow.
8. **No image count per scene** — Can't choose how many variations per scene.
9. **No quality selector** — Hardcoded to "high", no user choice.

## Edge Cases to Cover

- Zero products exist yet (empty state needs upload guidance)
- User deselects all scenes after selecting details (details should reset or warn)
- Credit balance exactly equals cost (should still allow)
- Very large batch (e.g., 10 products × 8 scenes = 80 images) — needs warning
- User navigates back from Step 3 to Step 2 and removes scenes that triggered detail blocks — stale detail values
- Mobile viewport: sticky bar must not overlap bottom nav
- Single product vs multi-product consistency toggle logic

## Plan

### 1. Persistent Product Context Strip (Steps 2-4)

Add a compact horizontal strip below the stepper on Steps 2, 3, and 4 showing selected product thumbnails (32×32 rounded), product count, and a "Change" button to go back to Step 1.

**File**: Create a new `ProductContextStrip` component used in `ProductImages.tsx`, passed `selectedProducts` and rendered when `step >= 2 && step <= 4`.

### 2. Floating Sticky Bottom Bar

Add a sticky `fixed bottom-0` bar that shows:
- Left: summary text ("3 products × 5 scenes = 15 images")
- Center: credit cost estimate
- Right: primary CTA button (changes per step: "Continue to Scenes" / "Continue to Details" / "Review Plan" / "Generate X images")

Visible on Steps 1-4. Replaces the current inline bottom buttons on each step.

**File**: Create `ProductImagesStickyBar.tsx`. Remove inline footer buttons from Steps 1-4 and add bottom padding to compensate for the bar height.

### 3. Scene Preview Placeholders

Add placeholder preview images to scene cards. Each `SceneCard` gets a gradient/illustration placeholder area (aspect-[4/3]) above the text content. Use subtle gradient backgrounds with scene-type-specific colors (warm for lifestyle, cool for studio, etc.) and a small camera/image icon overlay.

Update `SceneCard` in `ProductImagesStep2Scenes.tsx` to render preview area. The `ProductImageScene` type already has `previewUrl?: string` — render it if present, otherwise show the styled placeholder.

### 4. Expand Universal Scenes

Add these to `GLOBAL_SCENES` in `sceneData.ts`:
- **Flat Lay** — "Product arranged in a flat lay composition with complementary props and styling." Chips: Overhead, Styled, Arrangement. Triggers: sceneEnvironment, branding, layout.
- **Group / Collection Shot** — "Multiple products or variants shown together in a cohesive composition." Chips: Set, Bundle, Collection. Triggers: background, branding, layout, consistency.
- **Social Media Ready** — "Optimized for Instagram, TikTok, and social feeds with bold framing." Chips: Feed, Story, Bold. Triggers: background, visualDirection, branding.
- **Seasonal / Holiday** — "Product in seasonal or holiday-themed setting." Chips: Season, Holiday, Themed. Triggers: sceneEnvironment, visualDirection, branding.
- **Shadow & Light Play** — "Dramatic shadow and light composition for premium feel." Chips: Shadow, Light, Dramatic. Triggers: visualDirection, branding, layout.

Remove `wide-banner` from GLOBAL_SCENES.

### 5. Redesign Step 3 — Adaptive Details

Replace the all-collapsible layout with a card-based sectioned form:

- **Always-visible sections** at top: Format/Size selector, Image Count per scene, Quality toggle
- **Smart inline sections**: When person-related scenes are selected (In-Hand, portrait, etc.), show the person details as a prominent inline card with visual selectors (not hidden in a collapsible)
- **Collapsibles only for advanced/optional** blocks: custom note, consistency, branding visibility
- Group related fields together with clear visual hierarchy
- Add chip-style selectors instead of dropdown selects for common choices (skin tone, action type, etc.)

### 6. Add Format/Size Selector

Add aspect ratio selection to Step 3 (or as part of the sticky bar). Reuse the existing `AspectRatioMultiSelector` component from `AspectRatioPreview.tsx`. Store in `details.aspectRatio` or a new top-level state `selectedAspectRatios: Set<AspectRatio>`.

Update credit calculation: `products × scenes × aspectRatios × creditsPerImage`.

Update the generation handler in `ProductImages.tsx` to loop over selected aspect ratios when building payloads.

### 7. Add Image Count Selector

Add a "Images per scene" selector (1, 2, 3, 4) to Step 3. Default: 1. Multiply into credit calculation.

### 8. Add Quality Toggle

Add Standard/Pro quality toggle. Pro = 6 credits, Standard = 3 credits (matching existing system). Default: Pro.

### 9. Large Batch Warning

In Step 4 (Review), if total images > 20, show an info banner: "Large batch — generation may take several minutes. You can leave this page and find results in your library."

### 10. Stale Detail Cleanup

When user navigates back from Step 3 to Step 2 and changes scene selection, auto-clear detail fields that are no longer triggered by any selected scene. Add a `useEffect` in `ProductImages.tsx` that watches `selectedSceneIds` and prunes `details` of keys belonging to un-triggered blocks.

## Files to Create
- `src/components/app/product-images/ProductContextStrip.tsx`
- `src/components/app/product-images/ProductImagesStickyBar.tsx`

## Files to Modify
- `src/pages/ProductImages.tsx` — Add new state (aspectRatios, imageCount, quality), render context strip & sticky bar, stale detail cleanup, update generation handler for ratios/count/quality
- `src/components/app/product-images/ProductImagesStep2Scenes.tsx` — Add preview placeholders to SceneCard, remove inline footer buttons
- `src/components/app/product-images/ProductImagesStep3Details.tsx` — Full redesign: add format/size/quality/count at top, inline person details, chip selectors
- `src/components/app/product-images/ProductImagesStep4Review.tsx` — Add large batch warning, show aspect ratio & quality in summary, remove inline footer buttons
- `src/components/app/product-images/ProductImagesStep1Products.tsx` — Remove inline footer buttons
- `src/components/app/product-images/sceneData.ts` — Add 5 new global scenes, remove wide-banner
- `src/components/app/product-images/types.ts` — Add `aspectRatio`, `imageCount`, `quality` to DetailSettings or create separate state types
- `src/components/app/product-images/detailBlockConfig.ts` — Add trigger mappings for new scenes

