
## Mobile fit fix — pills overflow on 390px

From screenshot at 390px: "Scene" clips left, "Generate" clips right. Pills row exceeds card width.

### Root cause
At 390px viewport, the card spans nearly full width (~358px). Inner block has `px-3` (24px total) leaving ~334px for pills. Current mobile pill widths still exceed this when 4 pills sit in `flex-nowrap` + `justify-center` — overflow distributes symmetrically and clips both edges.

### Fix (single file: `src/components/app/FreestylePromptCard.tsx`)

**1. Hide the pill labels on mobile, keep only the avatar/icon circles**
- Wrap each pill's text label in a `hidden sm:inline` span. Mobile shows just the small circle/icon — tight, elegant, no clipping.
- Generate pill: keep the Zap icon visible, hide "Generate" label on mobile.

**2. Tighten further as backup**
- Mobile inner padding: `px-3` → `px-2`.
- Mobile pill: `px-1` → `p-1` (square, just hugs the avatar).
- Mobile gap: keep `gap-1`.

**3. Keep desktop unchanged**
Desktop still shows full labels (Scene · Model · Product · Generate) — the previous fix already works there.

### Acceptance
- 390px: 4 small circular pills fit comfortably centered, no clipping.
- ≥640px (sm+): Full labeled pills as today.
- No other layout changes.
