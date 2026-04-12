

# Fix "fragnance" Typo in Database Scene IDs

## Problem
Several fragrance scene records in the `product_image_scenes` database table have `scene_id` values containing the misspelling "fragnance" instead of "fragrance" (e.g. `angle-view-fragnance`, `side-view-fragrance`, etc.). This typo is visible in the admin panel and could surface in URLs or logs. The codebase itself has no such typo — the issue is purely in the database.

## Fix
A single database migration to rename all `scene_id` values containing "fragnance" to use the correct spelling "fragrance":

```sql
UPDATE product_image_scenes
SET scene_id = REPLACE(scene_id, 'fragnance', 'fragrance')
WHERE scene_id LIKE '%fragnance%';
```

## Scope
- **1 database migration** — no code changes needed
- Safe because `scene_id` is only used for upsert conflict resolution and display in the admin panel; there are no hardcoded references to "fragnance" in the codebase

