

# Fix: Remove Forced Aspect Ratio — Show Video at Natural Size

## Problem
The video player forces an aspect ratio class (e.g., `aspect-video`, `aspect-[9/16]`) on the `<video>` element itself, which creates white bars (letterboxing) when the video's actual dimensions don't match the forced ratio.

## Fix

**File: `src/components/app/video/VideoResultsPanel.tsx`**

Remove the `arClass` from both the `<video>` element and the original image container. Let the video render at its natural dimensions — the `w-full` + `object-contain` classes already handle responsive sizing correctly without forcing a container aspect ratio.

- **Line 146**: Remove `arClass` from the image wrapper div
- **Line 157**: Remove `arClass` from the `<video>` element
- **Line 144**: Remove the centering/padding wrapper's `flex items-center justify-center` — just let content flow naturally

The video will display at its native resolution without any forced aspect ratio constraints or white bars.

