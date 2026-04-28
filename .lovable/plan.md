## Goal

Bring five in-app pages — `/app/help`, `/app/bug-bounty`, `/app/settings`, `/app/learn`, `/app/brand-profiles` — visually in line with the **homepage aesthetic** (HomeHero / HomeCreateCards / PaymentSuccess style), while keeping the **content unchanged** and the layout **left-aligned** (not centered hero). No copy edits, no removed sections, no behavior changes.

## Reference aesthetic (from Home + PaymentSuccess + Contact)

- Off-white surface: `bg-[#FAFAF8]` page background, white `rounded-3xl` cards with `border-[#f0efed]` (a.k.a. `border-foreground/10`)
- Typography: tight `tracking-[-0.03em]` headlines, `font-semibold` (not `font-bold`), uppercase eyebrow `text-[11px] tracking-[0.2em] text-muted-foreground`
- Vertical rhythm: generous `py-12 sm:py-16`, sections separated by `space-y-10` / `space-y-12`
- Buttons: pill CTA — `rounded-full h-[3.25rem] px-7 shadow-lg shadow-primary/25` for primary; ghost/outline pills (`rounded-full`) for secondary
- Subtle `animate-in fade-in slide-in-from-bottom-2 duration-500` on hero block
- No drop shadows on body cards beyond the soft `shadow-sm`; rely on borders + off-white contrast

## Scope (5 files, content untouched)

### 1. `src/pages/AppHelp.tsx`
- Wrap content in `bg-[#FAFAF8]` shell with `py-14 sm:py-20`
- Switch container from `max-w-xl mx-auto` (centered) → `max-w-2xl` left-aligned (remove `mx-auto`, keep responsive padding)
- Replace `text-3xl/4xl font-semibold tracking-tight` headline → `text-4xl sm:text-5xl font-semibold tracking-[-0.03em]`
- Add uppercase eyebrow "Support" above the headline (matches homepage section labels) — this is a structural label, not new copy
- Wrap the existing form section and the helper-links section each in a `rounded-3xl border border-[#f0efed] bg-white p-6 sm:p-8` card
- Keep avatars, FAQ/Discord/Tutorials links, and footer social row exactly as-is

### 2. `src/pages/BugBounty.tsx`
- Same shell wrapper (`bg-[#FAFAF8]` + `py-14 sm:py-20`), container `max-w-3xl` left-aligned (remove `mx-auto` — currently centered)
- Hero: keep eyebrow `Bug Bounty`, restyle headline to `text-4xl sm:text-5xl font-semibold tracking-[-0.03em]`, swap the icon tile from `bg-primary/10 rounded-2xl` → `bg-white border border-[#f0efed] rounded-2xl shadow-sm` for the cleaner home look
- Convert all section cards (`How it works`, `Reward tiers`, `Qualifies/Doesn't`, `What to include`, CTA) from `bg-card/30 border-border/50 rounded-2xl` → `bg-white border border-[#f0efed] rounded-3xl` with consistent `p-6 sm:p-8`
- Final CTA: pill button already uses `rounded-full` — bump to `h-[3.25rem] px-7 shadow-lg shadow-primary/25` to match homepage primary CTA

### 3. `src/pages/Settings.tsx` (lightest touch — large file, content stays)
- Wrap the existing `<PageHeader>` + content in a `bg-[#FAFAF8]` shell `py-10 sm:py-14` (the page currently inherits whatever the AppLayout gives it)
- Update `PageHeader` consumption is local — no changes to the shared component. Instead, after PageHeader, restyle each `<Card>` to `rounded-3xl border-[#f0efed] bg-white shadow-none` via a small className override on each (5–6 cards)
- Replace `Separator` divider lines between sections with empty whitespace (`mt-12`) for the home-style airy rhythm
- Plan-tier toggle (Monthly/Annual): change from boxy `rounded-lg border` → pill `rounded-full border` to match home buttons
- Final "Save Settings" button: keep `size="pill"` but match the home primary CTA proportions (`h-[3.25rem] px-7 shadow-lg shadow-primary/25`)
- All copy, all logic, all admin sections, all checkboxes preserved

### 4. `src/pages/Learn.tsx`
- Page shell `bg-[#FAFAF8]` + `py-14 sm:py-20`, container `max-w-3xl` left-aligned (drop `mx-auto`, keep on mobile via padding)
- Add uppercase eyebrow "Learn"; headline → `text-4xl sm:text-5xl font-semibold tracking-[-0.03em]`
- Video figure: keep, but switch container to `rounded-3xl border-[#f0efed]` (currently `rounded-xl border-border/50`)
- Search input: pill style `rounded-full h-12 bg-white border border-[#f0efed]` (currently `bg-muted/50 border-transparent`)
- Track section cards: change list container from `rounded-xl border-border/60 bg-card/40` → `rounded-3xl border-[#f0efed] bg-white` with `divide-[#f0efed]`
- Keep all guides, sections, search behavior, empty state

### 5. `src/pages/BrandProfiles.tsx`
- The page currently uses `<PageHeader>` (good). Wrap output in `bg-[#FAFAF8]` shell + `py-10 sm:py-14`
- "Create Profile" button: bump to pill primary CTA matching home (`rounded-full h-11 px-6 shadow-md shadow-primary/20`)
- BrandModelsBanner: convert from `rounded-2xl bg-gradient-to-r from-primary/5` → `rounded-3xl bg-white border border-[#f0efed]` (drop the gradient — feels more premium-restrained, matches HomeCreateCards style); keep avatar, copy, CTA pill
- Profile cards left as-is (handled by `BrandProfileCard` component — out of scope)
- EmptyStateCard left as-is

## Out of scope

- No content/copy changes (per user request)
- No changes to `PageHeader.tsx`, `BrandProfileCard.tsx`, `EmptyStateCard.tsx`, `ChatContactForm.tsx`, `PlanCard.tsx`, `CreditPackCard.tsx`, or any shared component
- No new routes, no logic changes, no removed sections

## Files touched

- `src/pages/AppHelp.tsx`
- `src/pages/BugBounty.tsx`
- `src/pages/Settings.tsx` (className-only edits on existing JSX)
- `src/pages/Learn.tsx`
- `src/pages/BrandProfiles.tsx`
