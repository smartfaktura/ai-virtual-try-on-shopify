## Issues on `/product-visual-library` (mobile)

1. Filter trigger bar shows the current category (e.g. "Fashion & Apparel · 425") — confusing as a filter affordance. Should read as a clear action like "View by category".
2. Mobile filter drawer highlights "All categories" at the top in solid dark even though Fashion & Apparel is the actual active category — double active state, confusing.
3. Scene detail modal on mobile: hero image is wide (16:11) and the body sits below, but content still overflows on smaller phones, making the user scroll inside the modal. Needs a tighter vertical layout that fits a single mobile screen.
4. The default close X is hard to see against the dark hero image — needs a clearly visible floating close button.

## Fixes

### A) `src/pages/ProductVisualLibrary.tsx` — filter trigger label
- Change the mobile trigger label logic so it always says "View by category" (with the current category shown as a smaller secondary chip on the right). Concretely:
  - Remove the `triggerLabel` variable usage in the trigger button.
  - Replace the trigger button content with: icon + "View by category" + (if a family is active) a small pill on the right showing the family label and count, e.g. "Fashion & Apparel · 425".
  - This makes the bar read as an action instead of a status.

### B) `src/components/library/LibraryMobileFilters.tsx` — drawer active state
- Stop highlighting "All categories" in solid dark when a real family is already active. The "All categories" row should only be shown as active when **no** family is selected (or the user explicitly chose "All"). Today the condition `activeFamilySlug === families[0]?.slug && !activeCollectionSlug` highlights the first family as if it were "All", which is wrong.
- New rule: "All categories" highlighted only if `activeFamilySlug === null`.
- Add a separate "All categories" handler that sets `activeFamilySlug = null`. (`ProductVisualLibrary` already auto-falls back to `families[0]` for rendering when slug is null, so behaviour is preserved — but the visual state becomes correct.)
- Visual polish: when a family is expanded, render its sub-items in a slightly indented "tray" with a subtle left rule (1px `border-l border-foreground/10` + `ml-5 pl-3`) instead of pure indentation, so the hierarchy reads as a tree, not as two equal-level pills.

### C) `src/components/library/SceneDetailModal.tsx` — vertical fit on mobile + visible close

- **Layout switch on mobile to a vertical scroll-free design.** Replace the current 16:11 hero with a compact vertical stack tuned for a single phone screen:
  - Container: keep `max-h-[92dvh]`, but switch the inner layout to `flex flex-col` on mobile and the existing `md:grid-cols-[5fr_6fr]` on desktop.
  - Hero on mobile: change aspect ratio from `aspect-[16/11]` to `aspect-[5/4]` *but cap with `max-h-[42dvh]`* so the image never eats more than ~42 % of viewport height. Use `object-cover`. Desktop unchanged (`md:aspect-[4/5] md:max-h-none`).
  - Body padding on mobile reduced to `p-4` (was `p-5`), and gap reduced to `gap-3` (was `gap-4`) so badges, title, description and CTA all fit in the remaining ~50dvh.
  - Description: clamp to 3 lines on mobile via `line-clamp-3 sm:line-clamp-none` so very long copy can't push the CTA off-screen.
  - CTA stays the existing pill at `h-[3.25rem]`; helper line below the CTA stays as is.

- **Add a clearly visible floating close button.**
  - Hide the default theme X (`[&>button[aria-label='Close']]:hidden` on `DialogContent`) because it sits low-contrast on the hero.
  - Add an explicit `<DialogClose>`-wrapped circular button absolutely positioned at `top-3 right-3` on top of the hero: `h-9 w-9 rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur border border-foreground/10 flex items-center justify-center` with an `X` icon (4px stroke). On desktop this floats over the same hero corner and stays consistent.

## Files

- `src/pages/ProductVisualLibrary.tsx` — trigger button content only.
- `src/components/library/LibraryMobileFilters.tsx` — handler + active-state condition + tray styling.
- `src/components/library/SceneDetailModal.tsx` — mobile layout tweaks + floating close button.

No data, routing, or logic changes beyond the above.
