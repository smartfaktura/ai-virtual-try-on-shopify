

# Fix: `buildPersonDirective` Ignores Scene Outfit Hint

## Problem
The outfit hint is only used in the `outfitDirective` token resolver (line 890-898), but `buildPersonDirective` (line 698) independently calls `defaultOutfitDirective()` on lines 716 and 727 — injecting the standard "OUTFIT LOCK" text into the person directive. This **contradicts** the scene's curated outfit hint because both directives end up in the final prompt: one saying "OUTFIT LOCK — Wearing exactly: white tee, dark trousers..." and the other saying "OUTFIT DIRECTION — Premium athletic sportswear in #5E7485...".

The scene object isn't even passed to `buildPersonDirective`, so it can't check for `outfitHint`.

## Fix

### `src/lib/productImagePromptBuilder.ts`

**1. Update `buildPersonDirective` signature** (line 699) to accept an optional `outfitHint` parameter:
```typescript
function buildPersonDirective(d: DetailSettings, category?: string, sceneNeedsPerson?: boolean, gender?: string, garmentType?: string, resolvedOutfitHint?: string): string {
```

**2. Lines 714-718** — when no person details are set and scene needs person, skip `defaultOutfitDirective()` if outfit hint exists:
```typescript
if (sceneNeedsPerson) {
  let dir = defaultPersonDirective(category);
  if (!resolvedOutfitHint) {
    dir += ` ${defaultOutfitDirective(category, d, gender, garmentType)}`;
  }
  dir += ' Hyper-realistic skin texture...';
  return dir;
}
```

**3. Lines 726-728** — same for the explicit person details branch:
```typescript
if (sceneNeedsPerson && !resolvedOutfitHint) {
  directive += ` ${defaultOutfitDirective(category, d, gender, garmentType)}`;
}
```

**4. Line 886** — pass the resolved outfit hint to `buildPersonDirective`:
```typescript
case 'personDirective': {
  const needsPerson = (scene.triggerBlocks || []).includes('personDetails') || (scene.triggerBlocks || []).includes('actionDetails');
  const resolvedHint = scene.outfitHint
    ? scene.outfitHint
        .replace(/\{\{aestheticColor\}\}/gi, details.aestheticColorHex || 'coordinated')
        .replace(/\{\{productName\}\}/gi, ctx.productName || 'the product')
    : undefined;
  return buildPersonDirective(details, cat, needsPerson, ctx.modelGender, analysis?.garmentType, resolvedHint);
}
```

### Result
When a scene has `outfit_hint`, the person directive no longer injects a conflicting "OUTFIT LOCK". The curated outfit direction from `outfitDirective` token is the sole outfit instruction in the prompt.

### File changed
- `src/lib/productImagePromptBuilder.ts` — 4 small edits (~10 lines changed)

