## Goal
Create a standalone HTML email announcing newly released scenes on VOVV.AI, grouped by category (6 sample scenes each), with deep links into `/product-visual-library` filtered by tab, plus a closing prompt asking users to suggest the next scenes they want.

Output file: `/mnt/documents/new-scenes-announcement.html`

## Design pattern
Match the most recent broadcast (`scene-request-broadcast.html`):
- 620px max width card, `#f5f5f4` page bg, white card with 16px radius
- Dark hero gradient (`#0f172a` → `#1e293b`) with eyebrow chip, light/bold split headline, muted subtitle
- Inter font, no terminal periods in headers / single-sentence subtitles
- Section eyebrow style (10px / 2px tracking / uppercase #999)
- Pill CTA buttons in `#0f172a`
- Founder note block + footer with `{{{RESEND_UNSUBSCRIBE_URL}}}`

## Content structure

1. **Hero**
   - Eyebrow: "New This Drop · Scene Library"
   - Headline: "Fresh scenes just dropped in **VOVV.AI**"
   - Subtitle: "Over 300 new visual directions across your favorite categories — pick one and shoot your product in it today"
   - Primary CTA pill → `https://vovv.ai/product-visual-library`

2. **Category sections** (6 categories × 6 scene thumbnails each)
   Selected from scenes added in the last 30 days, ordered by recency:
   - Wedding Dresses (44 new) — tab link `?category=wedding-dress`
   - Phone Cases (32 new) — `?category=phone-cases`
   - Dresses (22 new) — `?category=dresses`
   - Activewear (30 new) — `?category=activewear`
   - Hats (68 new) — `?category=hats`
   - Furniture (94 new) — `?category=furniture`
   
   Per section:
   - Eyebrow with count ("22 new · Dresses")
   - H2 headline + one-line description
   - 3×2 grid of 6 scene thumbnails (preview_image_url already CDN-served, append `?quality=60&width=280` for compression). Each thumbnail labeled with scene title underneath
   - Secondary "View all → " pill linking to library with that tab preselected
   - The 3 callouts the user asked for ("Do Wedding Dresses", "Do Phone Cases", "Show new Dresses scenes") become bold mini-eyebrows on those three sections

3. **Scene request block** (closing)
   - Eyebrow: "Your turn"
   - Headline: "What scene do you wish existed next"
   - Short copy + dark pill CTA `mailto:hello@vovv.ai?subject=Scene idea&body=...`
   - Reuses the example chip row from previous broadcast (Parisian café, Tokyo neon, etc.)

4. **Founder note** + standard footer with unsubscribe token

## Technical details
- Pull 6 most recent scenes per target `category_collection` from `product_image_scenes` where `is_active=true AND owner_user_id IS NULL AND created_at > now() - interval '30 days'`, ordered by `created_at DESC`
- Verify the library page's tab query param format by reading `src/pages/ProductVisualLibrary.tsx` (or whichever file renders that route) so deep links land on the correct tab
- Thumbnails use Supabase render transform: `…/render/image/public/…?quality=60&width=280` — keeps file size small for inbox while staying sharp on retina
- Generation script: short Node script that queries via psql, builds HTML string, writes to `/mnt/documents/new-scenes-announcement.html`
- QA: open the file, render via Chromium screenshot to verify layout in 620px column before delivering

## Out of scope
- No sending. This is an HTML artifact only — you'll send it through your existing broadcast tool (Resend dashboard / external).
- No new database changes, no app code changes.