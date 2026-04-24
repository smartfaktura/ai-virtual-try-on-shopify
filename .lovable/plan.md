## Goal

Make `/product-visual-library` a clean, fast browse page: left-aligned slim hero, no search, no CTAs, sub-category pills inside each family, lazy/progressive rendering instead of dumping every collection at once. Also remove the "Explore Visuals" item from the landing nav.

---

## 1. Hero — slim, left-aligned, no CTAs (`ProductVisualLibrary.tsx`)

Replace the centered hero block with a tight left-aligned header that matches the sidebar's left edge:

- Container: `mx-auto max-w-7xl px-4 sm:px-6` (same as catalog) — title aligns with sidebar
- Padding: `py-10 sm:py-14` (tighter than current `py-16 sm:py-20`)
- Title: `text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight` left-aligned
- Subtitle: `mt-3 max-w-2xl text-base text-foreground/65` (single tight gap, no `mt-5/8`)
- Remove both buttons (Create Free Visuals, Browse Categories) and the `handlePrimaryCta` / `scrollToCatalog` helpers
- Drop the unused `useAuth`, `useNavigate`, `Sparkles`, `ArrowRight`, `Button`, `CREATE_PATH` imports

## 2. Catalog — remove search bar

- Delete the entire search `<Input>` block + the `<Search>` icon
- Delete `search` state and `filteredFamilies` memo (use `families` directly)
- Delete `isSearching` branch — there's only one render path now (active family)
- Remove `Search`, `Input` imports; remove the empty-search "no results" copy

## 3. Sub-category pills inside each family (`FamilySection`)

Today every collection's sub-groups stack vertically — that's why the page renders 425 cards at once for Fashion & Apparel.

New behaviour:

- Above the grid, render a horizontal scrollable pill row of every collection in the active family (e.g. for Fashion: `Clothing & Apparel · Dresses · Hoodies · Jeans · Jackets · Activewear · Swimwear · Lingerie · Streetwear`)
- Add an "All" pill at the start (default selected)
- Pills use the same style language as the existing mobile family pills (`rounded-full px-4 py-2`, active = `bg-foreground text-background`)
- Selecting a pill filters the rendered collections to just that one
- Sub-category eyebrow rows (`Collection · Sub-category`) stay as-is inside the filtered view
- Remove the redundant "Fashion & Apparel · 425 ideas" header (sidebar already shows this) — keep only the pills

State: `activeCollectionSlug: string | null` (null = "All"), reset to `null` whenever `activeFamilySlug` changes.

## 4. Progressive rendering — lazy load scenes as you scroll

The active family currently renders every scene up-front (Fashion = 425 images requested at once). Add a simple paginated reveal:

- Inside `FamilySection`, keep a `visibleCount` state (default 30)
- Flatten the (filtered) collections → sub-groups → scenes into an ordered list, slice to `visibleCount`, then re-group for rendering
- An invisible sentinel `<div ref>` after the grid uses `IntersectionObserver` to bump `visibleCount` by 30 when it enters the viewport
- Reset `visibleCount` to 30 whenever `family.slug` or `activeCollectionSlug` changes
- Show a small `<SceneCardSkeleton>` row at the bottom while more remain

This means initial paint shows ~30 cards, more load only as you scroll, and switching pills resets the window — no more giant up-front render.

## 5. Remove "Explore Visuals" from landing nav (`LandingNav.tsx`)

Delete the `{ label: 'Explore Visuals', href: '/product-visual-library', isRoute: true }` entry from the `links` array. The page stays reachable via direct URL and footer.

---

## Files

- `src/pages/ProductVisualLibrary.tsx` — hero rewrite, search removal, FamilySection rewrite (pills + lazy)
- `src/components/landing/LandingNav.tsx` — drop one nav entry

No changes to data hook, sidebar nav, scene card, or modal.

---

## Out of scope

Changing how the data is fetched (already paginated client-side from a single query), modal contents, sidebar styling, footer links.
