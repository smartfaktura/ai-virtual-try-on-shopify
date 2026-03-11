

## Fix: Scroll Position on Route Changes Inside AppShell

### Problem

The `ScrollToTop` component calls `window.scrollTo(0, 0)` on route changes, but inside the app (`/app/*`), the scrollable element is the `<main>` tag in `AppShell.tsx` (line 346: `overflow-y-auto`), not the window. So navigating between app pages (e.g. Dashboard → Workflows) preserves the previous scroll position instead of resetting to top.

The Discover page needs to be excluded from this behavior since it opens modals over the feed and should maintain scroll position.

### Changes

**1. `src/components/app/AppShell.tsx`**
- Add an `id="app-main-scroll"` to the `<main>` element (line 346)
- Listen for `pathname` changes via `useLocation` (already imported) and scroll the main element to top on route change
- Skip the scroll reset when on the Discover page (`/app/discover`) since modals there should preserve position

**2. `src/components/ScrollToTop.tsx`**
- No changes needed — it already handles public/landing page scroll correctly via `window.scrollTo`

### Why this works

The AppShell wraps all `/app/*` routes and owns the scroll container. By resetting `scrollTop = 0` on `pathname` changes within the shell (except Discover), each app page starts at the top. The existing `ScrollToTop` component continues handling public pages via `window.scrollTo`.

