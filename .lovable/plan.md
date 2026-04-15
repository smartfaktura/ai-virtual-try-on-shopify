# Rename "Presets" → "Explore" Across the App

## What We're Doing

Renaming all user-visible references from "Presets" to "Explore" — sidebar nav, page titles, share modals, tooltips, SEO, and chat suggestions. Internal code names (outfit presets, gradient presets, hook names, DB table `discover_presets`) stay unchanged.

## Changes

### 1. Sidebar nav label

**File:** `src/components/app/AppShell.tsx` (line 64)

- `'Presets'` → `'Explore'`

### 2. App Discover page title

**File:** `src/pages/Discover.tsx` (line 432)

- `title="Presets"` → `title="Explore"`

### 3. Public Discover page SEO

**File:** `src/pages/PublicDiscover.tsx` (line 336)

- SEO title: `"Explore AI Photography Presets & Scenes"` → `"Explore AI Product Photography — VOVV AI"`

### 4. Landing nav link label

**File:** `src/components/landing/LandingNav.tsx` (line 9)

- `'Examples'` → `'Explore'` (already routes to `/discover`)

### 5. Dashboard section heading

**File:** `src/components/app/DashboardDiscoverSection.tsx` (line 180)

- `"Explore Presets"` → `"Explore"`

### 6. Dashboard button

**File:** `src/pages/Dashboard.tsx` (line 542)

- `"Explore Presets"` → `"Explore"`

### 7. Share/Submit modals — user-facing labels

**File:** `src/components/app/SubmitToDiscoverModal.tsx`

- Line 145: `"Share to Presets"` → `"Share to Explore"`
- Line 296: `"appearing in Presets"` → `"appearing in Explore"`

**File:** `src/components/app/LibraryDetailModal.tsx` (line 398)

- `"Share to Presets"` → `"Share to Explore"`

**File:** `src/components/app/freestyle/FreestyleGallery.tsx` (line 427)

- `title="Share to Presets"` → `title="Share to Explore"`

### 8. Studio Chat suggestions

**File:** `src/components/app/StudioChat.tsx`

- Line 25: `'Submit to Presets'` → `'Submit to Explore'`

## Not Changed

- DB table name `discover_presets` — no migration needed
- Hook name `useDiscoverPresets` — internal code
- Outfit presets, gradient presets, style presets — different feature entirely
- File names — no renames needed, they already use "Discover" naming

## Impact

~10 files, all string label changes. No logic or routing changes.