

## Update Upscale Credit Pricing: 10 for 2K, 15 for 4K

Five files need updates to change upscale pricing from 8/12 to 10/15:

| File | What to change |
|------|---------------|
| `src/hooks/useUpscaleImages.ts` (lines 15-18) | `CREDIT_COST`: 2k → 10, 4k → 15 |
| `src/components/app/UpscaleModal.tsx` (lines 15-18) | `TIERS` display cost: 2k → 10, 4k → 15 |
| `supabase/functions/enqueue-generation/index.ts` (lines 31-33) | Backend pricing: `resolution === "4k" ? 15 : 10` |
| `src/pages/Generate.tsx` (line 1463, 3019-3020, 3046) | Upscale hub UI: update hardcoded 8/12 → 10/15 in cost calc and display |

All four locations currently show incorrect/mismatched values (4, 8, or 12). This aligns them all to 10/15.

