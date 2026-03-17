

## Fix Slow Mobile Navigation Dropdown

### Root Cause

Two performance problems on the nav bar (`<nav>` element, line 50):

1. **`transition-all duration-300`** — transitions *every* CSS property (background, blur, shadow, border, etc.) on every scroll-state change. On mobile GPUs this is expensive because it forces recomposition of `backdrop-blur-xl` and `shadow-2xl` during the transition.

2. **`backdrop-blur-xl`** on the top nav bar is always active on mobile. When the dropdown animates its `max-height`, the browser must re-composite the blur layer underneath on every frame, causing visible jank on lower-end devices.

### Fix

**File: `src/components/landing/LandingNav.tsx`**

1. **Replace `transition-all`** with a scoped transition that only animates `background-color`:
   ```
   transition-colors duration-300
   ```
   This avoids re-computing blur/shadow on scroll toggle.

2. **Limit `backdrop-blur-xl` to desktop only** on the nav bar. Use `lg:backdrop-blur-xl` and give mobile a fully opaque background (matching the dropdown pattern already in place):
   ```
   bg-sidebar lg:bg-sidebar/95 lg:backdrop-blur-xl
   ```
   On mobile the nav is fully opaque (no blur compositing cost). On desktop it keeps the frosted-glass look.

3. **Throttle the scroll listener** with `requestAnimationFrame` to avoid excessive state updates on mobile:
   ```ts
   useEffect(() => {
     let ticking = false;
     const onScroll = () => {
       if (!ticking) {
         requestAnimationFrame(() => {
           setScrolled(window.scrollY > 20);
           ticking = false;
         });
         ticking = true;
       }
     };
     window.addEventListener('scroll', onScroll, { passive: true });
     return () => window.removeEventListener('scroll', onScroll);
   }, []);
   ```

These three changes eliminate the GPU-heavy blur compositing during dropdown animation and reduce unnecessary repaints from scroll events.

