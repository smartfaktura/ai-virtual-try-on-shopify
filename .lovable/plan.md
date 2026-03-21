

# Fix Favicon: Remove Lovable Default & Add Proper Icon Tags

## Problem
- `public/favicon.ico` is the default Lovable heart favicon — Google is indexing this
- `index.html` has NO `<link rel="icon">` tag, so browsers default to `/favicon.ico`
- Only `apple-touch-icon` points to `/favicon.png` (your actual VOVV favicon)

## Changes

### File 1: `index.html`
Add proper favicon tags in `<head>`, pointing to `/favicon.png` (your VOVV icon):
```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
<link rel="icon" type="image/x-icon" href="/favicon.png" />
```

### File 2: Delete `public/favicon.ico`
Remove the Lovable default `.ico` file so it can never be served as a fallback.

### File 3: `public/site.webmanifest`
Already references `/favicon.png` — no change needed.

## Result
- Google will index `/favicon.png` (VOVV logo) instead of the Lovable heart
- All browsers will show the correct favicon
- 2 files changed, 1 file deleted

