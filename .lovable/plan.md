

# Fix Workflow Card Images: Fill Space + Remove Scale

## Problem
1. `scale(0.95)` on the background image shrinks it by 5%, leaving visible gaps around the edges instead of filling the card
2. The aspect ratios were made wider (`aspect-[4/5]`, `aspect-[3/4]`) which crops the images more horizontally

## Changes

### 1. `src/components/app/WorkflowAnimatedThumbnail.tsx` (line 751)
Remove `scale(0.95)` — let `object-cover` fill the container naturally:
```tsx
transform: 'translateZ(0)',
```

### 2. `src/components/app/WorkflowCardCompact.tsx` (line 52)
Restore taller portrait aspect ratios so images show more content vertically:
```tsx
// From:
modalCompact ? "aspect-[3/4]" : mobileCompact ? "aspect-[3/4]" : "aspect-[4/5]"
// To:
modalCompact ? "aspect-[3/4]" : mobileCompact ? "aspect-[2/3]" : "aspect-[3/4]"
```

- **Modal**: `aspect-[3/4]` (unchanged)
- **Mobile hub**: back to `aspect-[2/3]` (tall portrait)
- **Desktop hub**: `aspect-[3/4]` (tall portrait, images fill fully)

### Files
- `src/components/app/WorkflowAnimatedThumbnail.tsx` — line 751
- `src/components/app/WorkflowCardCompact.tsx` — line 52

