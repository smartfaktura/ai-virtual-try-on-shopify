# Match inner elements to /app Dashboard aesthetic

The five pages already share the standard `PageHeader` + `max-w-3xl` / dashboard container pattern. What still feels "off" is the **inner element styling** — the contact form, settings cards, search input and small density choices don't echo the Dashboard's calm, bordered-card pattern (`rounded-2xl border border-border bg-card p-5/6 shadow-sm`, soft icon tiles, `pill` buttons, consistent spacing).

This pass redesigns those inner pieces only. No content removed, no headlines changed.

---

## What changes per page

### 1. `/app/help` — `AppHelp.tsx` + `ChatContactForm.tsx`

The "spacious" form variant uses borderless underline fields on a card — they look like a different design system. Replace with bordered inputs that match the rest of `/app`.

- `ChatContactForm` (variant `spacious`):
  - Replace underline inputs with the standard `Input` / `Textarea` shadcn components: `h-11 rounded-xl bg-background border-border` for inputs, `rounded-xl` for textarea.
  - Labels → small uppercase eyebrow style: `text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-2`.
  - Submit button → `Button size="pill"` with `gap-2` and `Send` icon (matches Bug Bounty CTA).
  - Reduce vertical rhythm from `space-y-7` → `space-y-5`.
- `AppHelp.tsx`:
  - Wrap the avatars + form into one card (currently the avatars float above the card). Move the avatar row inside the form card as a small header strip with a thin divider, so the page reads as: **[Form card with team header]** → **[Helpers list card]** → **[footer links]**.
  - Helpers list rows: tighten to `py-3.5 px-5`, add a small `w-9 h-9 rounded-xl bg-primary/10` icon tile around each leading icon (matches Dashboard "More tools" cards).

### 2. `/app/bug-bounty` — `BugBounty.tsx`

Already mostly aligned. Polish only:

- Reduce overall `space-y-8` → `space-y-6` (matches Dashboard rhythm).
- Eyebrow labels (`How it works`, `Reward tiers`, etc.): tighten margin `mb-3` → `mb-2.5`, add subtle `px-1` so they align with card padding.
- "How it works" numbered steps: replace the bordered circle with the same soft tile used elsewhere — `w-8 h-8 rounded-xl bg-primary/10 text-primary text-[13px] font-semibold`.
- "What qualifies / doesn't qualify" cards: bump padding `p-5` → `p-6`, list items use `gap-3` and `text-[14px] leading-relaxed`.
- CTA card: add a small `Mail` tile (`w-10 h-10 rounded-xl bg-primary/10`) to the left of the "Found a bug?" text so it visually echoes Dashboard tool cards. Right-align the button on `sm+`.

### 3. `/app/settings` — `Settings.tsx`

Currently uses shadcn `<Card>` with mixed padding (`p-5`). Normalize to dashboard pattern: plain `div` with `rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm`. This removes the slightly-off `<Card>` border tone and matches Dashboard exactly.

- Replace every `<Card className="rounded-2xl border-border bg-card shadow-sm"><CardContent className="p-5 ...">` with a single `<div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">`. Affects: Current Plan card, Credit Packs card, Notifications card, Admin Asset Preview card.
- Section headings inside cards: standardize to `text-base font-semibold` + `text-sm text-muted-foreground mt-0.5` (already mostly there — make consistent).
- Notifications inner blocks: replace the bare `<h3 class="text-sm font-semibold">` sub-section labels with the eyebrow style used on Bug Bounty (`text-[11px] uppercase tracking-[0.2em] text-muted-foreground`) for visual continuity across pages.
- "Save Settings" button row: keep `size="pill"` but wrap in a thin top-divider (`pt-4 border-t border-border`) so the action feels grounded inside the page rather than floating.
- Billing period toggle (`Monthly / Annual`): no change — already matches the pill aesthetic.
- `ContentPreferencesSection`: wrap its body in the same `rounded-2xl border bg-card p-5 sm:p-6` so it visually separates from Notifications instead of being a sub-block of the same card. (Move it OUT of the Notifications card into its own card directly below.)

### 4. `/app/learn` — `Learn.tsx`

- Search input: swap pill style (`rounded-full h-11`) → `rounded-xl h-11` to match Settings/form inputs. Place it inside a thin wrapper or keep inline — keep inline.
- Track section eyebrow + count: already matches Bug Bounty pattern. No change.
- Guide rows: add subtle leading dot or number? **No** — keep clean, but increase row padding `py-4 px-5` → `py-4 px-5 sm:px-6` and bump title to `text-[15px] font-medium` (already there). Add a thin trailing read-time pill: wrap `{guide.readMin} min` in `px-2 py-0.5 rounded-full bg-muted/60 text-[11px]` for a small premium touch consistent with Dashboard badges.
- Video figure: keep `rounded-2xl` — already matches.

### 5. `/app/brand-profiles` — `BrandProfiles.tsx`

Mostly aligned. Polish:

- Top action row: instead of a lone right-aligned "Create Profile" button floating above the list, move it into the `PageHeader`'s `actions` slot so it sits next to the page title (matches the rest of `/app` action conventions like `Products`, `Library`).
- `BrandModelsBanner`: already uses the right card pattern. Tighten internal padding from `p-5 sm:p-7` → `p-5 sm:p-6` to match Dashboard cards. Avatar tile from `rounded-2xl` → keep, but normalize size to `w-12 h-12 sm:w-14 sm:h-14` for less visual weight.
- Loading skeletons: change `h-28` → `h-24` and `rounded-2xl` (already) — minor.

---

## Shared visual tokens applied everywhere

| Token | Value |
|---|---|
| Card | `rounded-2xl border border-border bg-card shadow-sm` |
| Card padding | `p-5 sm:p-6` |
| Eyebrow label | `text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground` |
| Soft icon tile | `w-10 h-10 rounded-xl bg-primary/10` (icon `text-primary w-5 h-5`) |
| Section vertical rhythm | `space-y-6` between cards |
| Primary CTA | `<Button size="pill">` with optional `gap-2` + icon |
| Inputs | `h-11 rounded-xl bg-background border-border` |

---

## Files to edit

- `src/components/app/ChatContactForm.tsx` — redesign `spacious` variant (bordered inputs, eyebrow labels, pill button).
- `src/pages/AppHelp.tsx` — merge avatar row into form card, add icon tiles to helpers list.
- `src/pages/BugBounty.tsx` — density polish, swap step circle for soft tile, add Mail tile to CTA.
- `src/pages/Settings.tsx` — replace `<Card>` wrappers with plain bordered divs, lift `ContentPreferencesSection` into its own card, eyebrow labels for sub-sections.
- `src/pages/Learn.tsx` — switch search input from pill to rounded-xl, add small read-time pill on rows.
- `src/pages/BrandProfiles.tsx` — move "Create Profile" into `PageHeader` actions, polish banner padding.

No content, copy, or routes change.
