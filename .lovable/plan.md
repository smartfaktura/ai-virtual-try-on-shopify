

## Complete Favicon System (revised)

Keep all existing files (`favicon.ico`, `favicon.png`) untouched. Only add new assets and update references.

### 1. Copy uploaded files into `public/`
- `svgfavicon.svg` → `public/favicon.svg`
- `512_x_512_px.png` → `public/icon-512.png`
- `192_x_192_px.png` → `public/icon-192.png`
- `180x180.png` → `public/apple-touch-icon.png`

### 2. Update `index.html` favicon links
Replace current icon links with:
```html
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

### 3. Update `public/site.webmanifest`
```json
"icons": [
  { "src": "/favicon.png", "sizes": "32x32", "type": "image/png" },
  { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
  { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
]
```

### What stays
- `public/favicon.ico` — untouched
- `public/favicon.png` — untouched, still referenced for 32x32

### What's added
- 4 new files in `public/`
- Updated references in `index.html` and `site.webmanifest`

