

# Always Use 2K for Workflow & Try-On Generations

## Problem
Workflow and Try-On edge functions don't pass `image_size` at all, resulting in tiny ~500KB images. User wants all generations to always be 2K — no conditional logic.

## Changes

### 1. `supabase/functions/generate-tryon/index.ts` (line 303)

**Current:**
```js
image_config: { aspect_ratio: aspectRatio },
```

**New:**
```js
image_config: { aspect_ratio: aspectRatio, image_size: '2K' },
```

### 2. `supabase/functions/generate-workflow/index.ts` (line 586)

**Current:**
```js
...(aspectRatio ? { image_config: { aspect_ratio: aspectRatio } } : {}),
```

**New:**
```js
image_config: { ...(aspectRatio ? { aspect_ratio: aspectRatio } : {}), image_size: '2K' },
```

Two one-line edits. Always 2K, no conditionals.

