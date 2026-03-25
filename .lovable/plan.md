

# Fix Camera Pill Label — Show "Pro" When Pro Is Selected

## Problem
In `FreestyleSettingsChips.tsx`, the Camera pill displays "Camera" when `pro` is selected. It should display "Pro".

## Change

### `src/components/app/freestyle/FreestyleSettingsChips.tsx` — Line 143

**Before:**
```tsx
{cameraStyle === 'natural' ? 'Natural' : 'Camera'}
```

**After:**
```tsx
{cameraStyle === 'natural' ? 'Natural' : 'Pro'}
```

One line change. The icon swap (Smartphone vs Camera) is already correct.

### Files
- `src/components/app/freestyle/FreestyleSettingsChips.tsx`

