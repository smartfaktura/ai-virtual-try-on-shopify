

## Build Branded VOVV.AI Email Notifications

**Secret**: `RESEND_API_KEY` is already stored and confirmed.

### VOVV.AI Email Brand System

All emails will use the exact VOVV.AI design system:
- **Background**: `#ffffff` white body (email best practice)
- **Primary text**: `#0f172a` (deep navy — `hsl(222, 47%, 11%)`)
- **Secondary text**: `#64748b` (muted foreground — `hsl(215, 16%, 47%)`)
- **Primary button**: `#1e293b` (navy CTA — `hsl(217, 33%, 17%)`) with white text
- **Accent surface**: `#f5f5f4` (warm stone — `hsl(40, 10%, 98%)`)
- **Border**: `#e7e5e4` (warm border)
- **Font**: Inter via Google Fonts (matching the app)
- **Logo**: "VOVV.AI" wordmark rendered as styled text (Inter Bold, tight tracking)
- **Layout**: 560px max-width, generous whitespace, minimal single-column
- **Footer**: "© 2026 VOVV.AI. All rights reserved." with muted text

No purple. No generic SaaS look. Pure VOVV.AI navy + warm stone aesthetic.

### Files Changed

**1. `supabase/functions/send-email/index.ts`** (new)
- Single edge function accepting `{ type, to, data }`
- Three email types: `welcome`, `generation_complete`, `low_credits`
- Each template uses inline-styled HTML with VOVV.AI brand colors
- Calls Resend API (`POST https://api.resend.com/emails`)
- From: `VOVV.AI <notifications@vovv.ai>`
- Authenticated via service role key header check

**2. Database migration**
- `CREATE EXTENSION IF NOT EXISTS pg_net`
- Add `last_low_credits_email_at timestamptz` to `profiles`
- Create `notify_new_user()` trigger on `profiles` INSERT — fires HTTP call to `send-email` with type `welcome`
- Update `deduct_credits()` to check if balance drops below 10, and if `last_low_credits_email_at` is null or >24h old, call `send-email` with type `low_credits`

**3. `supabase/functions/generate-freestyle/index.ts`**
- After line 641 (successful completion), add fire-and-forget fetch to `send-email` with `generation_complete` type

**4. `supabase/functions/generate-tryon/index.ts`**
- Same pattern — add email call after successful queue job completion

**5. `supabase/functions/generate-workflow/index.ts`**
- Same pattern — add email call after successful queue job completion

### Email Templates

**Welcome**
- VOVV.AI wordmark header
- "Welcome to VOVV.AI" heading in navy
- Brief copy about getting started with 20 free credits
- Navy CTA button: "Start Creating"
- Clean footer

**Generation Complete**
- VOVV.AI wordmark header
- "Your images are ready" heading
- Shows image count and generation type
- Navy CTA button: "View Results"
- Clean footer

**Low Credits**
- VOVV.AI wordmark header
- "Running low on credits" heading
- Shows remaining balance
- Navy CTA button: "Get More Credits"
- Clean footer

