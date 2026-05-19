## Polish empty state on `/app/models`

### 1. Typography alignment
The current empty state uses `text-2xl font-medium tracking-tight` for the H2, which renders heavier/larger than other empty states in the app. Peers (CatalogHub, etc.) use `text-xl font-semibold tracking-tight`. Match that:

- Title: `text-2xl font-medium` → **`text-xl font-semibold`**
- Body: keep `text-sm text-muted-foreground`, drop the explicit `leading-relaxed` so it matches peers.

### 2. Showcase strip — 3 sample model thumbnails

Replace the lonely dashed icon tile above the title with a small showcase strip that makes the concept tangible.

- Pull 3 portrait avatars from `TEAM_MEMBERS` (already imported): Sophia, Amara, Kenji — three different looks (E-Asian, African, E-Asian male) for diversity.
- Render as 3 stacked/overlapping circular portraits (80px each, `-ml-4` overlap) centered above the title, with a soft ring (`ring-2 ring-background`) so they read as a group.
- Tiny caption under: `Brand-safe AI faces · yours to reuse` (text-[11px] uppercase tracking-widest, muted) — replaces the dashed Users-icon tile entirely.

### 3. Layout / spacing tweak
- Remove the dashed `Users` icon block.
- Keep container `flex flex-col items-center text-center py-24 px-4 max-w-lg mx-auto gap-7`.
- Order: showcase strip → title + subtitle stack → primary CTA `Create your first brand model`.

### Files
- `src/pages/BrandModels.tsx` — only the `models.length === 0` block (~lines 1028-1044).

### Out of scope
- No changes to the populated grid, header, or form.
- No new assets; reuse existing `TEAM_MEMBERS` avatars from `@/data/teamData`.