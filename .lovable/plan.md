# Rebuild the 7 fashion-welcome emails with real images + sharper copy

## Problems with the current set
- Each email shows only a single placeholder URL (`vovv.ai/og-fashion-*.jpg` — these don't exist, so the email body looks empty).
- Copy reads generic.
- No visual proof of what VOVV actually produces.

## Fix

### 1. Real image URLs
I pulled the actual scene preview URLs from the `product_image_scenes` table — the same ones rendered on `/product-visual-library`. They live at `azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads/.../scene-previews/*.jpg` and are world-readable, so they work in any inbox without auth.

Curated pool (real URLs in hand): ~50 fashion images spanning **garments, dresses, jeans, activewear, swimwear, lingerie** — across the angles users actually generate the most (Old Money Outdoor Portrait, Luxury Street Walk, On-Model Front/Back/Editorial, Editorial Lean, Soft Volume Lean, Super Editorial Campaign, Movement Shot, Ghost Mannequin, Close-Up Detail, Texture Detail, Front View Flat Lay, etc.).

### 2. New image layout — multiple images per email
Replace the lonely single placeholder with:

- **Hero image** (full-width, ~520px) at the top of each email
- **2-column image grid** (4–6 thumbnails, ~252px each) showing variety — email-safe `<table>` markup, supported by Gmail/Apple Mail/Outlook
- Optional **second 2-col grid** near the bottom for use-case proof

Per email, the grid is curated to the email's angle:

| # | Hero | Grid theme (6 images) |
|---|------|---|
| 1 Welcome | Super Editorial Campaign (garments) | Mix across categories — dress, hoodie, swimwear, activewear, lingerie, jeans |
| 2 First gen | Clean Ghost Mannequin | 4 simple "easy first product" shots (flat lay, on-model front, ghost mannequin) |
| 3 More angles | On-Model Front | 6 angles of similar products — front, back, editorial, movement, close-up, texture |
| 4 Fashion scenes | Old Money Outdoor Portrait | 6 scene moods — street, desert, interior, studio, editorial, flash |
| 5 Product Swap | Editorial Lean | 6 on-model fronts across different fashion categories (visual proof of "same scene, different product") |
| 6 Brand look | Super Editorial Campaign | 6 images sharing the same editorial direction |
| 7 Upgrade | Luxury Door Statement (dresses) | 6-image "content system" grid mixing categories |

### 3. Copy rewrite
Tighter, more concrete, more outcome-driven. Each email gets:
- A sharper headline focused on one outcome
- Founder-voice intro (1–2 sentences) that names the specific fashion products
- A specific proof line under the grid ("these were generated from one uploaded product")
- A clean closing line from Tomas

Brand & structural rules unchanged: VOVV only, one CTA repeated max twice, Inter font, black `#0a0a0a` buttons, soft grey `#f5f5f4` sections, one-column layout, hidden preheader, no manual unsubscribe, "Visual Studio" wording, no emojis/hype.

### 4. Mechanics
- Update the 7 files at `src/emails/fashion-welcome/*.html` in place.
- Copy the updated files to `/mnt/documents/resend-templates/fashion-welcome/` and re-emit `<presentation-artifact>` tags so you can re-preview.
- In-app preview at `/admin/email-preview/fashion-welcome` keeps working (loads files via `?raw` import).

No backend / DB / route changes needed.

Approve and I'll ship.
