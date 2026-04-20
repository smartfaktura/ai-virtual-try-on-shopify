
User wants to duplicate scenes from `Clothing & Apparel` > `Everyday UGC Looks` sub-category into the `Hoodies` category as new rows in `product_image_scenes`, with new unique `scene_id` slugs.

This is a data operation (INSERT into existing table) — needs to be done via the insert tool (psql), not migration. Let me verify what exists first.

Need to confirm:
1. Exact `category_collection` value for Hoodies (could be "Hoodies", "hoodies", etc.)
2. Exact `category_collection` for Clothing & Apparel
3. Sub-category exact value "Everyday UGC Looks"

Plan: query first to see exact values, then duplicate rows with new scene_ids (suffix like `-hoodies`).
