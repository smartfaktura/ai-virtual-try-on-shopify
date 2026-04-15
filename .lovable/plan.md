

# QA Design Audit — Post-Gen Conversion (Layers 1–3)

## Issues Found

### Issue 1: Layer 2 Drawer — width conflict on mobile
The `UpgradeValueDrawer` sets `className="w-full sm:max-w-[480px]"` on `SheetContent`. But the base Sheet component already applies `w-3/4 sm:max-w-sm` (384px) via `sheetVariants`. The result:
- **Desktop**: `sm:max-w-[480px]` fights `sm:max-w-sm` — Tailwind merge may pick either depending on class order. Unpredictable width.
- **Mobile**: `w-full` overrides `w-3/4` correctly, so it's full-width. Fine.

**Fix**: The `w-full sm:max-w-[480px]` class needs to fully override the variant defaults. Since `SheetContent` merges via `cn()`, the inline class should win — but `sm:max-w-sm` and `sm:max-w-[480px]` are different utilities so both could apply. Need to add `!sm:max-w-[480px]` or override with a single `max-w` class that clearly wins.

### Issue 2: Layer 3 Modal — credit packs overflow on mobile
`NoCreditsModal` uses `grid-cols-1 sm:grid-cols-3` for packs, which stacks on mobile — good. But the overall `max-w-xl` dialog on small screens can still be too wide. The Dialog base component uses `w-full max-w-lg` and `max-w-xl` overrides it. On phones (<400px), the 3-column grid collapses properly, but the `px-8` horizontal padding (32px each side = 64px total) eats into a 375px screen, leaving only 311px for content. The "Best Value" badge with `absolute -top-3` also clips at the top of the scrollable area.

**Fix**: Reduce padding to `px-5 sm:px-8` for mobile breathing room. Add `mt-3` to the packs grid to prevent "Best Value" badge clipping.

### Issue 3: Layer 1 Card — `pl-9` left offset on narrow screens
The chips and CTA use `pl-9` (36px) to align with the text next to the sparkle icon. On mobile (320–375px), this creates a cramped right side. The chips may wrap to 3+ rows unnecessarily.

**Fix**: Use `pl-7 sm:pl-9` to reduce indent on mobile.

### Issue 4: Layer 2 Drawer — `p-0` removes Sheet's default padding but close button position is off
`SheetContent` has `p-0` to use custom `p-6` inside the div. But the Sheet's close button (`absolute right-4 top-4`) is positioned relative to the content element which has `p-0`, so it sits at the very top-right edge. Meanwhile the inner content has its own `p-6`, creating a visual mismatch — the X button isn't aligned with the header text below it.

**Fix**: Add `pt-2` to the SheetContent or adjust the inner padding to `pt-10` to account for the close button area, matching the pattern used elsewhere in the app.

### Issue 5: Layer 2 — "Most Popular" badge clips on scroll
The Growth plan card uses `relative` with `absolute -top-2.5` for the badge. If the drawer content is long enough to scroll, the badge is fine. But if the Growth card starts near the top of the scrollable area, the badge could clip against the container's top edge.

**Fix**: Add `pt-3` to the Growth card's wrapper to give the badge overflow space.

### Issue 6: Layer 3 — DialogFooter "Maybe Later" button alignment
The footer uses `DialogFooter` which on mobile is `flex-col-reverse`. With only one button, this is fine. But the button doesn't stretch full width on mobile, making it look unanchored.

**Fix**: Add `w-full sm:w-auto` to the "Maybe Later" button.

### Issue 7: Layer 2 — feature chips text too small at 10px
The `text-[10px]` feature chips in both Starter and Growth plan cards are below minimum readable size on mobile. Combined with the muted foreground color, they're nearly invisible.

**Fix**: Use `text-[11px] sm:text-[10px]` for slightly larger mobile rendering.

## Files to modify

1. **`src/components/app/PostGenerationUpgradeCard.tsx`** — `pl-7 sm:pl-9` for chips/CTA sections
2. **`src/components/app/UpgradeValueDrawer.tsx`** — fix max-width override, add close button clearance padding, Growth card badge space, bump chip text size
3. **`src/components/app/NoCreditsModal.tsx`** — reduce mobile padding `px-5 sm:px-8`, add pack grid top margin for badge, full-width "Maybe Later" button on mobile

