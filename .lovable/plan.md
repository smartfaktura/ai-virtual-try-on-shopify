

# Rename Sub-Category for 6 Sneaker Scenes

## Change
Update the `sub_category` column from `'Editorial Series'` to `'Concept Shots'` for the 6 recently added sneaker scenes.

## Implementation
One data update using the insert tool (UPDATE statement):

```sql
UPDATE product_image_scenes
SET sub_category = 'Concept Shots', updated_at = now()
WHERE scene_id IN (
  'glass-block-shot',
  'pool-ladder-shot',
  'light-circle-shot',
  'acrylic-cube-shot',
  'chrome-table-shot',
  'paper-sweep-shot'
);
```

No code changes needed — the frontend reads `sub_category` dynamically from the database.

