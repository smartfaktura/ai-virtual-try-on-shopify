
The user is focused on **spacing and border-radius**, not the white-bg-shimmer treatment. Looking at what's different:

**Sidebar pill buttons** (CreditIndicator "Top up", sidebar "Create / Open Studio / Browse Look"):
- `rounded-full` (fully pill)
- Tight padding: `h-8 px-3.5` or `h-9 px-4`
- Compact, snappy feel

**Page CTAs** (Add Products, default shadcn `<Button>`):
- `rounded-md` (6px corners — boxy)
- Taller padding: `h-10 px-4 py-2`
- Heavier, more "form-button" feel

The mismatch is the corner radius and height making the page buttons feel like form controls while the sidebar feels like premium nav CTAs.

### Recommendation
Move the whole app to **softly rounded, slightly more compact** primary buttons — the pill aesthetic without going full `rounded-full` everywhere (which can feel gimmicky on wide buttons like "Save Changes").

**Concrete change to `buttonVariants` in `src/components/ui/button.tsx`:**
- Base: `rounded-md` → `rounded-lg` (matches the 8–12px radius used on cards, inputs, sidebar tiles)
- `size.default`: `h-10 px-4` → `h-9 px-4` (one notch tighter, matches sidebar h-9)
- `size.lg`: `h-11 px-8` → `h-10 px-6 rounded-lg`
- `size.sm`: stays `h-9` but `rounded-md` → `rounded-lg`
- Add new `size="pill"` → `h-9 px-4 rounded-full` for cases where we want the sidebar-style pill (icon + label CTAs like "Generate", "Top up", "Create").

This way:
- All standard page buttons (Add Products, Save Changes, Cancel) get softer corners + tighter height → quietly matches the sidebar's premium feel
- Pill remains available as an opt-in for hero CTAs
- No bespoke white-bg shimmer treatment leaks into page content (which would look out of place on a light bg)

### Files
- `src/components/ui/button.tsx` (~6 lines — variants only)

### Out of scope
- No changes to `CreditIndicator` or sidebar nav buttons (they keep their bespoke white-pill style for dark sidebar contrast)
- No per-page button rewrites — the variant change cascades automatically
- No color/variant changes

### Acceptance
- "Add Products", "Save Changes", "Cancel" and similar buttons across the app render with `rounded-lg` corners and `h-9` height
- Sidebar Top up / Create / Open Studio / Browse Look unchanged
- New `size="pill"` available for future hero CTAs
- No layout breakage on existing button-heavy pages (forms, modals, tables)
