

# Fix Mobile 2-Column Workflow Cards

## Problem
The compact cards use `aspect-square` (1:1) thumbnails which are too short for the animated overlays — product chips, model circles, and badges get cramped and overlap, making them hard to see on mobile.

## Changes

### 1. Taller thumbnail aspect ratio — `WorkflowCardCompact.tsx`
Change the thumbnail from `aspect-square` to `aspect-[3/4]` (portrait). This gives ~33% more vertical space for the floating animation elements to breathe.

### 2. Scale down animation elements for compact cards — `WorkflowAnimatedThumbnail.tsx`
Add a `compact` prop that scales down the floating elements:
- Product/scene cards: image from `w-14 h-16` → `w-10 h-12`, text from `text-[13px]` → `text-[11px]`, sublabel from `text-[9px]` → `text-[8px]`
- Model circles: from `w-[60px] h-[60px]` → `w-[44px] h-[44px]`, label text smaller
- Action buttons: from `w-12 h-12` → `w-9 h-9`
- Badges: padding and text reduced slightly

### 3. Pass `compact` from `WorkflowCardCompact`
The compact card passes `compact={true}` to `WorkflowAnimatedThumbnail`, while `WorkflowCard` (the full-width card) continues without it.

### Files
- `src/components/app/WorkflowCardCompact.tsx` — change aspect ratio
- `src/components/app/WorkflowAnimatedThumbnail.tsx` — add `compact` prop, conditionally reduce element sizes

