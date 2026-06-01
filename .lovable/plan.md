# Studio Chat audit — findings & fixes

I cross-checked the SYSTEM_PROMPT in `supabase/functions/studio-chat/index.ts` against the real codebase (router, pricing data, video pricing config, workflow display names, Brand Scenes / Brand Models pages). Here's what's wrong or stale.

## Confirmed mistakes

### 1. Short Film contradicts itself
- Line 110 (TERMINOLOGY) lists Video sub-flows as: "Animate, Start & End, **Short Film**".
- Line 240 (NEVER) says: "Never mention Short Film".
- Router (`src/App.tsx`) redirects `/app/video/short-film` → `/app/video`. Feature is gone.
- pageContextMap still has a `/app/video/short-film` entry.

**Fix:** drop "Short Film" from line 110, delete the `/app/video/short-film` pageContextMap entry.

### 2. Wrong Swap Product route in pageContextMap
- Map key: `/app/swap`. Actual route: `/app/product-swap`.
- Harmless today (chat never CTAs `/app/swap`), but page-context never matches when the user is on the real Swap page.

**Fix:** change key to `/app/product-swap`.

### 3. `/app/upscale` page context maps to a non-existent route
- No `/app/upscale` route exists. Upscaling is launched from the Library (`/app/library`) via a modal.

**Fix:** drop the `/app/upscale` entry from pageContextMap, and update Image Upscaling references so the AI tells users to open it from Library.

### 4. Visual Type names don't match what Visual Studio actually shows
Per `DISPLAY_NAMES` in `src/pages/Workflows.tsx`:
- "Flat Lay" → actual: **Flatlay Visuals**
- "Selfie / UGC" → actual: **Selfie / UGC Visuals**
- "Mirror Selfie" → actual: **Mirror Selfie Visuals**
- "Interior / Exterior Staging" → actual: **Interior Staging Visuals** (no "Exterior")
- "Image Upscaling" → actual: **Image Upscaling Tool**

**Fix:** use exact card names so users see the same label in app + chat.

### 5. "Ambient audio is included" is misleading
- `src/config/videoCreditPricing.ts` sets `animate.ambient = 0`, and the toggle is no longer exposed for Animate. Start & End also = 0.
- Phrasing "ambient audio is included" implies audio plays by default. Actual: there's an audio mode selector (silent / ambient / voice) and ambient is just free of surcharge.

**Fix:** rephrase to "no audio surcharge — ambient mode is free." Don't promise audio is on by default.

## Cosmetic / consistency issues

### 6. Pricing FAQ data (`src/components/landing/LandingPricing.tsx` line 120) still says
> "Brand Model images are 20 credits each (public Brand Models are free to use)"

Same outdated "20 credits per image" wording we just fixed in chat. Not part of chat, but inconsistent. Flag only — fix only if you want.

### 7. Plan feature line conflates Brand Models & Brand Scenes
Lines 206–207 say: "Growth — Brand Models, Brand Scenes" / "Pro — Brand Models, Brand Scenes". True per code (both gated to Growth+), but worth verifying these are the only gated features (no mention of Content Calendar which the FAQ mentions as Growth+).

**Fix:** add Content Calendar to Growth/Pro features line if it's an active feature.

## Plan of attack (edit `supabase/functions/studio-chat/index.ts` only)
1. Line 110: remove "Short Film" from Video sub-flows.
2. pageContextMap: delete `/app/video/short-film`, delete `/app/upscale`, rename `/app/swap` → `/app/product-swap`.
3. Visual Types list (lines 117–124): use exact Visual Studio card names ("Selfie / UGC Visuals", "Flatlay Visuals", "Mirror Selfie Visuals", "Interior Staging Visuals", "Image Upscaling Tool").
4. Animate credit line (198): change "Ambient audio is included" → "Ambient audio mode is free (no surcharge)."
5. Add a sentence under Image Upscaling: "Launched from Library — open any image and click Upscale."
6. (Optional) Add "Content Calendar (Growth+)" to plan features if confirmed live.
7. Update `mem://features/studio-chat-knowledge-source` to reflect renamed Visual Types and removed Short Film.

No backend/UI/route changes. Pure prompt + memory sync.
