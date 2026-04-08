

# Sub-Category Ordering & Management for Product Image Scenes

## Current State

Sub-categories (like "Essential Shots") are just a **free-text field** (`sub_category`) on each scene row. There is no dedicated table or sort order for sub-categories themselves. The grouping in `buildCollections` uses `Map` insertion order — which means sub-categories appear in whatever order the first scene of that group was fetched from the database (by `sort_order`).

You **can** already create new sub-categories (e.g., "Editorial") by simply typing the name into any scene's "Sub-Category" field in the admin panel. But you **cannot** control the display order of sub-categories within a category — whichever sub-category has the lowest `sort_order` scene appears first.

## Proposed Fix — Sub-Category Sort Order

### Approach: Use each scene's existing `sort_order` to determine sub-group ordering

Instead of adding a new database table, we sort sub-groups by the **minimum `sort_order`** of their scenes. This means: if you want "Editorial" to appear before "Essential Shots", just give the Editorial scenes lower `sort_order` numbers.

### Changes

**1. `src/hooks/useProductImageScenes.ts` — Sort sub-groups by min scene sort_order**

In `buildCollections`, track the minimum `sort_order` per sub-category and sort sub-groups accordingly. Currently sub-groups use Map insertion order with no sorting.

**2. `src/pages/AdminProductImageScenes.tsx` — Visual sub-category controls**

- Show sub-category groups visually separated in the admin scene list (they already show as badges, but aren't grouped)
- Add a hint in the UI: "Sub-categories are ordered by their lowest scene sort_order"
- Optionally add a quick "Set sub-category" bulk action for selected scenes

### How to use it

- To create a new sub-category like "Editorial": edit any scene, type "Editorial" in the Sub-Category field
- To make "Editorial" appear first: give its scenes lower `sort_order` values than "Essential Shots" scenes
- Scenes with no sub-category fall into "General" (displayed last)

This is a lightweight change — no new tables or migrations needed.

