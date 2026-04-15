

# Fix Typewriter Placeholder Position

## Problem
The typewriter overlay uses `absolute inset-0` inside the padded container (`px-3 sm:px-5`, `pt-4 sm:pt-5`), so the animated text starts at the container edge instead of aligning with the textarea text.

## Fix
**File: `src/components/app/freestyle/FreestylePromptPanel.tsx`**

The textarea itself has no padding — it inherits position from the container's padding. The typewriter overlay needs to match: instead of `inset-0`, it should have no explicit inset (so it flows naturally) or explicitly set `top-0 left-0` since it's already inside the padded container.

Actually, the real issue is that the overlay is `absolute inset-0` which stretches to fill the container from edge to edge, ignoring the container's padding. The textarea text starts after the container's padding.

**Solution**: Remove `inset-0` from all three `TypewriterPlaceholder` return variants and replace with `top-0 left-0 right-0` — since the overlay is `absolute` inside a `relative` container that has padding, `inset-0` makes it ignore padding. Instead, we should not use `absolute` positioning at all and let it sit in normal flow, or keep absolute but match the textarea's exact position.

Simplest fix: the textarea has no internal padding, so the overlay just needs to match the textarea's position within the padded parent. Change `absolute inset-0` to `absolute top-0 left-0 right-0` — wait, that's the same as `inset-0`.

The real fix: the container has padding but `inset-0` on a child means the child fills from `0,0` of the positioned parent, which IS at the padding boundary since padding is inside the box. So `inset-0` should actually work... unless there's a source image preview or other element shifting things.

Let me re-examine: the `relative` div has `px-3 sm:px-5 pt-4 sm:pt-5`. An `absolute inset-0` child fills the full content box of the parent — which starts at the padding edge, not inside the padding. So the typewriter text starts at top-left corner of the container, behind/under the padding area, while the textarea text starts after the padding.

**Fix**: Add matching padding to the typewriter overlay divs. All three returns (lines 148, 156, 165) should change from:
```
className="absolute inset-0 pointer-events-none ..."
```
to:
```
className="absolute inset-0 pointer-events-none ... px-0 py-0"
```

Wait — `absolute inset-0` means `top:0; right:0; bottom:0; left:0` relative to the nearest positioned ancestor. The padding on the parent doesn't affect the child's position — the child covers the full area including the padded region. But the textarea sits INSIDE the padding because it's in normal flow.

**Correct fix**: The overlay text starts at the top-left of the padded container (position 0,0), but textarea text starts after the padding. The overlay needs the same text position as the textarea. Since the textarea has no padding itself but sits after the container's padding, the simplest fix is to NOT use `inset-0` but instead just let the overlay sit in flow before the textarea, or add padding to the overlay that matches the container.

Actually — since the parent has `px-3 sm:px-5 pt-4 sm:pt-5 pb-2 sm:pb-3`, and the absolutely positioned child ignores padding: the overlay should NOT have `inset-0`. It should instead not specify `left`/`top` at all (or use appropriate offsets). But the simplest approach: just remove `absolute inset-0` from the overlay and position it the same way the textarea sits — but that would shift the textarea down.

**Simplest correct fix**: Keep `absolute` but don't use `inset-0`. Instead, let the overlay auto-position (which for absolute elements defaults to where it would be in flow). Since the overlay is rendered right before the textarea, it will naturally sit at the textarea's position. Just use `absolute pointer-events-none` without `inset-0`.

### Changes (3 spots in `TypewriterPlaceholder`):

**Line 148** (custom placeholder):
```tsx
// Before
<div className="absolute inset-0 pointer-events-none text-base leading-relaxed text-muted-foreground/50 pr-10">

// After  
<div className="absolute pointer-events-none text-base leading-relaxed text-muted-foreground/50 pr-10">
```

**Line 156** (focused state):
Same change — remove `inset-0`.

**Line 165** (typewriter animation):
Same change — remove `inset-0`.

## Impact
- 1 file, 3 lines changed
- Typewriter text aligns exactly with where the user types

