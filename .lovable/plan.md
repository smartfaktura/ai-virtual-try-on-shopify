## Goal

Rename "Picture Perspectives" → **"Generate More Angles"** in all UI/copy (frontend + studio-chat system prompt). Keep backend, DB workflow `name`, slug, `workflow_label` prefix, route `/app/perspectives`, hook names, console logs, and runtime keys unchanged.

## Frontend edits

### 1. `src/pages/Perspectives.tsx`
- L521 SEOHead title → `"Generating More Angles…"`
- L528 H1 → `"Creating More Angles…"`
- L557 small label → `"Angles"`
- L677 SEOHead title → `"Generate More Angles"`
- L696 H1 → `"Generate More Angles"`
- L926 button → `"Choose Angles"`

### 2. `src/components/app/LibraryDetailModal.tsx`
- L418 CTA → `"Generate More Angles"`

### 3. `src/components/app/DropDetailModal.tsx`
- L359 button → `"More Angles"`

### 4. `src/components/app/WorkflowPreviewModal.tsx`
- L297 button → `"More Angles"`

### 5. `src/pages/Workflows.tsx`
- L30 `DISPLAY_NAMES['picture-perspectives']` → `'Generate More Angles'`

### 6. `src/components/app/WorkflowCard.tsx`
- Add optional `displayName?: string` prop. Render `displayName ?? workflow.name` in the title (L107), alt (L145), and overlay caption (L155). All map lookups (`workflowScenes`, `featureMap`) keep keying by `workflow.name`. Workflows.tsx already passes `displayName={DISPLAY_NAMES[workflow.slug ?? '']}` — it'll start taking effect.

### 7. `src/pages/Roadmap.tsx`
- L49 → `'Generate More Angles — 1 photo, endless angles'`

### 8. `src/data/learnContent.ts`
- L275 guide title → `'Generate More Angles'` (slug unchanged)

### 9. `src/data/faqContent.ts`
- L17, L67 Visual Types lists: replace "Picture Perspectives" with "Generate More Angles"
- L74 question → `"What is Generate More Angles?"`
- L75 answer: keep substance, replace name occurrences with "Generate More Angles"

## Studio chat edits

### 10. `supabase/functions/studio-chat/index.ts`
- L110 catalog line → `**Generate More Angles** — multi-angle views from one image …`
- L140 quick action link label → `[[Generate More Angles|/app/perspectives]]` (route preserved)
- L168 credits line → `Generate More Angles: **6 credits** per angle`
- L228 contextual map value → `'Generate More Angles — they are generating multi-angle product views.'`

No changes to `src/components/app/StudioChat.tsx` (L67 just compares `location.pathname` — no UI string).

## Preserved (not touched)

- Route `/app/perspectives`
- DB workflow row `name = 'Picture Perspectives'`, `slug = 'picture-perspectives'`
- `useGeneratePerspectives` hook + its `workflow_label` prefix `'Picture Perspectives — …'`
- `workflowAnimationData` key `'Picture Perspectives'`
- `WorkflowCard` featureMap key `'Picture Perspectives'`
- `CreativeDropWizard` image map key `'Picture Perspectives'`
- Console `[Perspectives]` logs, file/component identifiers

## Risk

Low. All edits are display strings except the additive `displayName` prop on `WorkflowCard`. No runtime keys, queries, or workflow lookups change.