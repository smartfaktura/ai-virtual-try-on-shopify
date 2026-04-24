## /product-visual-library — fix zoom, simplify hero, lazy-load by category, polish modal

Current page has 4 critical issues: cropped/zoomed thumbnails, too much repeated text & layout noise, infinite scroll over all categories at once (slow + crashy), and a modal that takes too long to load and repeats info already on the page. Fix all of them and tighten the visual hierarchy.

---

### 1. Fix the zoomed-in images everywhere (root cause)

`getOptimizedUrl(url, { width: N })` without a height tells Supabase's render endpoint to crop server-side, producing the "zoomed in face" look. Per project rule: **for full-bleed / collage / hero images use `{ quality: N }` only**.

Edit:
- `src/components/library/SceneCard.tsx` — `{ width: 600, quality: 60 }` → `{ quality: 65 }`.
- `src/components/library/SceneDetailModal.tsx` — `{ width: 1200, quality: 75 }` → `{ quality: 75 }`.
- `src/components/library/CategoryOverviewCard.tsx` — `{ width: 400, quality: 60 }` → `{ quality: 55 }`.

Result: full uncropped previews, same look as the rest of the site (Discover, Hero marquee).

### 2. Simplify the hero block

Cut the badge and shorten copy. New hero:

- Remove the small "AI Product Visual Library" eyebrow chip.
- H1: **"AI Product Visual Library"** (was the chip text; replaces the long sentence).
- Subtitle (one short line): **"Browse 1,600+ visual directions across every ecommerce category. Pick one and create it with your product photo."**
- Keep the two CTAs but give them the same shape as the `/home` hero buttons (`h-[3.25rem] rounded-full text-base font-semibold`). Primary stays "Create Product Visuals" / "Create Free Visuals", secondary "Browse Categories".
- Reduce vertical padding: `py-20 sm:py-28 lg:py-32` → `py-16 sm:py-20`.

### 3. Remove the "Built for every kind of ecommerce product" overview section

The 6-card category collage section duplicates the sidebar nav + catalog headings below. Delete the entire `<section id="categories">` block and its scroll-target. The hero's "Browse Categories" button now scrolls directly to the catalog (`#catalog`).

This also lets us drop the `CategoryOverviewCard` import and reduces initial paint cost.

### 4. Load only ONE category at a time (kill the infinite scroll)

Currently every family renders its own `<FamilySection>` and progressively mounts on scroll → on slower devices the page keeps growing forever and locks up. Switch to **single-active-category** mode:

- Render only the `family` whose `slug === activeFamilySlug` (which already drives the sidebar selection).
- Sidebar click swaps the active family in place (no smooth-scroll jump to a hidden section), and scrolls the catalog header into view.
- Remove `IntersectionObserver` mounting logic — no longer needed since only one family renders.
- Mobile pills already filter the same way.

When the user searches, show all matching families collapsed into one flat list (existing behavior is fine, since a search is intentional).

### 5. Catalog header: kill redundant titles

Right now you see this stack for one category:
```
Browse product visual ideas
↓
Fashion & Apparel        425 visuals
  CLOTHING & APPAREL     69
    CREATIVE SHOTS
      [grid]
```
That's 4 stacked headings before the first image. Compress to:
```
Fashion & Apparel · 425 ideas
  Clothing & Apparel · Creative Shots     [grid]
  Clothing & Apparel · Editorial Studio   [grid]
```

Specifically:
- Catalog section keeps a single small header ("Browse visuals" + helper) above the search.
- The big family `<h3>` inside `FamilySection` gets removed (the sidebar already shows which family is active). Replace with a smaller eyebrow row: `<family label> · <count> ideas`.
- Collection label + sub-group label combine into a single subtle row: `Clothing & Apparel · Creative Shots` with consistent typography (`text-[11px] uppercase tracking-[0.16em] text-foreground/55`). No more giant "Fashion & Apparel" repetition.
- Drop the per-collection count chip on the right (noise — sidebar count is enough).

### 6. Show sub-categories properly

`sub_category` currently gets hidden when label === "General". Update so:
- If a collection has multiple sub-groups, render each sub-group with its label (always).
- If a collection has only one sub-group named "General", omit the sub-row but keep the collection row visible.
- This matches what user sees in the wizard's Step 2 "SHOTS" list.

### 7. Replace the beige (#f6f3ee) catalog background

User dislikes the warm beige. Switch the catalog section background to clean `bg-background` (the same neutral off-white the rest of the page uses). Cards already have their own subtle placeholder tone so they read clearly. Hero stays slightly tinted (`bg-[#FAFAF8]` to match `/home`).

Also update `SceneCard` placeholder bg (`bg-[#efece8]`) → `bg-muted/40` for a cooler neutral.

### 8. Fix the Scene Detail Modal

Current modal renders a giant 1:1 image (which is the cropped one — the screenshot shows the city photo flooding the entire modal). Slim it down:

- Use `aspect-[4/5]` for the hero image instead of `aspect-square` / `min-h-[520px]`.
- Drop `width: 1200` from the URL (already covered in step 1 — uncropped + smaller).
- Constrain modal max-width: `max-w-5xl` → `max-w-3xl`. Two-column grid on `md+`, image on left (~45%), info on right (~55%).
- Remove the redundant "Use cases" chip block (Product page / Social media / Ads / Campaign visuals / Editorial content) — these are generic and add noise. Keep only: family badge + title + description + CTA + helper line.
- Add max-height + scroll: `max-h-[90vh] overflow-y-auto` on the dialog content so it never spills off-screen on small laptops.
- Image gets `loading="eager"` and a smooth fade-in via opacity transition so it doesn't appear to "crash load".

### 9. Files touched

- `src/pages/ProductVisualLibrary.tsx` — slim hero, remove categories overview section, single-active-family rendering, simpler catalog header.
- `src/components/library/SceneCard.tsx` — quality-only URL, simpler caption row.
- `src/components/library/SceneDetailModal.tsx` — smaller modal, no use-case chips, uncropped hero, max-height.
- `src/components/library/CategoryOverviewCard.tsx` — keep file (no longer imported but harmless), or delete — will delete to keep tree clean.
- `src/components/library/LibrarySidebarNav.tsx` — no functional change needed; styling stays.

### Out of scope

- Database or RLS changes (already in place from the previous plan).
- Adding new admin tools.
- Changing the wizard / generator flow.

Approve to implement.