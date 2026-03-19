

# Make Freestyle Prompt Bar Narrower + Add Support Icon Spacing

## Problem
The prompt panel currently uses `lg:max-w-4xl` (896px) which makes it stretch too wide on desktop/tablet. It also sits at the very bottom with no right-side margin awareness, causing it to overlap the customer support chat icon.

## Changes

### 1. `src/pages/Freestyle.tsx` — Reduce max-width and add bottom-right spacing

**Line 810** — Change `lg:max-w-4xl` to `lg:max-w-2xl` (672px) to make the bar noticeably narrower.

**Line 809** — Add right padding (`lg:pr-20`) to ensure the bar doesn't overlap the support icon (typically positioned ~60px from the right edge). Also add `lg:pb-5` for vertical breathing room above the support icon.

**Before:**
```
<div className="lg:px-4 lg:sm:px-8 lg:pb-3 lg:sm:pb-5 lg:pt-2 lg:pointer-events-none">
  <div className="lg:max-w-4xl lg:mx-auto lg:pointer-events-auto relative z-20">
```

**After:**
```
<div className="lg:px-4 lg:sm:px-8 lg:pb-5 lg:sm:pb-6 lg:pt-2 lg:pointer-events-none lg:pr-20">
  <div className="lg:max-w-2xl lg:mx-auto lg:pointer-events-auto relative z-20">
```

This reduces the bar width by ~25% and adds explicit clearance for the support icon on the bottom-right.

