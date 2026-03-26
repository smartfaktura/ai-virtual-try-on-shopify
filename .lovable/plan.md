

# Revert: Always Use Pro Model When Model Images Are Present

## Context
The previous change made Nano Banana skip the Pro model upgrade when a model image is present. But since only admins select providers, speed isn't a concern — quality (face/identity accuracy) is. Pro should always be used when model images are involved.

## Change

**File: `supabase/functions/generate-freestyle/index.ts` (~line 1091)**

Revert the condition to remove the `providerOverride !== "nanobanana"` check:

```typescript
// Before (current):
const aiModel = (forceProModel || isPerspective || (hasModelImage && providerOverride !== "nanobanana"))

// After (reverted):
const aiModel = (forceProModel || isPerspective || hasModelImage)
  ? "google/gemini-3-pro-image-preview"
  : "google/gemini-3.1-flash-image-preview";
```

This ensures Pro model is always used when a model image is present, regardless of provider selection. One line change.

