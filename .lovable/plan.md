
## Unify card border-radius across `/app` and public pages

The user wants every card to share the same corner radius. Right now there's inconsistency because cards are styled in three different ways across the codebase.

### What I found

The base `Card` component (`src/components/ui/card.tsx`) uses `rounded-2xl` (1rem / 16px).

But many components don't use `<Card>` — they build cards manually with `rounded-lg`, `rounded-xl`, `rounded-md`, etc. Examples already visible in context:
- `RecentProductsList.tsx` → `rounded-lg`
- `ModelSelectorCard.tsx` → `rounded-lg sm:rounded-xl`
- `index.css` `.card-luxury` → `rounded-xl`
- `.generation-preview` → `rounded-lg`

So there are at least **4 different radii** in play (md, lg, xl, 2xl).

### The fix — one token, applied everywhere

**1. Define a single canonical card radius**
Add a CSS variable `--radius-card` in `src/index.css` and a Tailwind alias `rounded-card` in `tailwind.config.ts`. Pick the value the user prefers (default proposal: `1rem` / `rounded-2xl`, matching the current `<Card>` base — most premium / matches "luxury restraint" aesthetic).

**2. Update the `Card` primitive**
`src/components/ui/card.tsx` → swap `rounded-2xl` for `rounded-card`. Now any consumer using `<Card>` automatically inherits the unified radius.

**3. Sweep manual card markup**
Find every "card-like" container not using `<Card>` and replace its radius class with `rounded-card`. Targets (based on grep for `rounded-(md|lg|xl|2xl)` on div/article/button containers that visually act as cards):
- `src/components/app/RecentProductsList.tsx`
- `src/components/app/ModelSelectorCard.tsx`
- `src/components/app/LibraryDetailModal.tsx` (inner panels only, not the overlay)
- `src/components/app/RecentCreationsGallery.tsx`
- `src/components/app/DashboardDiscoverSection.tsx`
- Other `src/components/app/*.tsx` and `src/pages/**/*.tsx` files containing card-like wrappers
- `index.css` → `.card-luxury`, `.generation-preview`, `.template-card` aligned to the same token

**Out of scope (kept on their own scales):**
- Buttons, badges, pills, inputs (different radius semantics)
- Avatars, image thumbnails inside cards
- Modal overlays (full-screen)
- Tiny icon chips

### Question before I sweep

<lov-questions>
<lov-question header="Card radius" question="Which radius should be the canonical card radius across the entire app?" multi-select="false">
<lov-option label="rounded-2xl (16px) — current Card default, most premium">Matches existing base Card; softest, luxury feel.</lov-option>
<lov-option label="rounded-xl (12px) — balanced, matches .card-luxury">Slightly tighter; modern editorial look.</lov-option>
<lov-option label="rounded-lg (8px) — tightest, matches most manual cards">Crispest; closest to current ad-hoc usage so smallest visual change.</lov-option>
</lov-questions>

### Files touched (estimate)
- `src/index.css` (token + 3 utility class updates)
- `tailwind.config.ts` (add `rounded-card` alias)
- `src/components/ui/card.tsx`
- ~10–15 component/page files containing manual card markup

### Acceptance
- One token controls every card corner.
- All cards on `/app` pages and public pages render with identical radius.
- No buttons / inputs / badges affected.
