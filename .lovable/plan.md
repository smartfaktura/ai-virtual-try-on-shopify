## Goal

Expand the Step 4 · Cast → Interaction "Action" row (today: Still / Walking / Mid-motion / Seated / Candid) into a richer **Pose** picker with an **Other** free-text fallback, and make sure the user can override the pose even when **Auto-cast** is selected — because pose materially changes the composition once people are in the scene.

## 1. Richer pose options (`wizard/constants/cast.ts`)

Replace `CAST_ACTIONS` with a longer, pose-oriented list and add a free-text companion field.

```ts
export const CAST_ACTIONS = [
  { value: "standing",     label: "Standing" },
  { value: "seated",       label: "Sitting" },
  { value: "crossed_legs", label: "Crossed legs" },
  { value: "leaning",      label: "Leaning" },
  { value: "kneeling",     label: "Kneeling / crouched" },
  { value: "walking",      label: "Walking" },
  { value: "motion",       label: "Mid-motion" },
  { value: "jumping",      label: "Jumping" },
  { value: "still",        label: "Still & composed" },
  { value: "candid",       label: "Candid moment" },
] as const;

export const CAST_ACTION_NOTE_MAX = 80;
```

Order: static poses first (standing / sitting / crossed legs / leaning / kneeling) → motion (walking / motion / jumping) → mood (still / candid). Default seed for auto-cast stays `standing` unless the resolved preset says otherwise.

## 2. "Other" free-text on the Pose row (`Step4Cast.tsx → InteractionTab`)

Swap the raw `Chip` row for the existing `ChipRowWithOther` helper used elsewhere in the wizard:

- `options` = `CAST_ACTIONS`
- `current` = `cast?.action`
- `custom` = `cast?.action_note`
- `onPick` → `onCastChange({ action })`
- `onCustom` → `onCastChange({ action_note })` (clears `action` when set, and vice-versa, mirroring how the helper already toggles)
- placeholder: `"e.g. mid-jump, sitting on stairs, arms crossed"`
- max length 80 chars

Section label changes from **Action** → **Pose** to match user vocabulary; subtitle: *Sets the body language and composition*.

## 3. New field plumbing

- **`types.ts`** — add `action_note?: string` to `BrandSceneCast`.
- **`schema.ts`** — add `action_note: z.string().max(80).optional()` on the cast schema.
- **`prompt/buildCastDirective.ts`** —
  - extend the `ACTION` map with the new values (`standing`, `crossed_legs`, `leaning`, `kneeling`, `jumping`) using natural-language directives, e.g. `crossed_legs: "seated with crossed legs"`, `jumping: "captured mid-jump, both feet off the ground"`, `leaning: "leaning casually against a surface"`, `kneeling: "in a low kneeling / crouched pose"`, `standing: "standing upright, weight balanced"`.
  - if `cast.action_note` is set, prefer it: `parts.push(`Pose: ${cast.action_note}.`);` and skip the preset action line.
- **`Step5Review.tsx`** — surface the chosen pose (or custom note) in the summary chips so the user sees it before generating.

## 4. Auto-cast still lets the user steer pose (the important bit)

Currently `mode === "skip"` jumps straight past every sub-step, including Interaction, so pose is auto-picked and never user-confirmed. Change:

- In `Step4Cast.tsx`, render the new `AutoCastSummary` (already added) with the seeded **Pose** chip explicitly visible alongside Cast / Interaction / Scale.
- Each summary chip is clickable and routes into its sub-step with that field focused — for pose, that means jumping to the Interaction sub-step with the Pose section scrolled into view. The auto-jump in `BrandSceneWizard.handleNext` only fires when the user hits **Continue**; clicking a summary chip overrides the skip and lets them edit before continuing.
- Add a one-line caption under the Auto-cast card: *"Pose strongly affects composition — tap it above to fine-tune."*
- After the user customises pose, persist `mode === "skip"` but mark `action`/`action_note` as user-touched so subsequent re-seeds don't overwrite it. Tracked with a small `userTouched: Set<keyof BrandSceneCast>` in wizard state (or simpler: a boolean `castUserEdited` if scope creeps).

## 5. Forbidden-pose guards (lightweight)

In `combinationGuards.ts`, add a small `forbiddenActions(preset, scalePreset, module)` helper so that, e.g.:
- `preset === "hands"` or `"none"` → no pose row at all (already hidden via `hasPeople`).
- `scalePreset === "architectural"` + `jumping` is allowed (no restriction), but `kneeling` for `furniture` scale gets a soft hint, not a block. Keep guards minimal — over-restricting hurts creative control.

## Out of scope

- No changes to other chip fields, other wizard steps, schema migrations, or stored data shape beyond the additive `action_note` field.
- No DB / edge function changes.
- No copy changes outside the Pose section + the one Auto-cast caption.

## Files touched

- `src/features/brand-scenes/wizard/constants/cast.ts`
- `src/features/brand-scenes/types.ts`
- `src/features/brand-scenes/schema.ts`
- `src/features/brand-scenes/prompt/buildCastDirective.ts`
- `src/features/brand-scenes/wizard/steps/Step4Cast.tsx` (Pose row + AutoCastSummary pose chip + user-touched flag)
- `src/features/brand-scenes/wizard/steps/Step5Review.tsx` (surface pose)
- `src/features/brand-scenes/wizard/rules/combinationGuards.ts` (optional, minimal)
