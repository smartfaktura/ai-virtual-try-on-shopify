

## Add Google Ads Tag (AW-18007670934)

You already have gtag.js loaded for GA4 (`G-V3BBTYZXS1`). Since gtag.js is shared across all Google tags, you only need to add one line — no extra script tag required.

### Change

**`index.html`** — Add `gtag('config', 'AW-18007670934');` right after the existing GA4 config line:

```js
gtag('config', 'G-V3BBTYZXS1');
gtag('config', 'AW-18007670934');  // Google Ads
```

Single line addition. The existing deferred gtag.js script already handles both GA4 and Google Ads.

