

## Change All Generation Credits from 8 → 6

Uniform change: every place that currently charges or displays "8 credits" for generations (workflows, freestyle with model/scene, try-on, perspectives) becomes **6 credits**. Standard freestyle without model/scene stays at **4 credits**. Upscale and video pricing unchanged.

### Files to Update

**Backend billing (3 files):**
1. `supabase/functions/enqueue-generation/index.ts` — lines 33-36: change `perImage = 8` to `6` for workflow/tryon, and `8 : 4` to `6 : 4` for freestyle
2. `supabase/functions/trigger-creative-drop/index.ts` — line 170: update cost calculation from `15/12/4` pattern to use `6`
3. `src/lib/dropCreditCalculator.ts` — line 35: `return 6` instead of `return 8`

**Frontend credit calculations (6 files):**
4. `src/contexts/CreditContext.tsx` — lines 255-256: `count * 6` instead of `count * 8`
5. `src/pages/Freestyle.tsx` — line 275: `6 : 4` instead of `8 : 4`
6. `src/pages/Generate.tsx` — lines 1650-1651: `6` instead of `8` (workflow and tryon costs)
7. `src/pages/Perspectives.tsx` — line 333: `perImageCost = 6`
8. `src/components/app/TryOnConfirmModal.tsx` — line 42: `creditsPerImage = 6`
9. `src/types/bulk.ts` — line 75: `6 : 4` instead of `8 : 4`

**UI text / copy (8 files):**
10. `src/components/app/GenerationModeCards.tsx` — "6 credits per image"
11. `src/components/app/GenerationModeToggle.tsx` — lines 21-22: update credit text
12. `src/components/app/generate/TryOnSettingsPanel.tsx` — "6 credits each"
13. `src/components/app/freestyle/FreestyleSettingsChips.tsx` — two occurrences: "6 credits/image"
14. `src/pages/Perspectives.tsx` — line 1019: "6 credits/image" text
15. `src/pages/features/PerspectivesFeature.tsx` — lines 41, 52: "6 credits per angle"
16. `src/pages/HelpCenter.tsx` — line 36: update FAQ text
17. `src/components/landing/LandingFAQ.tsx` — line 37: update FAQ text

**AI chat instructions (1 file):**
18. `supabase/functions/studio-chat/index.ts` — lines 148-160: update all pricing references to 6

**Total: ~18 files, all simple 8→6 replacements. No structural or database changes needed.**

