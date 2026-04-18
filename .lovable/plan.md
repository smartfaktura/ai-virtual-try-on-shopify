

## Two fixes in `src/components/app/AppShell.tsx`

### 1. Collapsed sidebar credits → match mobile pill style

**Current** (lines 240–265): vertical stack with 32px square sparkle icon + tiny "10px" balance number below + separate arrow button. Doesn't match anything.

**Mobile pill** (lines 458–471) is the reference: rounded-full pill, sparkle + balance number inline, with empty/low/normal color states.

**Change**: Replace the collapsed credits block with a vertically-compact version of the mobile pill:
- Outer button: `flex flex-col items-center gap-1.5 w-full px-1.5 py-1.5 rounded-2xl` + same color states (`isEmpty` → white bg, else `bg-white/[0.06] border-white/10`).
- Inside: `Sparkles` icon (w-3.5) on top, balance number `text-xs font-semibold` below.
- Click → `openBuyModal` (same as mobile).
- Keep the small `ArrowUpRight` upgrade button below (unchanged) for upgrade-to-pricing access — OR remove it since the mobile pill doesn't have it. **Decision: remove it** — pill click already opens upgrade/topup modal, matches mobile exactly.

### 2. User popup menu position fix

**Current** (lines 299–302): `absolute bottom-full mb-2 w-52 ... left-1/2 -translate-x-1/2` (collapsed) or `left-3` (expanded).

**Issue per screenshot**: On mobile drawer the dropdown is correctly anchored but is being visually crowded/clipped by the floating chat FAB on the bottom-left. Also when collapsed sidebar is narrow (~64px), the `w-52` (208px) menu centered with `-translate-x-1/2` extends off the left edge of the sidebar.

**Fix**:
- Collapsed desktop: change from `left-1/2 -translate-x-1/2` to `left-full ml-2 bottom-0` so menu opens to the **right** of the collapsed sidebar instead of overflowing left.
- Mobile drawer / expanded desktop: keep `left-3` but switch from `bottom-full mb-2` to anchor that doesn't collide with FAB — already fine; the FAB issue is separate (FAB sits at viewport bottom-left, drawer at z-50). Add `lg:left-3 left-3` and ensure drawer overlay has higher z than FAB (already `z-50` for menu vs FAB likely `z-40`).
- Add a `max-w-[calc(100vw-2rem)]` safeguard on the menu so it never overflows viewport.

### Acceptance
- Collapsed sidebar shows a small rounded pill with sparkle + balance, identical visual language to mobile top-bar pill.
- Clicking pill opens upgrade/topup modal.
- User dropdown on collapsed desktop opens to the right of the sidebar (not clipped left).
- User dropdown on mobile fits within viewport, not clipped on left edge.

