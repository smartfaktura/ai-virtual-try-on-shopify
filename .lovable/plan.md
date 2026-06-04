## Fix Fresh Scenes link domain + preview modal seam

Two small fixes to `src/components/app/DashboardFreshScenes.tsx`.

### 1. "View all" link → in-app destination
Currently links to `/product-visual-library#catalog-grid` — that's the public marketing page (vovv.ai). From inside `/app`, the user expects to stay in the app, not get pushed to the marketing site.

Change the `<Link to="/product-visual-library#catalog-grid">` to point to the in-app discovery route: `/app/discover`. Keeps the user inside the authenticated app shell and consistent with "Steal the Look → see all" flow.

### 2. Preview modal — remove white seam, match DiscoverDetailModal fix
Current modal uses shadcn `<Dialog>` with a two-column grid (`bg-muted` image column + `bg-background` text column). The right column reads as a hard white slab next to the dark image area — same problem we just fixed in `DiscoverDetailModal`.

Apply the same treatment:
- Right column stays `bg-background`, but add a 24px `bg-gradient-to-r from-transparent to-background` overlay on the inner right edge of the image column (md+) so the image visually fades into the text panel.
- Image column: switch desktop `object-cover` so it fills its frame edge-to-edge with no white gap, keep the existing aspect/height.
- DialogContent: keep `border-border` (subtle) but remove any harsh seam by ensuring both columns sit on the same `bg-background` base, with the image column overlaying its own `bg-muted` only behind the image bounds.
- Tighten the modal close animation: shadcn Dialog already animates, no change needed there — just verify it feels smooth after the seam fix.

### Scope
One file: `src/components/app/DashboardFreshScenes.tsx`. No taxonomy, data, or routing changes beyond the single Link href.

### Risk
Minimal — presentation + one href.
