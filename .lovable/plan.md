

The user is right — the global `button.tsx` change made `<Button>` components round, but **raw `<button>` elements** with hardcoded `rounded-lg` / `rounded-xl` classes were NOT touched. The "Get Credits" in `LowCreditsBanner.tsx` is a perfect example: it's a raw `<button>` with `rounded-lg`.

I need to sweep `/app` for all raw `<button>` CTAs and any `<Button>` with hardcoded radius overrides.

### Confirmed offenders so far
1. **`LowCreditsBanner.tsx`** — `<button>` with `rounded-lg` ("Get Credits") + dismiss `<button>` (icon-only, leave square or round)
2. **`CreditIndicator.tsx`** — `<button>` with `rounded-full` already ✓ (Upgrade/Top up)
3. Need to grep all of `src/components/app/**` and `src/pages/**` for:
   - `<button` (raw) with `className=` containing CTA-style tokens (bg-, px-, py-, rounded-)
   - `<Button` with `rounded-lg`, `rounded-xl`, `rounded-md` className overrides
   - `buttonVariants(` calls inside other components

### Plan

1. **Grep raw `<button>` elements** across `/app` components & pages → identify CTA-shaped ones (have bg/border + padding) → convert radius to `rounded-full` (preserve height & padding)
2. **Grep `<Button … className="…rounded-(lg|xl|md)…"`** → strip the override (base is now `rounded-full`)
3. **Grep `buttonVariants(`** usages → ensure they don't override radius
4. **Spot-check special components**:
   - `LowCreditsBanner` (Get Credits)
   - Activity cards, Library asset cards, Lightbox toolbar buttons
   - Modal close X buttons (DialogClose) — keep as-is (shadcn primitive)
   - Sidebar collapse trigger
   - "Create Visuals" sidebar button
   - Filter chips, status pills (already round)
   - Auth/login forms
   - Onboarding CTAs

### Exclusions (unchanged)
- shadcn primitives in `src/components/ui/**` (except already-fixed `button.tsx`)
- Marketing/landing pages
- Tabs / segmented controls / toggle groups
- Icon-only menu triggers inside DropdownMenu/Popover that use `<button>` with no visible bg

### Deliverable
A single sweep producing a list of every file edited with the radius fix applied, with raw `<button>` CTAs converted to `rounded-full` and stray `rounded-lg/xl/md` className overrides on `<Button>` removed. Final summary will list each file + the specific button(s) fixed.

