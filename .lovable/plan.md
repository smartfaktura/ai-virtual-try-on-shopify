

## Scroll-triggered email capture with branded confirmation email

### Flow
1. Visitor scrolls 60%+ on any public page → slide-up appears with email input
2. On submit → call a new public edge function that:
   - Adds contact to Resend audience with `plan: 'visitor'` property
   - Sends a branded confirmation email promising only creative content + nudging them to sign up for 20 free credits
3. Popup shows success state, then auto-dismisses

### What gets built

**1. New email template in `send-email/index.ts`** — `lead_welcome` type

Branded VOVV.AI email:
- Headline: "You're in"
- Body: "We'll only send you creative inspiration — AI photography tips, new features, and the occasional behind-the-scenes look. No spam, ever."
- Stone card: "Ready to create? Sign up now and get **20 free credits** to generate your first AI product photos."
- CTA button: "Create Your Account" → `https://vovv.ai/auth`
- Uses existing `emailWrapper` + `ctaButton` helpers

**2. New edge function: `capture-lead/index.ts`** — public (no auth required)

- Accepts `{ email }` body
- Validates email format
- Rate-limits by IP (simple in-memory, prevents abuse)
- Adds contact to Resend audience with properties: `{ plan: 'visitor', signup_date }`
- Calls `send-email` internally to send the `lead_welcome` email
- Config: `verify_jwt = false` in config.toml

**3. New component: `src/components/landing/SignupSlideUp.tsx`**

- Scroll listener triggers at 60%
- Shows only for anonymous visitors (`!has_account` in localStorage)
- `sessionStorage` tracks dismissal per session, `localStorage` (`lead_captured`) for permanent hide
- VOVV.AI branded mini-card (bottom-right, full-width on mobile)
- Email input + "Get Started" button
- Success state: checkmark + "Check your inbox" → auto-dismiss after 3s
- Auto-hide after 12s if ignored

**4. Edit: `src/components/landing/PageLayout.tsx`** — render `<SignupSlideUp />`

### Files
- `supabase/functions/capture-lead/index.ts` — new public edge function
- `supabase/functions/send-email/index.ts` — add `lead_welcome` template
- `src/components/landing/SignupSlideUp.tsx` — new component
- `src/components/landing/PageLayout.tsx` — add slide-up to layout
- `supabase/config.toml` — add `[functions.capture-lead]` with `verify_jwt = false`

