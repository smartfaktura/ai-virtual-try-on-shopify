## Why it's not working

The page `/app/admin/seo-page-visuals` shows **404** because the route was never registered in `src/App.tsx`. The page component exists (`src/pages/admin/SeoPageVisuals.tsx`), but React Router doesn't know about it, so it falls through to the NotFound page.

## Fix

### 1. `src/App.tsx` — register the route

Add a lazy import alongside the other admin imports (around line 70):

```ts
const SeoPageVisuals = lazy(() => import('@/pages/admin/SeoPageVisuals'));
```

Add the route inside the `/app` admin route block (around line 265, next to other `/admin/*` routes):

```tsx
<Route path="/admin/seo-page-visuals" element={<SeoPageVisuals />} />
```

### 2. (Optional) `src/components/app/AppShell.tsx` — add sidebar link

Add a navigation entry in the Admin section so admins can reach the page without typing the URL. Label: **"SEO Page Visuals"**, path: `/app/admin/seo-page-visuals`, gated by `useIsAdmin()` like the other admin links.

### 3. Wrap with `AdminGuard`

If other `/admin/*` routes use a guard, wrap this one the same way to keep access restricted.

## Result

After approval, navigating to `/app/admin/seo-page-visuals` will load the SEO Page Visuals admin UI instead of 404.
