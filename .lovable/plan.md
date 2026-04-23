

## Restore the Tech category — recover 5 misfiled headphone/earbud/speaker items

### Root cause

Two bugs combined:

1. **Pass 2 SQL remap was too coarse.** I sent every `product-editorial` and `clean-studio` row to `home` in one sweep. Headphones / earbuds / speakers happened to live in those legacy families and got swept into `home` instead of `tech`.
2. **Auto-tagger only searches within the row's family.** Even when a row's tags clearly say `tech, gadget, headphones`, the function never tries `tech-devices` slugs unless the row's `category` already equals `tech`. So the headphones row sat in `home` with no chance of being moved to Tech.

Result: **0 rows** in `category = 'tech'`. Your screenshot's "No results found" under the Tech pill is correct — there's literally nothing there.

### The 5 affected rows

| Title | Current category | Current sub | Should be |
|---|---|---|---|
| Premium Wireless Headphones | home | NULL | tech / tech-devices |
| Aurenx Series One Wireless Earbuds | home | NULL | tech / tech-devices |
| Aurenx Series One Wireless Earbuds (concrete variant) | home | NULL | tech / tech-devices |
| Immersive Sound, Earthy Tones | home | NULL | tech / tech-devices |
| Red Hot Beats (portable speaker) | home | **home-decor** ❌ | tech / tech-devices |

All 5 have unambiguous `tech` / `gadget` / `headphones` / `earbuds` / `speaker` tags. Zero ambiguity.

### Fix — one targeted SQL update, scoped by id

Snapshot first, then update only these 5 rows:

```sql
-- Backup
COPY (SELECT id, category, subcategory FROM discover_presets WHERE id IN (...))
TO '/mnt/documents/tech_recovery_backup_<ts>.csv' WITH CSV HEADER;

-- Move them to Tech
UPDATE discover_presets
SET category = 'tech', subcategory = 'tech-devices'
WHERE id IN (
  '53cf5c96-3738-4077-8c14-f445ead3bf12',  -- Premium Wireless Headphones
  'b7fd113f-3ae1-48bd-8b66-aaff975594fb',  -- Aurenx Earbuds
  '7eebb145-55aa-4b3d-b7dd-a14fe6b1da13',  -- Aurenx Earbuds (concrete)
  '17e56e3a-bf07-46da-b03a-4f5e3124021f',  -- Immersive Sound
  'a40c3498-1d0e-47ce-a9b5-ebfb362be7d6'   -- Red Hot Beats
);
```

### Prevention — tighten the Pass 2 remap going forward

For the future, when an unknown family contains tech-tagged items they should land in `tech`, not `home`. I'll patch the edge function's pre-classifier to do a **family auto-correction pass** when:

- Row's `tags` or `prompt` contains a strong tech signal (`headphone`, `earbud`, `speaker`, `tablet`, `laptop`, `wearable`, `gadget`, `tech`)
- AND row's current category is `home`, `product-editorial`, `clean-studio`, `studio`, `surface`, `living-space`

→ remap `category = 'tech'` and `subcategory = 'tech-devices'` in one pass.

Same logic could later catch other strays (food bottles wrongly in `home`, jewelry in `fashion`, etc.) but for now we just need Tech populated. Strict scope: tech keywords only.

### Safety guarantees

- **Backup CSV** at `/mnt/documents/tech_recovery_backup_<ts>.csv` with prior `category` + `subcategory` for the 5 ids — one SQL UPDATE reverts.
- **Scoped by explicit ids** — no risk of touching anything else.
- **Only `category` and `subcategory` columns mutate** — `image_url`, `prompt`, `title`, `tags`, `is_featured`, `sort_order` untouched.
- The future-prevention edge function patch is **dry-run gated** before commit, same as before.

### Files touched

```text
RUN   1) snapshot 5 rows → /mnt/documents/tech_recovery_backup_<ts>.csv
      2) UPDATE 5 rows → category='tech', subcategory='tech-devices'
      3) verify SELECT * FROM discover_presets WHERE category='tech'

EDIT  supabase/functions/backfill-discover-subcategories/index.ts
        - Add tech-keyword family auto-correction (pre-classification step)
        - Deploy
        - Run dry-run preview to confirm no other strays elsewhere
```

### Validation

1. `/app/discover` → **Tech** pill → 5 items visible (Headphones, 2× Earbuds, Immersive Sound, Red Hot Beats).
2. `/app/discover` → **Home** pill → those 5 items no longer appear.
3. Spot-check 1 row in admin drawer → only `category` + `subcategory` differ from backup; `prompt`, `tags`, `image_url`, `title` unchanged.
4. Backup CSV present in `/mnt/documents/`.
5. Dry-run of the patched function reports 0 additional family-corrections (confirms no other tech strays hiding elsewhere).

