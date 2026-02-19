

## Fix: "Not enough credits" Text Clipping on Mobile

### Problem
In the freestyle prompt panel's action bar, the "Not enough credits" message and "Buy Credits" button share a single horizontal row. On mobile, the text gets truncated ("Not enough c...") because the button takes priority in the flex layout.

### Solution
When credits are insufficient on mobile, switch the action bar to a vertical layout so the warning text appears above a full-width "Buy Credits" button.

### Changes (single file: `src/components/app/freestyle/FreestylePromptPanel.tsx`)

**Line 275 — Action bar container**: Make it wrap vertically on mobile when showing insufficient credits:
```tsx
// Before
<div className="px-4 sm:px-5 py-3 flex items-center justify-end gap-3">

// After — add flex-wrap support
<div className="px-4 sm:px-5 py-3 flex flex-wrap items-center justify-end gap-2 sm:gap-3">
```

**Lines 287-290 — Warning text**: Make it full-width on mobile so it sits on its own row:
```tsx
// Before
<p className="text-xs text-muted-foreground mr-auto truncate">
  <span className="hidden sm:inline">Need {creditCost - (creditBalance ?? 0)} more credits</span>
  <span className="sm:hidden">Not enough credits</span>
</p>

// After — full width on mobile, no truncation
<p className="text-xs text-muted-foreground mr-auto w-full sm:w-auto">
  <span className="hidden sm:inline">Need {creditCost - (creditBalance ?? 0)} more credits</span>
  <span className="sm:hidden">Not enough credits</span>
</p>
```

**Line 301 — Buy Credits button**: Make it full-width on mobile (it already has `w-full sm:w-auto`, so it just needs the parent to allow wrapping — already handled above).

This gives a clean two-row layout on mobile:
- Row 1: "Not enough credits" (full width)
- Row 2: "Buy Credits" button (full width)

On desktop, it remains a single row as before.
