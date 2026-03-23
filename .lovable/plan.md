

# Move Workflow Animations Below Image in Modal Cards

## Idea
Instead of floating animated overlays on top of the background image (which clutters small modal cards), show the **image clean** and display the workflow "ingredients" as a **horizontal animated strip** between the image and the workflow name. Each ingredient (Product, Model, Scene) appears as a small pill/chip that slides in sequentially — making it immediately clear what inputs each workflow needs.

```text
┌──────────────────┐
│                  │
│   Clean image    │
│   (no overlays)  │
│                  │
├──────────────────┤
│ [🧥 Product] [👤 Model] [📍 Scene]  ← animated chips
│                  │
│ Virtual Try-On   │
│ [Create Set →]   │
└──────────────────┘
```

## Changes

### 1. `src/components/app/WorkflowAnimatedThumbnail.tsx`

When `modalCompact` is true, **skip rendering floating elements** — only render the background image. The animated ingredient strip will live in the card component instead.

- In the main render (line ~752-774): wrap the floating elements container in `!modalCompact &&` so overlays don't appear on the image in modal mode.

### 2. `src/components/app/WorkflowCardCompact.tsx`

When `modalCompact` is true and a `scene` exists with elements, render a **horizontal animated strip** between the thumbnail and the title:

- Extract element data from `scene.elements` (product, model, scene, badge types)
- Render small pills: icon + label, with staggered `animation-delay` for sequential slide-in
- Use existing `animate-fade-in` or simple CSS keyframe with delay
- Pills are `bg-muted rounded-full px-2 py-0.5 text-[10px]` — compact, no borders
- Wrap in `flex gap-1.5 overflow-x-auto scrollbar-hide` for horizontal layout
- Only show for `modalCompact` mode

### Files
- `src/components/app/WorkflowAnimatedThumbnail.tsx` — skip floating elements when `modalCompact`
- `src/components/app/WorkflowCardCompact.tsx` — add animated ingredient strip between image and title for modal cards

