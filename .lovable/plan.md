## Fresh scenes — layout & preview modal

Refines the existing `DashboardFreshScenes` component only. No data, RLS, routing, or wizard changes.

### 1. Kill the strange scroller on the pill row
- Replace the horizontal `overflow-x-auto` strip with a **wrapping flex row** (`flex flex-wrap gap-2`) so all category pills sit on one or two clean lines without a scrollbar.
- Cap to top **6 categories** (down from 8) so wrap stays tidy on desktop and mobile.
- Keep pill style; remove the count badge to reduce noise (pills become cleaner: "Socks", "Eyewear", …).

### 2. Bigger scene cards + better responsive grid
- New grid: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4` with `gap-3 sm:gap-4`.
- Show **8 scenes per pill** as today (2 rows × 4 on desktop, 4 rows × 2 on mobile).
- Card aspect ratio stays `4/5`; cards become significantly larger because column count drops from 8 → 4 on desktop.
- Title moves to a soft bottom gradient overlay inside the image (cleaner, more editorial) instead of a separate text strip below.

### 3. Hover & click → preview modal
- Card becomes a `<button>` (not `<Link>`); click opens a centered modal using existing shadcn `Dialog`.
- Hover state: subtle scale + ring (`hover:ring-1 hover:ring-border`) and small "Preview" chip fading in top-right.
- Modal contents:
  - Large preview image (max 75vh, full image, `object-contain`, dark backdrop) using `getOptimizedUrl({ quality: 80 })`.
  - Right/bottom panel: scene title, category label (from `getCollectionLabel`), short helper line "Generate product images in this scene".
  - Primary CTA button: **"Use this scene"** → navigates to `/app/generate/product-images?sceneId={id}&from=fresh` (same URL as before).
  - Secondary ghost button: **"Close"**.
- Modal uses existing tokens (`bg-background`, `text-foreground`, etc.); no new colors.

### 4. Section header polish
- "View all" link kept; on mobile it remains hidden (unchanged).
- Subtitle copy unchanged.

### Technical notes
- File touched: `src/components/app/DashboardFreshScenes.tsx` only.
- Reuse `@/components/ui/dialog` (`Dialog`, `DialogContent`, `DialogTitle`, `DialogDescription`).
- Local state: `const [previewScene, setPreviewScene] = useState<FreshScene | null>(null)`.
- `useNavigate()` from `react-router-dom` for the CTA.
- No query changes, no new requests, no cache key changes.
- Skeleton loader updated to match new 4-col grid and wrapping pills.

### Out of scope
- Dashboard.tsx, other sections, public library page, RLS, scene data, preselect plumbing.
