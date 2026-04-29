## Branded Resend templates for VOVV.AI

I'll generate **8 production-ready HTML email files** matching the VOVV.AI homepage aesthetic, ready to copy-paste into Resend → Templates. No code changes to the app — the existing `track-resend-event` triggers will fire these templates inside Resend's automation builder.

## Brand system applied to every template

Pulled directly from `src/index.css` and `_shared/email-render.ts` so emails feel like a continuation of the website:

- **Background**: Warm Stone `#FAFAF8` (matches homepage `bg-[#FAFAF8]`)
- **Surface card**: Pure white `#FFFFFF` with subtle border `#E7E5E4`
- **Primary text**: Navy `#0F172A` (homepage foreground)
- **Muted text**: `#64748B`
- **CTA button**: Navy `#1E293B`, 8px radius, 14px 32px padding, white text
- **Wordmark**: "VOVV.AI" — Inter 700, 20px, letter-spacing -0.03em (matches `LandingNav`)
- **Body type**: Inter 400/500/600, 15px, line-height 1.6, antialiased
- **Hero image**: 560×320 cover image from `landing-assets` bucket (e.g. `auth/auth-hero.jpg`, `showcase/fashion-camel-coat.png`) optimized at q=80
- **Footer**: 12px muted, marketing-unsubscribe link + "© 2026 VOVV.AI · A product by 123Presets"
- **Width**: 560px max, centered, mobile-responsive
- **Subject lines**: No terminal periods on short headers (memory rule), sentence case, conversion-tested

## The 8 templates

Each file = standalone HTML, table-based for Outlook/Gmail compatibility, uses Resend merge tags (`{{first_name}}`, `{{balance}}`, `{{plan}}`, `{{unsubscribe_url}}`).

| # | File | Trigger event | Subject |
|---|------|---------------|---------|
| 1 | `01-welcome.html` | `user.signup` (new contact added) | Welcome to VOVV.AI |
| 2 | `02-first-generation.html` | `user.first_generation` | Your first visual is live |
| 3 | `03-credits-low.html` | `credits.low` (balance <10) | Your credits are running low |
| 4 | `04-subscription-started.html` | `subscription.started` | You're in. Let's make great visuals |
| 5 | `05-subscription-canceled.html` | `subscription.canceled` | We'd love to have you back |
| 6 | `06-abandoned-checkout.html` | `checkout.abandoned` (1h delay) | Your VOVV.AI plan is one click away |
| 7 | `07-weekly-inspiration.html` | Manual broadcast | This week in VOVV.AI |
| 8 | `08-reengagement.html` | 30 days inactive | Your studio is waiting |

Each template includes:
- VOVV.AI wordmark (top-left, no logo image needed — pure type)
- One hero image pulled from your existing `landing-assets` bucket (no new uploads needed)
- One H1 (24px, weight 600, navy)
- 1-2 paragraphs of warm, restrained copy (no exclamation marks, no emojis)
- One primary CTA button to `https://vovv.ai/app/...`
- Unsubscribe footer

## Copy direction (sample — Welcome email)

> **Welcome to VOVV.AI**
>
> Your studio is ready. Upload a product photo and you'll have editorial-quality visuals in under a minute — no photographer, no set, no waiting.
>
> Most brands start with their bestseller. Try yours next.
>
> [ Open your studio → ]
>
> Need a walkthrough? Our [Learn hub](https://vovv.ai/app/learn) has 2-minute guides.

Same restrained tone across all 8.

## Delivery

I'll write all 8 HTML files to `/mnt/documents/resend-templates/` and emit `presentation-artifact` tags so you can preview/download each one. Then you:

1. Open Resend → Templates → New Template
2. Paste the HTML, set the subject (provided in a comment at the top of each file)
3. In Automations, link the template to the matching event/audience tag (already firing from our edge functions)

## Technical section

- Output dir: `/mnt/documents/resend-templates/`
- Hero images: referenced via existing public Supabase Storage URLs (`landing-assets` bucket) — no new asset work
- Merge tags: Resend syntax `{{first_name | default: "there"}}`, `{{unsubscribe_url}}`
- A `README.md` in the same folder will list each template, its trigger, subject line, and Resend automation step-by-step
- No app code changes, no migrations, no edge function changes — purely artifact generation

Reply "go" and I'll generate all 8 files plus the README in one pass.