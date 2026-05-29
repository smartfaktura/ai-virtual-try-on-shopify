# Fix false "Custom Background" badge on scenes

## Problem

`Soft Lounge Glow`, `Waistband Fit Closeup` (and likely others) show the **Custom Background** badge in Step 2 of Product Images, but selecting them does **not** actually feed a user-chosen backdrop into generation.

Root cause: the badge in `src/components/app/product-images/ProductImagesStep2Scenes.tsx` (line 193) detects "has background" by string-matching `{{background}}` in `promptTemplate`:

```ts
const hasBackground = scene.promptTemplate?.includes('{{background}}');
```

But the real source of truth — confirmed in the admin editor screenshot — is the scene's `triggerBlocks` array. Both offending scenes contain the literal `{{background}}` token in their template text, yet their `triggerBlocks` does **not** include `'background'` (only `personDetails`, `stylingDetails`). Without the trigger block, the upstream resolver never substitutes the token and the user's color choice is ignored.

So the badge lies.

## Fix

Single-line semantic change in `SceneCard` (`ProductImagesStep2Scenes.tsx`):

```ts
// before
const hasBackground = scene.promptTemplate?.includes('{{background}}');

// after
const hasBackground = scene.triggerBlocks?.includes('background');
```

`hasAestheticColor` already reads from `triggerBlocks` correctly — this just makes `hasBackground` consistent.

## Effect

- Soft Lounge Glow, Waistband Fit Closeup, and any other scene whose template still contains stray `{{background}}` text but lacks the `background` trigger will **stop showing** the "Custom Background" label + swatches.
- Scenes that legitimately have `background` in `triggerBlocks` are unaffected.
- No DB migration, no template edits, no backend change.

## Out of scope (flag only)

Stray `{{background}}` text still sits in those template bodies. It's inert today (resolver leaves it untouched without the trigger), but worth a future cleanup pass via admin editor. Not blocking — purely cosmetic in the prompt.
