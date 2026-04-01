

# Improve Image Size Selector UX

## Problem
The "Select at least 1" warning text is small, uses only `text-destructive` (red text), and blends into the layout — easy to miss. The overall Image Size section needs better visual hierarchy and clearer validation feedback.

## Changes — `src/components/app/AspectRatioPreview.tsx`

### 1. Make "Select at least 1" more prominent
- Replace the small red text with a visible inline alert/badge style: add a background (`bg-destructive/10`), padding, rounded corners, and an `AlertCircle` icon so it stands out
- Move it below the grid (instead of floating right of the header) so users see it after scanning the options

### 2. Improve selected/unselected contrast
- Selected state: stronger ring (`ring-2 ring-primary`) and darker background (`bg-primary/10`)
- Unselected state: lighter border (`border-border/60`) to make the difference more obvious
- Add a small checkmark icon overlay on selected cards

### 3. Better header
- Add a subtle helper text below "Image Size" like `"Tap to select one or more sizes"` in muted text

These same improvements apply to both `AspectRatioMultiSelector` and `AspectRatioSelector` components in the same file. Single file change.

