

## Resolution Control: 1K/2K/4K for Freestyle, Auto-2K for Workflows/Try-On

### Status: ✅ Implemented

### What Changed

1. **Freestyle UI** — Replaced Standard/High quality chip with 1K/2K/4K resolution picker
   - 1K = Standard model, 4 credits/image
   - 2K = Pro model (auto), 8 credits/image  
   - 4K = Pro model (auto), 12 credits/image
   - When model/scene selected, locked to "Pro · 2K" minimum

2. **Backend** — Added `imageSize` to Gemini `image_config`
   - `generate-freestyle`: Dynamic resolution from payload, forces Pro model for 2K/4K
   - `generate-tryon`: Hardcoded `imageSize: "2K"`
   - `generate-workflow`: Hardcoded `imageSize: "2K"`
   - `enqueue-generation`: Resolution-aware credit calculation

### Files Changed
- `src/pages/Freestyle.tsx`
- `src/components/app/freestyle/FreestyleSettingsChips.tsx`
- `src/components/app/freestyle/FreestylePromptPanel.tsx`
- `src/hooks/useGenerationQueue.ts`
- `supabase/functions/generate-freestyle/index.ts`
- `supabase/functions/generate-tryon/index.ts`
- `supabase/functions/generate-workflow/index.ts`
- `supabase/functions/enqueue-generation/index.ts`
