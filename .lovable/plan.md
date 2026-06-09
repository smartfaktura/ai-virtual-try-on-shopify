
# Before / After sections — use existing library assets

Add a single Before/After block to emails **02**, **03**, and **05**, reusing existing scene-preview images already in `IMG{}`. No new image generation, no new uploads.

## Asset mapping (from existing IMG dict)

| Email | BEFORE (raw-looking upload) | AFTER (editorial result) |
|---|---|---|
| 02 — First generation | `d_flat` (front view flat lay) | `g_on_model_front` (on-model front) |
| 03 — More angles | `g_clean_full` (single clean full body) | `g_editorial_lean` (editorial lean) |
| 05 — Product swap | `d_old_money` (dress editorial) | `g_old_money` (outerwear editorial, same direction) |

Rationale per pick:
- **02**: flat lay = closest to a raw merchant upload in our existing set; on-model proves the leap
- **03**: one clean shot → editorial angle from the same product
- **05**: same scene direction, different product (the actual "swap" promise)

## Block design

Inserted as a new `body_block` *before* the existing grid section in each chosen email, inside its own grey (`#f5f5f4`) section so it visually anchors the email.

```text
EYEBROW (12px uppercase, #6b7280)
"Before and after"
Heading (22px, #0a0a0a)
"From one upload to a finished shot"

┌──────────────────┬──────────────────┐
│ BEFORE           │ AFTER            │
│ [image, 12px r]  │ [image, 12px r]  │
│ Your upload      │ Generated in     │
│ (13px, #6b7280)  │ VOVV.AI (13px)   │
└──────────────────┴──────────────────┘
```

- 50/50 two-column table, 12px gutter (matches existing grid)
- Eyebrow labels `BEFORE` / `AFTER` above each image: 11px, uppercase, `#94a3b8`, `letter-spacing:0.08em`
- Image `border-radius:12px` (matches grid)
- Caption under each image, 13px `#6b7280`, single line
- Mobile: existing `@media (max-width:600px)` already stacks 50% cells — works as-is
- No section CTA on this block (it sits above the grid section which already has one) — keeps single-CTA rhythm per section

## Builder changes (`/tmp/build_emails.py`)

1. New helper:
   ```text
   def before_after_section(eyebrow, heading, before_key, before_cap,
                            after_key, after_cap, bg="#f5f5f4")
   ```
   Reuses `img_tag()` for both images. Renders eyebrow + h2 + 2-col labeled table. Returns full `<tr><td>` section (matches `section()` signature shape).

2. Insert into `body_blocks` of emails 02, 03, 05 as the **first** block (before the existing `grid_section`).

3. Regenerate all 7 emails + .txt siblings. Plain-text version appends:
   ```text
   BEFORE AND AFTER
   From one upload to a finished shot
   Before: [your upload]
   After:  [generated in VOVV.AI]
   ```

## Verification

- `grep "Before and after"` returns hits only in 02/03/05
- Visual check: 02/03/05 each have 1 before/after block + 1 existing grid section
- 01/04/06/07 unchanged

## Files touched

- `/tmp/build_emails.py` (builder)
- `src/emails/fashion-welcome/0{2,3,5}-*.html` regenerated
- `src/emails/fashion-welcome/0{2,3,5}-*.txt` regenerated
- Other 4 emails: rebuilt identically (no content change)
- `/mnt/documents/resend-templates/fashion-welcome/*` artifacts re-emitted
