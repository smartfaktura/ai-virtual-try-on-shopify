

# Enhanced Freestyle Loading State

## Overview

Replace the blank gray skeleton square with an engaging, branded loading experience. When generating, users will see a team avatar with animated status text, a progress bar, and helpful time estimate -- turning the wait into a polished, human moment.

## Current Problem

The loading state is a plain `<Skeleton />` square -- a flat gray rectangle with a pulse animation. No context about what's happening, no time estimate, and no personality. It feels broken rather than intentional.

## Design

Each generating placeholder will show:
1. A softly pulsing gradient background (not flat gray)
2. A centered team avatar with a subtle glow ring animation
3. A rotating status message (e.g., "Setting up the lighting...", "Composing the scene...")
4. A slim progress bar below the avatar area
5. A time estimate hint: "Usually takes 10-20 seconds"

The overall vibe is: a studio team member is actively working on your image.

---

## Changes

### File: `src/components/app/freestyle/FreestyleGallery.tsx`

**Replace `SkeletonCard` with a new `GeneratingCard` component:**

- Remove the plain `<Skeleton>` usage
- New component includes:
  - A `rounded-xl` card with animated gradient background (`bg-gradient-to-br from-muted/60 via-muted/40 to-muted/60` with a shimmer animation)
  - A centered team avatar (randomly picked from a small pool: Sophia, Luna, Kenji) displayed in a `w-12 h-12` rounded-full with a pulsing ring border
  - Below the avatar: a rotating status message that cycles every 3 seconds through phrases like:
    - "Setting up the lighting..."
    - "Composing the scene..."
    - "Refining the details..."
    - "Adding finishing touches..."
  - A slim `<Progress>` bar showing the current generation progress (passed as a prop)
  - A small hint line: "Usually 10-20s" in `text-xs text-muted-foreground/50`

**Props update:**
- Change `generatingCount` to also accept a `generatingProgress` number (0-100)
- The `FreestyleGalleryProps` interface gets: `generatingProgress?: number`

**Layout:**
- When count is <= 3 (centered flex layout): the generating card matches the `w-60` sizing
- When in grid layout: the generating card fills the grid cell like images do

### File: `src/pages/Freestyle.tsx`

- Pass the `progress` value from `useGenerateFreestyle` to the gallery as `generatingProgress`
- Update the `FreestyleGallery` call: add `generatingProgress={progress}`

---

## Technical Details

### GeneratingCard component (inside FreestyleGallery.tsx)

- Import team avatars: `avatar-sophia.jpg`, `avatar-luna.jpg`, `avatar-kenji.jpg`
- Use `useState` + `useEffect` with a 3-second `setInterval` to cycle through status messages
- Pick a random avatar on mount using `useState(() => ...)` so it stays consistent during the generation
- The progress bar uses the existing `<Progress>` component from `@/components/ui/progress`
- The shimmer effect uses the existing `animate-pulse` class on the background

### Status messages array

```
"Setting up the lighting..."
"Composing the scene..."  
"Styling the shot..."
"Refining the details..."
"Adjusting the colors..."
"Adding finishing touches..."
```

### Avatar pool with names

```
{ name: "Sophia", avatar: avatar-sophia }
{ name: "Luna", avatar: avatar-luna }
{ name: "Kenji", avatar: avatar-kenji }
```

The name appears as a small label above the status text: "Sophia is working on this..."

### Files modified

1. `src/components/app/freestyle/FreestyleGallery.tsx` -- Replace SkeletonCard, add GeneratingCard, update props
2. `src/pages/Freestyle.tsx` -- Pass `generatingProgress={progress}` to FreestyleGallery

