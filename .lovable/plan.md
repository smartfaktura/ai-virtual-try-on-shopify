

## Move White Studio to First Position in Product Studio

### Problem
White Studio (`scene_038`) doesn't appear first in the Product tab because the admin sort order table (`scene_sort_order`) doesn't have an entry for it — it defaults to sort position 9999. Shadow Play (`scene_019`) has sort position 61, so it shows first.

### Solution
Insert `scene_038` into the `scene_sort_order` table with `sort_order: 50` (before all other product scenes which start at 61). This is the simplest fix — a single database insert.

### Changes

**Database migration** — Insert White Studio sort order
```sql
INSERT INTO scene_sort_order (scene_id, sort_order, updated_by)
VALUES ('scene_038', 50, (SELECT id FROM auth.users LIMIT 1));
```

This places White Studio at position 50, ahead of Shadow Play (61) and all other product scenes, making it the first item shown under **Product Studio** in the scene selector.

No code changes needed.

