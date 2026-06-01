# Fix Brand Model credit copy in Studio chat

## Reality (verified in code: `supabase/functions/generate-user-model/index.ts`)
- **Creating a Brand Model = 20 credits, one-time.** Function deducts 20 via `deduct_credits` RPC on creation.
- **Using a Brand Model in a generation = standard image cost** (e.g. Product Visuals 6 credits/image). No extra Brand-Model surcharge per image.
- **Public VOVV.AI Brand Models = free to use** (no creation cost since the user didn't create them; generations still cost the standard image price).
- **Plan gate: Growth+ required to create.** Public models usable on every plan.

## What the chat said (wrong)
"Once trained, generating an image with your model costs 20 credits."
Implies 20 credits per image. Actual: 20 credits is the **one-time creation fee**.

## Change (1 file, copy-only)
Edit `supabase/functions/studio-chat/index.ts`:

1. Brand Models section (~line 136–140) — already updated to drop "train/trained" wording last turn. Add: creation has a **one-time 20-credit cost**; subsequent image generations using your Brand Model cost the standard per-image price.

2. Replace current line 187 fact:
   - Old: `Brand Model image: **20 credits** per generation. Using a public Brand Model someone else trained is **free**. Brand Model creation needs **only 1 reference photo** — never quote 15–25 or any multi-image number.`
   - New: `Brand Model creation: **20 credits, one-time** (Growth+ only, just 1 reference photo). Once created, generating images with your Brand Model costs the **standard image price** (e.g. 6 credits/image in Product Visuals) — there is NO 20-credit-per-image surcharge. Public VOVV.AI Brand Models are **free to use** (no creation fee; generations still cost the standard image price).`

3. Add to DO-NOT list: never say "20 credits per image" or "20 credits per generation" for Brand Models — that number is the one-time creation cost only.

## Scope guardrails
- Only `supabase/functions/studio-chat/index.ts`.
- No price changes, no UI, no backend logic.
- Memory file `mem://features/studio-chat-knowledge-source` will be updated to reflect the correct rule so future re-syncs stay accurate.
