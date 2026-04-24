## Add loading state to "Recreate this" buttons on /discover

### Confirmed bug
You're right — there is **no loading affordance** anywhere on the Recreate flow. When the user clicks "Recreate this", the button just calls `navigate(...)` synchronously and the user stares at an unchanged button until the next page (`/app/generate/product-images`, `/app/freestyle`, etc.) finishes lazy-loading + fetching wizard data. That gap can be 0.5–2s and feels broken.

Buttons affected (all have zero loading state today):
| File | Line | Button |
|---|---|---|
| `src/components/app/DiscoverCard.tsx` | 120 | Desktop hover "Recreate this" pill |
| `src/components/app/DiscoverCard.tsx` | 146 | Mobile bottom-right "Recreate" pill |
| `src/components/app/DiscoverDetailModal.tsx` | ~860 | Modal primary "Recreate this" CTA |
| `src/components/app/PublicDiscoverDetailModal.tsx` | ~179 | Public modal "Recreate This" CTA |

### Fix — local transient loading state per button

Each button gets a tiny local `isNavigating` state. On click:
1. Set `isNavigating = true`
2. Show inline spinner + dim/disable the button (pointer-events off, but stays visible)
3. Call the existing `onRecreate` / navigate handler
4. State auto-resets when the component unmounts on route change (no timer needed — the new page replaces this one)

For the **DiscoverCard buttons**, both the desktop and mobile "Recreate" buttons share one local state since only one is visible at a time per breakpoint.

For the **modals**, state lives on the existing `Recreate this` `<Button>` — swap the `ArrowRight` icon for a `Loader2` spinner while loading and disable the button to prevent double clicks.

### Visual pattern (consistent across all 4 buttons)

Idle:
```
[ Recreate this  → ]
```

Loading:
```
[ Recreate this  ⟳ ]   (spinning, disabled, slightly dimmed)
```

Implementation snippet (illustrative, applied to each button):
```tsx
const [isNavigating, setIsNavigating] = useState(false);

<button
  disabled={isNavigating}
  onClick={(e) => {
    e.stopPropagation();
    setIsNavigating(true);
    onRecreate(e);
  }}
  className={cn(
    "...existing classes...",
    isNavigating && "opacity-80 cursor-wait"
  )}
>
  Recreate this
  {isNavigating
    ? <Loader2 className="w-3 h-3 animate-spin" />
    : <ArrowRight className="w-3 h-3" />}
</button>
```

### Why this approach (not a global loader)
- Zero risk of getting stuck on (state lives only on the unmounting card/modal — route change destroys it automatically)
- Doesn't require touching navigation, query cache, or wizard pages
- Doesn't alter framing/sizing/aesthetics — same pill, only icon swap + faint dim
- Works identically on desktop hover pill, mobile bottom-right pill, and modal CTA

### Files to edit (4 buttons across 3 files — modal already shares one component)
- `src/components/app/DiscoverCard.tsx` — add `isNavigating` state + apply to both Recreate buttons (desktop + mobile)
- `src/components/app/DiscoverDetailModal.tsx` — add state + apply to "Recreate this" CTA at line ~860
- `src/components/app/PublicDiscoverDetailModal.tsx` — add state + apply to "Recreate This" CTA at line ~179

### Out of scope (intentionally not changed)
- Navigation logic in `handleUseItem` (Discover.tsx, PublicFreestyle.tsx, DashboardDiscoverSection.tsx) — unchanged
- Wizard page mount/data fetching — unchanged
- No global route-transition spinner (out of scope; would be a larger UX decision)

### QA
1. `/app/discover` → hover any card → click "Recreate this" → spinner appears instantly, button disabled, then product-images wizard loads
2. `/app/discover` on mobile/touch → tap bottom-right "Recreate" pill → same spinner behavior
3. `/app/discover` → click a card → click modal "Recreate this" CTA → spinner shows in CTA until wizard mounts
4. Public `/discover` (logged out) → modal "Recreate This" → spinner shows briefly before /auth route mounts
5. No double-navigation possible (button disabled while loading)
6. Spinner never gets stuck (component unmounts on route change)
