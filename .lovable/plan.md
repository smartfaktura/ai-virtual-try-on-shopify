
I reviewed the current Freestyle mobile code and your screenshots. The core issues are real and come from 3 places: (1) extra outer padding around the prompt panel, (2) chip buttons hard-capped at `max-w-[140px]`, and (3) mobile selectors still using popovers instead of proper mobile modals (no explicit close, bad keyboard behavior).

## Implementation plan

### 1) Make the prompt bar truly full-width on mobile
**Files:** `src/pages/Freestyle.tsx`, `src/components/app/freestyle/FreestylePromptPanel.tsx`

- Remove mobile horizontal wrapper padding around `FreestylePromptPanel` (`px-4` / `pr-*`) so panel can go edge-to-edge.
- Keep desktop spacing unchanged (`lg:max-w-2xl` remains desktop-only).
- Keep internal content padding, but reduce it slightly on mobile for better usable width.
- Use stable mobile height behavior (avoid forced `100dvh` jitter on keyboard open) to reduce flashing/reflow.

### 2) Redesign mobile chip layout to fit more content + show previews
**File:** `src/components/app/freestyle/FreestyleSettingsChips.tsx`

- Rework mobile chips into a denser layout:
  - Primary row/group: Upload, Product, Model, Scene (larger, clearer touch targets).
  - Secondary row/group: Framing, Brand, Ratio, Camera, Quality (compact but readable).
- Pass `fullWidth` intentionally where useful.
- Ensure selected chips always show thumbnail/avatar clearly (not clipped/truncated too aggressively).

### 3) Fix chip width logic so “fullWidth” actually works
**Files:**  
`src/components/app/freestyle/ProductSelectorChip.tsx`  
`src/components/app/freestyle/ModelSelectorChip.tsx`  
`src/components/app/freestyle/SceneSelectorChip.tsx`  
`src/components/app/freestyle/BrandProfileChip.tsx`  
`src/components/app/FramingSelectorChip.tsx`

- Remove/override hard `max-w-[140px]` when `fullWidth` is enabled.
- Add mobile-specific sizing classes so labels and selected image/avatar stay visible.
- Keep desktop chip sizing as-is.

### 4) Replace mobile popovers for Product/Model/Scene with proper mobile modal/sheet UX
**Files:** same selector chip files above (plus optional small shared mobile picker wrapper)

- On mobile only: use full-height bottom sheet/dialog style instead of anchored popover.
- Add sticky header with clear title and explicit **Close (X)** button.
- Keep desktop as popovers (no regression to desktop UX).
- Product/model grids become larger (mobile-friendly, likely 2 columns) so images are easy to see.
- Scene picker opens in mobile-friendly full view directly (no tiny cramped state).

### 5) Stop zoom + flashing behavior in picker flows
**Files:** selector chip files + `Freestyle.tsx`

- Product search input: mobile font size at least 16px and disable aggressive autofocus on mobile.
- Ensure modal content scroll is contained (`overflow-y-auto`, sticky header) so keyboard doesn’t break layout.
- Reduce animation/positioning churn on mobile picker open/close to eliminate visible flashing.

## Acceptance checklist (what I’ll verify after implementation)

1. Prompt panel spans full usable width on mobile (no awkward left/right card gaps).
2. Chips show more readable content and selected thumbnails/avatars.
3. Product/Model/Scene pickers open in mobile sheet/dialog with visible close button.
4. Picker content fits screen with keyboard open (no clipped top, no inaccessible controls).
5. No iOS-style input zoom jump and no flashing/repaint effect during open/close.
6. Desktop Freestyle layout and picker behavior remain unchanged.
