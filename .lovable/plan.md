## Swap `/` and `/home` route content

Make the current `/home` page become the new public homepage at `/`, and move the current `/` content to `/home`.

### Changes (1 file)

**`src/App.tsx`** — swap the two route element bindings:

```tsx
// Before
<Route path="/" element={<Landing />} />
<Route path="/landing" element={<Landing />} />
<Route path="/home" element={<Home />} />

// After
<Route path="/" element={<Home />} />
<Route path="/home" element={<Landing />} />
<Route path="/landing" element={<Landing />} />
```

### Small follow-up tweaks

**`src/pages/Home.tsx`** — update canonical + JSON-LD URL from `${SITE_URL}/home` to `${SITE_URL}/` so SEO points at the new homepage URL.

**`src/pages/Landing.tsx`** — update canonical to `${SITE_URL}/home` to match its new location (and avoid duplicate-canonical with `/`).

**`public/sitemap.xml`** — ensure `/` is listed (highest priority) and `/home` is either removed or listed at lower priority.

### What I will NOT touch
- All component files (`HomeHero`, `HomeFooter`, `LandingNav`, etc.) — both pages keep using `LandingNav` + `LandingFooter`, so the global header/footer stay consistent.
- The 3 internal `to="/home"` links in `HomeNav.tsx` / `HomeFooter.tsx` are dead code (those components aren't mounted anywhere) — leaving them alone.
- All other routes, auth, dashboard, category hubs — untouched.

### Risk
Near zero. Pure route reassignment + 3 SEO string updates. No logic, no data, no styling changes.
