
## Fix Mobile Prompt Bar: Corners + Clean Collapsed State

### Problem

1. **Corners clipped**: The parent wrapper `<div className="lg:hidden">` has no overflow or border-radius settings, so the `rounded-t-3xl` corners of the prompt panel get visually cut off
2. **Collapsed state too busy**: Currently shows "Describe what you want..." text and a ChevronUp icon -- user wants ONLY the pill handle when collapsed, nothing else

### Changes

**File: `src/pages/Freestyle.tsx`** (line 613)

Add `overflow-visible` and matching rounded corners to the mobile wrapper so the panel's rounded corners render properly:

```
<div className="lg:hidden overflow-visible">
```

**File: `src/components/app/freestyle/FreestylePromptPanel.tsx`** (lines 200-217)

Remove the collapsed text row entirely. When collapsed, show only the pill handle centered in a generous touch target -- clean, minimal, Apple-style:

Replace the entire collapse handle block with:
```tsx
{isMobile && onToggleCollapse && (
  <button
    onClick={onToggleCollapse}
    className="w-full flex items-center justify-center py-3 active:scale-[0.98] transition-transform"
    aria-label={isCollapsed ? 'Expand prompt' : 'Collapse prompt'}
  >
    <div className={cn(
      'h-[5px] rounded-full transition-all',
      isCollapsed ? 'w-10 bg-muted-foreground/30' : 'w-9 bg-border/50'
    )} />
  </button>
)}
```

This removes the "Describe what you want..." text and ChevronUp icon from the collapsed state, leaving only the clean pill indicator.

### Files Modified
- `src/pages/Freestyle.tsx` -- add overflow-visible to mobile wrapper
- `src/components/app/freestyle/FreestylePromptPanel.tsx` -- remove text from collapsed state, pill-only handle
