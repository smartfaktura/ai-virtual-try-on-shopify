Three small fixes to the brand-scene wizard.

## 1) Rename the save CTA
In `Step6PreviewAndPick.tsx`:
- Button label "Save to library · free" → **"Save to Brand Scenes"**.
- Drop the "Saving is free." sentence from the body copy of the picker card — the action itself is the call to action.

## 2) Pre-select an "As reference image" pose pill in the reference flow
**Problem:** In reference flow, the Cast → Interaction step asks for a pose, but there's no way to say "just follow the reference's pose". Users can't reproduce the look of their uploaded image.

**Solution** in `Step4Cast.tsx` → `InteractionTab` (and a tiny constant addition):

- Thread the existing `isReference` prop into `InteractionTab` (currently it's available in the parent `Step4Cast` but not forwarded).
- Define a canonical reference-pose marker, e.g. `REFERENCE_POSE_NOTE = "Match the pose, framing, body language and gaze from the reference image"`.
- Render a dedicated `Chip` **before** the existing `ChipRowWithOther`, only when `isReference && hasPeople`. Label: **"As reference image"**. Active when `cast?.action_note === REFERENCE_POSE_NOTE`.
- Clicking it sets `{ action: undefined, action_note: REFERENCE_POSE_NOTE }`. Clicking another action chip or typing in Other clears it (existing handlers already wipe `action_note`).
- Preselect logic: in `Step4Cast`, a `useEffect` that — when `isReference && hasPeople && !cast?.action && !cast?.action_note` and the user first lands on the interaction sub-step — dispatches the same patch. Guarded so the user can clear it later without it reappearing (track via a ref like `seededRefPoseRef.current`).

The prompt builder already concatenates `action_note` into the assembled directive, so the model will follow the reference pose without any prompt-template changes.

## 3) Fix Continue blocked after picking "Other" custom pose
**Problem:** When the user types a custom pose in Other, `action_note` is set but `action` is undefined. Both `interactionHeadlineMissing` in `Step4Cast.tsx` (line ~193) and `getSubStepDisabledReason` in `step4Flow.ts` (line ~141) check only `!cast?.action`, so the dot stays red and "Continue to Styling" stays disabled.

**Fix:** treat `action OR action_note` as satisfied.

- `step4Flow.ts` line 141:
  ```ts
  if (hasPeople && !cast?.action && !cast?.action_note?.trim())
    return "Pick an action to continue";
  ```
- `Step4Cast.tsx` line 192-195:
  ```ts
  const interactionHeadlineMissing = (() => {
    if (hasPeople) return !cast?.action && !cast?.action_note?.trim();
    return !cast?.hands_on_product;
  })();
  ```

## Files touched
- `src/features/brand-scenes/wizard/steps/Step6PreviewAndPick.tsx` (CTA label + body copy)
- `src/features/brand-scenes/wizard/steps/Step4Cast.tsx` (preselect effect, InteractionTab gets `isReference` + reference chip, headline-missing fix)
- `src/features/brand-scenes/wizard/step4Flow.ts` (validation accepts `action_note`)

## Out of scope
- No prompt-builder changes (action_note already flows into the directive).
- No DB / edge-function changes.
- No new constants files — the reference-pose marker lives next to the chip.
