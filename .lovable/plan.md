

## Fix Popover Flash-Close Bug + Match Style Chip

### Root Cause: Popovers Flash and Close

The prompt panel container (line 167-182 in `FreestylePromptPanel.tsx`) has `onTouchStart` and `onTouchEnd` handlers for the swipe-to-collapse gesture. These handlers fire on **every touch inside the panel**, including taps on popover trigger chips. Radix Popover uses pointer/touch events internally, and the parent touch handlers interfere -- causing the popover to briefly open then immediately close.

### Fix 1: Limit touch handlers to the pill handle only

Move `onTouchStart` and `onTouchEnd` from the outer container div (line 181-182) to only the collapse handle button (line 202-211). The swipe gesture should only work when dragging the pill handle, not when tapping chips.

**File: `src/components/app/freestyle/FreestylePromptPanel.tsx`**

- **Lines 181-182**: Remove `onTouchStart` and `onTouchEnd` from the outer container div
- **Lines 202-211**: Add `onTouchStart={handleTouchStart}` and `onTouchEnd={handleTouchEnd}` to the collapse handle button, and make it a `div` with a larger touch target so the swipe gesture still feels natural

### Fix 2: Style chip already matches (no change needed)

Looking at the screenshot, the Style chip on desktop already uses the same `h-8 px-3 rounded-full border` styling as other chips. The visual difference in the uploaded screenshot is the desktop layout where Style appears in a separate row with other advanced options -- this is expected behavior on desktop. On mobile, all chips use the same styling.

### Technical Changes

**`src/components/app/freestyle/FreestylePromptPanel.tsx`**

1. Remove touch handlers from outer container (lines 181-182):
```tsx
// Before
onTouchStart={isMobile && onToggleCollapse ? handleTouchStart : undefined}
onTouchEnd={isMobile && onToggleCollapse ? handleTouchEnd : undefined}

// After: remove these two props entirely
```

2. Move touch handlers to the collapse handle area (lines 201-212). Expand the handle's touch area and attach the swipe listeners there:
```tsx
{isMobile && onToggleCollapse && (
  <div
    onTouchStart={handleTouchStart}
    onTouchEnd={handleTouchEnd}
    className="w-full flex items-center justify-center py-3 cursor-grab"
  >
    <button
      onClick={onToggleCollapse}
      className="active:scale-[0.98] transition-transform"
      aria-label={isCollapsed ? 'Expand prompt' : 'Collapse prompt'}
    >
      <div className={cn(
        'h-[5px] rounded-full transition-all',
        isCollapsed ? 'w-10 bg-muted-foreground/30' : 'w-9 bg-border/50'
      )} />
    </button>
  </div>
)}
```

This ensures:
- Tapping any chip (Model, Scene, Product, etc.) works without interference
- The swipe-to-collapse gesture still works when swiping on the pill handle
- No other behavior changes

### Files Modified
- `src/components/app/freestyle/FreestylePromptPanel.tsx` -- move touch handlers to collapse handle only
