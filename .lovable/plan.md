

## Update Workflows MissingRequestBanner to Compact Style

Single-line change in `src/pages/Workflows.tsx` (line 339):

Change `<MissingRequestBanner category="workflow" />` → `<MissingRequestBanner category="workflow" compact />`

This matches the compact interactive button style used in model and scene selector popovers — a clickable row with chevron that expands on click, instead of showing the full bordered textarea by default.

