# Fix: Resolve dynamic tokens inside scene `outfit_hint`

## Problem

Tokens like `{{productMainHex}}`, `{{productSecondaryHex}}`, `{{productAccentHex}}`, `{{backgroundBaseHex}}` (and the rest of the 70+ token vocabulary) resolve correctly when authored in `prompt_template`, but pass through as **literal text** when authored in `outfit_hint`.

## Root cause

`src/lib/productImagePromptBuilder.ts` → `resolveOutfitHintText()` (lines 925–935) only does two narrow `.replace()` calls:

```ts
return scene.outfitHint
  .replace(/\{\{aestheticColor\}\}/gi, colorDesc)
  .replace(/\{\{productName\}\}/gi, productName || 'the product');
```

It never invokes the generic `resolveToken(token, ctx)` resolver that `prompt_template` runs through (around line 1393). So any other `{{…}}` token in an outfit_hint reaches Gemini unresolved.

## Fix (simple, ~10 lines)

Update `resolveOutfitHintText()` to run the same generic resolver as `prompt_template`, while keeping the existing `aestheticColor` behavior (it's not a token in the generic resolver — it's outfit-hint-specific).

1. Change the function signature to also accept the `TokenContext` (or the inputs needed to build it: `product`, `analysis`, `details`, `scene`).
2. After the two existing narrow replacements, run:
   ```ts
   out = out.replace(/\{\{(\w+)\}\}/g, (match, token) => {
     const v = resolveToken(token, ctx);
     return v === '' ? match : v; // leave unknown tokens untouched, same as prompt_template path
   });
   ```
   (Mirror the exact behavior used for `prompt_template` so we don't accidentally blank tokens that are intentionally empty.)
3. Update the two call sites of `resolveOutfitHintText` (around lines 1022 and 1457) to pass the already-built `TokenContext` / required inputs — both call sites are inside the main builder where `ctx` is already in scope, so no new plumbing.

## Out of scope

- No changes to `outfit_hint` schema or admin UI.
- No changes to which tokens exist (Token System v2 stays as-is).
- No edge-function or DB changes.
- `generate-workflow` edge function is not affected — outfit_hint is resolved client-side before payload is sent.

## Verification

1. Pick a phone-case scene whose `outfit_hint` contains `{{productMainHex}}` / `{{backgroundBaseHex}}`.
2. Generate → inspect the final prompt (existing prompt log/debug panel).
3. Confirm the outfit line now contains the actual hex value (e.g. `#E67F2C`) instead of `{{productMainHex}}`.
4. Confirm `{{aestheticColor}}` and `{{productName}}` still resolve as before.
5. Generate a scene whose outfit_hint has no tokens — must be unchanged.
