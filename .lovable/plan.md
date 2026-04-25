## Goals

1. Fix the awkward "Now showing Sneakers" line on all 10 category hub pages — it currently reads like debug copy because the chip already shows the same label right below it.
2. On `/ai-product-photography`, make the "Choose your product category" card thumbnails larger and more impactful on mobile by showing **2 images per card instead of 3**.

---

## 1. The "Now showing …" line

**Where**: `src/components/seo/photography/category/CategoryBuiltForEveryCategory.tsx` (lines 82–95). Used by all 10 category pages.

**Why it feels off**:
- It restates the active chip's label that sits right below it → redundant.
- "Now showing" reads like a filter status label, not editorial copy.
- It pushes the chip rail down and adds a second muted line under the H2, weakening hierarchy.

**Fix** — replace the dynamic "Now showing X" line with a **static, editorial subline** that describes the section's value, and let the chips do the "what's selected" job (they already visually indicate active state with the dark pill).

New copy under the H2 (static, per page):
> "Switch between {groupName.toLowerCase()} subcategories — every chip reveals real scenes generated from a single upload."

This:
- Removes the redundant echo of the chip label.
- Adds genuine context for first-time visitors (explains what the chips do and what the grid below is).
- Keeps the section's editorial voice consistent with the rest of the page.

The grid still re-animates on chip change (the `key={active.subCategory}` on the grid stays), so the interaction remains obvious without needing a text label.

---

## 2. Mobile cards on `/ai-product-photography`

**Where**: `src/components/seo/photography/PhotographyCategoryChooser.tsx` (lines 27, 39–55).

**Current**: `thumbs = cat.previewImages.slice(0, 3)` rendered in a `grid-cols-3` collage at all breakpoints. On a 390px viewport each thumb is ~55px wide → too small to read.

**Fix**:
- Slice the thumbnails responsively: **2 on mobile, 3 from `sm:` up**.
  - Render `previewImages.slice(0, 3)` but hide the 3rd thumb under `sm:` with `hidden sm:block`.
- Switch the inner grid to `grid-cols-2 sm:grid-cols-3` so the 2 visible thumbs fill the full card width on mobile.
- Bump the collage aspect ratio slightly on mobile (`aspect-[4/3] sm:aspect-[16/9]`) so the larger thumbs aren't overly letterboxed.
- Keep desktop (`sm:` and up) exactly as today — 3 thumbs, 16/9 — so nothing changes above mobile.

Result: each card on mobile shows two clean, readable preview images instead of three cramped ones, matching the premium feel of the rest of the page.

---

## Files to edit

- `src/components/seo/photography/category/CategoryBuiltForEveryCategory.tsx` — replace the "Now showing" block (lines 82–95) with the static editorial subline; drop the `splitLabel(active.subCategory)` usage that's only needed for that line.
- `src/components/seo/photography/PhotographyCategoryChooser.tsx` — responsive 2-vs-3 thumb grid + mobile aspect ratio tweak.

No data files, no routes, no SEO copy elsewhere change.
