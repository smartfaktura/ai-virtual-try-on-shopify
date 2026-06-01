# Fix Brand Models upload copy in Studio chat

## Problem
When users click "Brand Models" in Studio chat, the AI replies with "Upload 15–25 high-quality photos of your chosen person." That's wrong — VOVV.AI Brand Models only require **1 reference photo** (confirmed in `src/pages/BrandModels.tsx`: single-image upload flow, "Upload a reference" UI). The 15–25 number is a model hallucination from generic LoRA-training knowledge.

## Change (1 file, copy-only)
Edit `supabase/functions/studio-chat/index.ts` — Brand Models section (line ~136) to add a hard, explicit fact the model must use verbatim:

- Replace the current Brand Models paragraph with a version that states:
  - Creating a Brand Model needs **only 1 high-quality reference photo** of the person (front-facing, well-lit, clean background recommended).
  - Never say "15–25 photos", "dataset", "training set" or anything implying multi-image LoRA training.
- Add a matching line to the FACTS block (~line 187) so the rule is enforced from two places: `Brand Model creation: **1 reference photo** is enough — never quote 15–25 or any multi-image number.`

## Scope guardrails
- Only `supabase/functions/studio-chat/index.ts` is touched.
- No UI, no backend logic, no schema, no credit/plan changes.
- All other Brand Models facts (Growth+ requirement, 20 credits per generation, public models free) stay unchanged.
- Memory note will be added afterward so future prompt edits stay in sync.
