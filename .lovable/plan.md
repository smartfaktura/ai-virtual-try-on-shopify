

# VOVV Trend Watch + Scene Builder — Implementation Plan

## Overview
A private admin-only tool at `/app/admin/trend-watch` (and `/app/admin/scene-library`) for monitoring Instagram accounts, analyzing post aesthetics, and converting them into reusable VOVV scene recipes.

---

## Phase 1: Database Schema

Create 6 new tables via migration (all with RLS restricted to admin role):

### Tables
1. **watch_accounts** — Instagram accounts to monitor, grouped by category
2. **watch_posts** — Individual posts fetched or manually added per account (max ~9 recent)
3. **post_notes** — Editable internal notes per post (palette, lighting, mood, etc.)
4. **reference_analyses** — Structured AI-extracted visual analysis per post
5. **scene_recipes** — Reusable scene directions built from analyses
6. **prompt_outputs** — Generated prompt components per scene recipe

All tables get admin-only RLS using existing `has_role(auth.uid(), 'admin')` pattern. Foreign keys: `watch_posts → watch_accounts`, `post_notes → watch_posts`, `reference_analyses → watch_posts`, `scene_recipes → reference_analyses` (nullable), `prompt_outputs → scene_recipes`.

---

## Phase 2: Edge Function — Instagram Fetch

**`supabase/functions/fetch-instagram-feed/index.ts`**
- Accepts `{ username, account_id }`, calls Apify Instagram scraper API
- Returns latest 9 posts (image URL, caption, permalink, posted date, likes, comments)
- Stores results in `watch_posts` table
- Updates `watch_accounts.sync_status` and `last_synced_at`
- Admin-only JWT validation
- Requires `APIFY_API_KEY` secret (will request from user)

---

## Phase 3: Edge Function — Post Analysis

**`supabase/functions/analyze-trend-post/index.ts`**
- Accepts `{ watch_post_id }`, fetches the post image
- Uses Lovable AI (Gemini) to extract structured visual direction
- Returns all analysis fields (palette, lighting, composition, mood, etc.)
- Stores result in `reference_analyses` table
- Emphasizes extracting aesthetic direction, NOT replicating the source

---

## Phase 4: Edge Function — Prompt Generation

**`supabase/functions/generate-scene-prompts/index.ts`**
- Accepts `{ scene_recipe_id }`, reads the scene recipe
- Uses Lovable AI to generate prompt components (master, environment, lighting, composition, styling, negative, consistency)
- Stores in `prompt_outputs` table
- Avoids exact replication, brand names, logos, likenesses

---

## Phase 5: Frontend — Trend Watch Dashboard

**New page: `src/pages/AdminTrendWatch.tsx`**
- Admin gate using `useIsAdmin()` (same pattern as other admin pages)
- Header with title, search, category filter, sort, "Add Account" and "Scene Library" buttons

**Key components:**
- `TrendWatchHeader` — title bar with filters and actions
- `CategorySection` — collapsible section per category with account count
- `WatchAccountCard` — avatar, name, username, badges (source mode, sync status), actions (refresh, edit, deactivate), row of 9 post thumbnails
- `PostThumbnailRow` — horizontal row of 9 square thumbnails with hover overlay
- `AddAccountModal` — form to add account (manual or API mode)
- `PostDetailDrawer` — right-side drawer showing large image, metadata, notes, analysis actions

**Categories hardcoded:** Fashion & Apparel, Beauty & Skincare, Fragrances, Jewelry, Accessories, Home & Decor, Food & Beverage, Electronics, Sports & Fitness, Health & Supplements

---

## Phase 6: Frontend — Post Detail Drawer

**Component: `PostDetailDrawer.tsx`**
- Large image preview
- Caption, permalink, date, media type, likes, comments
- Editable note fields (palette, lighting, background, crop, props, mood, styling tone, premium cue, internal note)
- Action buttons: Analyze Post, Save Notes, Mark Favorite, "Worth turning into aesthetic" flag
- After analysis: shows structured analysis fields in editable form
- "Create Scene Recipe" button to convert analysis → scene

---

## Phase 7: Frontend — Scene Library Page

**New page: `src/pages/AdminSceneLibrary.tsx`**
- Grid/table toggle view
- Filters: category, scene type, aesthetic family, status, source type
- Scene cards: preview image, name, category, aesthetic family, description, tags, status
- Actions: open, edit, duplicate, archive, use in generation

**Scene detail/edit drawer:**
- All scene recipe fields editable
- Prompt outputs section with generate button
- Shows source reference post if linked

---

## Phase 8: Routing & Navigation

**Add routes in `App.tsx`** (inside `/app/*` protected block):
```
/app/admin/trend-watch → AdminTrendWatch
/app/admin/scene-library → AdminSceneLibrary
```

**Add admin nav links** in `AppShell.tsx` admin section (existing pattern for admin links).

---

## Phase 9: Manual Reference Support

- "Add Account" modal supports `source_mode: 'manual'`
- "Add Post Manually" action on account cards — upload image or paste URL, add caption/permalink/date
- Manual posts get same analysis flow as API-fetched posts

---

## Implementation Order (MVP)

| Step | What | Files |
|------|------|-------|
| 1 | Database migration (6 tables + RLS) | migration SQL |
| 2 | Request APIFY_API_KEY secret | secret tool |
| 3 | `fetch-instagram-feed` edge function | edge function |
| 4 | `analyze-trend-post` edge function | edge function |
| 5 | `generate-scene-prompts` edge function | edge function |
| 6 | Trend Watch page + components | ~8 component files + page |
| 7 | Post Detail drawer + notes | ~3 component files |
| 8 | Scene Library page | ~4 component files + page |
| 9 | Routes + admin nav | App.tsx, AppShell.tsx |

---

## Technical Notes

- All pages use existing `useIsAdmin()` guard + `<Navigate to="/app" />` for non-admins
- AI analysis uses `LOVABLE_API_KEY` (already available) via Gemini model — no extra API key needed for analysis
- Apify requires `APIFY_API_KEY` — will need to request this from user
- UI follows existing admin page patterns (white/neutral, cards, badges, collapsible sections)
- Desktop-first responsive layout matching existing admin tools
- Empty states for all sections (no accounts, no posts, no scenes, no analyses)

