
## Improve Mirror Selfie Set Animation Elements

### Problem
1. The floating "ingredient" cards (Product, Model, Scene) and their text labels are too small
2. The "+" action icon overlaps with the model's face in the background image

### Changes

**File: `src/components/app/WorkflowAnimatedThumbnail.tsx`** -- Scale up all floating element sizes:

- **Product/Scene cards**: Increase thumbnail from `w-12 h-14` to `w-14 h-16`, increase sublabel from `text-[7px]` to `text-[9px]`, increase label from `text-[11px]` to `text-[13px]`, add more padding
- **Model circle**: Increase avatar from `w-[52px] h-[52px]` to `w-[60px] h-[60px]`, increase label from `text-[9px]` to `text-[11px]`
- **Action button (+ icon)**: Increase from `w-10 h-10` to `w-12 h-12`, increase icon size from `w-4 h-4` to `w-5 h-5`
- **Badge**: Increase text from `text-[10px]` to `text-[12px]`

**File: `src/components/app/workflowAnimationData.tsx`** -- Reposition the "+" action icon:

- Move the action icon position from `{ top: '40%', left: '38%' }` to approximately `{ top: '48%', left: '42%' }` so it sits lower and avoids overlapping the model's face in the mirror reflection
