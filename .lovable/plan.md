

# Fix Favicon in Chrome

## Problem
Chrome requests `/favicon.ico` by default. Since no `favicon.ico` exists in `public/`, the hosting platform's default (Lovable logo) is served instead, overriding the `<link>` tags.

## Fix

### 1. Create `public/favicon.ico`
- Copy `public/favicon.png` → `public/favicon.ico` (browsers accept PNG data inside a `.ico` filename)

### 2. Update `index.html` favicon references (line 6-8)
```html
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
<link rel="apple-touch-icon" href="/favicon.png" />
```
- Put `.ico` first so Chrome picks it up immediately
- Fix the type mismatch (was `type="image/x-icon"` pointing to `.png`)

### Files changed
- `public/favicon.ico` — new (copy of favicon.png)
- `index.html` — reorder and fix favicon link tags

### Note
After deploying, users may need to hard-refresh (`Ctrl+Shift+R`) since Chrome caches favicons aggressively.

