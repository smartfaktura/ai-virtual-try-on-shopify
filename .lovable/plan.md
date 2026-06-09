## Goal

Make all 7 emails in `src/emails/fashion-welcome/` (01-welcome → 07-upgrade) visually identical in structure, spacing, and button system. Remove the orphan "button-only" row that currently appears between the grey section and the footer.

## Problems found

1. **Orphan CTA row** — every email has a standalone row right after the grey section that contains only a black button (e.g. "Save your direction", "Start creating"). It floats with no image, no copy, no eyebrow → looks broken.
2. **Two button sizes coexist** — primary `padding:16px 36px; font-size:15px` and secondary `padding:14px 28px; font-size:14px`. Inconsistent across hero / section / final.
3. **Brand mark inconsistency** — header wordmark still says `VOVV`, footer says `VOVV.AI`. Memory says always `VOVV.AI` in user-facing text.
4. **Email 1 has an extra bullet section** (76 lines vs 74 in others) that breaks rhythm — it stacks: grey section CTA → bullet section CTA → orphan CTA → footer (three buttons in a row).
5. **Spacing drift** — hero block uses `padding-bottom:48px`, grey section uses `padding:56px`, final orphan uses `padding:16px 44px 64px`, footer uses `padding:48px 44px 56px`. Different rhythms.
6. **Inline `<table>` soup on one line** for grey section makes diffs and edits fragile, but visually OK — leave structure, just normalize values via the build script.

## Fix (applied uniformly to all 7 emails)

### A. Kill the orphan CTA row
Remove the standalone final CTA block (currently `padding:16px 44px 64px 44px` with only a button). The grey section already ends with its own contextual CTA — that becomes the email's closing action. Footer follows directly.

For email 1 specifically: also remove the extra "Four things to ship" bullet section so all 7 emails share the exact same skeleton:
```text
Header wordmark
Hero (h1 + p + primary CTA)
Hero image (clickable)
Grey section (eyebrow + h2 + 3×2 image grid + section CTA)
Footer
```

### B. One button system, two roles (same visual size)
- **Primary** (hero + grey section CTA): `bgcolor:#0a0a0a`, `padding:15px 32px`, `font-size:14px`, `font-weight:600`, `border-radius:6px`, white text, `letter-spacing:-0.01em`.
- Drop the secondary variant entirely. Every CTA in every email uses the **same** primary spec so size never shifts.

### C. Standardized spacing tokens (applied in build script)
```text
Header row:        padding: 40px 44px 32px 44px
Hero block:        padding: 0 44px 36px 44px
  h1 margin-bottom: 16px
  p  margin-bottom: 28px
Hero image row:    padding: 0 44px 48px 44px
Grey section:      padding: 56px 44px 56px 44px (inside grey wrapper)
  eyebrow margin-bottom: 12px
  h2 margin-bottom: 28px
  grid → CTA gap (spacer div): 32px
Footer:            padding: 48px 44px 56px 44px, top border 1px #e7e5e4
Grid cell gap:     6px horizontal, 12px vertical (unchanged)
```

### D. Brand mark
Header wordmark string `VOVV` → `VOVV.AI` in all 7 templates (matches footer + project memory).

### E. Typography (unchanged, just confirmed consistent)
- h1: 32px / line 1.15 / weight 600 / -0.02em
- h2: 22px / line 1.3 / weight 600 / -0.015em
- body p: 16px / line 1.65 / #374151
- eyebrow: 12px / 600 / uppercase / 0.08em / #6b7280

### F. Clickable images, footer socials, dynamic unsubscribe
Already in place from last pass — preserved exactly. No changes.

## Mechanics

1. Edit `/tmp/build_emails.py`:
   - Remove `secondary_cta()` helper; have `section_grid()` and `hero` both call the single `cta()` helper with the unified spec.
   - Remove the `final_cta` row emission from the `build()` template.
   - Remove the bullet block from email 1's `build(...)` call.
   - Change wordmark constant to `VOVV.AI`.
   - Update the spacing constants listed in section C.
2. Run `python3 /tmp/build_emails.py` → regenerates all 7 files in `src/emails/fashion-welcome/`.
3. Verify with `grep`: every file has exactly one `padding:15px 32px` button spec per CTA, no `padding:16px 36px`, no `padding:14px 28px`, header contains `VOVV.AI`, and no orphan trailing CTA row between grey section and footer.
4. Re-emit all 7 as `<presentation-artifact>` for preview.

No app/runtime code is touched — only the static HTML files under `src/emails/fashion-welcome/`.
