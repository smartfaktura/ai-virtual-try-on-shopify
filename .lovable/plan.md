

## Transform Templates into Discover -- Inspiration Gallery

### Overview
Replace the current `/app/templates` table view with a visual "Discover" page -- a curated gallery of AI-generated images users can browse for inspiration, copy prompts, and open directly in Freestyle with presets pre-filled.

### Phase 1: Curated Platform Presets (this plan)

#### 1. Database: New `discover_presets` table

Create a table to store curated inspiration cards:

```text
discover_presets
- id (uuid, PK)
- title (text) -- e.g. "Tennis Court Editorial"
- prompt (text) -- the full prompt used
- image_url (text) -- the generated result image
- category (text) -- Cinematic, Commercial, Photography, Styling, Ads, Editorial, Lifestyle, Product
- model_name (text, nullable) -- which AI model was referenced
- scene_name (text, nullable) -- which scene was used
- aspect_ratio (text) -- e.g. "3:4"
- quality (text) -- "standard" or "high"
- tags (text[], nullable) -- searchable tags
- sort_order (int, default 0) -- for manual curation ordering
- is_featured (boolean, default false)
- created_at (timestamptz)
```

RLS: Public read for all authenticated users. No insert/update/delete for regular users (admin-only via SQL).

#### 2. Seed with 12-15 curated presets

Generate example images using the AI and insert them as seed data. Categories:
- **Cinematic** (moody editorial shots)
- **Commercial** (clean product photography)
- **Photography** (studio portraits)
- **Styling** (fashion editorial)
- **Ads** (social media ready)
- **Lifestyle** (contextual scenes)

Each preset includes: a hero image, the exact prompt, model/scene references, and tags.

#### 3. Rename nav + route

- Sidebar: "Templates" becomes "Discover"
- Icon: `LayoutTemplate` becomes `Compass` (from lucide)
- Route stays `/app/templates` internally (or rename to `/app/discover` with redirect)
- Page title: "Discover"

#### 4. New Discover page UI

Replace the table with a visual gallery:

```text
+--------------------------------------------------+
|  Discover                                         |
|                                                   |
|  [Search...]                                      |
|                                                   |
|  Cinematic  Commercial  Photography  Styling ...  |
|  (icon tabs as horizontal filter bar)             |
|                                                   |
|  +--------+ +--------+ +--------+ +--------+     |
|  |        | |        | |        | |        |      |
|  | image  | | image  | | image  | | image  |      |
|  |        | |        | |        | |        |      |
|  |  title | |  title | |  title | |  title |      |
|  +--------+ +--------+ +--------+ +--------+     |
|  +--------+ +--------+ +--------+ +--------+     |
|  |        | |        | |        | |        |      |
|  ...masonry grid continues...                     |
+--------------------------------------------------+
```

- Responsive masonry grid: 2 cols mobile, 3 cols tablet, 4-5 cols desktop
- On hover: show prompt preview + "Use Prompt" button
- Category filter bar with icons (similar to Kive.ai reference)
- Search by prompt text or tags

#### 5. Detail modal (on click)

```text
+------------------------------------------+
|  [X]                                      |
|                                           |
|  +------------------+  Title              |
|  |                  |  "25 year old..."   |
|  |   Large image    |                     |
|  |                  |  Scene: Tennis Court |
|  |                  |  3:4  |  PNG        |
|  +------------------+                     |
|                        [Use Prompt]       |
|                        [Use Style]        |
|                                           |
|  --- More like this ---                   |
|  [thumb] [thumb] [thumb] [thumb]          |
+------------------------------------------+
```

- Shows full prompt text (copyable)
- Model + Scene badges
- "Use Prompt" button: navigates to `/app/freestyle` with `?prompt=...&aspect_ratio=...&quality=...` pre-filled
- "More like this": shows other presets in same category

#### 6. Freestyle integration

Update Freestyle page to read URL query params (`prompt`, `aspect_ratio`, `quality`) and pre-fill the prompt bar + settings when arriving from Discover.

### Files to Create/Modify

| File | Action |
|------|--------|
| `discover_presets` table | Create via migration |
| `src/pages/Discover.tsx` | New file -- replaces Templates.tsx |
| `src/components/app/DiscoverCard.tsx` | New -- image card with hover actions |
| `src/components/app/DiscoverDetailModal.tsx` | New -- detail view modal |
| `src/hooks/useDiscoverPresets.ts` | New -- fetch presets from DB |
| `src/components/app/AppShell.tsx` | Update nav label + icon |
| `src/App.tsx` | Update route import |
| `src/pages/Freestyle.tsx` | Read URL params for pre-fill |

### Technical Details

- The `discover_presets` table uses public read RLS so any logged-in user can browse
- Seed data is inserted via migration SQL with placeholder image URLs (to be replaced with real generated images)
- The old `mockTemplates` data and Templates.tsx can be kept temporarily but hidden from nav
- Category icons use lucide-react (Camera, ShoppingBag, Palette, Scissors, Megaphone, Sun, etc.)
- Image cards use `aspect-[3/4]` for consistent portrait-oriented thumbnails
- "Use Prompt" navigates with URL params: `/app/freestyle?prompt=...&ratio=3:4&quality=high`

### Phase 2 (future, not in this plan)
- Users can "Share" their own generations to the Discover feed
- Like/save presets to personal collection
- "Trending" and "New" sort options
- User attribution on shared presets

