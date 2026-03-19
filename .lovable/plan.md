

# Fix Workflow Thumbnail Images — Revert to object-cover

## Problem
The previous change from `object-cover` to `object-contain` causes tall/narrow workflow images to render as thin vertical lines inside the small square thumbnails. `object-contain` preserves the full image but leaves empty space — terrible for small thumbnails.

## Fix

**File: `src/components/app/CreativeDropWizard.tsx`**

Two lines to change:

1. **Line 791** (workflow selection list): Change `object-contain` back to `object-cover`
2. **Line 883** (config step header): Change `object-contain` back to `object-cover`

`object-cover` fills the square thumbnail and crops the excess — the correct behavior for small preview thumbnails. The curated fallback image priority (which was also changed) remains correct.

