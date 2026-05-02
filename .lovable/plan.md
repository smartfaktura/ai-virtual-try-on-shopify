
## Changes

### 1. Hide Virtual Try-On card from /app/workflows

In `src/pages/Workflows.tsx`, add `virtual-try-on-set` to the existing slug filter (line 61 already filters `product-listing-set`):

```ts
.filter(w => w.slug !== 'product-listing-set' && w.slug !== 'virtual-try-on-set');
```

The workflow and its generation flow remain intact -- only the card is hidden from the Visual Studio grid.

### 2. Make Product Visuals the visually dominant card

- In both `WorkflowCard` and `WorkflowCardCompact`, add a `featured` prop that applies a subtle primary border glow, a "Recommended" badge, and slightly larger text/padding when the workflow slug is `product-images`.
- In `Workflows.tsx`, pass `featured={workflow.slug === 'product-images'}` to both card components.

### 3. Remove pre-made suggestion chips from live chat

In `StudioChat.tsx`:
- Remove the `PAGE_CHIPS` map and `DEFAULT_CHIPS` array entirely.
- Remove the `getChipsForPage` helper and the chip rendering block (lines 242-254).
- Remove the `showChips` variable.

### 4. Update live chat to recommend Product Visuals

In `supabase/functions/studio-chat/index.ts`, update the `SYSTEM_PROMPT`:
- Add a directive: "When users ask about creating product visuals, generating images, or need help choosing a Visual Type, always recommend starting with **Product Visuals** at /app/generate/product-images as the primary and most comprehensive option. Use the CTA [[Start Product Visuals|/app/generate/product-images]]."
- Add this CTA to the approved CTAs list.
- Remove "Virtual Try-On" from the Visual Types list in the prompt (keep it as internal knowledge but don't proactively suggest it).
- When users ask about support or contacting the team, include the [[Talk to the Team|__contact__]] CTA in the response.

### Files changed
- `src/pages/Workflows.tsx` -- filter out virtual-try-on-set, pass `featured` prop
- `src/components/app/WorkflowCard.tsx` -- add `featured` styling
- `src/components/app/WorkflowCardCompact.tsx` -- add `featured` styling
- `src/components/app/StudioChat.tsx` -- remove chips
- `supabase/functions/studio-chat/index.ts` -- update system prompt
