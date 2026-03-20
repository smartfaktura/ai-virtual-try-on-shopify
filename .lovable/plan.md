

# Fix Favicon Google Indexing

## Problem
Google isn't picking up the favicon. Common causes:
1. **No `sizes` attribute** on the icon links — Google needs explicit size hints
2. **No `apple-touch-icon`** — Google's crawler often prefers this for search result favicons
3. **No web manifest** — Google checks `manifest.json` for icons
4. **Two competing declarations** (PNG + ICO) without size differentiation

## Changes

### 1. Fix `index.html` icon declarations
- Add `sizes="32x32"` to the PNG favicon link
- Add `sizes="48x48"` to a second PNG entry (Google prefers 48×48 multiples)
- Add an `apple-touch-icon` link (Google frequently uses this as the favicon source in search results)
- Add a `<link rel="manifest">` pointing to a web manifest

### 2. Create `public/site.webmanifest`
A minimal web manifest with icon entries at 192×192 and 512×512 sizes. Google explicitly recommends this for favicon indexing. Since we only have the current favicon files, we'll reference `favicon.png` and note that ideally a 192px version should be provided.

### 3. Minimal manifest content
```json
{
  "name": "VOVV AI",
  "short_name": "VOVV",
  "icons": [
    { "src": "/favicon.png", "sizes": "32x32", "type": "image/png" },
    { "src": "/favicon.png", "sizes": "192x192", "type": "image/png" }
  ],
  "start_url": "/",
  "display": "standalone",
  "background_color": "#faf9f7",
  "theme_color": "#2d3a4e"
}
```

### Updated `index.html` head (icon section)
```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="apple-touch-icon" href="/favicon.png" />
<link rel="manifest" href="/site.webmanifest" />
```

### Files
- `index.html` — update icon link tags (4 lines)
- `public/site.webmanifest` — new file

### Note
For best results, you should also provide a 192×192 PNG version of your logo (e.g. `favicon-192.png`). Google strongly prefers icons that are multiples of 48px. If you upload one, I'll wire it in.

