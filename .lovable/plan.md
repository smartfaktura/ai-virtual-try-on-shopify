

## Simplify: Remove Resolution Selectors, Default Everything to 1K

Since the AI models output at native ~1K regardless, the 2K/4K resolution selector is misleading. Upscaling will be a Library-only feature (already exists via `upscale-image` edge function).

### Changes

**1. `src/pages/Freestyle.tsx`**
- Remove `resolution` state and all references — hardcode `'1K'` in payload
- Remove `resolution` from `settingsProps` passed to `FreestyleSettingsChips`
- Simplify credit cost back to: `(hasModel || hasScene) ? 8 : 4` (flat per image)
- Remove `resolution` from `enqueue()` calls

**2. `src/components/app/freestyle/FreestyleSettingsChips.tsx`**
- Remove the resolution popover/selector UI entirely
- Remove `resolution`, `onResolutionChange`, `hasModelSelected` props
- Keep quality as flat "4 credits/image" (or 8 with model/scene)

**3. `src/pages/Generate.tsx`**
- Remove `workflowResolution` state
- Remove all 3 resolution selector UI blocks (flat lay ~line 3318, staging ~line 3463, try-on ~line 3600)
- Simplify `resolutionCredits` → flat 8 credits per workflow image (workflows always use pro model)
- Remove `resolution` from all payloads passed to `enqueue()`
- Update credit display text to remove resolution references

**4. `src/hooks/useGenerationBatch.ts`**
- Remove `resolution` from `BatchParams` interface
- Remove resolution-based credit logic

**5. `src/contexts/CreditContext.tsx`**
- Remove `resolution` parameter from `calculateCost` — simplify to flat pricing

**6. `supabase/functions/generate-freestyle/index.ts`**
- Remove resolution reading from payload
- Remove "OUTPUT RESOLUTION" prompt injection
- Remove `imageSize` from `image_config`

**7. `supabase/functions/generate-workflow/index.ts`**
- Remove resolution parameter handling
- Remove "OUTPUT RESOLUTION" prompt text
- Remove `imageSize` from `image_config`

**8. `supabase/functions/generate-tryon/index.ts`**
- Remove resolution parameter, hardcoded 2K references
- Remove `imageSize` from config

**9. `supabase/functions/enqueue-generation/index.ts`**
- Remove resolution-based credit calculation
- Use flat pricing: freestyle = 4 (or 8 with model/scene), workflows/tryon = 8

### Credit Pricing (simplified)
- **Freestyle basic**: 4 credits/image
- **Freestyle with model/scene**: 8 credits/image (pro model)
- **All workflows & try-on**: 8 credits/image (always pro model)
- **Upscale in Library**: 4 credits (existing `upscale-image` function)

### Files: 9 files across frontend and backend

