# Redesign Payment Success page in homepage aesthetic

The success page works (purchase pixel fires correctly) but the typography and layout feel generic. Align it with the homepage look used in `HomeHero` / `HomeCreateCards`.

## Homepage aesthetic reference (current source of truth)

- Background: warm off-white `#FAFAF8` (not muted grey)
- Headline: `font-semibold tracking-[-0.03em] leading-[1.08]`, sizes `text-[2rem] sm:text-5xl lg:text-[3.5rem]`
- Eyebrow: `text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground`
- Body: `text-base sm:text-lg leading-relaxed text-muted-foreground` (max-w-xl, no period if single line)
- Cards: `bg-white rounded-3xl border border-[#f0efed] shadow-sm`, hover `-translate-y-1 hover:shadow-md`
- Primary CTA: pill `h-[3.25rem] px-8 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25`
- Microcopy under CTA: `text-[11px] tracking-[0.2em] uppercase text-muted-foreground/60`

## Changes — `src/pages/PaymentSuccess.tsx` only

### 1. Page shell
- Replace `bg-background` with `bg-[#FAFAF8]`
- Increase vertical padding: `pt-24 pb-20 lg:pt-32 lg:pb-28`
- Center container `max-w-3xl px-6`

### 2. Hero block (replace current Check-in-circle + small h1)
- Eyebrow above headline: `PAYMENT CONFIRMED` (uppercase, tracked, muted)
- Big homepage-style headline:
  - Subscription: `You're now on <span className="italic font-light">Starter</span>` rendered as `text-[2rem] sm:text-5xl lg:text-[3.5rem] font-semibold tracking-[-0.03em] leading-[1.08]` — plan name keeps the same weight, no italic; matches HomeHero exactly
  - Credits: `+1,500 credits added` in the same headline style
  - Timeout: `Your payment is processing`
- Subline: single sentence, `text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed`, no terminal period (per memory rule)
  - e.g. `500 credits ready to use — receipt sent to user@email.com`
- Drop the green check circle (feels generic). Replace with a small inline checkmark chip beside the eyebrow, or omit entirely — homepage hero has no badge icon.

### 3. Plan summary card
- Restyle to match homepage cards: `bg-white rounded-3xl border border-[#f0efed] shadow-sm` (replaces current shadcn `Card`)
- Padding `p-8`, three-column grid `Plan / Monthly credits / Renews` with values in `text-xl font-semibold tracking-tight` and labels in the eyebrow style
- Remove shadcn `Badge`; use a quiet pill: `inline-flex h-6 px-2.5 rounded-full bg-foreground/[0.06] text-xs font-medium`
- Show interval (Monthly / Annual) as a second inline pill

### 4. What's next
- Eyebrow `WHAT'S NEXT` (already correct style, just align tracking to `0.2em`)
- Three `NextStep` cards restyled to match homepage cards: `bg-white rounded-3xl border border-[#f0efed] shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-500`, padding `p-6`, title `text-base font-semibold`, desc `text-sm text-muted-foreground leading-relaxed`
- Icon in a small `w-9 h-9 rounded-xl bg-foreground/[0.04]` tile above the title (homepage feature-card pattern), no color tint

### 5. Footer actions
- Primary CTA pill matches homepage hero CTA exactly: `h-[3.25rem] px-8 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25`, label `Start creating`
- Secondary `Manage billing & invoices` becomes a quiet text link, centered under the CTA, with the eyebrow microcopy treatment for the helper line

### 6. Verifying state
- Same `#FAFAF8` background, centered
- Replace `Loader2` with a subtle dotted/pulsing dot pattern OR keep a thin spinner but in `text-foreground/40`
- Heading uses the homepage h2 scale: `text-2xl sm:text-3xl font-semibold tracking-tight`, copy `text-muted-foreground` no period

### 7. Animations
- Use the same fade-in-up pattern: `animate-in fade-in slide-in-from-bottom-2 duration-700`
- Stagger cards with `style={{ transitionDelay: ... }}` like `HomeCreateCards`

## Files touched
- `src/pages/PaymentSuccess.tsx` — full visual rewrite, no logic changes (polling, tracking, routing all untouched)

No changes to `gtm.ts`, `CreditContext.tsx`, edge functions, or routing. Pixel-firing behavior stays exactly as it is.
