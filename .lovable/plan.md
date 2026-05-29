# Gate "OUTFIT CONSISTENCY (CRITICAL)" to person scenes only

## What's happening today

Every generation sent through `generate-workflow` includes this line in CRITICAL REQUIREMENTS #7:

> OUTFIT CONSISTENCY (CRITICAL): If a person/model appears, they MUST wear the EXACT same outfit…

It fires because the wizard always sends `batch_outfit_lock: true` (`src/pages/ProductImages.tsx:1007`), regardless of whether the chosen scene actually puts a person in frame. The edge function then renders the line whenever that flag is on (`supabase/functions/generate-workflow/index.ts:622`).

Result: pure packshots, flat lays, furniture rooms, food, etc. all get an irrelevant "if a person/model appears…" directive. Harmless wording, but noise the model has to parse and occasionally treats as a cue to invent a model.

## The change

Only send `batch_outfit_lock: true` when the scene actually involves a person — i.e. its `triggerBlocks` include `personDetails` or `actionDetails` (the same flags the wizard already uses to decide whether a model reference is required, see `ProductImages.tsx:885` and `:1362`).

### Edit
**File:** `src/pages/ProductImages.tsx` (line ~1007, inside the per-scene job payload)

Replace the hard-coded `batch_outfit_lock: true` with a computed value:

```ts
const sceneNeedsPerson = (scene.triggerBlocks || []).some(
  (b: string) => b === 'personDetails' || b === 'actionDetails'
);
// …
batch_outfit_lock: sceneNeedsPerson,
```

(Compute `sceneNeedsPerson` once per scene inside the existing loop; reuse if you also want to log it.)

No edge-function change is required — `generate-workflow` already conditions the line on `batch_outfit_lock`. When the flag is `false`, CRITICAL #7 is simply omitted.

## Out of scope

- No DB migration.
- No change to the edge function's prompt template.
- No change to how model references are attached — that still uses the same `personDetails` / `actionDetails` trigger check.
- Interior / furniture prompt (the other big block we discussed) is untouched.

## How to verify

1. Pick a non-person scene (e.g. a clean packshot or a furniture room) → generate → confirm the prompt logged by `generate-workflow` no longer contains the "OUTFIT CONSISTENCY" line.
2. Pick an on-model scene (one with `personDetails` or `actionDetails` trigger) → generate → confirm the line is still present.
