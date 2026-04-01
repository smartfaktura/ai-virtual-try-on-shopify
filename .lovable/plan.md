

# Improve Bulk Image Grid & Multi-Motion UX

## Problems identified
1. **Duplicate "Images (4)" label** — Line 757 renders `Images (${bulkImages.length})` as a label, but the `BulkImageGrid` component already shows its own count header. Result: "Images (4)" appears twice.
2. **"Customize per image" toggle** — Floating card with odd spacing/styling; should be visually integrated with the image grid above it.
3. **Multi-camera motion** — The `MultiChipRow` component exists and is wired correctly, but there's no visual indicator for free users that this is a paid feature. Need VOVV.AI avatar-branded upsell messaging next to Camera Motion for free users.

## Changes

### 1. Remove duplicate image count label (`AnimateVideo.tsx`)
Delete the `<label>Images ({bulkImages.length})</label>` wrapper (lines 755-758) in the post-upload section. The `BulkImageGrid` already displays the count. Keep only the grid itself.

### 2. Integrate "Customize per image" into the image grid card (`AnimateVideo.tsx`)
Instead of rendering the customize toggle as a separate bordered card below the grid, merge it into the same visual container as the `BulkImageGrid`:
- Wrap the grid + customize toggle in a single `rounded-xl border bg-card p-4` container
- The toggle becomes a subtle row at the bottom of the grid card with a divider
- When expanded, the thumbnail tab bar and overrides render inside the same card

### 3. Add VOVV avatar upsell for multi-camera motion (`MotionRefinementPanel.tsx`)
When `multiSelect` is false (free user):
- Below the Camera Motion `ChipRow`, add a small inline banner with Sophia's avatar: "Select multiple camera motions with any paid plan" + "Upgrade" link
- Styled as a subtle muted row (similar to the Batch Mode upsell pattern)

When `multiSelect` is true (paid user):
- The existing `MultiChipRow` is already correct — just add a small helper text: "Select multiple to generate one video per motion"

New props on `MotionRefinementPanel`: `isPaidUser?: boolean` to control the upsell display.

## Files to modify
- **`src/pages/video/AnimateVideo.tsx`** — Remove duplicate label, merge customize toggle into grid card
- **`src/components/app/video/MotionRefinementPanel.tsx`** — Add VOVV avatar upsell for free users next to Camera Motion

