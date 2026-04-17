

## Fix workflow card layout — too tall, content sitting too high

### Issue from screenshot
On the 3-col desktop grid (`/app/workflows`), cards have `auto-rows-fr` applied. Because the Selfie/UGC card has 2 lines of description while others have shorter text, the row stretches to a tall height (~850px). The thumbnail keeps its `aspect-[3/4]` ratio at the column width (~470px → ~625px tall), but `auto-rows-fr` then forces the whole card row taller, leaving the title/description/button block compressed at the bottom and a visual mismatch where content sits "too high" relative to the thumbnail.

Also: at this 3-col layout each card is quite large (~470px wide) — the user says "little too small" actually means the cards feel awkward because the wide thumbnail + short content = unbalanced. Better fix: tighten thumbnail aspect from `aspect-[3/4]` (1.33x tall) to `aspect-[4/5]` (1.25x tall) on desktop. Slightly less tall thumbnail → cards naturally shorter → less stretching needed.

### Root cause
1. `auto-rows-fr` on the grid is forcing all cards to match the tallest, creating wasted vertical space inside shorter cards.
2. `aspect-[3/4]` thumbnail is too tall on desktop at 3-col / 4-col widths.

### Changes

**File: `src/pages/Workflows.tsx`**
- Remove `auto-rows-fr` from the workflow grid (around line 561). Let cards size to their content. Consistency comes from the fixed thumbnail aspect + 2-line clamp on subtitle (already in place).

**File: `src/components/app/WorkflowCardCompact.tsx`** (around line 117 — thumbnail aspect)
- Change desktop thumbnail aspect from `aspect-[3/4]` to `aspect-[4/5]` (slightly less tall, more balanced for the wider desktop columns).
- Keep `aspect-[2/3]` for mobileCompact (mobile already feels right).
- Keep `aspect-[3/4]` for modalCompact (modal context unchanged).

**File: `src/components/app/FreestylePromptCard.tsx`** 
- Match the same aspect change so Freestyle card aligns with workflow cards on desktop (`aspect-[3/4]` → `aspect-[4/5]` for non-mobile).

### Acceptance
- Workflow cards on `/app/workflows` desktop have balanced thumbnail-to-content ratio; no big empty band above the Start button.
- All cards in a row share roughly the same height naturally (via fixed aspect + 2-line clamp), no `auto-rows-fr` stretching.
- Mobile and modal layouts unchanged.

