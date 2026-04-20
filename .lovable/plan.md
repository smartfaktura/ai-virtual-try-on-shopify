

## Investigate the real source of the duplicate-slug error in Wallets & Cardholders

### What I missed
My previous SQL query returned a row that doesn't actually appear in your admin UI — likely because I matched on the wrong column or stale data. Your screenshot shows 29 shots in Wallets & Cardholders across 5 sub-categories, none titled "Interior View".

### What I'll do (read-only investigation)

1. **List every existing scene_id in `wallets-cardholders`** so we have ground truth:
   ```sql
   SELECT scene_id, title, sub_category 
   FROM product_image_scenes 
   WHERE category_collection = 'wallets-cardholders'
   ORDER BY sub_category, title;
   ```

2. **Identify the source shot you're trying to duplicate** (from the previous screenshot context — the one that errored). Compute what `scene_id` the duplicate handler would generate for it (likely `{source_scene_id}-wallets` or `{source_scene_id}-bags-wallets`).

3. **Cross-check** that exact generated `scene_id` against the list from step 1 to find the real collision.

4. **Inspect the duplicate handler** in `src/pages/AdminProductImageScenes.tsx` to confirm the suffix pattern it uses, so the fix can be precise.

### Deliverable
A short, accurate report:
- The exact `scene_id` that's colliding
- Which existing row owns it (title + sub-category)
- A one-paragraph fix recommendation (e.g., make duplicate handler append `-2`, `-3`, … until free, OR use a short random hash suffix)

### Notes
- Pure investigation — no DB writes, no code changes
- After you see the report, you can decide whether to (a) delete the stale row, (b) rename your duplicate, or (c) have me patch the duplicate handler to auto-resolve collisions

