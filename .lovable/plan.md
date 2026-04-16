

# No Credits Modal — Differentiated Plan Features

## Problem
The modal renders `p.features.slice(0, 3)` — the first 3 features from each plan. Since all plans share the same first 6 items ("All workflows", "Bulk generations", "Freestyle", "All Models & Scenes", "Upscale", "Video"), every card looks identical. The real differentiators (credits, profiles, products, Brand Models, Priority queue) are never shown.

## Solution
Instead of pulling generic features from the shared `features` array, define **modal-specific differentiators** directly in `NoCreditsModal.tsx` — a small lookup map per plan that highlights what makes each tier unique.

### Per-plan highlights (3 lines each):

| Starter | Growth | Pro |
|---------|--------|-----|
| 500 credits/mo | 1,500 credits/mo | 4,500 credits/mo |
| 3 Brand Profiles | Priority queue | Priority queue |
| Up to 100 products | Brand Models · NEW | Unlimited products & profiles |

### Implementation — `NoCreditsModal.tsx`

1. Add a `MODAL_PLAN_FEATURES` map above the component:
```ts
const MODAL_PLAN_FEATURES: Record<string, string[]> = {
  starter: ['500 credits every month', '3 Brand Profiles', 'Up to 100 products'],
  growth: ['1,500 credits every month', 'Priority generation queue', 'Brand Models'],
  pro: ['4,500 credits every month', 'Priority generation queue', 'Unlimited products & profiles'],
};
```

2. Replace `p.features.slice(0, 3)` with `MODAL_PLAN_FEATURES[p.planId]` in the free-user plan cards section.

3. For Growth's "Brand Models" line, add a small `NEW` badge inline (simple `<Badge>` after text).

## Single file change
`src/components/app/NoCreditsModal.tsx`

