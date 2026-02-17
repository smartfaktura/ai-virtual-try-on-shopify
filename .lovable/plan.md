

## Mobile Prompt Bar: Swipe Gesture + Collapsed Message

### Problem

1. The prompt bar only responds to taps on the pill handle -- there's no swipe-down gesture, which feels unnatural on mobile (users expect to swipe a bottom sheet down to dismiss it)
2. When collapsed, there's no hint about what the bar does -- just a tiny pill with no context
3. The pill handle alone doesn't feel interactive enough for a premium app experience

### Changes

**File: `src/components/app/freestyle/FreestylePromptPanel.tsx`**

1. **Add touch swipe gesture** for collapse/expand:
   - Track `touchStart` Y position on the handle area
   - On `touchEnd`, if user swiped down more than 40px while expanded, collapse; if swiped up more than 40px while collapsed, expand
   - Add `onTouchStart` and `onTouchEnd` handlers to the outer container (not just the pill button)
   - This gives the native iOS bottom-sheet feel

2. **Show a compact collapsed row** when collapsed:
   - Instead of just a bare pill, show: pill handle + a single line like "Tap to create" or "Describe what you want..." in muted small text + a small chevron-up icon
   - This gives users a clear hint that the bar is interactive and what it does
   - Keep height compact (~52px) so it doesn't eat into the grid

3. **Subtle visual refinements to the pill**:
   - Slightly wider pill when collapsed (`w-10`) to be more visible
   - Add a gentle scale animation on touch (`active:scale-95`) for tactile feedback

**Collapsed state layout:**
```text
+--------------------------------------------------+
|              ───── (pill handle) ─────            |
|   "Describe what you want..."        ChevronUp   |
+--------------------------------------------------+
```

### Technical Details

**Touch gesture implementation** (added to FreestylePromptPanel):

```tsx
const touchStartY = useRef<number | null>(null);

const handleTouchStart = (e: React.TouchEvent) => {
  touchStartY.current = e.touches[0].clientY;
};

const handleTouchEnd = (e: React.TouchEvent) => {
  if (touchStartY.current === null || !onToggleCollapse) return;
  const delta = e.changedTouches[0].clientY - touchStartY.current;
  // Swipe down while expanded -> collapse
  if (delta > 40 && !isCollapsed) onToggleCollapse();
  // Swipe up while collapsed -> expand
  if (delta < -40 && isCollapsed) onToggleCollapse();
  touchStartY.current = null;
};
```

Attach `onTouchStart={handleTouchStart}` and `onTouchEnd={handleTouchEnd}` to the outer mobile container div.

**Collapsed row** (replaces current collapsed state):

When `isCollapsed` is true, instead of only showing the pill button, show:
- The pill handle (slightly larger)
- A row below with muted placeholder text "Describe what you want..." and a ChevronUp icon on the right
- The whole area is tappable to expand

**Updated pill button section** (lines 186-197):

The pill handle remains but gets `active:scale-95` for feedback. When collapsed, an additional hint row appears below the pill with the placeholder text and chevron.

### Files Modified
- `src/components/app/freestyle/FreestylePromptPanel.tsx` -- swipe gesture, collapsed hint row, pill refinements

