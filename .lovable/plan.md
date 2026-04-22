

## Improve Prompt Builder modal on mobile (all steps)

### Problem (from screenshot)

Prompt Builder on mobile uses a `Dialog` taking the full screen, with categories rendered in a 3-column grid. Cards stretch tall awkwardly, labels wrap onto 3 lines ("Fashion & Apparel" → 3 lines), and the dialog style doesn't match the Model / Product / Scene Look bottom-sheet pattern used elsewhere in `/app/freestyle`. Steps 2–6 have similar density issues with cramped 2- and 3-column grids.

### Approach

Bring the Prompt Builder in line with the rest of the freestyle UI by:

1. **Switch container to a bottom Sheet on mobile** (matches Model/Product/Scene pickers).
2. **Use a uniform 2-column grid for all option grids on mobile** so cards don't squeeze to 3-up.
3. **Switch card layout to horizontal (icon left, text right) on mobile** — fixes the 3-line label wrap and gives cards a calm, predictable height.
4. **Keep desktop/tablet (≥768px) untouched** — current Dialog + 3/4-column grids are fine there.

### Changes — `src/components/app/freestyle/PromptBuilderQuiz.tsx` only

**Container swap (mobile only)**
- Replace the mobile branch of `<DialogContent>` with `<Sheet><SheetContent side="bottom">` matching `SceneCatalogModal`'s pattern: `h-[92dvh] rounded-t-2xl p-0 flex flex-col`, `onOpenAutoFocus={(e) => e.preventDefault()}`.
- Desktop keeps `<Dialog>` exactly as-is (`max-w-2xl max-h-[80vh] rounded-2xl`).
- Conditional render: `isMobile ? <Sheet>…</Sheet> : <Dialog>…</Dialog>`. Header / progress / step content / footer extracted to a shared inner block so there is zero duplication.

**Mobile-aware OptionCard**
- Add an `isMobile` prop (or read `useIsMobile` once and pass via closure).
- Mobile layout: `flex-row items-center gap-3 p-3.5 text-left` with icon in a 36×36 rounded tile on the left, label + description stacked on the right. Min-height removed; cards size to content → uniform across the grid.
- Desktop layout: unchanged (`flex-col items-center gap-2 p-4 sm:p-5 text-center`).
- Selected state: keep `border-primary bg-primary/5 ring-2 ring-primary/15`. Move the `Check` badge to top-right on both layouts (already there; works for both).

**Grid columns per step (mobile only — desktop unchanged)**
- Category step: `grid-cols-2 sm:grid-cols-4` (was `grid-cols-3 sm:grid-cols-4`).
- Subject step (With Person + Product Only sections): `grid-cols-1 sm:grid-cols-3` — single column on mobile so 2-line labels never collide.
- Interaction: `grid-cols-1 sm:grid-cols-2`.
- Setting / Mood / Framing: `grid-cols-2 sm:grid-cols-3` stays — but with the new horizontal mobile card the 2-up reads cleanly.
- Section pills (`With Person` / `Product Only`) and headings unchanged.

**Header & footer polish on mobile**
- Header padding `px-5 py-3.5`, title text-base, "Step X of Y" pill unchanged.
- Add a small drag-handle bar (`h-1 w-10 rounded-full bg-muted mx-auto mt-2 mb-1`) at the top of the SheetContent on mobile to mirror Scene Look modal affordance.
- Footer: keep Back / Next pill buttons; on mobile make them `flex-1` so they span equally (`justify-between` row with both buttons full-tap-target).

**Review step on mobile**
- Reduce card padding from `p-5 sm:p-6` to `p-4 sm:p-6`.
- Textarea min-height stays 140px — fine on mobile sheet.

### Untouched

- All quiz logic, step ordering, `assemblePrompt`, all template files (`promptBuilderTemplates.ts`).
- Desktop ≥768px layout (Dialog, 3/4-col grids, centered card style).
- `FreestylePromptPanel.tsx`, settings chips, hooks, RLS, edge functions.
- The "Prompt Helper" trigger button itself.

### Validation (390×818 mobile)

- Modal slides up from bottom like Model / Product / Scene Look pickers (consistent UX).
- Step 1 (Category): 2-column grid, each card a horizontal row — icon tile left, "Fashion & Apparel" + "Clothing, shoes" stacked right, label fits on one line, all 11 cards equal height.
- Step 2 (Subject): With Person + Product Only sections each 1-column on mobile; cards readable, no awkward wrap.
- Steps 3–6 (Interaction / Setting / Mood / Framing): 2-column horizontal cards, uniform height.
- Step 7 (Review): textarea + Edit toggle work as before; footer Back / Use This Prompt buttons span full width.
- Desktop ≥768px: completely unchanged.

