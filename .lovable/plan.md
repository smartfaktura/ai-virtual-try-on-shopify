

Three surfaces with CTA buttons that bypass the unified `h-10 rounded-lg` (default) / `h-10 rounded-full` (`size="pill"`) standard. All currently use `size="sm"` or hardcoded `min-h-[44px]` / icon-only sizing chains.

### 1. `src/components/app/freestyle/PromptBuilderQuiz.tsx` (lines 419–441)

Footer Back / Next / Use This Prompt currently use `size="sm"` with `w-3.5 h-3.5` icons.

Changes:
- **Back** → `<Button variant="ghost" size="pill" className="gap-1.5 text-muted-foreground hover:text-foreground">` + icon `w-4 h-4`
- **Next** → `<Button size="pill" onClick={handleNext} disabled={!canAdvance} className="gap-1.5 disabled:opacity-40">` (drop the redundant `bg-foreground text-background` overrides — let primary variant handle it). Icon `w-4 h-4`.
- **Use This Prompt** → `<Button size="pill" onClick={handleUse} className="gap-1.5 shadow-md">` + icon `w-4 h-4`

### 2. `src/components/app/UpgradePlanModal.tsx` (lines 374–419) — Top-up & Upgrade modals

All four footer buttons use `min-h-[44px]` (~44px) instead of standard `h-10`.

Changes (all 4 buttons):
- **Maybe later / Compare plans** (outline) → `<Button variant="outline" size="pill" ...>` — drop `min-h-[44px]`
- **Continue to checkout** (primary, both topup & upgrade branches) → `<Button size="pill" ... className="gap-2">` — drop `min-h-[44px]`

### 3. `src/pages/Settings.tsx`

- Line 131 **Save preferences** → drop `size="sm"`, add `size="pill"`
- Line 405 **Manage Billing & Invoices** → change `size="sm"` to `size="pill"`, keep `variant="secondary"` and `w-full`
- Lines 428–439 **Monthly / Annual toggle** — these are segmented toggle buttons, NOT CTAs. Standardize internal height to `h-10` (currently `py-2` ≈ 36px). Change to `h-10 px-4 text-sm font-medium` so the toggle group is 40px tall matching the system.
- Line 480 **Contact Sales** → drop `size="lg"`, use `size="pill"` so it matches other CTAs
- Line 596 **Save Settings** (footer) → add `size="pill"`
- Line 621 **Regenerate All Previews** (admin) → add `size="pill"`, keep `variant="secondary"`

### 4. `src/components/app/CreditPackCard.tsx` (line 37–44) — buy credits button

This appears in Settings credit-pack grid AND Pricing page.

Changes:
- Replace `className="w-full min-h-[44px]"` with `size="pill" className="w-full"` so it inherits `h-10 rounded-full text-sm`. Keep `variant={pack.popular ? 'default' : 'outline'}`.

### Out of scope
- Plan cards CTA (`PlanCard.tsx`) — leave as is; they're large card CTAs that warrant the 44px height for tap target on mobile. Only change if user calls them out.
- Tiny inline text links (`text-xs ... underline`) like "Switch to annual & save 20%", "View past invoices", "Cancel subscription", "Reset to onboarding selection" — these are intentional text links, not buttons.

### Acceptance
- Prompt Builder footer Back / Next / Use This Prompt all render at `h-10 rounded-full` with `text-sm` and `w-4` icons.
- Top up / Upgrade modal footers: secondary outline + primary buttons both `h-10 rounded-full`.
- Settings: Save preferences, Manage Billing, Contact Sales, Save Settings, Regenerate All Previews, and credit-pack Buy Credits all `h-10 rounded-full`. Monthly/Annual segmented toggle is 40px tall.

