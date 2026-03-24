

# Add Share Button to Discover Detail Modals

## Overview
Add a share popover to both `PublicDiscoverDetailModal` and `DiscoverDetailModal` with Copy Link, WhatsApp, Twitter/X, and Facebook sharing options. Uses a `Popover` component matching existing UI patterns.

## Approach

### 1. Create shared `SharePopover` component
**New file**: `src/components/app/SharePopover.tsx`

- A reusable `Popover` triggered by a share button (using `Share2` icon from lucide-react)
- Content layout:
  - **Copy link** button — copies current page URL to clipboard, shows sonner toast "Link copied"
  - Separator line
  - **Share via** label (uppercase micro text matching existing `text-[10px]` pattern)
  - WhatsApp, Twitter/X, Facebook buttons — each opens `window.open()` with pre-filled share URL
- Share URL: construct from `window.location.origin + /discover/{item-slug-or-id}` so the link is shareable
- Styled to match vovv.ai branding: `bg-background` popover, muted text, clean icons, rounded buttons

### 2. `src/components/app/PublicDiscoverDetailModal.tsx`
- Import and render `SharePopover` between the CTA button and the subtitle text (after line 194)
- Pass the item title and a constructed share URL

### 3. `src/components/app/DiscoverDetailModal.tsx`
- Add `SharePopover` in the secondary actions row (line 406-462) alongside Save, Similar, Feature buttons
- Same styling as the existing action buttons (rounded-xl, muted bg, border)

### Files
- `src/components/app/SharePopover.tsx` — new shared component
- `src/components/app/PublicDiscoverDetailModal.tsx` — integrate share button
- `src/components/app/DiscoverDetailModal.tsx` — integrate share button

