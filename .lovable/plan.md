

# Fix: Add `text-product` to valid job types

## Problem
The `enqueue-generation` edge function rejects `text-product` jobs because the `validJobTypes` whitelist on line 114 doesn't include it, even though credit calculation (line 47) and process-queue routing already support it.

## Fix
**File**: `supabase/functions/enqueue-generation/index.ts` — line 114

Change:
```typescript
const validJobTypes = ["tryon", "freestyle", "workflow", "upscale", "video", "catalog"];
```
To:
```typescript
const validJobTypes = ["tryon", "freestyle", "workflow", "upscale", "video", "catalog", "text-product"];
```

One line, one file. Then redeploy `enqueue-generation`.

