

## Fix WorkflowRequestBanner — desktop layout + mobile right-aligned button

### Issues from screenshots
1. **Desktop (screenshot 2):** Banner is now extremely wide (full width with empty right space) because parent grid uses `auto-rows-fr` → row stretches to match Catalog/Freestyle card height (~600px). Banner sits in a tall empty box.
2. **Mobile (screenshot 1):** Share Request button stacks below text on its own row, left-aligned. User wants compact row: avatars + text on left, button on right (same line).

### Root cause
- `WorkflowRequestBanner` is rendered inside a `grid` with `auto-rows-fr` (added in last patch for even card heights). `col-span-full` makes it span all columns, but `auto-rows-fr` forces it to match the tallest row. Need to opt this row out of `auto-rows-fr`.
- Mobile layout uses `flex-col sm:flex-row` — switches to row at `sm` (640px). At <640px (real mobile) it stacks vertically, button goes full-width below. User wants horizontal even on mobile.

### Changes

**File: `src/pages/Workflows.tsx`** (around line 561 — the grid wrapping the banner)
- The banner needs to escape `auto-rows-fr`. Move `WorkflowRequestBanner` OUT of the `auto-rows-fr` grid into its own block right below the grid (still inside the same section). Keeps card grid uniform-height while banner sizes to content.

**File: `src/components/app/WorkflowRequestBanner.tsx`**
- Collapsed state container (line ~58): change `flex-col sm:flex-row items-start sm:items-center justify-between gap-4` → `flex-row items-center justify-between gap-3 sm:gap-4` so avatars+text and button always sit on the same row.
- Inner left block: keep avatars + text. On mobile, hide the secondary subtitle ("Tell us what you need…") OR keep it — it can wrap under the title since text block is `min-w-0 flex-1`. Probably cleaner: keep title only on mobile, show subtitle from `sm:` up.
- Avatar count on mobile: reduce from 4 to 3 to save space (`AVATARS.slice(0, isMobile ? 3 : 4)` — or simpler: hide last avatar with `hidden sm:flex` on the 4th).
- Button: keep current size (`h-10 px-5`), shrink label on mobile to just the icon + "Request" or keep "Share Request" — at `h-10` with `text-sm` it should fit on a 375px viewport alongside 3 avatars + 1-line title. Confirmed by screenshot 1 the button at h-10 fits, just needs to be on the right.
- Remove the `col-span-full` class from the root (no longer needed once it's outside the grid).
- Padding: reduce mobile padding from `p-5 sm:p-8` → `p-4 sm:p-6` for tighter mobile feel.

### Acceptance
- Desktop: banner sits as a normal-height row below the workflow grid, no giant empty space; visually similar to before the `auto-rows-fr` change.
- Mobile: avatars + "Missing a Visual Type for your brand?" on left, Share Request button on right, single row, button right-aligned.
- Workflow grid cards above still have uniform heights (auto-rows-fr preserved on the grid).

