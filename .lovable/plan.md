

# Transform nanobanna into a Standalone SaaS Platform

## Overview

This plan converts nanobanna from a Shopify-embedded app into a standalone SaaS platform where anyone can sign up, upload product images, and generate professional AI photography. The landing page becomes the entry point, authentication gates access to the dashboard, and "Publish to Shopify" becomes "Download" with optional shop connections.

## What Changes

### Phase 1: Authentication System

Add user signup/login so the "Start Free" buttons on the landing page actually work.

**Database tables needed:**
- `profiles` table (id, email, display_name, avatar_url, plan, credits_balance, created_at)
- `user_products` table (id, user_id, title, product_type, description, image_url, created_at) -- replaces mock Shopify products
- `generation_jobs` table (id, user_id, product_id, template_id, status, credits_used, results, created_at) -- persists job history

**New pages/components:**
- `/auth` page with signup and login forms (email + password via built-in authentication)
- Auth context/provider wrapping the app
- Protected route wrapper for dashboard routes

**Flow:**
```text
Landing Page (/landing)
     |
     | "Start Free" button
     v
Auth Page (/auth)
     |
     | Sign up / Log in
     v
Dashboard (/)
```

### Phase 2: Route Restructuring

- Make `/landing` the default route (`/`)
- Move the dashboard app routes under `/app/*`
- Update all internal navigation accordingly

**New route structure:**
```text
/              -> Landing page (public)
/auth          -> Login / Signup (public)
/app           -> Dashboard (protected)
/app/generate  -> Generate page (protected)
/app/templates -> Templates (protected)
/app/jobs      -> Job history (protected)
/app/settings  -> Settings (protected)
```

### Phase 3: De-Shopify the App Shell

The app shell (sidebar, topbar) currently uses Shopify Polaris `Frame`, `Navigation`, and `TopBar`. These need to be replaced with a custom layout since this is no longer a Shopify embedded app.

**Changes to AppShell:**
- Replace Polaris `Frame`/`Navigation`/`TopBar` with custom Tailwind sidebar + header
- Show the authenticated user's name/email instead of "My Store" / "mystore.myshopify.com"
- Add a "Sign Out" action that actually signs the user out
- Keep the same navigation items (Dashboard, Generate, Templates, Jobs, Settings)

### Phase 4: Replace "Products" with User Uploads

Currently the Generate flow starts with "From Product(s)" which loads mock Shopify products. This needs to become upload-first.

**Changes:**
- Remove `SourceTypeSelector` distinction between "From Product(s)" and "From Scratch" -- everything is now upload-based
- The Generate flow starts with "Upload your product image" as the primary path
- Add a secondary "My Products" library where users can save previously uploaded products for reuse
- Store uploaded products in `user_products` database table
- Update `UploadSourceCard` to be the default (and primary) entry point

### Phase 5: Replace "Publish to Shopify" with Download

Currently generated images go through a "Publish to Shopify" modal. This needs to become:

**Changes:**
- Replace `PublishModal` with a `DownloadModal` or inline download buttons
- "Publish" becomes "Download" (single/bulk download as ZIP)
- Remove `ProductAssignmentModal` (Shopify product assignment)
- Remove Shopify-specific references from `GeneratedAsset` type (`publishedToShopify`, `shopifyImageId`)
- Add "Save to My Library" option to save generated images for later

### Phase 6: De-Shopify Text and References

Update all Shopify-specific copy across the app:

| Current | New |
|---------|-----|
| "Publish to Shopify" | "Download Images" |
| "Select Shopify products" | "Upload your product" |
| "mystore.myshopify.com" | User's email/name |
| "Publishing defaults: Shopify" | "Export defaults" |
| Settings > "Publishing Defaults" to Shopify | "Download & Export Settings" |
| "Assign to Shopify Product" modal | Remove entirely |

### Phase 7: Connect Credits to Real User

- Move credits from mock `CreditContext` to database-backed `profiles.credits_balance`
- New users get 5 free credits on signup (as promised on landing page)
- Credit deductions persist to the database
- Buy Credits modal stays (mock for now, ready for Stripe later)

### Phase 8: Landing Page CTA Wiring

Wire all "Start Free" buttons to navigate to `/auth`:

- `LandingNav` "Start Free" button -> `/auth`
- `HeroSection` "Start Free -- 5 Credits" button -> `/auth`
- `LandingPricing` plan CTA buttons -> `/auth`
- `FinalCTA` "Start Free -- 5 Credits" button -> `/auth`

---

## Technical Details

### Files to Create

| File | Purpose |
|------|---------|
| `src/pages/Auth.tsx` | Login/signup page with email + password forms |
| `src/contexts/AuthContext.tsx` | Authentication state management (wraps Supabase auth) |
| `src/components/app/ProtectedRoute.tsx` | Route guard that redirects unauthenticated users to `/auth` |
| `src/components/app/DownloadModal.tsx` | Replaces PublishModal -- download single/multiple images |
| `src/components/app/UserMenu.tsx` | User avatar + dropdown with account/sign out |

### Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Restructure routes: `/` = Landing, `/auth` = Auth, `/app/*` = protected app |
| `src/components/app/AppShell.tsx` | Replace Polaris Frame with custom Tailwind sidebar layout, show user info |
| `src/pages/Generate.tsx` | Remove Shopify product picker, make upload the default, replace publish with download |
| `src/pages/Dashboard.tsx` | Load real user data from DB, remove Shopify references |
| `src/pages/Settings.tsx` | Remove "Publishing Defaults" Shopify section, update copy |
| `src/contexts/CreditContext.tsx` | Connect to database for real credit persistence |
| `src/types/index.ts` | Remove `shopifyImageId`, `publishedToShopify`, update `Shop` type to `UserProfile` |
| `src/data/mockData.ts` | Keep as sample data but remove Shopify domain references |
| `src/components/app/SourceTypeSelector.tsx` | Simplify or remove -- upload becomes default |
| `src/components/landing/LandingNav.tsx` | Wire "Start Free" to `/auth` |
| `src/components/landing/HeroSection.tsx` | Wire CTA to `/auth` |
| `src/components/landing/FinalCTA.tsx` | Wire CTA to `/auth` |
| `src/components/landing/LandingPricing.tsx` | Wire plan CTAs to `/auth` |
| `src/pages/BulkGenerate.tsx` | Replace "Publish to Shopify" with download |

### Database Migrations

1. Create `profiles` table with trigger on auth.users insert
2. Create `user_products` table for saved uploads
3. Create `generation_jobs` table for persisted history
4. RLS policies: users can only access their own data
5. Default credits: new profiles start with 5 credits

### Implementation Order

Due to the size of these changes, they should be implemented in this sequence:

1. **Database + Auth** -- Create tables, auth context, login/signup page, protected routes
2. **Route restructure** -- Move landing to `/`, app to `/app/*`, wire CTAs
3. **AppShell redesign** -- Replace Polaris Frame with custom Tailwind layout
4. **Generate flow update** -- Upload-first, remove Shopify product picker, download instead of publish
5. **Dashboard + Settings cleanup** -- Remove Shopify copy, connect to real user data
6. **Credit system wiring** -- Database-backed credits with 5 free on signup

