

## Current State

**Product upload limits are display-only** — there is no backend enforcement. The `user_products` table RLS simply checks `auth.uid() = user_id` with no count restrictions. Any user can upload as many products as they want regardless of plan. The limits shown in pricing cards are purely marketing text in `src/data/mockData.ts`.

## Proposed Changes

Update the feature text in `src/data/mockData.ts` to reflect more generous and sensible product limits:

| Plan | Current | Proposed |
|------|---------|----------|
| Free | `1 product upload` | `Up to 5 products` |
| Starter | `Up to 10 products` | `Up to 100 products` |
| Growth | `Up to 100 products` | `Up to 250 products` |
| Pro | `Unlimited products` | `Unlimited products` (no change) |

Also noting a few feature inconsistencies visible in the screenshot:
- **Free plan** says "All workflows" but other plans say "Batch generation (3 scenes)" — Free should probably not claim "All workflows" if it doesn't include batch generation. Should Free say something like "Single generation" instead?
- **Pro plan** is missing "Priority queue" which Growth has — should Pro also list it?

I'd recommend keeping the limits as display text only (no backend enforcement) for now, since adding enforcement would require checking product counts in the insert policy or an edge function, adding friction without clear benefit at this stage.

### Single file change
**`src/data/mockData.ts`** — update the features arrays:
- Free: `'1 product upload'` → `'Up to 5 products'`
- Starter: `'Up to 10 products'` → `'Up to 100 products'`  
- Growth: `'Up to 100 products'` → `'Up to 250 products'`

