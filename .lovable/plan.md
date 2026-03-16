

## Remove specific scenes from Selfie / UGC Set workflow

The scenes "POV Discovery", "In-Use Close-up", and "Haul / You Need This" shown in your screenshots need to be removed from the Selfie / UGC Set workflow's variation strategy in the database.

### Change

**Database migration** — Update the `generation_config` JSON for the Selfie / UGC Set workflow (`3b54d43a-a03a-49a6-a64e-bf2dd999abc8`) to remove these 3 variations from the `variation_strategy.variations` array:

1. **"Haul / You Need This"** (Content Creator category)
2. **"POV Discovery"** (Content Creator category)  
3. **"In-Use Close-up"** (Close-up category)

This is a single SQL update that filters out those 3 entries from the JSONB array. The remaining 12 scenes stay intact. No code changes needed — the UI already renders whatever variations exist in the config.

After removal, the "Close-up" category will only have "Hands-Only Demo" and "Content Creator" will have "Unboxing Excitement" and "Product Holding in Hand".

