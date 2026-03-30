

## Remove 3 Scenes from Environment Showcase

**File:** `src/components/landing/EnvironmentShowcaseSection.tsx`

Remove these 3 entries from `ROW_2` (lines 37-39):
- `e('Garden Natural', 'pose-lifestyle-garden.jpg')`
- `e('Studio Close-Up', 'pose-studio-closeup.jpg')`
- `e('Studio Crossed Arms Male', 'pose-studio-arms-male.jpg')`

This leaves ROW_2 with 7 items (vs ROW_1's 10). The marquee still works fine with unequal row lengths.

**How scenes were chosen:** These were hand-picked when the section was built — a mix of freestyle generation outputs (the `d()` entries pointing to `freestyle-images` bucket) and built-in pose previews (the `e()` entries pointing to `landing-assets/poses/`). There's no automated selection logic. If you want to add different scenes later, you can tell me which ones to add or upload new images.

