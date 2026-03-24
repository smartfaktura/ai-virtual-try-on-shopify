

# Fix Public Freestyle: Deleted Scenes, Mobile Spacing, Double Tooltip, CMD+V

## Issues

1. **Deleted scenes showing in scene picker**: `SceneSelectorChip` internally fetches its own scene list from `mockTryOnPoses` + `useCustomScenes` + `useHiddenScenes`. It applies `filterVisible` internally. The issue is that `useHiddenScenes` queries the `hidden_scenes` table which may require auth or has different RLS for anon users — so hidden scenes aren't filtered for public visitors. Need to verify RLS, but the simpler fix is that the scene chip already handles this internally, so the problem is likely that anon users can't read `hidden_scenes`.

2. **Mobile prompt bar gap**: The prompt bar has `pb-4 sm:pb-6` padding on the wrapper div (line 392), creating a gap between the bar and screen bottom on mobile. Should be `pb-0 sm:pb-6`.

3. **Double tooltip on Brand chip**: `BrandProfileChip` has its own internal `Tooltip` (lines 33-68), AND `FreestyleSettingsChips` wraps it in another `Tooltip` when disabled (lines 284-301, 338-355). This shows two tooltips stacked.

4. **CMD+V paste not working**: `FreestylePromptPanel` paste handler checks `if (!onFileDrop) return` (line 114), but `PublicFreestyle` doesn't pass `onFileDrop` prop.

## Changes

### 1. `src/pages/PublicFreestyle.tsx`
- Pass `onFileDrop` prop to `FreestylePromptPanel` that creates a local `URL.createObjectURL` preview (same as `handleUploadClick` logic)
- Change prompt bar wrapper padding from `pb-4` to `pb-0` on mobile

### 2. `src/components/app/freestyle/FreestyleSettingsChips.tsx`
- When `disabledChips.brand` is true, do NOT wrap in an outer `Tooltip`. Instead, render the `BrandProfileChip` directly but with `open={false}` and pass a custom tooltip text override. Since `BrandProfileChip` already has a tooltip internally, we need a different approach:
  - Render a simple button that looks like the brand chip (same styling) but with the disabled tooltip text, bypassing `BrandProfileChip` entirely when disabled
  - OR: simpler — just render `BrandProfileChip` with `open={false}` and override its internal tooltip by not wrapping in another one. The fix: remove the outer Tooltip wrapper for brand, and instead pass the disabled state differently.
  - **Cleanest fix**: Remove the outer `<Tooltip>` wrapper for disabled brand. Instead, render a standalone disabled-looking button with a single tooltip (not using `BrandProfileChip` at all when disabled).

### 3. Scene visibility for anon users
- Check `hidden_scenes` RLS — if anon can't read it, `filterVisible` returns all scenes (empty hiddenIds). Will check and add anon SELECT policy if missing.

### Files
- `src/pages/PublicFreestyle.tsx` — add `onFileDrop`, fix mobile bottom padding
- `src/components/app/freestyle/FreestyleSettingsChips.tsx` — fix double brand tooltip
- Possibly: database migration to add anon SELECT on `hidden_scenes`

