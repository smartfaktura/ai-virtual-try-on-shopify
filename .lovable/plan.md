
Goal

Improve Catalog Studio so model identity is replicated more faithfully and the weak product-only shots stop producing body/mannequin-looking results. The app is already generating at 4K with guidance scale 8.5, so the main problems are reference handling and shot prompting, not output resolution.

What’s causing it now

1. `/app/catalog` currently sends `m.previewUrl` as the model reference. For user-created models, that ignores the original `source_image_url`, so identity may be copied from a generated or lower-detail portrait instead of the true face source.
2. `generate-catalog` sends Seedream references in product-first order (`product -> model -> anchor`), which overweights the garment and weakens face locking.
3. The bad scenes are too generic:
   - `front_flat` / `back_flat` say “floating centered”, which invites torso/mannequin-looking garments.
   - `ghost_mannequin` is not strict enough, so it can hallucinate a person.
   - `zoom_detail` allows body/neckline crops instead of pure fabric macro detail.

Implementation plan

1. Upgrade the model identity reference
- Add an optional identity/source image field through the catalog model flow.
- `useUserModels.ts`: expose `source_image_url` on the model profile.
- `useCustomModels.ts`: use the original model image as the identity fallback.
- `CatalogGenerate.tsx`: when building selected models, send the best identity ref (`sourceImageUrl ?? previewUrl`) instead of only the display image.

2. Fix backend reference priority
- Extend the catalog payload model shape in `supabase/functions/generate-catalog/index.ts` to accept an explicit identity image.
- Rebuild reference ordering by shot type:
  - on-model anchor/reference shots: identity image first, product second
  - product-only shots: product only
  - if an anchor image is available, include it as a consistency reference without replacing the identity image
- Centralize this logic so reference priority is not hardcoded inline.

3. Strengthen the prompt engine for identity locking
- In `src/lib/catalogEngine.ts`, add a dedicated identity-priority block:
  - face, eyes, skin tone, hair, and facial structure must come from the model identity image
  - garment color, cut, seams, and texture must come from the product image
  - never invent a different person, never smooth/soften/pixelate the face
- Add stronger face-detail language for close and upper-body shots.

4. Rewrite the failing product-only shot prompts
- `zoom_detail`: force true textile macro only; no skin, no neckline-as-body, no mannequin, no human crop.
- `front_flat`: technical front garment shot, laid flat or invisibly clipped, perfectly symmetrical, no torso shape.
- `back_flat`: same, but exact back view only.
- `ghost_mannequin`: strict ecommerce ghost-mannequin language with hollow neck/arm openings, no head, no skin, no body anatomy.
- Add apparel/top-specific overrides so tank tops stop turning into human-shaped renders.

5. QA pass
- Test the exact failing scenes for a top: Zoom Detail, Front Flat Product, Back Flat Product, Ghost Mannequin.
- Test one user-created model and one library model across Front Model / Waist-Up / Full Look to confirm sharper face replication and less drift.

Technical details

Files likely touched:
- `src/types/index.ts`
- `src/hooks/useUserModels.ts`
- `src/hooks/useCustomModels.ts`
- `src/pages/CatalogGenerate.tsx`
- `src/lib/catalogEngine.ts`
- `supabase/functions/generate-catalog/index.ts`

Notes:
- No database migration is needed for this pass.
- I would keep the current 4K + guidance 8.5 settings; the biggest quality gain here will come from better identity reference handling and stricter shot templates.
