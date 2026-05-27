## Match the rest of /app/settings to the new "Current Plan" card

Apply the same calm, banded, generous-padding design language (eyebrow → display → divider → action) to every other section on Settings.tsx. Visual only — no logic, no copy-meaning changes, no removed controls.

### Shared card recipe (now the page standard)
- Container: `rounded-2xl border border-border bg-card p-7 sm:p-9 shadow-sm`
- Eyebrow label: `text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium`
- Section title: `text-2xl font-semibold tracking-tight leading-none`
- Subtitle: `text-sm text-muted-foreground` (no terminal period on single-sentence subtitles, per Core memory)
- Band dividers inside a card: `my-7 border-t border-border/60` (replaces inline `<Separator />` usage inside cards)
- Buttons: `h-11 rounded-xl` with `w-4 h-4 mr-2` icons (primary filled, secondary `variant="secondary"`)
- Only 3 type sizes per card: 11px eyebrow, 14px body, 24px display

### Sections to restyle

1. **"Choose Your Plan" header row** (560–579)
   - Replace `text-base` h3 + tiny subtitle with: eyebrow "Plans" + `text-2xl` "Choose your plan" + `text-sm` subtitle "Built for ongoing brand-ready visual production"
   - Keep the monthly/annual pill toggle; align it to bottom-right of the header block

2. **Plan grid** (581–595)
   - Keep grid + PlanCard usage untouched (out of scope per "do not change functions")
   - Bump gap to `gap-5 sm:gap-6`

3. **Enterprise banner** (598–624)
   - Apply shared recipe padding `p-7 sm:p-9`
   - Eyebrow "Enterprise" + `text-2xl` plan name + `text-sm` subtitle
   - Feature checks: same grid, restyled as `text-sm text-muted-foreground` with `Check w-3.5 h-3.5 text-foreground`
   - "Contact Sales" → `h-11 rounded-xl`

4. **Need More Credits? (credit packs)** (627–637)
   - Container padding to `p-7 sm:p-9`
   - Eyebrow "Top-up" + `text-2xl` "Need more credits" + `text-sm` "Purchase additional credits anytime · Credits never expire"
   - Insert `my-7 border-t border-border/60` divider between header and pack grid

5. **Cancel / Reactivate footer** (640–670)
   - Keep centered link but bump to `text-sm` and tighten copy spacing; no card chrome change

6. **Notifications card** (675–729)
   - Apply shared recipe padding
   - Replace inline h2 + h3s with: eyebrow "Notifications" + `text-2xl` "Notifications" + `text-sm` subtitle
   - Each sub-group (Email / Marketing / In-app) becomes a band separated by `my-7 border-t border-border/60` instead of `<Separator />`
   - Sub-group label keeps its `text-[11px] uppercase tracking-[0.2em]` style (already matches eyebrow spec)
   - Checkbox rows: tighten to `gap-3`, label `text-sm font-medium`, help `text-xs text-muted-foreground mt-0.5`
   - Save button → `h-11 rounded-xl`

7. **Content Preferences card** (732–734)
   - Container padding to `p-7 sm:p-9`
   - No edits to `ContentPreferencesSection.tsx` contents (out of scope)

8. **Page-level `<Separator />` between sections** (672, 740)
   - Replace with simple `mt-4` spacing — cards already self-separate via their borders

### Files
- `src/pages/Settings.tsx` — only the JSX between the closing of the Current Plan band (≈558) and the end of the page wrapper

### Out of scope (do not touch)
- `PlanCard.tsx`, `CreditPackCard`, `ContentPreferencesSection`, `AdminFeedbackPanel`, `FeedbackBanner`
- Any business logic, state, copy meaning, or button behavior
- Sidebar, page header, dialogs