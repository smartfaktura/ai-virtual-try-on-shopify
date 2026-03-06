

## Add "Submit to Discover" for All Users

The goal is to let every authenticated user submit their generated images to the Discover feed for review, with a chance to win up to 10,000 credits. Currently, only admins see "Add to Discover" in the Library modal, and the Freestyle gallery already has a Share button but the lightbox does not.

### What exists today

| Surface | Admin "Add to Discover" | User "Submit to Discover" |
|---|---|---|
| Freestyle gallery cards | Yes (Globe icon) | Yes (Send icon) |
| Freestyle lightbox | No | No |
| Library detail modal | Yes (admin section) | **No** |

The `SubmitToDiscoverModal` component and `useSubmitToDiscover` hook already exist and work. The `discover_submissions` table is already in place.

### Changes

**1. Library Detail Modal** (`src/components/app/LibraryDetailModal.tsx`)
- Import `SubmitToDiscoverModal` and `Send` icon
- Add a new section **above** the admin section (visible to ALL authenticated users) with a styled card:
  - Headline: "Share to Discover"
  - Subtitle: "Submit your best generations and win up to 10,000 credits"
  - A pill-shaped button with Send icon: "Submit for Review"
- Clicking opens the existing `SubmitToDiscoverModal` pre-filled with the image's data
- Style: subtle gradient card with `bg-primary/5 border border-primary/10 rounded-xl`, matching the luxury aesthetic

**2. Freestyle Lightbox** (`src/components/app/ImageLightbox.tsx`)
- Add optional `onShare` callback prop
- Render a new "Share" pill button in the bottom action bar (Send icon, same frosted-glass style as Download/Copy Prompt)
- Wire it up in `src/pages/Freestyle.tsx` where `ImageLightbox` is used — the callback opens `SubmitToDiscoverModal` for the current image

**3. Freestyle Lightbox integration** (`src/pages/Freestyle.tsx`)
- Add state for `shareImg` (same pattern as FreestyleGallery)
- Pass `onShare` to `ImageLightbox` that sets the share image
- Render `SubmitToDiscoverModal` when `shareImg` is set

No database or edge function changes needed — the submission table and review flow already exist.

