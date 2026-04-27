## Add Google Tag Manager (GTM-P29VVFW3) sitewide

Install GTM in `index.html` so it loads on every route — including all public marketing pages and the `/app` authenticated area (this is a single-page React app, so one install covers everything).

### Changes to `index.html`

**1. Add GTM loader script high in `<head>`** (placed right after the existing `<title>`/meta block, before the deferred gtag/Meta Pixel snippets so GTM initializes as early as possible):

```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-P29VVFW3');</script>
<!-- End Google Tag Manager -->
```

**2. Add GTM noscript iframe immediately after the opening `<body>` tag** (in `<body>`, not `<head>` — per HTML5 rules `<noscript>` with `<iframe>` is only valid in body; project rules also enforce this):

```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-P29VVFW3"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

This will sit alongside the existing Meta Pixel `<noscript>` fallback already in `<body>`.

### Notes

- Existing gtag.js (GA4 + Google Ads) and Meta Pixel are kept untouched — GTM runs in parallel, so you can later migrate tags into GTM at your own pace.
- No changes needed to React routes — since this is a SPA mounted from `index.html`, GTM is automatically present on `/`, `/app/*`, and every other route.
- `dataLayer` is already initialized by the existing gtag snippet; the GTM snippet safely reuses it (`w[l]=w[l]||[]`).