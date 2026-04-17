

## Goal
Replace all user-facing `VOVV AI` (with space, no dot) with `VOVV.AI`. Preserve `vovv.ai` URLs, technical identifiers, and the short `VOVV` microcopy where it already exists.

## Scope of changes

Based on the audit from earlier this session, here are the exact locations to fix:

### SEO titles & meta descriptions
- `src/components/SEOHead.tsx` line 68 — default title fallback `'VOVV AI | Automated Visual Studio for E-commerce'` → `'VOVV.AI | Automated Visual Studio for E-commerce'`, and og:site_name on line 53 `'VOVV AI'` → `'VOVV.AI'`
- `src/pages/Auth.tsx` SEO description (~line 347): `"...your VOVV AI account..."` → `"...your VOVV.AI account..."`
- All `src/pages/features/*` page SEO titles using `VOVV AI`
- Any other page-level `<SEOHead title="... VOVV AI ...">` invocations
- `src/pages/Pricing.tsx` (lines 14, 16, 33) public pricing SEO copy
- `src/pages/PublicFreestyle.tsx` (lines 294, 327) and `src/pages/PublicDiscover.tsx` SEO blocks

### UI text
- Anywhere a visible string contains `VOVV AI` (with space) in:
  - Navigation, headers, hero copy
  - Onboarding screens
  - Modals (upgrade, no-credits, buy-credits, etc.)
  - Pricing pages (`/pricing`, `/app/pricing`)
  - Auth pages (sign in / sign up / reset)
  - Legal pages (`CookiePolicy`, `PrivacyPolicy`, `TermsOfService` if they exist)
  - Footer, FAQ blocks

### Email templates
- `supabase/functions/_shared/email-templates/*.tsx` — confirm `siteName` usage; if any subject line or body string hardcodes `VOVV AI`, change to `VOVV.AI`
- `supabase/functions/auth-email-hook/index.ts` (or equivalent) — subject lines passing the brand
- Any transactional email template files

### Index HTML
- `index.html` `<title>` and meta tags if they contain `VOVV AI`

## Method

1. Run a project-wide search for the exact string `VOVV AI` (case-sensitive, with the single space).
2. For each match, replace with `VOVV.AI` **only when it is user-facing display text** (JSX text, string literals used in `title`/`content`/`subject`/`displayName`).
3. Skip:
   - `vovv.ai` lowercase URL strings
   - Variable names, comments, code identifiers
   - Existing short `VOVV` microcopy (e.g. `BuyCreditsModal` "Get more from VOVV", `CompetitorComparison` "VOVV pricing varies…", `HomeFAQ` "What is VOVV?") — leave these untouched per the rule
4. After applying, run the same search again to confirm zero remaining `VOVV AI` matches in user-facing strings.

## Out of scope
- Tone, copy length, or structural changes
- The short `VOVV` form (preserved where natural)
- Any `vovv.ai` URL string
- Lowercase `vovv` in technical contexts
- Image alt text rewrites beyond the brand fix

## Deliverable
After the sweep, I'll output:
1. A grouped list of every file changed and the exact line(s) updated
2. Any ambiguous cases I deferred (e.g. a string that mixes brand + product name and might need your call) — flagged, not auto-changed
3. Confirmation that `grep "VOVV AI"` (case-sensitive, with space) returns zero matches in `src/`, `supabase/functions/`, and `index.html`

## Result
Single canonical brand mark `VOVV.AI` everywhere it appears as a name, with the short `VOVV` form retained only in the existing handful of microcopy locations. No design, tone, or structural changes.

