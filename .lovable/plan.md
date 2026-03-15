

## Add Rich Context to Generation Failed Emails

### Problem
The failure email only shows "Type: Freestyle" and a generic error like "Signal timed out." — no prompt, product, model, scene, or workflow name. Users can't tell which generation failed.

### Solution
Pass richer context from each generator into the email `data` payload, then render it in the email template as additional rows in the details table.

### Changes

**1. Each generator's `completeQueueJob` email call** — pass extra fields from `payload`:

**`supabase/functions/generate-freestyle/index.ts`** (~line 694)
- Add to the email data: `prompt` (truncated to 80 chars), `productName` (from payload if available), `modelContext`, `sceneId`

**`supabase/functions/generate-workflow/index.ts`** (~line 692)  
- Add: `workflowName` (from `payload.workflow_name`), `productName` (from `payload.product_title`), `prompt` (truncated)

**`supabase/functions/generate-tryon/index.ts`** (~line 359)
- Add: `productName` (from `payload.product?.title`), `modelName` (from `payload.model?.name`), `sceneName` (from `payload.pose?.name`)

**2. `supabase/functions/send-email/index.ts`** (~line 195-224)
- Expand `generationFailedEmail` data interface to accept optional: `prompt`, `productName`, `modelName`, `sceneName`, `workflowName`
- Render non-empty fields as additional rows in the details table:
  - Prompt → truncated user prompt (italic, smaller)
  - Product → product title
  - Model → model name  
  - Scene → scene name
  - Workflow → workflow name

Example email output for freestyle:
```
Type          Freestyle
Prompt        "A model in a summer dress on the beach at sun..."
Product       Silk Summer Dress
Model         Luna
Scene         Golden Hour Beach
Details       Image 1: Signal timed out.
```

**3. Redeploy** all 4 edge functions after changes.

### Technical Details
- `payload` in each generator is the full request body — already contains all needed fields
- Freestyle: `payload.prompt`, `payload.productId` (would need to look up name — simpler to pass product title from the client). Actually the freestyle payload doesn't have product name directly, but we can look it up from `payload.productId` via a quick DB query, or just show the prompt which is the most useful context
- Workflow: `payload.workflow_name` and `payload.product_title` are available in the body
- Try-on: `payload.product.title`, `payload.model.name`, `payload.pose.name` are structured in the request
- Prompt truncated to 80 chars with "…" suffix for email readability
- All new fields are optional — existing emails still render correctly if fields are missing

Four edge function files modified, then redeployed.

