

## Simplify: Remove Resolution Selectors, Default Everything to 1K

### Status: ✅ Implemented

### What Changed

1. **Removed resolution selectors** from Freestyle, Generate (all 3 workflow types), and FreestyleSettingsChips
2. **Simplified credit pricing** to flat rates:
   - Freestyle basic: 4 credits/image
   - Freestyle with model/scene: 8 credits/image
   - All workflows & try-on: 8 credits/image
3. **Cleaned backend edge functions** — removed `OUTPUT RESOLUTION` prompt injections, `imageSize` config, and resolution-based model forcing
4. **Upscaling remains available** in Library via existing `upscale-image` edge function

### Files Changed
- `src/pages/Freestyle.tsx`
- `src/pages/Generate.tsx`
- `src/components/app/freestyle/FreestyleSettingsChips.tsx`
- `src/components/app/freestyle/FreestylePromptPanel.tsx`
- `src/contexts/CreditContext.tsx`
- `src/hooks/useGenerationQueue.ts`
- `src/hooks/useGenerationBatch.ts`
- `supabase/functions/enqueue-generation/index.ts`
- `supabase/functions/generate-freestyle/index.ts`
- `supabase/functions/generate-workflow/index.ts`
- `supabase/functions/generate-tryon/index.ts`
