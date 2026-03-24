

# Mobile Scene Carousel: Auto-scroll Hint + Partial Card Cut

## Changes

### `src/components/app/freestyle/FreestyleQuickPresets.tsx`

**1. First-interaction auto micro-scroll (onboarding hint)**
- Add a one-time animation on mobile: after mount, scroll `0 → 40px → back to 0` with smooth easing
- Use `sessionStorage` key `freestyle_scroll_hint_shown` so it only fires once per session
- Use `useIsMobile()` hook to gate this to mobile only
- Trigger after a short delay (~400ms) so the UI feels settled first

**2. Partial card cut (always on mobile)**
- Remove `px-4` on mobile for the scroll container wrapper so cards can bleed to the edge
- Add `pl-4` to the scroll container itself (left padding only) so the first card is inset
- Add a right padding spacer (invisible element) at the end of the card list so the last card can scroll fully into view, but at rest the rightmost card is visibly cut ~25%
- This naturally shows "there's more to scroll"

### Implementation detail

```typescript
// Auto micro-scroll hint (once per session, mobile only)
const isMobile = useIsMobile();
const hasAnimated = useRef(false);

useEffect(() => {
  const el = scrollRef.current;
  if (!el || !isMobile || hasAnimated.current) return;
  if (sessionStorage.getItem('freestyle_scroll_hint')) return;
  hasAnimated.current = true;
  
  const timer = setTimeout(() => {
    el.scrollTo({ left: 40, behavior: 'smooth' });
    setTimeout(() => {
      el.scrollTo({ left: 0, behavior: 'smooth' });
      sessionStorage.setItem('freestyle_scroll_hint', '1');
    }, 400);
  }, 500);
  
  return () => clearTimeout(timer);
}, [isMobile, scenes]);
```

For partial cut: change the outer wrapper from `px-4 sm:px-0` to `sm:px-0` and add `pl-4 sm:pl-0` to the scroll div, plus a trailing spacer `<div className="shrink-0 w-4 sm:hidden" />` after the last card.

### Files
- `src/components/app/freestyle/FreestyleQuickPresets.tsx`

