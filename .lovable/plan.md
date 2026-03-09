

## Add Shareable URLs for Discover Items

Currently, clicking a Discover item opens a modal but the URL stays at `/discover`. There's no way to share or bookmark a specific item. This plan adds URL-based routing so each item gets a unique, shareable URL.

### How it works

When a user clicks an item, the URL updates to `/discover/:itemId` (e.g., `/discover/abc-123` for presets, `/discover/scene-custom-xyz` for scenes). Visiting that URL directly will auto-open the detail modal for that item. Closing the modal navigates back to `/discover`.

### Changes

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/discover/:itemId` route for both public and authenticated layouts, pointing to the same components |
| `src/pages/PublicDiscover.tsx` | Read `itemId` from URL params. On mount, if `itemId` is present, find and auto-select that item. On card click, use `navigate(/discover/${id})` instead of just setting state. On modal close, navigate back to `/discover`. |
| `src/pages/Discover.tsx` | Same URL-driven pattern: read `itemId` param, auto-open modal, update URL on click/close |

### URL scheme

- Presets: `/discover/{uuid}` (uses the preset's database `id`)
- Scenes: `/discover/scene-{poseId}` (prefixed to distinguish from preset UUIDs)

### Behavior details

- Browser back button closes the modal (since it's a navigation)
- Direct link loads the feed, scrolls to top, and opens the item modal
- If an item ID is invalid/not found, the feed shows normally without a modal
- SEO: the public discover page already has `SEOHead`; individual item URLs will use the same meta

