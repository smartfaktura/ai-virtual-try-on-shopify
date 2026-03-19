

# Widen Freestyle Prompt Panel + Fix Chip Layout

## Problem
The prompt bar is constrained to `max-w-3xl` (768px) on desktop, leaving empty space on the right. With 9 chips across two rows, they look cramped and oddly spaced within this narrow container.

## Changes

### 1. `src/pages/Freestyle.tsx` (line 810)
Widen the prompt panel container from `lg:max-w-3xl` to `lg:max-w-4xl` (896px). This gives chips more breathing room and fills the available space better.

```
lg:max-w-3xl → lg:max-w-4xl
```

### 2. `src/components/app/freestyle/FreestyleSettingsChips.tsx` — Desktop layout (lines 293-322)
Change the second row of chips to spread evenly using `justify-between` or add slight spacing improvements so chips don't cluster on the left with empty space on the right. Increase gap from `gap-1.5` to `gap-2` for both rows to give chips more visual breathing room.

### Summary
- One class change in Freestyle.tsx: `max-w-3xl` → `max-w-4xl`
- Gap increase in FreestyleSettingsChips desktop rows: `gap-1.5` → `gap-2`

