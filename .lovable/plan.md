## Rebuild Activation Nudge — match VOVV newsletter pattern

Rewrite `/mnt/documents/activation-nudge-email_v2.html` using the exact visual system from the attached `brand-scenes-newsletter (4).html` reference. Fix broken images by uploading to a public storage bucket (the `vovv.ai/email/` paths only exist locally and never resolve in inboxes).

### Fixes vs v1

1. **Brand mark:** "VOVV" everywhere (uppercase, 2.4px letter-spacing wordmark). Remove all "VOVV.AI".
2. **Visual system matches newsletter exactly:**
   - Body bg `#F7F5F2` (cream), card bg `#FFFFFF`, border `1px solid #E8E4DD`, radius `6px`
   - Image radius `3px`, pill buttons `border-radius:999px`
   - Navy CTA `#0B1C3A` with white text
   - System font stack only: `-apple-system, BlinkMacSystemFont, 'Inter', 'Helvetica Neue', Arial, sans-serif` — **no Google Fonts** (caused the off look in v1)
   - Hero H1 `40px / weight 500 / -1.2px letter-spacing`, body `15px / 1.55 / #4A4A4A`, eyebrow caps `11px / 2.4px letter-spacing / #6B6B6B`
   - 600px container, 44px card padding, 14px gap between cards
3. **Fix broken images:** upload 6 compressed JPGs to public Supabase Storage bucket `email-assets` (create if missing, public read). Use real CDN URLs `https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/render/image/public/email-assets/...?quality=65&width=480&height=600&resize=cover`.
4. **6 category tiles** in a 3×2 grid (stacks 1-col on mobile) with caption underneath each:
   - Skincare ← `skincare-serum-marble.png`
   - Fashion ← `fashion-knit-loft.png`
   - Home ← `home-candle-evening.png`
   - Activewear ← `fashion-activewear-gym.png`
   - Food & Drink ← `food-cocktail-rocks.png`
   - Fragrance ← `skincare-perfume-vanity.png`
5. **Shorter copy:**
   - Eyebrow: `STILL EXPLORING?`
   - H1: `Your first visual, {{{FIRST_NAME|friend}}} — in 60 seconds`
   - Lede (one sentence): `You signed up but haven't created yet. {{{credits_balance|20}}} free credits are waiting.`
   - Steps card removed (too long) — replaced with single inline "Upload → Pick a Visual Type → Done" microcopy under the grid
   - CTA: `Start Creating →`
   - Reassurance: `{{{credits_balance|20}}} credits on your {{{plan|Free}}} plan`
   - Secondary: `Need ideas? Browse the gallery →` → `/app/discover`
6. **Dynamic tokens verified:** `{{{FIRST_NAME|friend}}}`, `{{{credits_balance|20}}}`, `{{{plan|Free}}}` — triple-brace Resend syntax with pipe fallbacks, used in subject + preheader + body.
7. **Footer** matches newsletter: wordmark left + tagline right, 3-column links (Studio / Company / Follow), hairline, `© 2026 VOVV · vovv.ai` + `View in browser · Unsubscribe`.

### Resend subject + preheader (paste into Send email step)

- Subject: `{{{FIRST_NAME|Hey}}}, your first visual is one click away`
- Preheader: `{{{credits_balance|20}}} free credits are still waiting — 60 seconds to create`

### Execution steps

1. Compress 6 source PNGs from `public/images/showcase/` to ≤80KB JPGs at 600×800 (4:3) into `/tmp/email-tiles/`.
2. Ensure public storage bucket `email-assets` exists (create with `supabase--migration` if missing, public read policy).
3. Upload all 6 via `supabase--storage_upload` to `email-assets/nudge/{slug}.jpg`.
4. Write `/mnt/documents/activation-nudge-email_v2.html` using the storage CDN URLs and the newsletter's exact style tokens.
5. Deliver as artifact.
