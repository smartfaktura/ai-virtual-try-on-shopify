

# Fix Contact Form Dialog Horizontal Spacing on Mobile

## Problem
The `ContactFormDialog` uses `mx-4` to add horizontal spacing on mobile, but since the dialog is `fixed` with `left-[50%] translate-x-[-50%]`, CSS margin doesn't create equal spacing from screen edges — it shifts the dialog off-center, leaving uneven gaps (more space on right than left).

## Fix

### File: `src/components/app/ContactFormDialog.tsx` (line 80)

Replace `mx-4 sm:mx-0` with a width constraint that works with the centered fixed positioning:

```tsx
// Before
<DialogContent className="max-w-md p-0 gap-0 overflow-hidden mx-4 sm:mx-0">

// After
<DialogContent className="max-w-md p-0 gap-0 overflow-hidden w-[calc(100%-2rem)] sm:w-full">
```

This uses `w-[calc(100%-2rem)]` on mobile to achieve the same 16px inset on each side, but it works correctly with `left-[50%] translate-x-[-50%]` centering. On `sm+`, it reverts to `w-full` (capped by `max-w-md`).

### Files
- `src/components/app/ContactFormDialog.tsx` — 1 class change on line 80

