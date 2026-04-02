

# Upgrade Catalog Studio: 4K Resolution + Guidance Scale 8.5

## Changes

### File: `supabase/functions/generate-catalog/index.ts`

**Line 45**: Change `size: "2K"` → `size: "4K"`

**After line 50**: Add `guidance_scale: 8.5` to the Seedream request body object.

That's it — two single-line changes in the API call body.

