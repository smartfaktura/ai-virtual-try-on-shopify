

# Fix Prompt Helper & Reset Button Positioning

## Problem
1. Reset button and Prompt Helper are at bottom-right of textarea — overlapping with prompt text
2. On mobile, Prompt Helper icon is too small and hard to tap
3. User wants both buttons moved to **top-right corner** of the textarea area

## Changes

### `src/components/app/freestyle/FreestylePromptPanel.tsx`

Move the action buttons container from `absolute bottom-3 right-3` to `absolute top-3 right-3` (top-right corner of the textarea row). This prevents overlap with the prompt text which flows downward.

**Before (~line 263):**
```tsx
<div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-5 flex items-center gap-1.5">
```

**After:**
```tsx
<div className="absolute top-3 right-3 sm:top-4 sm:right-5 flex items-center gap-1.5">
```

Also make the Prompt Helper icon larger on mobile and always show the Wand2 icon at a tappable size:

**Before (~line 273-280):**
```tsx
<button className="inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] ...">
  <Wand2 className="w-3 h-3" />
  <span className="hidden sm:inline">Prompt Helper</span>
</button>
```

**After:**
```tsx
<button className="inline-flex items-center gap-1 h-7 px-2 rounded-md text-[11px] ...">
  <Wand2 className="w-4 h-4 sm:w-3 sm:h-3" />
  <span className="hidden sm:inline">Prompt Helper</span>
</button>
```

Also increase the reset button tap target on mobile similarly (`w-4 h-4 sm:w-3.5 sm:h-3.5`).

### Files
- `src/components/app/freestyle/FreestylePromptPanel.tsx` — reposition buttons to top-right, enlarge mobile tap targets

