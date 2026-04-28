## Phase 4b: Migrate to react-helmet-async

This is the cleanup Lovable's docs recommend for SPAs like ours. Goal: make every page reliably set its own `<title>`, `<meta>`, and structured data — without the fragile direct-DOM hacks we use today.

---

## Plain-English summary

**Today**: Two components (`SEOHead.tsx` and `JsonLd.tsx`) reach into the page's `<head>` and manually edit tags using `document.querySelector(...)` and `document.head.appendChild(...)`. This works but is fragile.

**After**: Same two components, but rebuilt on top of a small, well-trusted React library called `react-helmet-async` that does this properly. React tracks the tags, no race conditions, no leftover stale tags when you switch pages.

**What changes for the user**: Nothing visual. Same site, same speed. Just more reliable metadata for Google and a cleaner foundation.

**What changes for the 52 files that use `<SEOHead>` and `<JsonLd>` today**: Nothing. They keep working with zero edits — we only swap the engine inside.

---

## Honest expectations

| Improves | Doesn't fix |
|---|---|
| Reliable per-page title/meta for Google, Bing, ChatGPT crawlers (they run JS) | LinkedIn / Slack / X link previews — these need server-rendering, separate project |
| Cleanup of stale tags between route changes | Initial HTML still shows the default home title to non-JS scrapers |
| Structured data (JsonLd) per page works cleanly | Indexing speed (still depends on Google's render queue) |
| Foundation for future SSR/prerender if ever needed | |

---

## The plan (4 small steps)

### Step 1 — Install the library
Add `react-helmet-async` (~5 KB, maintained by the React community, the official Lovable recommendation).

### Step 2 — Wrap the app
In `src/App.tsx`, wrap the existing `<BrowserRouter>` tree with `<HelmetProvider>`. This is a one-line change that lets Helmet manage the head globally.

```text
<HelmetProvider>
  <BrowserRouter>
    ...everything we already have...
  </BrowserRouter>
</HelmetProvider>
```

### Step 3 — Rebuild `SEOHead.tsx` internally
Same props (`title`, `description`, `canonical`, `ogImage`, `ogType`, `noindex`) — same call sites everywhere. Inside, replace the `useEffect` + `document.querySelector` code with a `<Helmet>` block:

```text
<Helmet>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonical} />
  <meta property="og:title" content={title} />
  ...etc
  {noindex && <meta name="robots" content="noindex, follow" />}
</Helmet>
```

All 50+ pages that import `<SEOHead>` keep working with no edits.

### Step 4 — Rebuild `JsonLd.tsx` internally
Same prop (`data`). Inside, replace `document.createElement('script')` with:

```text
<Helmet>
  <script type="application/ld+json">{JSON.stringify(data)}</script>
</Helmet>
```

---

## Safety / rollback

- Pure refactor — no API/data/database changes.
- No visual or behavioral changes for users.
- Public component signatures stay identical → 52 caller files untouched.
- If anything misbehaves, we revert Steps 1–4 and we're back to today's state instantly.
- No conflict with the static `<title>`, `<meta>`, OG tags, or JSON-LD already in `index.html` — Helmet replaces or adds tags as needed and respects the static fallbacks for non-JS scrapers.

---

## What we'll verify after

- Home page still shows its title in the browser tab
- Navigating Home → Pricing → About correctly updates the tab title each time
- View Source on a public page shows Helmet-managed tags in the head
- No console errors
- Robots noindex still emits on `/discover/:itemId` and `/freestyle/:itemId` (from Phase 4a)

---

## Out of scope (saved for later if you want)

- Server-side rendering / prerender for true social-preview support (big project)
- Per-page Open Graph images (currently we use one default site-wide image)
- Adding more JSON-LD schema types (Article, Product, FAQ, etc.) — easy to add once Helmet is in

Approve and I'll execute Steps 1–4 in one pass.