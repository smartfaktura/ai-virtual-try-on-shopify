

# Fix Lightbox Not Covering Full Page

## Problem
The lightbox in the Results page renders inside the `<main>` content area, which is a child of the AppShell flex layout. The sidebar bleeds through on the left side because the lightbox's `fixed inset-0 z-50` is trapped in a stacking context created by the AppShell layout.

## Solution
Render the `ImageLightbox` component via a React **portal** to `document.body`, ensuring it sits above everything regardless of DOM nesting.

## File: `src/components/app/ImageLightbox.tsx`

1. Import `createPortal` from `react-dom`
2. Wrap the entire lightbox return in `createPortal(..., document.body)`

This is a 3-line change that fixes the issue globally for all pages using the lightbox (Results, Library, Freestyle, etc.).

