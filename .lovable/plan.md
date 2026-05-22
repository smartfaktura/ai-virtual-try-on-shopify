# Phase 7z — error UX refinement, simpler family cards, structured cast step

Three focused polish changes for `/app/brand-scenes/new`. Frontend/presentation only.

## 1. Refined error / missing-field treatment

Current state is loud and feels broken: a pulsing red dot + red text ("Pick a starting point") floats above the sticky bar, and required sections show a red asterisk.

**`src/features/brand-scenes/wizard/WizardLayout.tsx`** (lines 170–179) — replace the floating red error line with a quieter inline pill rendered **inside** the sticky card, above the buttons:

```text
[ ◷ Pick a starting point ]
```

- Container: `rounded-full border border-border bg-muted/40 px-3 py-1.5 text-[11px] text-muted-foreground` with a small static `Lock` (or `Info`) icon, no animation.
- Mobile + desktop: render inside the same card the buttons live in (drops the standalone red line above the card entirely).
- Tooltip on hover/focus of the disabled Next button stays as-is (already neutral).

**`src/features/brand-scenes/wizard/components/Section.tsx`** — soften the required treatment:
- Replace the red `*` (`text-destructive/80`) with a small `Required` chip next to the label: `text-[9px] uppercase tracking-[0.18em] text-muted-foreground/70`.
- When `missing`, drop any destructive coloring on labels; instead add a subtle `ring-1 ring-border` + `bg-muted/20` wrapper around the section content so the user sees focus without alarm. Keep `data-missing="1"` on the wrapper so the existing "scroll to first missing" logic in `WizardLayout.handleNextClick` still works.

No behavior changes — only visual tone.

## 2. Family cards — titles only

**`src/features/brand-scenes/wizard/steps/Step1ChooseModule.tsx`**:
- Delete the `FAMILY_BLURBS` map and stop passing `body` to `WizardCard`.
- Cards become title-only ("Fashion", "Footwear", …) — `WizardCard` already gracefully omits `body` when not provided.
- Tighten card sizing: reduce min height by adjusting padding on the title-only branch (small follow-up in WizardCard: `p-5` stays; nothing else needed).
- Keep the existing "ships soon" footnote for locked modules.

Step subtitle on this step ("Your saved scene will appear under this category in your library") already lives in `BrandSceneWizard.tsx` and stays.

## 3. Step 3 ("Who's in the scene?") — clear groupings

The step renders ~12 Sections in conditional sequence, which reads as a random wall of chip rows. Introduce visual grouping headers so the eye lands on logical clusters.

**`src/features/brand-scenes/wizard/steps/Step4Cast.tsx`**:

Wrap existing Sections into 5 named groups using a new lightweight `<GroupHeader>` (defined inline at the top of the file):

```tsx
function GroupHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="pt-2 first:pt-0">
      <div className="text-[11px] font-semibold tracking-tight text-foreground/90">
        {title}
      </div>
      {hint && (
        <p className="text-[11px] text-muted-foreground/70 mt-0.5 leading-relaxed">
          {hint}
        </p>
      )}
      <div className="mt-3 h-px bg-border/70" />
    </div>
  );
}
```

Group order and contents (reorders existing Sections — no logic changes):

1. **People** — `Who's in the shot`, Gender, Age, Energy / vibe, Build, EthnicityChips.
2. **Product interaction** — `Product interaction`, Hands on product, Body-part focus.
3. **Behavior & energy** — Gaze direction, Group dynamic, Action / energy.
4. **Styling & wardrobe** — Wardrobe color anchor, the existing "Optional styling — skip and we'll pick smart defaults" extras block (collapsed inside this group; remove its own duplicate divider since the GroupHeader now provides one).
5. **Product scale** — Product scale + exact dimensions toggle.
6. **Notes** — Cast note textarea.

Each group's existing conditional visibility is preserved by wrapping the group in a fragment that early-returns `null` when none of its inner Sections render (helper: `groupHasContent` boolean computed inline). Replicate-mode (`isReplicate`) still hides most groups exactly as today; only "People (limited)" + "Product scale" + the replicate hint render.

Warnings block stays after groups, before the existing extras block (which now lives inside Styling & wardrobe).

The `<GroupHeader>` only renders when the group will produce visible content; no empty headers.

---

## Out of scope
- No changes to generation pipeline, schemas, RLS, prompt assembler, or tests.
- No copy edits beyond removing family blurbs and the loud error line.
- No restructuring of Section/Chip primitives beyond the small `missing`/`required` style update.

## Files touched
- `src/features/brand-scenes/wizard/WizardLayout.tsx`
- `src/features/brand-scenes/wizard/components/Section.tsx`
- `src/features/brand-scenes/wizard/steps/Step1ChooseModule.tsx`
- `src/features/brand-scenes/wizard/steps/Step4Cast.tsx`

## Test impact
Existing 175 tests should continue to pass — no schema, prompt, or routing changes. Spot-check that any test asserting `data-missing="1"` still finds it on the Section wrapper.
