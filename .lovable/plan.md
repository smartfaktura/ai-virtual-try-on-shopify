

# Remove Seedream Model-Reference Restriction in generate-workflow

## Problem
Line 1236 in `supabase/functions/generate-workflow/index.ts` has a guard `!body.model?.imageUrl` that skips the Seedream fallback when a model reference image is present. This is incorrect — Seedream already handles model references successfully in the try-on flow (`generate-tryon`), where `body.model.imageUrl` is passed as a reference image (line 829).

## Change

### `supabase/functions/generate-workflow/index.ts`

**Line 1236**: Remove the `!body.model?.imageUrl` guard so Seedream is used as fallback regardless of whether a model reference is present.

```typescript
// BEFORE (line 1236):
if (imageUrl === null && !body.model?.imageUrl) {

// AFTER:
if (imageUrl === null) {
```

**Line 1255**: Update the log message since the condition no longer varies:

```typescript
// BEFORE:
console.warn(`[generate-workflow] Primary${body.model?.imageUrl ? '' : ' + Seedream'} failed — trying Flash fallback`);

// AFTER:
console.warn(`[generate-workflow] Primary + Seedream both failed — trying Flash fallback`);
```

That's it — 2 lines changed. The `generateImageSeedream` function already accepts an array of reference image URLs and passes `body.model.imageUrl` into it (via `referenceImages`), so no other changes are needed.

## Impact
- Swimwear/lingerie generations with model references will now fall back to Seedream when Gemini blocks the content, instead of skipping directly to Flash
- All other product-image workflows with models benefit from the same improved fallback chain
- The 3-tier chain becomes: **Gemini → Seedream → Flash** for ALL generations (not just product-only)

## Files
- `supabase/functions/generate-workflow/index.ts` — 2 lines modified

