

## Replace `gemini-2.5-flash-image` → `gemini-3.1-flash-image-preview`

Swap the standard-quality image model from Nano Banana 1 to Nano Banana 2 across all edge functions.

### Changes

| File | Lines | Change |
|------|-------|--------|
| `supabase/functions/generate-freestyle/index.ts` | ~812, ~815 | Replace 2× `google/gemini-2.5-flash-image` → `google/gemini-3.1-flash-image-preview` |
| `supabase/functions/generate-workflow/index.ts` | ~540 | Replace 1× `google/gemini-2.5-flash-image` → `google/gemini-3.1-flash-image-preview` |
| `supabase/functions/generate-workflow-preview/index.ts` | ~83 | Replace 1× `google/gemini-2.5-flash-image` → `google/gemini-3.1-flash-image-preview` |

**Total**: 4 replacements across 3 files. The high-quality model (`gemini-3-pro-image-preview`) stays unchanged.

