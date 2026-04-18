

## Freestyle card — fix overflow + remove watermark

### Issues from screenshot
1. **Pills overflow** — "Generate" pill clips off the right edge ("Gener..."); "Scene" pill clips on the left.
2. **Empty space top + bottom** — content block isn't truly centered, prompt sits with too much vertical breathing room while pills hang off-screen.
3. **VOVV.AI watermark** — user wants it removed.

### Root cause
- Inner block uses `w-[88%]` AND pills use horizontal padding `px-2 py-0.5` with avatar `w-5 h-5` + label text. Total pill row width exceeds 88% of container at 1276px viewport when the card sits in a 4-col grid (~290px wide).
- `justify-center` + `flex-nowrap` + `overflow-hidden` causes pills wider than container to overflow symmetrically (clipping both edges).

### Changes (single file: `src/components/app/FreestylePromptCard.tsx`)

**1. Remove VOVV.AI watermark**
Delete lines 143–150 entirely.

**2. Make inner block fit container width**
- Change `w-[88%]` → `w-full px-4` (desktop) / `w-full px-3` (mobile). Gives pills the full available width to breathe.

**3. Make pills fit cleanly**
- Reduce pill padding: `px-2` → `px-1.5` (desktop), `px-1.5` → `px-1` (mobile).
- Reduce avatar size: `w-5 h-5` → `w-4 h-4` desktop; `w-4 h-4` → `w-3.5 h-3.5` mobile.
- Tighten gap between pills: `gap-1.5` → `gap-1` desktop; keep `gap-1` mobile.
- Tighten icon-to-label gap inside pill: `gap-1` → `gap-0.5`.
- Allow gentle shrink: keep `flex-nowrap` but remove `overflow-hidden` on the row so nothing clips; the reduced widths above will fit at all card sizes in the grid.

**4. Tighten vertical composition**
- Reduce prompt bar `min-h`: `110px` → `92px` desktop; `88px` → `76px` mobile. Less wasted vertical space, prompt + pills sit as a balanced cluster.
- Reduce gap between prompt bar and pills: `gap-3` → `gap-2.5`.

### Acceptance
- All 4 pills (Scene, Model, Product, Generate) fully visible, no clipping at 4-col, 3-col, 2-col grid widths.
- No VOVV.AI watermark.
- Prompt bar and pills feel like a centered, balanced cluster — no large empty band above or below.
- Card height + padding still byte-identical to sibling `WorkflowCardCompact`.

