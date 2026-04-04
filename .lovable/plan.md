

# Product Images Flow — Round 5 Fixes

## 3 Changes

### 1. Split "Generation Settings" into its own step (Step 3), move scene-specific details to Step 4

**Current**: Step 3 mixes format/quality/count cards with scene-triggered detail blocks. The stepper has 6 steps: Products → Scenes → Details → Review → Generate → Results.

**Fix**: Insert a new step between Scenes and the current Details:
- **Step 3 "Settings"** — Format/Size (with small shape icons on each chip), Quality, Images per scene. Clean, simple.
- **Step 4 "Refine"** — Scene-triggered detail blocks only (model picker, action, environment, focus, etc.) + custom note. Renamed from "Details" for clarity.
- Review becomes Step 5, Generate Step 6, Results Step 7.

**Files**:
- `types.ts` — Change `PIStep` from `1-6` to `1-7`
- `ProductImages.tsx` — Update `STEP_DEFS` to 7 steps, add new step routing, update `canNavigateTo`, `canProceed`, `handleNext`, `handleBack`. Extract generation settings (aspectRatio, quality, imageCount) into Step 3 component, scene details into Step 4.
- New `ProductImagesStep3Settings.tsx` — Format/Size with small shape SVG icons (square, portrait, story, landscape outlines next to each label), Quality chips, Images per scene chips. Simple and focused.
- Rename current `ProductImagesStep3Details.tsx` → keep file but remove the "Generation settings" section (format/quality/imageCount cards). It becomes only the scene-triggered blocks. Update heading to "Refine your scenes" with subtitle "Optional tweaks based on your selected scenes."

### 2. Format/Size chips get small shape icons

In the new Step 3 Settings component, each aspect ratio chip will have a tiny inline SVG shape icon before the label:
- 1:1 → small square outline
- 4:5 → tall rectangle outline
- 3:4 → slightly tall rectangle
- 9:16 → very tall thin rectangle
- 16:9 → wide rectangle

These are simple 12×12 inline SVGs rendered inside each chip.

### 3. Sticky bar — use solid card style matching other workflows

**Current**: Semi-transparent backdrop-blur bar that looks faint and conflicts with floating elements.

**Fix**: Replace with a solid `bg-background` card-style bar similar to the credit summary sections used in TryOnSettingsPanel and CatalogStepReviewV2. Specifically:
- Solid `bg-background` (no transparency/blur)
- `border border-border rounded-xl shadow-lg` — floating card look
- `fixed bottom-4 left-[var(--sidebar-width,0px)] right-4` with proper z-index — sits above content but leaves room for the chat button (which is at `bottom-20`)
- Stronger text contrast: summary numbers in `font-bold text-foreground`, credits with colored icon
- Compact but clear layout

**File**: `ProductImagesStickyBar.tsx` — full restyle. Update step labels for new 7-step flow.

## Summary

| File | Change |
|------|--------|
| `types.ts` | `PIStep` becomes `1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7` |
| `ProductImages.tsx` | 7-step flow, new step routing, pass settings props to Step3Settings |
| New `ProductImagesStep3Settings.tsx` | Format (with shape icons), Quality, Images per scene |
| `ProductImagesStep3Details.tsx` | Remove generation settings section, keep only scene blocks + custom note, rename heading |
| `ProductImagesStickyBar.tsx` | Solid card-style floating bar, updated step labels for 7 steps |

