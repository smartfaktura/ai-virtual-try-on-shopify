## Creative Drops — Audit Issues Fixed

All 6 issues from the remaining audit have been implemented:

### ✅ Issue 1: Theme Now Affects Generation
- `trigger-creative-drop` passes `theme` and `theme_notes` in each job payload
- `generate-workflow` injects a `SEASONAL DIRECTION` block into prompts when theme is present

### ✅ Issue 2: Brand Profile Fully Resolved
- `trigger-creative-drop` fetches the full brand profile object from DB (tone, colors, keywords, do_not_rules, etc.)
- Passes the complete object (not just ID) so `generate-workflow` can build the BRAND GUIDELINES prompt section

### ✅ Issue 3: Product Data Fully Resolved
- `trigger-creative-drop` fetches all product rows (title, product_type, description, dimensions, image_url) 
- Builds the full `product` object expected by `generate-workflow`

### ✅ Issue 4: Image URL Handling
- Uses the stored `image_url` directly (public URL from upload flow)
- Added comment noting dependency on public accessibility

### ✅ Issue 5: imageCount Aligned with Variation Count
- `trigger-creative-drop` now calculates actual variation count per workflow (capped at 4)
- Credits are charged based on real output, not the arbitrary `imagesPerDrop` number

### ✅ Issue 6: do_not_rules Merged into Negatives
- `generate-workflow` merges `brand_profile.do_not_rules` with `config.negative_prompt_additions`
- Combined into a single `AVOID:` block in the prompt
