

## Public Discover Page -- Unsplash/Pexels-Style Browse Feed

### Overview

Create a public `/discover` route that shows the same masonry grid of scenes and presets, accessible to anyone without logging in. When a visitor clicks any action (Use Scene, Generate Prompt, Save, etc.), they get redirected to `/auth` to register/login first. After auth, they land in the app.

### Key Changes

#### 1. Database: Allow Anonymous Read Access to Presets and Scenes

Currently `discover_presets` and `custom_scenes` require authenticated users to read. We need to add RLS policies allowing anonymous (public) SELECT access:

- `discover_presets`: Add policy "Anyone can view discover presets" for `anon` role
- `custom_scenes`: Add policy "Anyone can view active scenes publicly" for `anon` role with `is_active = true`

(`discover_item_views` already allows public inserts and reads -- no change needed.)

#### 2. New Page: `src/pages/PublicDiscover.tsx`

A simplified version of the existing Discover page that:
- Uses the `PageLayout` wrapper (LandingNav + LandingFooter) for consistent public branding
- Renders the same masonry grid with `DiscoverCard` components (no save/featured overlays for anonymous users)
- Has search + category filter chips (same as the authenticated version)
- Shows a detail modal when clicking a card, but replaces all action buttons ("Use Prompt", "Use Scene", "Generate Prompt", "Save", "Similar") with a single **"Sign up free to use this"** CTA that navigates to `/auth`
- No admin features, no save/featured toggles, no view tracking for anonymous users

#### 3. New Component: `src/components/app/PublicDiscoverDetailModal.tsx`

A stripped-down version of `DiscoverDetailModal` that:
- Shows the image, title, category, description, tags (read-only)
- Replaces all action buttons with a single prominent "Sign Up Free to Use" button linking to `/auth`
- No "Generate Prompt", "Copy", "Save", "Similar" buttons
- Still shows "More like this" related items grid (read-only, clicking opens same modal for that item)

#### 4. Routing

Add a public route in `App.tsx`:
```text
<Route path="/discover" element={<PublicDiscover />} />
```
This sits alongside other public routes like `/about`, `/blog`, etc.

#### 5. Navigation

Add "Discover" link to the `LandingNav` component's `navLinks` array, pointing to `/discover` (full page navigation, not an anchor scroll).

#### 6. Reuse Hooks

- `useDiscoverPresets` -- already works, just needs the RLS policy change for anon access
- `useCustomScenes` -- same, needs RLS policy change
- `mockTryOnPoses` -- static data, works anywhere

### Files to Create / Change

| File | Action |
|------|--------|
| Database migration | Add anon SELECT policies for `discover_presets` and `custom_scenes` |
| `src/pages/PublicDiscover.tsx` | **New** -- public discover page |
| `src/components/app/PublicDiscoverDetailModal.tsx` | **New** -- read-only detail modal with auth CTA |
| `src/App.tsx` | Add `/discover` public route |
| `src/components/landing/LandingNav.tsx` | Add "Discover" nav link |

### UX Flow

1. Visitor lands on `/discover` (or clicks "Discover" in top nav)
2. Sees the full masonry grid of scenes and presets with search + category filters
3. Clicks any card -- detail modal opens showing image, title, description, tags
4. All action buttons replaced with a single "Sign Up Free to Use" CTA
5. Clicking CTA navigates to `/auth`
6. After registration and login, user lands in `/app` where they can use the full authenticated Discover page

