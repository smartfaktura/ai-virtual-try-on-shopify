

## Copy 8 shots into Bags & Accessories

### What I found
All 8 requested shots exist in the scene database:

1. **Elevated Mirror UGC Pose** — source: `garments`
2. **Low Angle Leather Walk** — source: `garments`
3. **Desert Tailored Walk** — source: `garments`
4. **Elevated Stair Editorial** — source: `garments`
5. **Urban Bench Flash Editorial** — source: `garments`
6. **Power Mirror Statement Selfie** — source: `garments`
7. **Jet Lounge** — source: `hoodies`
8. **Tarmac Walk** — source: `hoodies`

None of these titles currently exist in **Bags & Accessories**, so this is a clean copy operation.

### Target placement
I’ll copy them into:

- Category: **Bags & Accessories**
- `category_collection`: `bags-accessories`
- Sub-category: **On-Body Editorial & Location**

That sub-category already exists in Bags & Accessories, so I’ll preserve its current ordering.

### Copy behavior
For each copied shot, I’ll duplicate the full scene definition:

- title
- description
- prompt template
- trigger blocks
- preview image URL
- scene type
- extra reference requirement
- suggested colors
- outfit hint
- scene reference flag

The new rows will keep the same visible shot titles, but receive unique scene IDs ending in `-bags-accessories`, for example:

```text
elevated-mirror-ugc-pose-bags-accessories
low-angle-leather-walk-bags-accessories
desert-tailored-walk-bags-accessories
elevated-stair-editorial-bags-accessories
urban-bench-flash-editorial-bags-accessories
power-mirror-statement-selfie-bags-accessories
hoodies-private-jet-lounge-bags-accessories
hoodies-airport-tarmac-walk-bags-accessories
```

### Ordering
Bags & Accessories currently has a max `sort_order` of `2331`, so I’ll place the new shots after the existing list:

```text
2332 → Elevated Mirror UGC Pose
2333 → Low Angle Leather Walk
2334 → Desert Tailored Walk
2335 → Elevated Stair Editorial
2336 → Urban Bench Flash Editorial
2337 → Power Mirror Statement Selfie
2338 → Jet Lounge
2339 → Tarmac Walk
```

### Implementation
This is a database data-copy operation only.

I’ll insert 8 new `product_image_scenes` rows using `INSERT ... SELECT` from the existing source scenes, changing only:

- `scene_id`
- `category_collection`
- `sub_category`
- `category_sort_order`
- `sub_category_sort_order`
- `sort_order`
- timestamps

No app code or schema changes are needed.

### Validation
After copying, I’ll verify:

1. Exactly 8 new rows exist in `bags-accessories`
2. All 8 are under **On-Body Editorial & Location**
3. All copied rows are active
4. Scene IDs are unique
5. `/app/admin/product-image-scenes` can show them when filtering Bags & Accessories

