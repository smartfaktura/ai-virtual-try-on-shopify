

## Fix: Banner Branding, Spacing, and Margin Alignment

### 1. Restyle LowCreditsBanner to Match VOVV.AI Branding
**File: `src/components/app/LowCreditsBanner.tsx`**

Replace the amber/yellow color scheme with the app's dark navy primary palette:
- Container: `bg-primary/5 text-foreground border-primary/20` (instead of amber-50)
- Icon: `text-primary` (instead of amber-500)
- Button: `bg-primary text-primary-foreground hover:bg-primary/90` (instead of amber-600)
- Dark mode variants updated accordingly

### 2. Fix QueuePositionIndicator Margins to Match Gallery Grid
**File: `src/pages/Freestyle.tsx`**

The queue indicator wrapper currently uses `px-1 pt-1` while the gallery uses `px-3 lg:px-1`. Update the queue indicator wrapper to use matching horizontal padding:

```
// Before (line 554)
<div className="px-1 pt-1">

// After — match gallery's px-3 and add bottom spacing
<div className="px-3 lg:px-1 pt-1 pb-2">
```

### 3. Add Spacing Between Generating Card and Image Grid
**File: `src/components/app/freestyle/FreestyleGallery.tsx`**

Currently the masonry grid and the centered layout both use `gap-1` with no vertical separation from generating cards. In the masonry branch (4+ items), generating cards are mixed into columns already. In the centered branch (1-3 items), add a small gap:

```
// Before (line ~290)
<div className="flex items-stretch justify-center gap-1 px-3 lg:px-1">

// After — add gap-2 for breathing room
<div className="flex items-stretch justify-center gap-2 px-3 lg:px-1">
```

Also for the masonry layout, increase column gap slightly:

```
// Before
<div className="flex gap-1 px-3 lg:px-1 pb-4">

// After
<div className="flex gap-2 px-3 lg:px-1 pb-4">
```

### Summary of Visual Changes
- **Banner**: Dark navy/primary branding instead of amber/yellow
- **Queue indicator**: Horizontal margins match gallery grid (px-3 on mobile)
- **Grid gaps**: Slightly larger gaps (gap-2) between generating cards and images for breathing room
