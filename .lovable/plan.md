

# Add /tryshot Preview Route

## Problem
The TryShot page only renders when `window.location.hostname === 'try.vovv.ai'`, so it's inaccessible in the Lovable preview.

## Change

### File: `src/App.tsx`

Add a `/tryshot` route in the public routes section (alongside `/landing`, `/auth`, etc.):

```tsx
<Route path="/tryshot" element={<TryShot />} />
<Route path="/tryshot/:domain" element={<TryShot />} />
```

The `TryShot` lazy import already exists. This just adds two routes to the main route tree so you can visit `/tryshot` or `/tryshot/nike.com` in the preview.

The subdomain hostname detection stays unchanged — on `try.vovv.ai` it still renders the isolated route tree.

