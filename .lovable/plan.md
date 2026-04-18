
## Fix dashboard greeting flicker on load

The user sees the greeting text glitch on `/app` load — first "Welcome" (or "Welcome, there") renders, then swaps to "Welcome back, Tomas" once the profile + generation-jobs queries resolve. Confirmed in session replay: at 1776495839938 the text node updates to add ", Tomas" and at 1776495840005 swaps "Welcome" → "Welcome back" and the CTA "Start creating" → "Create now".

### Root cause
In `src/pages/Dashboard.tsx`, the heading and the primary CTA depend on two async React Query results:
- `profile` → drives the name (`firstName`)
- `hasGenerated` → drives `isReturning` (toggles "Welcome" vs "Welcome back" and CTA label "Start creating" vs "Create now")

Both queries start as `undefined`, so the component renders the "new user" copy first, then re-renders with the "returning user" copy ~150ms later. That's the flicker.

### Fix
Hold the greeting + dependent CTA copy until both queries have resolved. Render a neutral skeleton (matching final layout dimensions to avoid layout shift) for just the heading line, subtitle, and the Card 1 button label during that brief window. Everything else on the page can render immediately.

Specifically in `src/pages/Dashboard.tsx`:
1. Track `profileLoading` and `hasGeneratedLoading` from the two `useQuery` calls.
2. Compute `greetingReady = !profileLoading && !hasGeneratedLoading` (only when `user` exists; if no user the ProtectedRoute already handles it).
3. While `!greetingReady`:
   - Render a fixed-height skeleton block where the `<h1>` + subtitle sit (same line-heights/widths as final text so no CLS).
   - Render the Card 1 CTA button with a neutral label skeleton (or just disable + show a small skeleton inside) so it doesn't flash "Start creating" → "Create now".
4. Once ready, render the real heading, subtitle, and CTA with the resolved `isReturning` / `firstName` values in a single paint.

Cache via `staleTime: 5 * 60 * 1000` is already set, so on subsequent navigations both queries are instant and the skeleton won't appear.

### Files touched
- `src/pages/Dashboard.tsx` (single file, ~15 lines changed around the heading block + Card 1 button)

### Acceptance
- First visit to `/app`: heading area shows a brief skeleton, then resolves once into the correct "Welcome back, Tomas" + "Create now" — no text swap.
- Repeat visits within the cache window: instant render, no skeleton.
- No layout shift (skeleton matches final dimensions).
- Rest of the dashboard (cards grid, Discover, video sections) keeps rendering immediately as today.
