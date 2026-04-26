## Add explainer video to Product Visuals guide

Embed the YouTube video `https://youtu.be/lm9ywh7Ipwc` as the main explainer at the top of the Product Visuals guide (`/app/learn/visual-studio/product-images`). Since this is currently the only tutorial video for the app, place it prominently as a hero element right under the title, so it doubles as the general app walkthrough.

### Where it goes

`src/components/app/learn/ProductVisualsGuide.tsx` — inside the hero `<header>`, between the tagline (line ~246) and the animated mini-stepper (line ~248).

### Visual treatment

- Full-width 16:9 responsive container using a wrapper div with `aspect-video`
- Rounded-xl, soft border (`border-border/50`), subtle shadow, overflow-hidden — matches the existing "soft panel" aesthetic used in `vsAlternatives` and `Quick start` sections
- Black background while loading
- A small caption row underneath: "Watch: 2-min walkthrough" on the left, optional "Open on YouTube ↗" link on the right (muted, text-[12px])

### Embed approach

- Use a native `<iframe>` with `youtube-nocookie.com` privacy-enhanced domain
- Params: `?rel=0&modestbranding=1&playsinline=1` (no related videos at end, minimal branding, mobile-friendly)
- Lazy-loaded: `loading="lazy"` so it doesn't block initial guide render
- `title="VOVV.AI product visuals walkthrough"` for accessibility
- `allow="accelerated-2d-canvas; encrypted-media; picture-in-picture; fullscreen"`
- `allowFullScreen`

No new dependencies, no thumbnail-click-to-load wrapper (keeps it simple — one iframe, lazy-loaded is sufficient for a single video on a guide page).

### Files changed

- `src/components/app/learn/ProductVisualsGuide.tsx` — add video block in hero
- `public/version.json` — bump

### Out of scope

- No changes to other Learn guides (they keep their text-only template)
- No video on the `/app/learn` hub list (the request is specifically for Product Visuals)
- No autoplay (poor UX, blocked on most browsers anyway)
