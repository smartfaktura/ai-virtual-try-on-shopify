## Scope

Only `/product-visual-library`. No DB changes, no other pages affected.

## Problem

The query orders by `category_sort_order` first. Inside the `activewear` collection, the DB has mixed `category_sort_order` values per row: Padel and Tennis rows have `0`, while Editorial Sport Poses has `25`. So Padel/Tennis scenes get inserted into the sub-category map before Editorial Sport Poses and appear at the top.

## Fix

Edit `src/hooks/usePublicSceneLibrary.ts` only. In `fetchPublicScenes`, also select `sub_category_sort_order` (already selected). In `buildFamilyTree`:

1. Track each sub-group's minimum `sub_category_sort_order`.
2. After grouping, **sort `subGroups` inside each collection by that minimum ascending** (tie-break: label A–Z).
3. Sort `collections` inside each family by the smallest `category_sort_order` seen in their rows (tie-break: existing insertion order).

That makes Activewear render: Editorial Sport Poses (-2) → TRENDING ON INSTAGRAM (-1) → Essential Shots (0) → Creative Shots / Gym UGC / Padel (1) → Flat Lay (2) → Tennis (3) → Aesthetic Color Sport Sets (4) — regardless of the inconsistent `category_sort_order` on individual rows.

Activewear stays first inside Fashion & Apparel because at least one of its rows has `category_sort_order = 0` (lowest in the family).

## Not touched

- DB rows
- RLS / auth / brand-scene filters
- Any other page or hook
- Admin scene tools