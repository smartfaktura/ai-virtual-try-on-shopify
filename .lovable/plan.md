

## Fix: React Hooks Violation in MetricCard.tsx

### Problem
`useIsMobile()` on line 119 is called after an early return on line 48 (`if (loading) return ...`). When the component renders with `loading=true`, React sees fewer hooks than on subsequent renders, causing the crash: "Rendered more hooks than during the previous render."

This crashes the entire `/app/admin/status` page (and any other page using `MetricCard` with a loading state), which is why you see "Something went wrong."

### Fix
Move `useIsMobile()` to the top of the component, before any conditional returns. All hooks must be called unconditionally on every render.

**File: `src/components/app/MetricCard.tsx`**
- Move `const isMobile = useIsMobile();` from line 119 to line 34 (before the `loading` early return)
- Remove line 119

This is a one-line move that fixes the crash.

