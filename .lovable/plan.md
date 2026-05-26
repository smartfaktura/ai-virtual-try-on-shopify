## What's happening

Two separate bugs combine on the Look step:

1. **The flash / "skipped" feeling** — In `Step4Cast.tsx`, `setMode("yes")` (Design the look) immediately calls `onSubStepChange?.("essentials")`. So the moment the user clicks "Design the look", the wizard auto-jumps from Look → Essentials. There is no acknowledgement that the choice was registered, no chance to click Next — it looks like the Look step was skipped.

2. **Maximum update depth exceeded** — `BrandSceneWizard.tsx` line 166-173 has:
   ```ts
   useEffect(() => {
     if (!onCastStep || step4Mode !== "skip") return;
     setVisitedSubSteps((prev) => {
       const next = new Set(prev);
       for (const t of step4Flow.visibleTabs) next.add(t);
       return next;  // always returns a new Set ref, even when nothing changed
     });
   }, [onCastStep, step4Mode, step4Flow.visibleTabs]);
   ```
   `computeStep4Flow` is called every render and returns a fresh `visibleTabs` array, so the effect re-runs forever, each time committing a new `Set` reference → React bails out with "Maximum update depth exceeded". This fires whenever Auto-cast is selected (and likely contributes to the flash visible in the replay).

## Fix

**File 1 — `src/features/brand-scenes/wizard/steps/Step4Cast.tsx`** (`setMode`, ~line 229-232)

Remove the auto-advance for "Design the look". The Look step should stay active after the user picks a branch; the wizard's footer Next button advances to Essentials. Auto-cast already seeds defaults and can stay where it is (showing the AutoCastSummary on the same Look pane).

```ts
} else {
  onCastChange({ extras: nextExtras });
  // (no auto-advance — let the user confirm by hitting Next)
}
```

Also stop calling `onSubStepChange?.("essentials")` for "skip" if any similar branch exists — currently only "yes" does so; "skip" stays on Look (correct, since AutoCastSummary renders there).

**File 2 — `src/features/brand-scenes/wizard/BrandSceneWizard.tsx`** (visited effect, ~line 166-173)

Make the Set update a true no-op when nothing changes, so the effect doesn't re-render forever:

```ts
useEffect(() => {
  if (!onCastStep || step4Mode !== "skip") return;
  setVisitedSubSteps((prev) => {
    let changed = false;
    const next = new Set(prev);
    for (const t of step4Flow.visibleTabs) {
      if (!next.has(t)) { next.add(t); changed = true; }
    }
    return changed ? next : prev;
  });
}, [onCastStep, step4Mode, step4Flow.visibleTabs]);
```

## Result

- Clicking "Design the look" highlights the card and enables Next; no flash, no jump.
- Clicking "Auto-cast" highlights the card, shows the AutoCastSummary inline, enables Next; no infinite-loop warning.
- Next behaviour for Step 4 is unchanged (Look → Essentials → optional tabs).
