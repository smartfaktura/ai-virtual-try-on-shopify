## Goal

The current hero on `/ai-product-photography/home-furniture` has an overlong H1 (4 lines on mobile) and a 4-line subheadline that lists too many products + too many room styles. We'll trim both for clarity and conversion, keeping the same SEO intent.

## Changes (single file: `src/data/aiProductPhotographyCategoryPages.ts`, home-furniture entry)

**1. H1 — shorter, single thought**
- Before: `AI Furniture & Home Decor Product Photography` + `for Home & Furniture Brands`
- After: `h1Lead: "AI Photography for"` + `h1Highlight: "Furniture & Home Decor"`
- Result: 2 lines on mobile instead of 4, same keyword density.

**2. Subheadline — one tight sentence, no punch-list**
- Before (43 words): "Place sofas, beds, dining sets, desks, vases, and lighting into editorial salons, linen-soft bedrooms, travertine dining halls, concrete studios, and Mediterranean terraces — material-true PDPs, lifestyle stories, and catalog visuals from a single photo"
- After (~18 words): `"Drop any furniture or decor piece into styled rooms — PDPs, lifestyle, and catalog visuals from one photo"`
- Removes redundant style list (already shown by the 4-image collage + subcategory chips below).

**3. Eyebrow — keep** (`Furniture · Rooms · Decor`) — it's already tight.

**4. Meta description — keep** (still useful for SEO; not visible in the hero).

## Out of scope
No component edits, no other pages, no CTA changes — copy-only edit to the one entry.
