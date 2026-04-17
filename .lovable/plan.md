

## Goal
Constrain the sticky bar on `/app/pricing` to the main content area (not the full viewport), matching the sticky bar pattern used in `/app/generate/product-images`.

## Investigation
Need to check how `/app/generate/product-images` positions its sticky bar — likely uses `sticky` inside the content container, or `absolute` within the main content area, rather than `fixed` to the viewport. Currently `AppPricing.tsx` uses `fixed` with `sm:left-1/2 sm:-translate-x-1/2 sm:max-w-6xl` which spans full viewport width and ignores the sidebar.

## Approach
1. Read the product-images sticky bar implementation to identify the exact pattern (positioning, width, parent container).
2. Apply the same pattern to `AppPricing.tsx`:
   - Likely move sticky bar inside the `<main>` / page content wrapper.
   - Use `sticky bottom-4` or `fixed` constrained by AppShell content offset (e.g., `left-[var(--sidebar-width)]`), so it spans only the content area between sidebar and right edge.
   - Preserve existing slide-up transform animation, content, and responsive layout.

## File
- `src/pages/AppPricing.tsx` (sticky bar wrapper, ~lines 637–650)
- Reference only: `/app/generate/product-images` sticky bar source

## Out of scope
- Bar internal layout, animation, dropdown, CTA logic — unchanged.
- StudioChat hide behavior — unchanged.

## Result
Sticky bar aligns with the main content area (respects sidebar), matching the visual behavior of the product-images page sticky bar. No more full-viewport overflow on desktop.

