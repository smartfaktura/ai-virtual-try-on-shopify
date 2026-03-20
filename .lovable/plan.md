

# Fix Workflow Card Thumbnail Focus

## Problem
The `WorkflowAnimatedThumbnail` component uses `object-top` on all background images, which works for the wider row layout but crops out the important center content (e.g., the model) when displayed in the square compact card.

## Solution
Change `object-top` to `object-center` on the background `<img>` elements inside `WorkflowAnimatedThumbnail.tsx`. This affects approximately 5 occurrences across different render modes (carousel, upscale, staging, default).

### File: `src/components/app/WorkflowAnimatedThumbnail.tsx`
- Line 192: `object-cover object-top` → `object-cover object-center`
- Line 285: `object-cover object-top` → `object-cover object-center`
- Line 296: `object-cover object-top` → `object-cover object-center`
- Line 663: `object-cover object-top` → `object-cover object-center`

This centers the focal point of every workflow thumbnail, ensuring models and key content are visible in both row and grid layouts.

