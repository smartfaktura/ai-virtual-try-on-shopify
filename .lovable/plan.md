
## Fix: Make Public Discover Auth-Aware

### Problem
When a logged-in user visits `/discover` (the public route), they still see the "Create account for free" CTA instead of actionable buttons like "Use Prompt", "Use Scene", "Copy", "Save", etc. The page doesn't check auth state at all.

### Solution
Make `PublicDiscover.tsx` auth-aware: if the user is logged in, render the full `DiscoverDetailModal` (same as `/app/discover`) with all interactive buttons. If not logged in, keep the current `PublicDiscoverDetailModal` with the sign-up CTA.

### Changes

**1. `src/pages/PublicDiscover.tsx`**
- Import `useAuth` from `@/contexts/AuthContext`
- Import `DiscoverDetailModal` (the authenticated version)
- Import `useSavedItems`, `useIsAdmin`, `useFeaturedItems`, `useToggleFeatured` (same hooks used in the app Discover page)
- Check `user` from `useAuth()`:
  - If logged in: render `DiscoverDetailModal` with full functionality (Use Prompt/Scene, Copy, Save, Similar, Feature)
  - If not logged in: render `PublicDiscoverDetailModal` (existing behavior)
- Add `handleUseItem` that navigates to `/app/freestyle` with the appropriate params (same logic as app Discover)
- Wire up save/featured/similar handlers for logged-in users

**2. No changes needed to the detail modals themselves** -- we reuse the existing components as-is.

### How "Generate Same Results" Works for Users

When a logged-in user clicks an item in Discover, they get:
- **For presets**: "Use Prompt" button -- navigates to Freestyle with the exact prompt, aspect ratio, and quality pre-filled
- **Copy Prompt**: copies the prompt text to clipboard
- **Generate Prompt from Image**: AI-analyzes the image and generates a matching prompt (already built into `DiscoverDetailModal`)
- **For scenes**: "Use Scene" button -- navigates to Freestyle with the scene pre-selected
- **Save**: bookmarks the item for later
- **Similar**: finds related items

This gives users a one-click path from browsing inspiration to generating their own version.

### Technical Details

| What | Detail |
|------|--------|
| Auth check | `const { user } = useAuth()` -- no loading state needed since the page works either way |
| Navigation | `navigate('/app/freestyle?prompt=...&ratio=...&quality=...')` for presets, `navigate('/app/freestyle?scene=...')` for scenes |
| Hooks added to PublicDiscover | `useAuth`, `useSavedItems`, `useIsAdmin`, `useFeaturedItems`, `useToggleFeatured` |
| Conditional modal | `{user ? <DiscoverDetailModal ... /> : <PublicDiscoverDetailModal ... />}` |
