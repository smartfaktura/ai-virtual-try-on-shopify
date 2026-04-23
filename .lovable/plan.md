

## Tag the remaining ~243 Explore items — second-pass auto-tag with stronger matching

### Current state

After the first run: **126 / 369** items now have canonical sub-family slugs. **243 still NULL.**

I checked the data. The remaining 243 break into three groups:

| Group | Count (est.) | Why first pass missed them | Fixable? |
|---|---|---|---|
| **A.** Family is canonical (`fashion`, `home`, `bags-accessories`, `beauty-fragrance`, `food-drink`, `wellness`, `jewelry`) but prompt/title/tags don't contain any current synonym | ~150 | Synonym list too narrow (e.g. "tee" → garments works, but "knit", "tank", "cardigan", "puffer", "trench" don't). | Yes — expand `SLUG_SYNONYMS` |
| **B.** Family is non-canonical (`product-editorial`, `clean-studio`, `streetwear`, `surface`, `studio`, `living-space`) | ~44 | Function skips unknown families (correct — we don't want to guess the family). | Partially — remap families first via SQL, then re-run |
| **C.** Family canonical but content genuinely doesn't hint at any sub-type (abstract editorial, neutral product shots) | ~50 | No signal to classify on. | No — these need manual tagging in admin drawer |

### The fix — three-step second pass, same safety guarantees as last time

#### Step 1 — Expand the synonym table

Add the missing apparel/home/beauty/jewelry/footwear vocabulary so common words classify correctly:

```ts
// Examples of additions to SLUG_SYNONYMS
garments:     [...existing, 'knit','knitwear','tank','cardigan','sweater','jumper','vest','polo']
jackets:      [...existing, 'puffer','trench','overcoat','parka','windbreaker','bomber']
dresses:      [...existing, 'maxi','midi','mini','slip dress','sundress']
activewear:   [...existing, 'workout','training','running','run','fitness','sport','cycling']
hoodies:      [...existing, 'pullover','crewneck']
'home-decor': [...existing, 'sculpture','frame','mirror','rug','throw','cushion','pillow','bowl','tray']
furniture:    [...existing, 'shelf','desk','bench','stool','cabinet','dresser','bed','armchair']
'beauty-skincare': [...existing, 'mask','exfoliant','peel','retinol','spf','sunscreen','balm','oil']
'makeup-lipsticks': [...existing, 'gloss','liner','palette','eyeshadow','concealer','bronzer','highlighter']
fragrance:    [...existing, 'scent','aroma','musk','floral','oud']
'jewellery-rings':     [...existing, 'band','signet']
'jewellery-necklaces': [...existing, 'choker','collar']
sneakers:     [...existing, 'kicks','low-top','high-top']
boots:        [...existing, 'chelsea','combat','western','knee-high']
'tech-devices': [...existing, 'earbuds','tablet','watch','smart','gadget']
beverages:    [...existing, 'cocktail','mocktail','latte','espresso','matcha','smoothie']
food:         [...existing, 'plate','bowl','breakfast','lunch','dinner','pasta','salad']
```

Expected lift: ~80–110 of the Group A rows now classify on the second pass.

#### Step 2 — One-shot SQL remap of non-canonical families (Group B)

For the 44 rows whose `category` is something the function doesn't know, normalise to the closest canonical family **before** the second auto-tag run. Snapshot first, then:

```sql
UPDATE public.discover_presets
SET category = CASE category
  WHEN 'product-editorial' THEN 'home'           -- generic editorial product shots
  WHEN 'clean-studio'      THEN 'home'           -- packshot-style, no clear family
  WHEN 'streetwear'        THEN 'fashion'        -- streetwear is a fashion sub-type
  WHEN 'surface'           THEN 'home'           -- surface/material studies
  WHEN 'studio'            THEN 'home'
  WHEN 'living-space'      THEN 'home'
  ELSE category
END
WHERE category IN ('product-editorial','clean-studio','streetwear','surface','studio','living-space')
  AND subcategory IS NULL;
```

I'll run a `SELECT category, COUNT(*)` first to confirm the actual distribution and adjust mappings if anything surprising shows up. The `streetwear → fashion` mapping is especially nice because then the second-pass auto-tag can set `subcategory = 'streetwear'` for those rows automatically.

#### Step 3 — Run second auto-tag pass with `dryRun:true → dryRun:false`

Same safety pattern as before:
1. **Snapshot** → `/mnt/documents/discover_subcategory_backup_pass2_<ts>.csv`
2. **Dry-run** → returns per-family preview, posted in chat
3. **Commit** → only on your approval
4. **Verify** → final NULL count + per-family / per-sub breakdown

### Expected outcome

| | Before pass 2 | After pass 2 (estimate) |
|---|---|---|
| Tagged with canonical sub-family | 126 | **240–280** |
| Still NULL (genuinely abstract / needs manual) | 243 | 90–130 |
| % auto-coverage | 34% | ~70% |

The remaining ~100 will be visually-abstract or edge-case items that no keyword scan can classify — those you tag manually in the drawer (30 sec each, only when you actually browse them).

### Safety guarantees (unchanged)

- Only `discover_presets.subcategory` is touched. Never `image_url`, `prompt`, `title`, `tags`, `is_featured`, `sort_order`.
- Only `subcategory IS NULL` rows are touched — the 126 already-classified rows are physically excluded.
- CSV snapshot before any write. One SQL UPDATE reverts everything from the snapshot if you hate the result.
- Dry-run gate before commit.
- Idempotent — safe to re-run.
- The Step 2 SQL only touches rows where `subcategory IS NULL` — already-tagged items keep their family unchanged.

### Files touched

```text
EDIT  supabase/functions/backfill-discover-subcategories/index.ts
        - Expand SLUG_SYNONYMS with apparel / home / beauty / jewelry / tech vocab
        - Deploy

RUN   1) snapshot families before remap
      2) SQL remap of 6 non-canonical families → canonical (NULL-only)
      3) snapshot subcategory state → /mnt/documents/discover_subcategory_backup_pass2_<ts>.csv
      4) invoke function with dryRun:true → post per-family preview
      5) invoke function with dryRun:false → commit
      6) verify SELECT counts (overall NULL count + per family/sub breakdown)
```

### Validation

1. `/app/discover` → **Fashion → Knitwear / Outerwear / Activewear** → meaningfully more items than today.
2. `/app/discover` → **Home → Decor / Furniture** → populated (was largely empty due to thin synonyms).
3. `/app/discover` → **Beauty & Fragrance → Skincare / Makeup / Fragrance** → all three populated.
4. `/app/discover` → **Fashion → Streetwear** → previously-orphaned `category=streetwear` items now appear.
5. Spot-check 5 rows that were already tagged (e.g. Pilates Studio Glow → activewear) → unchanged.
6. Backup CSV present in `/mnt/documents/`.

