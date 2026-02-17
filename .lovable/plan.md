

## Mobile Freestyle: Improve Collapse Handle and "More Settings" Style

### Problem

1. **Collapse handle not clear**: The current pill-shaped handle (thin 40x4px bar) is not discoverable as a toggle. Users don't know they can collapse the prompt panel.

2. **"More settings" style mismatch**: The "More settings" button uses `h-7 px-2.5 text-[11px]` (smaller) while all other main chips use `h-8 px-3 text-xs` (standard size), making it look inconsistent.

### Changes

**File: `src/components/app/freestyle/FreestylePromptPanel.tsx`** (lines 184-192)

Replace the generic pill handle with a proper collapse/expand button that includes a chevron icon and a text hint:

- Use a full-width touchable row with a centered chevron (ChevronDown when expanded, ChevronUp when collapsed)
- Add subtle text label "Hide" / "Show prompt" so it's obvious
- Keep compact: `py-1.5` height, muted styling
- The pill bar stays as a decorative grab indicator above the chevron

**File: `src/components/app/freestyle/FreestyleSettingsChips.tsx`** (lines 373-389)

Update the "More settings" toggle to match the standard chip size:

- Change from `h-7 px-2.5 text-[11px]` to `h-8 px-3 text-xs` to match Upload Image, Model, Scene, etc.
- Keep the same color logic (active vs inactive) and badge count

### Technical Details

**FreestylePromptPanel.tsx collapse handle** (lines 186-191):

Current:
```
<button className="w-full flex items-center justify-center py-2 ...">
  <div className="w-10 h-1 rounded-full bg-border" />
</button>
```

Replace with:
```
<button className="w-full flex flex-col items-center gap-0.5 py-1.5 ...">
  <div className="w-8 h-1 rounded-full bg-border/60" />
  <div className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
    <ChevronDown className="w-3 h-3" /> {/* rotates 180 when collapsed */}
  </div>
</button>
```

**FreestyleSettingsChips.tsx "More settings"** (lines 375-389):

Change chip classes from `h-7 px-2.5 text-[11px]` to `h-8 px-3 text-xs` to match other chips exactly.

### Files Modified
- `src/components/app/freestyle/FreestylePromptPanel.tsx` -- clearer collapse handle with chevron
- `src/components/app/freestyle/FreestyleSettingsChips.tsx` -- "More settings" chip matches standard size

