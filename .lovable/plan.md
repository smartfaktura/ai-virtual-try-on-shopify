

# Fix: Prompt Helper Chip — Layout & Styling

## Problems
1. **Layout**: Prompt Helper is stuck at the end of the second row. On wider screens it could fit in the first row (after Scene), on narrower screens it wraps alone. It should flow naturally with all other chips in a single wrapping container.
2. **Styling**: The button always looks "active/clicked" (purple tinted with `border-primary/30 bg-primary/5 text-primary`) even when idle. It should match the neutral chip style used by Framing, Aspect Ratio, etc.

## Changes

### 1. Merge into single flex-wrap row (desktop)
**File**: `src/components/app/freestyle/FreestyleSettingsChips.tsx` (lines 322-370)

Remove the two-row `space-y-2` layout. Use a single `flex items-center gap-2 flex-wrap` container with all chips in natural order:

```
Upload → Product → Model → Scene → Framing → Brand → Aspect → Camera → Quality → Prompt Helper
```

This lets the browser wrap chips wherever they naturally fit based on available width — Prompt Helper will sit next to Scene on wide screens or flow to the next line with other chips on narrower ones.

### 2. Neutral idle styling for Prompt Helper button
**File**: `src/components/app/freestyle/FreestylePromptPanel.tsx` (line 319)

Change from the always-active purple style:
```
border-primary/30 bg-primary/5 text-primary hover:bg-primary/10
```
To the standard neutral chip style matching other unselected chips:
```
border-border bg-muted/50 text-foreground/70 hover:bg-muted
```

This makes it visually consistent — it looks like a regular chip, not a permanently pressed button.

## Files Modified
- `src/components/app/freestyle/FreestyleSettingsChips.tsx` — merge desktop into single wrapping row
- `src/components/app/freestyle/FreestylePromptPanel.tsx` — neutral chip styling

