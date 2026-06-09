# Stronger editorial shots + refined spacing across the 7 emails

## Image curation — push editorial, drop plainness
Right now Emails 2, 3 and 5 lean on flat lays, ghost mannequins and product-page shots. They communicate the function but don't sell the brand. Tighten the pool to favour editorial frames in every email **except where the email's job is to show simplicity** (Email 2 — first gen, and Email 3 — angles set, both need the plainer shots for the message to make sense).

Editorial priority pool (real URLs already in the script):
- Old Money Outdoor Portrait (garments + dresses)
- Super Editorial Campaign (garments + dresses)
- Luxury Door Statement (garments + dresses)
- Editorial Lean / Soft Volume Lean / Soft Shoulder Turn
- Luxury Street Walk / Paris Curb Side Pose / Front Portrait Street Hero
- Flash Glamour Portrait / Interior Window Light Editorial
- Desert Tailored Walk / Hand on Waist

Per-email changes:

| # | Change |
|---|---|
| 1 Welcome | Hero stays Super Editorial. Swap grid to 6 mixed-category **editorial** frames (dress, outerwear, swim editorial, activewear editorial, lingerie editorial, denim editorial) — drop the simpler on-model fronts. |
| 2 First gen | Keep the simple shots (this email is *about* the easy first result). Only swap the hero to a slightly more polished frame. |
| 3 More angles | Functional shots stay — angle variety is the point. Swap hero to a stronger editorial. |
| 4 Fashion scenes | Replace one studio thumb with **Hand on Waist** and one with **Soft Shoulder Turn** for richer mood range. |
| 5 Product swap | Replace the plain on-model fronts with editorial frames per category — still demonstrates "same direction, every product" but reads as campaign-grade. |
| 6 Brand look | Already editorial — swap one repeat for **Interior Window Light** to add interior tone. |
| 7 Upgrade | Replace the movement shots with **Old Money** + **Luxury Door** for an aspirational closing impression. |

## Spacing refinements (applied to all 7)
Same shell, retuned vertical rhythm so emails breathe more:

- Outer side padding: `40px` → `44px` (mobile stays `24px`)
- Header → headline gap: `24px` → `28px`
- Headline `margin-bottom`: `16px` → `20px`
- Body paragraph `line-height`: `1.55` → `1.65`
- Intro paragraph `margin-bottom`: `28px` → `32px`
- Space below top CTA before hero: add `40px` (currently 0)
- Hero → section gap: tighten `32px` → `24px` (image already sits in white space)
- Section vertical padding (grey + white): `40px` → `48px`
- Eyebrow label → heading gap: `8px` → `12px`
- Heading → grid gap: `20px` → `24px`
- Image grid gutter: keep `8px` but increase row gap to `10px`
- Lists: line-height `1.55` → `1.7`, row padding `6px` → `10px`
- Final CTA block: top padding `8px` → `24px`; signature gap `32px` → `40px`
- Footer top padding: `32px` → `40px`

Mobile media query unchanged (24px side padding, full-width buttons).

## Mechanics
Single edit to `/tmp/build_emails.py`: update the `SHELL` template spacing constants and adjust the per-email `body_blocks` grids with the new image picks. Re-run, regenerate the 7 files in `src/emails/fashion-welcome/` and `/mnt/documents/resend-templates/fashion-welcome/`, re-emit artifacts.

Approve and I'll ship.
