

## Goal
On the asset/lightbox panel, make the **"Submit for Review"** button match the **"Copy Caption"** button styling exactly — same variant, size, and visual weight. No other changes.

## Approach
1. Grep for "Submit for Review" and "Copy Caption" to locate the host component (likely a lightbox/asset panel in `src/components/app/library/**`).
2. Read both button definitions side-by-side.
3. Update "Submit for Review" button's classes/variant/size to mirror "Copy Caption" — keep handler & label intact.

## Files likely touched
- One file (the panel that renders both cards) — to be confirmed by grep before editing.

## Out of scope
- No card consolidation, no modal changes, no copy edits.

