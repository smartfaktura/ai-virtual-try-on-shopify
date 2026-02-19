

## Fix: Banner Branding and Margin Alignment

### 1. Restyle LowCreditsBanner to VOVV.AI Branding
**File: `src/components/app/LowCreditsBanner.tsx`**

Replace the amber/yellow color scheme with the app's primary dark navy palette:

| Element | Current (amber) | New (primary/brand) |
|---------|-----------------|---------------------|
| Container bg | `bg-amber-50` | `bg-primary/5` |
| Container text | `text-amber-900` | `text-foreground` |
| Container border | `border-amber-200` | `border-primary/20` |
| Dark container | `dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800` | (remove, primary tokens handle dark mode) |
| Icon color | `text-amber-500 dark:text-amber-400` | `text-primary` |
| Button bg | `bg-amber-600 hover:bg-amber-700` | `bg-primary hover:bg-primary/90 text-primary-foreground` |

### 2. Fix QueuePositionIndicator Margins
**File: `src/pages/Freestyle.tsx`**

The queue indicator wrapper uses `px-1 pt-1` while the gallery grid uses `px-3 lg:px-1`. Update line 554:

```
// Before
<div className="px-1 pt-1">

// After
<div className="px-3 lg:px-1 pt-1 pb-2">
```

Also update the LowCreditsBanner wrapper (line 544) to use matching padding:

```
// Before
<div className="px-4 sm:px-6 lg:px-8">

// After
<div className="px-3 lg:px-1">
```

### 3. Increase Grid Gaps for Breathing Room
**File: `src/components/app/freestyle/FreestyleGallery.tsx`**

Increase `gap-1` to `gap-2` in both gallery layouts:

- Centered layout (line 426): `gap-1` to `gap-2`
- Masonry layout (line 452): `gap-1` to `gap-2`
- Masonry column gap (line 454): `gap-1` to `gap-2`

### Summary
- Banner uses branded navy/primary colors instead of amber
- All three horizontal sections (banner, queue indicator, gallery) share consistent `px-3 lg:px-1` padding
- Gallery grid has slightly more breathing room between items

