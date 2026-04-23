

## One-shot auto-tag, then remove the button — safety review

Yes, this plan is safe. Here's exactly why nothing can crash, plus the guardrails I'll add.

### Why it's safe

**1. Scope is one column on one table.**
The function only writes `discover_presets.subcategory`. It never touches `image_url`, `prompt`, `title`, `tags`, `category`, `is_featured`, `sort_order`, or any other column. No deletes, no inserts, no schema changes.

**2. Only NULL rows are touched.**
The query is `WHERE subcategory IS NULL`. Manually-tagged rows (e.g. your "Pilates Studio Glow" → `activewear`) are physically excluded from the update set. Re-running is idempotent.

**3. CSV snapshot before any write.**
Before commit, I export `id, category, subcategory` for all 366 rows to `/mnt/documents/discover_subcategory_backup_<timestamp>.csv`. If the result looks wrong, one SQL statement restores every row to its prior value.

**4. Dry-run gate.**
Function is invoked with `dryRun: true` first → returns per-family counts (e.g. `fashion → 71, home → 58, …`) with **zero writes**. I show you the numbers; only on your approval do I run `dryRun: false`.

**5. Slug values are validated against canonical taxonomy.**
The fix rewrites `SUBS_BY_FAMILY` to use the same canonical slugs the user-facing filter (`itemMatchesDiscoverFilter`) reads. No risk of writing a slug that the UI rejects.

**6. Unknown families are skipped, not guessed.**
Rows with families the function doesn't recognise (e.g. `product-editorial`, `clean-studio`, `surface`) stay NULL — no fallback assignment. Reported in a separate `unknownFamily` counter.

**7. Admin-gated.**
Edge function checks `user_roles.role = 'admin'` before doing anything. No user-facing exposure during the run.

**8. No production traffic impact.**
Single update per row, 366 rows max, takes ~5 seconds. No locks held longer than the per-row update. Discover grid keeps serving normally.

### What could go "wrong" (and isn't a crash)

- **A row gets a slug you'd have tagged differently.** E.g. a hoodie photo whose prompt also mentions "activewear" lands in `activewear` instead of `hoodies`. Fix: open admin drawer, change the sub-family pill, save. 30 seconds per row.
- **Some rows stay NULL.** Expected. They surface under the family's *All* tab as before; just don't appear under specific sub-pills until tagged manually.

Neither breaks any user flow.

### Execution sequence

```text
1. EDIT supabase/functions/backfill-discover-subcategories/index.ts
     - Canonical SUBS_BY_FAMILY (11 families, canonical slugs)
     - SLUG_SYNONYMS table (loose tags → canonical slugs)
     - unknownFamily counter
     - Fix regex escape bug on line 39
2. DEPLOY the edge function
3. SNAPSHOT → /mnt/documents/discover_subcategory_backup_<ts>.csv
4. INVOKE function with dryRun:true → log per-family preview, post counts in chat
5. INVOKE function with dryRun:false → commit
6. VERIFY → SELECT category, subcategory, COUNT(*) GROUP BY 1,2
7. EDIT src/components/app/AdminSubmissionsPanel.tsx
     - Remove Auto-tag button, handler, classifying state
8. EDIT src/pages/Discover.tsx
     - Drop button reference from empty-state copy
```

### Rollback plan (if you hate the result)

One SQL statement using the snapshot CSV restores every row's prior `subcategory` value. I'll keep the snapshot in `/mnt/documents/` for your reference. Edge function file stays in place (unused, harmless) so we have an emergency re-run path if needed.

### Files touched

```text
EDIT  supabase/functions/backfill-discover-subcategories/index.ts
EDIT  src/components/app/AdminSubmissionsPanel.tsx
EDIT  src/pages/Discover.tsx
RUN   snapshot CSV → /mnt/documents/
RUN   dry-run preview, then commit
```

### Validation

1. `/app/discover` → **Fashion → Activewear** → multiple items (Pilates + matches from prompts mentioning yoga/gym/sportswear).
2. `/app/discover` → **Bags & Accessories → Wallets & Cardholders** → populated.
3. `/app/discover` → **Beauty & Fragrance → Fragrance** → populated.
4. Spot-check 5 random rows in admin drawer — every column except `subcategory` matches pre-run state.
5. Admin Submissions panel → no **Auto-tag** button, empty-state copy reads cleanly.
6. Backup CSV present in `/mnt/documents/`.

