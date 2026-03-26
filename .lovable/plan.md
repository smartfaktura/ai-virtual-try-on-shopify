

# Fix Seedream Model ID

## Problem
The model ID in our code is `seedream-4-5-250422` but the correct one from your BytePlus ARK console is **`seedream-4-5-251128`**. This is why every Seedream call returns a 404 "model not found" error.

## Changes

### `supabase/functions/generate-freestyle/index.ts`

1. **Fix model ID**: Change `seedream-4-5-250422` → `seedream-4-5-251128` (line 305)

2. **Revert to `"2K"` size**: The REST API example from your console confirms `"2K"` is a valid size parameter. Simplify `seedreamSizeForRatio()` to just return `"2K"` for all aspect ratios, matching the official API docs. The API handles aspect ratio mapping internally.

That's it — a two-line fix. After deployment, Seedream should work on the next generation attempt.

