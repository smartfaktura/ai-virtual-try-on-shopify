

# Shorten Mobile CTA in Public Discover Detail Modal

## Problem
The CTA button text "Create account for free to generate results like this" is too long for mobile screens, causing overflow or awkward wrapping.

## Change

### `src/components/app/PublicDiscoverDetailModal.tsx`

On the non-recreate branch (line 187), use shorter text on mobile via a responsive approach:
- Show `"Try this for free"` on small screens (`sm:hidden` span)
- Show the full `"Create account for free to generate results like this"` on larger screens (`hidden sm:inline`)

This keeps the button compact on mobile while preserving the descriptive text on desktop.

### Files
- `src/components/app/PublicDiscoverDetailModal.tsx` — responsive CTA text

