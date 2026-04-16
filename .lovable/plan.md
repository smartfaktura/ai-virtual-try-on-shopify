

# Upgrade Value Drawer — Differentiated Plans + Dynamic Copy

## Problem
1. The drawer's plan cards use a single `differentiator` string per plan — all three look similar (just credit counts + a short note)
2. The headline/subline ("Scale your fashion visual library" / "From 1 direction to a full campaign-ready collection") is static L2 copy that doesn't feel personal or dynamic

## Changes

### 1. Differentiated plan features — `UpgradeValueDrawer.tsx`
Replace the single `differentiator` string with the same `MODAL_PLAN_FEATURES` pattern from `NoCreditsModal` — a checklist of 3 unique items per plan with check icons:

| Starter | Growth | Pro |
|---------|--------|-----|
| 500 credits/mo | 1,500 credits/mo | 4,500 credits/mo |
| 3 Brand Profiles | Priority queue | Priority queue |
| Up to 100 products | Brand Models · NEW | Unlimited products & profiles |

Each feature rendered as a `Check` icon + text row instead of the current plain text line.

### 2. Dynamic headline + subline — `conversionCopy.ts`
Update L2 copy to be more personal and action-oriented. Change from generic "Scale your X library" to copy that references the user's momentum:

| Category | New Headline | New Subline |
|----------|-------------|-------------|
| fashion | Your fashion visuals, unlimited | Go from one direction to a full campaign-ready collection |
| beauty | Your beauty content, unlimited | Cover every channel — studio to lifestyle and beyond |
| jewelry | Your jewelry catalog, unlimited | Every angle, detail, and setting — no limits |
| fragrances | Your fragrance visuals, unlimited | Conceptual to editorial — every direction covered |
| food | Your food visuals, unlimited | Packshots to styled scenes — cover every listing |
| electronics | Your product visuals, unlimited | Feature shots to lifestyle — all in one place |
| home | Your home visuals, unlimited | Room scenes to catalogs — every surface styled |
| accessories | Your accessories content, unlimited | Studio to lifestyle — every angle and context |
| fallback | Your visual production, unlimited | Create the complete set your brand needs |

### Files changed
- `src/components/app/UpgradeValueDrawer.tsx` — add `DRAWER_PLAN_FEATURES` map, render check-list items, remove `differentiator` string
- `src/lib/conversionCopy.ts` — update L2 headline/subline copy for all categories

