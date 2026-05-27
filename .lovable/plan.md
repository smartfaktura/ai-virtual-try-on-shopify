## Activation Nudge — VOVV.AI branded email (personalized)

Build a paste-into-Resend HTML email that matches the existing VOVV welcome template (`supabase/functions/send-email/index.ts`), mobile-optimized, with 3 compressed showcase images hosted on `vovv.ai`, and **Resend merge tags** so subject + body adapt to each contact.

### Resend personalization tokens used

Resend renders contact attributes inline using `{{{TOKEN|fallback}}}` (triple braces, pipe fallback). We'll use:

| Token | Source | Fallback |
|---|---|---|
| `{{{FIRST_NAME\|there}}}` | Resend built-in (split from full name) | `there` |
| `{{{plan\|Free}}}` | Custom attribute synced from `profiles.plan_tier` | `Free` |
| `{{{credits_balance\|20}}}` | Custom attribute synced from `profiles.credits_balance` | `20` |
| `{{{signup_source\|the homepage}}}` | Custom attribute (optional, if synced) | `the homepage` |

The Resend automation is already set in the chat: triggered by `last_event = user.signed_up`, waits 24h, condition `last_event still = user.signed_up`. So every recipient is guaranteed a signed-up user with their `FIRST_NAME` already on the contact record.

### Personalized subject lines (set in Resend "Send email" step, not HTML)

The user pastes **one** as the subject — recommended:
- **Subject:** `{{{FIRST_NAME|Hey}}}, your first visual is one click away`
- **Preview text (preheader):** `Your {{{credits_balance|20}}} free credits are still waiting — create something in 60 seconds`

### 1. Compress & host 3 showcase images (~65 KB each)

Source PNGs in `public/images/showcase/` are 1.3–1.8 MB. Resize to 600px wide, JPG q78, strip metadata, save to `public/email/` so they're served from `https://vovv.ai/email/...`:

- `public/email/nudge-skincare.jpg` ← `skincare-serum-marble.png`
- `public/email/nudge-fashion.jpg`  ← `fashion-knit-loft.png`
- `public/email/nudge-home.jpg`     ← `home-candle-evening.png`

Total payload ≈ 165 KB across all 3 images.

### 2. Create `/mnt/documents/activation-nudge-email.html`

Self-contained HTML matching the existing brand system from `send-email/index.ts`:
- Colors: navy `#0f172a`, navy CTA `#1e293b`, muted `#64748b`, stone `#f5f5f4`, border `#e7e5e4`, white body
- Inter font via Google Fonts + system fallbacks
- 560px max-width table layout (email-client safe), 40px outer padding, scales to 100% on mobile
- VOVV.‌AI wordmark (with invisible ZWNJ to defeat Gmail auto-linking, matching existing template)
- Footer with "© 2026 VOVV.‌AI" and "A product by 123Presets"

**Personalized content structure (mobile-first, single column):**

1. **Hidden preheader:** `Your {{{credits_balance|20}}} free credits are still waiting — create something in 60 seconds`
2. **H1:** `Your first visual is one click away, {{{FIRST_NAME|friend}}}`
3. **Lede:** `Noticed you signed up but haven't created anything yet. Here's what you could be making with your {{{credits_balance|20}}} free credits in under a minute.`
4. **3-image grid** (stacks on mobile): skincare / fashion / home with captions
5. **Stone card** with 3 numbered steps:
   - 1. Upload a product photo (or pick a sample)
   - 2. Choose a Visual Type
   - 3. Get studio-quality images in seconds
6. **Primary CTA:** "Start Creating" → `https://vovv.ai/app/workflows`
7. **Reassurance line:** `You still have {{{credits_balance|20}}} free credits on your {{{plan|Free}}} plan ready to use.`
8. **Secondary link:** "Need ideas? Browse the gallery →" → `https://vovv.ai/app/discover`

### Mobile optimizations
- `<meta name="viewport">` + `meta name="x-apple-disable-message-reformatting"`
- Image cells `display:block; width:100%; height:auto` so they reflow on narrow screens
- Font sizes: H1 24px, body 15px, captions 12px — readable at 320px
- CTA button ≥ 44px tap target

### 3. Deliver as artifact + paste-ready subject/preheader

```
<presentation-artifact path="activation-nudge-email.html" mime_type="text/html"></presentation-artifact>
```

Plus the subject + preheader strings the user pastes into the Resend "Send email" step fields.

### Notes on what's syncable from your app
- `FIRST_NAME` is automatically populated by Resend's contact import if a full name exists — your backend currently sends `name` via `track-resend-event`, so this works.
- `plan` and `credits_balance` will only render personalized values if you push them as **custom attributes** when you create/update Resend contacts. If they aren't synced yet, the `|fallback` defaults render gracefully ("Free", "20"). Optional follow-up: add these to the `attributes` object in `track-resend-event` so they stay fresh.
