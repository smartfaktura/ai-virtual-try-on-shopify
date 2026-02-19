

## Fix: Mobile-Optimize Queue Indicator and Generating Card

Two overlapping sections need to be compacted on mobile: the **QueuePositionIndicator** (the "Generating your images..." banner) and the **GeneratingCard** (the avatar placeholder in the gallery).

### 1. QueuePositionIndicator — Compact on Mobile
**File: `src/components/app/QueuePositionIndicator.tsx`**

In the `ProcessingState` component (lines 93-132):

- **Reduce padding**: `p-4` to `p-3 sm:p-4`
- **Reduce gap**: `gap-3` to `gap-2 sm:gap-3`
- **Hide the "Using Pro model" hint on mobile**: Add `hidden sm:block` to the complexity/pro-model hint line (line 110-112)
- **Hide the rotating team message row on mobile**: Add `hidden sm:flex` to the team avatar + message row (lines 117-125) since the GeneratingCard already shows a team member
- **Shrink progress bar**: reduce `h-1.5` to `h-1 sm:h-1.5`

This removes ~40px of vertical space on mobile.

### 2. GeneratingCard — Shrink on Mobile
**File: `src/components/app/freestyle/FreestyleGallery.tsx`**

In the `GeneratingCard` component (lines 80-115):

- **Container**: `gap-5 px-8` to `gap-3 sm:gap-5 px-4 sm:px-8`
- **Avatar**: `w-16 h-16` to `w-10 h-10 sm:w-16 sm:h-16`; glow ring `-inset-1.5` to `-inset-1 sm:-inset-1.5`
- **Status text container**: `min-h-[3.5rem]` to `min-h-0 sm:min-h-[3.5rem]`
- **Text sizes**: both `text-sm` lines to `text-xs sm:text-sm`
- **Progress bar**: `max-w-[200px]` to `max-w-[140px] sm:max-w-[200px]`; gap `space-y-2` to `space-y-1 sm:space-y-2`
- **"Wrapping up" text**: `text-xs` to `text-[10px] sm:text-xs`

This shrinks the generating card to fit comfortably on mobile without overlapping the gallery images or prompt panel.

