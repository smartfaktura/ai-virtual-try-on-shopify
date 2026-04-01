

# Catalog Studio Frontend Redesign

## Overview
Complete UI/UX overhaul of the `/app/catalog` wizard. Replace the current plain stepper and basic card layouts with a premium, branded experience featuring VOVV.AI team avatars, better visual hierarchy, and polished interactions across all 6 steps.

## Design Concept

```text
┌─────────────────────────────────────────────────┐
│  Catalog Studio                                 │
│  ┌───────────────────────────────────────────┐  │
│  │ ○ Products ─── ○ Style ─── ○ Models ───  │  │
│  │ ○ Background ─── ○ Shots ─── ○ Review    │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────┐  ┌─────────────────┐  │
│  │    Step Content       │  │ Sidebar Summary │  │
│  │    (full width)       │  │ + Team Avatar   │  │
│  └──────────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Key Design Changes

1. **New stepper bar**: Horizontal pill-style stepper with step labels, progress line fill animation, and icons — replacing the current plain numbered circles.

2. **Floating context sidebar**: A sticky right-side summary panel (hidden on mobile, collapsible) showing current selections as they're made — product count, style badge, model thumbnails, background swatch, shot count, and credit estimate. This gives users confidence at every step.

3. **VOVV.AI Team Avatar integration**: A branded "Your Studio Team" strip at the top of the page showing 3 rotating team member avatars (Sophia for lighting, Zara for styling, Kenji for art direction) with hover cards. These contextualize the AI as a team effort.

4. **Step 1 (Products)**: Larger product cards (4-col grid), subtle hover lift, improved selection checkbox overlay, drag-to-select feel. Selected products get a subtle glow ring. Empty state with illustration.

5. **Step 2 (Style)**: Visual style cards with a color mood strip (gradient bar from the style's palette) at the top of each card, plus a "recommended" badge on the most popular style.

6. **Step 3 (Models)**: Larger avatar previews (6-col), gender filter tabs, sticky product-only toggle card at top with better visual treatment.

7. **Step 4 (Background)**: Larger swatches in a 4-col grid with the color filling the full card, label overlay at bottom. Selected state uses a thick primary ring.

8. **Step 5 (Shots)**: Shot cards with descriptive icons/illustrations, grouped with collapsible sections, and a live credit calculator pinned at the bottom.

9. **Step 6 (Review)**: Visual summary with product thumbnail strip, model avatar strip, style + background badge row, shot list, and a prominent "Generate" CTA with credit breakdown.

## Files to Create / Modify

| File | Action | Description |
|------|--------|-------------|
| `src/pages/CatalogGenerate.tsx` | **Rewrite** | New stepper, layout with context sidebar, team avatar strip, all step wiring preserved |
| `src/components/app/catalog/CatalogStepProducts.tsx` | **Rewrite** | Larger cards, better selection UX, improved empty state |
| `src/components/app/catalog/CatalogStepFashionStyle.tsx` | **Rewrite** | Visual mood cards with color strip and recommended badge |
| `src/components/app/catalog/CatalogStepModelsV2.tsx` | **Rewrite** | Larger avatars, gender filter, better product-only toggle |
| `src/components/app/catalog/CatalogStepBackgroundsV2.tsx` | **Rewrite** | Full-bleed color swatches, 4-col grid, better selected state |
| `src/components/app/catalog/CatalogStepShots.tsx` | **Rewrite** | Descriptive shot cards, collapsible groups, pinned credit calc |
| `src/components/app/catalog/CatalogStepReviewV2.tsx` | **Rewrite** | Visual summary strips, prominent CTA |
| `src/components/app/catalog/CatalogStepper.tsx` | **Create** | Extracted pill-style stepper component |
| `src/components/app/catalog/CatalogContextSidebar.tsx` | **Create** | Floating right-side summary panel |
| `src/components/app/catalog/CatalogTeamStrip.tsx` | **Create** | VOVV.AI team avatar strip with 3 rotating members + hover cards |

## What stays the same
- All state management, hooks, types, and generation logic in `CatalogGenerate.tsx` — only the JSX/layout changes
- `catalogEngine.ts` — untouched
- `useCatalogGenerate.ts` — untouched
- All prop interfaces between parent and step components — preserved (may add optional new props for sidebar data)
- Progress/completion/lightbox rendering — refreshed visually but same logic

## Technical Notes
- Team avatars reuse `TEAM_MEMBERS` from `teamData.ts` and `TeamAvatarHoverCard` component
- Context sidebar uses `position: sticky` with `top` offset, hidden below `lg` breakpoint
- Stepper uses CSS `transition` on the progress line width for smooth animation
- All components continue using shadcn/ui primitives (Button, Badge, Tabs, Tooltip, etc.)
- Follows existing design system: Inter font, weights 300-600, backdrop-blur, `duration-150` transitions

