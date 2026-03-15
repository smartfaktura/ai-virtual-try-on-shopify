

## Fix Upload Button Full-Width + Normalize Chip Sizes

### Problem
1. Upload button has `w-full sm:w-auto` — on mobile it takes the entire row
2. Product chip (and others) grow wider than needed when a name is selected — they should be capped to match other chips

### Changes

**`src/components/app/freestyle/FreestylePromptPanel.tsx`** (line 185):
- Remove `w-full` from upload button class — change `w-full sm:w-auto` to just no width constraint, so it sizes like all other chips

**`src/components/app/freestyle/ProductSelectorChip.tsx`**:
- Add `max-w-[140px]` to the outer button so the whole chip (including icon, text, X) is capped
- The label span already has truncate

**`src/components/app/freestyle/ModelSelectorChip.tsx`**:
- Same: add `max-w-[140px]` to the outer trigger button

**`src/components/app/freestyle/SceneSelectorChip.tsx`**:
- Same: add `max-w-[140px]` to the outer trigger button

**`src/components/app/freestyle/BrandProfileChip.tsx`**:
- Same: add `max-w-[140px]` to the outer trigger button

This caps all selector chips at the same max width so they look uniform and don't push other pills around.

