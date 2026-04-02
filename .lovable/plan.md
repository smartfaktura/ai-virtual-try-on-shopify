

# Catalog Session Detail Modal

## Problem
Clicking a session card navigates to `/app/library` showing all images — not just the images from that specific shoot.

## Solution
Add a session detail modal directly in `CatalogHub.tsx` that opens when a session card is clicked, displaying only that session's images in a grid with download/lightbox support.

## Changes

### 1. `src/pages/CatalogHub.tsx` — Add session modal + state

- Add `useState<CatalogSession | null>` for the selected session
- Replace `navigate('/app/library')` in `SessionCard` with an `onOpen(session)` callback
- Add a `Dialog` modal that shows:
  - Header with product names, date, status, image count
  - Scrollable image grid (3 columns on desktop, 2 on mobile) showing all session images
  - Each image is clickable to open the existing `ImageLightbox` for full-screen viewing with navigation
  - Download button per image (reuse existing `saveOrShareImage` utility)
- Footer with a "View in Library" link for users who want the full library

### 2. Components reused
- `Dialog` / `DialogContent` / `DialogHeader` from existing UI
- `ImageLightbox` for full-screen image viewing with arrow navigation
- `ShimmerImage` for lazy-loaded thumbnails
- `saveOrShareImage` from `@/lib/mobileImageSave` for downloads

### Technical details
- No new files needed — all changes in `CatalogHub.tsx`
- The modal receives the full `CatalogSession` object (already has `images[]`, `productNames[]`, metadata)
- Lightbox state: `lightboxIndex: number | null` — when set, opens `ImageLightbox` overlay on top of the modal

