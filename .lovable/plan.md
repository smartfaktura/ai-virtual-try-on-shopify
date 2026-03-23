

# Fix: Grey Gap Below Open Prompt Panel on Mobile

## Problem
The wrapper div around the prompt panel uses `pb-5 sm:pb-6` when the panel is expanded. On mobile (390px), this creates a visible grey gap below the Generate button. The padding should only apply on larger screens where the panel floats above the page.

## Fix

### `src/pages/Freestyle.tsx` (line 916)

Change the non-collapsed padding to only apply on `sm` and up:

```tsx
// Before
isPromptCollapsed ? "pb-0" : "pb-5 sm:pb-6"

// After
isPromptCollapsed ? "pb-0" : "pb-0 sm:pb-6"
```

One token changed. Mobile gets `pb-0` always; desktop keeps its spacing.

