

## Fix Footer Links on Mobile

### Problem
Footer links have tiny touch targets on mobile — just bare `text-sm` (14px) text with `space-y-2` (8px) gap between items. On a real phone with a thumb, these are nearly impossible to tap accurately. The recommended minimum touch target is 44x44px.

### Solution

**File: `src/components/landing/LandingFooter.tsx`**

1. **Increase touch targets** — Add vertical padding (`py-2`) to all footer link elements (both `<Link>` and `<button>`) so each link has a comfortable ~40px tap height on mobile
2. **Reduce list gap** — Change `space-y-2` to `space-y-0` since the padding on links now provides spacing
3. **Make Product links real `<Link>` elements** — Currently they're `<button>` elements that use `window.location.href` for navigation off the landing page, which causes a full page reload. Convert them to `<Link>` for consistent SPA navigation and better mobile touch behavior

