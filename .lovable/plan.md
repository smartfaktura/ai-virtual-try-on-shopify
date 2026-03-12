

## Fix Favicon Declaration for Google

### Problem
`index.html` has **no `<link rel="icon">` tag**. Browsers silently fall back to `/favicon.ico`, but Google's crawler prefers an explicit declaration and favors PNG/SVG formats. The structured data already references `/favicon.png` as the logo, but the HTML never tells browsers or crawlers to use it as the favicon.

### Change: `index.html` (after line 5)

Add explicit favicon links:

```html
<link rel="icon" type="image/png" href="/favicon.png" />
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
```

PNG is listed first so modern browsers and Google prefer it. The `.ico` fallback covers legacy browsers.

Single file, two-line addition.

