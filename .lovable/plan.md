

# Text-to-Product Generation — Standalone New Feature

## Overview
A new `/app/generate/text-to-product` page where users describe a product in text and select scene templates to generate photorealistic images — no product image upload needed. This is a **completely separate** page and edge function, touching zero existing code paths.

## Architecture: Full Isolation

To guarantee no regressions, this feature uses:
- A **new edge function** `generate-text-product` (separate from `generate-workflow`)
- A **new page** `TextToProduct.tsx` (separate from `ProductImages.tsx`)
- The same generation engine (Gemini Pro → Seedream → Flash fallback) but copied into its own function

No existing files are modified except `App.tsx` (one new route line).

## Files

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/TextToProduct.tsx` | **Create** | 5-step wizard page (~500 lines) |
| `supabase/functions/generate-text-product/index.ts` | **Create** | Dedicated edge function for text-only generation |
| `src/App.tsx` | **Edit** | Add one lazy route |

## New Edge Function: `generate-text-product`

A simplified copy of `generate-workflow`'s generation core with these differences:
- **No product image reference** — the prompt is entirely text-driven
- **No workflow DB lookup** — receives the full prompt directly from the client
- **Same 3-tier fallback**: Gemini Pro (`gemini-3-pro-image-preview`) → Seedream 4.5 → Gemini Flash
- **Same image upload to storage** (workflow-previews bucket)
- **Same queue integration** (called from `process-queue` via `job_type: 'text-product'`)
- Accepts: `{ specification: string, scenes: [{ label, prompt, aspect_ratio }], job_id, user_id, credits_reserved }`
- Each scene's prompt already contains the full specification text (injected client-side)

## New Page: `TextToProduct.tsx`

### Step 1 — Describe
- Title input (short product name)
- Large textarea for full product specification (the detailed description with hex colors, construction details, etc.)
- Category selector (optional — Apparel, Accessories, Footwear, etc.)

### Step 2 — Select Scenes
- Grid of 6 hardcoded scene template cards with checkboxes:
  - **White Front** — straight-on front view, pure white background
  - **White Side** — side profile view, pure white background
  - **Back View** — straight-on back view, pure white background
  - **Inside View** — interior/lining view, pure white background
  - **iPhone / Resale** — casual on-body iPhone photo style
  - **Detail / Macro** — close-up texture/embellishment shot
- Each card shows icon + short description
- Multi-select (pick 1-6)
- Aspect ratio picker (shared or per-scene)

### Step 3 — Review
- Summary: product title, description preview (truncated), selected scenes list, aspect ratio, credit cost (6 credits × scene count)
- "Generate" button

### Step 4 — Generating
- Reuse same polling pattern as ProductImages (enqueue → poll `generation_queue`)
- Progress bar showing X/Y completed
- Session recovery on refresh

### Step 5 — Results
- Grid of generated images grouped by scene label
- Download, save to library actions

### Enqueue Logic
Each selected scene becomes one job:
```typescript
payload = {
  specification: fullText,
  scenes: [{ label: scene.label, prompt: scene.fullPrompt, aspect_ratio: ratio }],
  quality: 'high',
}
// Enqueued as jobType: 'text-product'
```

### Scene Prompt Templates
The 6 templates are hardcoded strings (the exact prompts from the user's message), each ending with `\n\nPRODUCT SPECIFICATION:\n{specification}`. The client replaces the placeholder before sending.

## Process Queue Integration
The `process-queue` function routes `job_type: 'text-product'` to `generate-text-product` edge function (same pattern as other job types).

## What This Does NOT Touch
- `generate-workflow/index.ts` — untouched
- `ProductImages.tsx` — untouched
- `productImagePromptBuilder.ts` — untouched
- Any existing workflow, scene, or template data — untouched
- Database schema — no new tables needed (uses existing `generation_queue` + `generation_jobs`)

