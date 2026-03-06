

## Make "Missing a scene/model?" Banners More Clickable

### Problem
The `MissingRequestBanner` in both Scene and Model selector popovers looks like a passive notification — dashed border, muted colors, small text. Users don't realize it's clickable. The Scene selector also hides it at the bottom behind scroll.

### Solution

**`src/components/app/MissingRequestBanner.tsx`** — When `compact` is true, restyle the collapsed state as a clear interactive button:
- Replace dashed border + muted background with a solid, slightly elevated style: `bg-primary/8 border-primary/20 border-solid hover:bg-primary/15`
- Add a right-arrow chevron (`ChevronRight` icon) to signal clickability
- Make the text slightly bolder and use `text-primary/70` instead of `text-muted-foreground`
- Add `cursor-pointer` and a subtle hover transition
- Keep the expanded (textarea) and submitted states unchanged

**`src/components/app/freestyle/SceneSelectorChip.tsx`** — Move `MissingRequestBanner` outside the scrollable `max-h-72` div so it's always visible at the bottom of the popover (like the Model selector already does visually).

**`src/components/app/freestyle/ModelSelectorChip.tsx`** — Same treatment: ensure the banner sits outside the scrollable grid area so it's pinned at the bottom.

### Visual result (collapsed compact state)
```text
┌─────────────────────────────────────────────┐
│  ⊞  Missing a model? Tell us, we'll    ›   │
│     create it in 1–2 business days.         │
└─────────────────────────────────────────────┘
```
Solid border, primary-tinted background, chevron arrow — clearly a button.

### Files changed
- `src/components/app/MissingRequestBanner.tsx` — restyle compact collapsed state
- `src/components/app/freestyle/SceneSelectorChip.tsx` — move banner outside scroll area
- `src/components/app/freestyle/ModelSelectorChip.tsx` — move banner outside scroll area

