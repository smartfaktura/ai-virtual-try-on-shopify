## Goal

Rebuild the AI customer-support chat (`studio-chat` edge function + chip suggestions) so it speaks accurately about today's VOVV.AI platform — correct names, correct routes, correct prices, correct features — and drops the over-the-top AI "team of personas" tone (which conflicts with the human-first direction we just set on `/app/help`).

---

## Audit findings — what's wrong today

The current `studio-chat` system prompt was written several product cycles ago. Concrete drift:

### Naming drift (violates brand voice memory)
| Bot says | Reality / brand rule |
|---|---|
| "Templates" | Must be **Visual Studio** (destination) and **Visual Types** (selectable items) |
| "Workflows" | Same — never expose internally |
| "Freestyle" | Sidebar label is **Create with Prompt** (route still `/app/freestyle`) |
| "Discover" | Sidebar label is **Explore** (route still `/app/discover`) |
| "Sophia / Kenji / Zara / Luna / Max / Sienna / Omar / Leo / Amara / Yuki" persona team | We're moving to a real-team voice (Tomas + small team of pros). Drop the personas. |

### Missing features the bot doesn't know about
- **Brand Models** (`/app/models`) — generate custom AI models, **20 credits per image**. New, prominent in sidebar.
- **Catalog Studio** (`/app/catalog`, `/app/catalog/new`) — bulk catalog-ready visuals.
- **Video Hub** has 3 sub-flows, not "one video product":
  - Animate (`/app/video/animate`) — image → 5s/10s clip
  - Start & End (`/app/video/start-end`) — frame interpolation
  - Short Film (`/app/video/short-film`) — multi-shot Kling v3 director
- **Image Upscaling** is its own Visual Type now, not just a Library action.
- **Learn** hub (`/app/learn`) — guides for every Visual Type.
- **Help & Support** page (`/app/help`) for human contact.

### Wrong / outdated Visual Type list
The bot lists 6 templates with old names (Virtual Try-On Set, Product Listing Set, Selfie/UGC Set, Flat Lay Set, Mirror Selfie Set, Interior/Exterior Staging). Real DB has **10 active Visual Types**:
- Product Visuals (`product-images`) — flagship: 1000+ scenes
- Virtual Try-On (`virtual-try-on-set`)
- Product Listing (`product-listing-set`)
- Selfie / UGC (`selfie-ugc-set`)
- Flat Lay (`flat-lay-set`)
- Mirror Selfie (`mirror-selfie-set`)
- Interior / Exterior Staging (`interior-exterior-staging`)
- Picture Perspectives (`picture-perspectives`)
- Image Upscaling (`image-upscaling`)
- Catalog Studio (`catalog-shot-set`)

### Wrong pricing
| Item | Bot says | Reality (`mockData.ts`, `videoCreditPricing.ts`, `BrandModels.tsx`, `UpscaleModal.tsx`) |
|---|---|---|
| Freestyle standard | 4 credits | ✅ 4 credits |
| Freestyle high / w/ model or scene | 6 credits | ✅ 6 credits |
| Video | flat 30 credits | ❌ Actually variable: **Animate 5s = 10**, 10s = 18, +2 premium motion, +4 ambient. **Start & End 5s = 20**. **Short Film** ≈ 10–18 / shot + 5 planning + 4 ambient + 12 voice |
| Upscale | "10–15 credits" | ✅ 2K = 10, 4K = 15 |
| Brand Model image | not mentioned | ❌ Missing — **20 credits per image**, public Brand Models = free |
| Free plan | 20 credits, "1 product" | ❌ Actually **20 credits, up to 5 products** |
| Starter | "$39, 500 credits, 10 products, 2 video credits" | ❌ Actually **$39, 500 credits, up to 100 products** (no separate "video credits" — credits are universal) |
| Growth | "$79, 1500 credits, 100 products, 5 video credits" | ❌ Actually **$79, 1500 credits, faster queue, Brand Models** |
| Pro | "$179, 4500, Content Calendar, unlimited" | ❌ Actually **$179, 4500, fastest queue, Brand Models** |
| Top-up packs | 200/$15, 500/$29, 1500/$69 | ✅ Correct |

### Wrong CTA labels
Bot uses old-name CTAs ("Browse Templates", "Try Freestyle", "Browse Discover"). Should match in-app sidebar: **Open Visual Studio**, **Create with Prompt**, **Browse Explore**.

---

## Plan

### 1. Rewrite `SYSTEM_PROMPT` in `supabase/functions/studio-chat/index.ts`

- **Drop the persona team entirely.** Replace with a single, calm voice: "You are the VOVV.AI support team — a small group of real people who help brands create great product visuals." No name-dropping characters mid-reply.
- **Replace the platform-knowledge block** with the accurate map below.
- **Update CALL-TO-ACTION ROUTES** to use current sidebar labels and add the missing routes.
- **Replace SUBSCRIPTION PLANS** block with the verified table.
- **Replace VIDEO PRICING** block — variable per workflow, not flat.
- **Add BRAND MODELS** section.
- **Keep** the rate limiting, validation, length/tone rules, and "Talk to a Human" escalation flow.

The new platform-knowledge block (concise, accurate):

```text
Two main creation destinations:

VISUAL STUDIO (/app/workflows) — guided creation across Visual Types:
- Product Visuals — flagship; 1000+ scenes, brand-ready product shots (any product)
- Virtual Try-On — clothing on diverse AI models in any pose/setting
- Product Listing — clean, marketplace-ready shots
- Selfie / UGC — authentic creator-style content
- Flat Lay — overhead styled arrangements
- Mirror Selfie — fit-check / room mirror shots
- Interior / Exterior Staging — empty rooms or curb appeal
- Picture Perspectives — multi-angle views from a single image (Amazon/Etsy/Shopify ready)
- Image Upscaling — sharpen to 2K (10c) or 4K (15c)
- Catalog Studio — bulk catalog-ready shots in one run

CREATE WITH PROMPT (/app/freestyle) — open text-to-image, full creative control. 4 credits standard, 6 credits with model/scene/high quality.

VIDEO (/app/video) — hub with three sub-flows:
- Animate (/app/video/animate) — image → 5s (10c) or 10s (18c) clip
- Start & End (/app/video/start-end) — frame-to-frame transition (20c)
- Short Film (/app/video/short-film) — multi-shot AI Campaign Director (10–18c per shot + small planning fee)

BRAND MODELS (/app/models) — train custom AI models for consistent brand faces. 20 credits per image. Public Brand Models are free to use.

ASSETS:
- Products (/app/products) — manual upload, Shopify import, or QR mobile upload
- Library (/app/library) — every generation lives here; download, upscale, favorite, submit to Explore
- Explore (/app/discover) — community gallery for inspiration

LEARN (/app/learn) — short guides for every Visual Type
HELP & SUPPORT (/app/help) — direct line to the team
```

CTA route map (replaces the current list):

```text
[[Open Visual Studio|/app/workflows]]
[[Create with Prompt|/app/freestyle]]
[[Generate Perspectives|/app/perspectives]]
[[Upscale an Image|/app/library]]
[[Open Catalog Studio|/app/catalog]]
[[Create a Brand Model|/app/models]]
[[Animate an Image|/app/video/animate]]
[[Build a Short Film|/app/video/short-film]]
[[Browse Explore|/app/discover]]
[[Set Up Brand Profile|/app/brand-profiles]]
[[Upload Products|/app/products]]
[[View Library|/app/library]]
[[See Plans|/app/pricing]]
[[Buy Credits|/app/settings]]
[[Talk to the Team|__contact__]]
```

Pricing block (verified):

```text
PLANS (monthly; annual saves ~17%):
- Free — 20 credits/mo, 1000+ scenes, Create with Prompt, up to 5 products
- Starter ($39/mo) — 500 credits, bulk generations, up to 100 products
- Growth ($79/mo, most popular) — 1,500 credits, faster queue, Brand Models
- Pro ($179/mo) — 4,500 credits, fastest queue, Brand Models
- Enterprise — custom volume, dedicated support, custom integrations

TOP-UP PACKS:
- 200 credits — $15
- 500 credits — $29 (best value)
- 1,500 credits — $69

CREDIT COSTS:
- Visual Studio image: 4 credits standard, 6 credits high/with model/scene
- Create with Prompt image: 4 credits standard, 6 credits with model/scene/high
- Picture Perspectives: 6 credits per angle
- Brand Model image: 20 credits (public Brand Models = free to use)
- Animate video: 10c (5s) / 18c (10s); +2 premium motion, +4 ambient audio
- Start & End video: 20 credits
- Short Film: ~10–18c per shot + 5 planning fee + audio add-ons
- Upscale: 10c (2K) / 15c (4K)
```

Tone rules to keep but adjust:
- Keep: 3–6 lines, bullets max 3–4, one focused follow-up question, sparing bold, no markdown headers.
- Change: drop "drop a team member's name" rule. Speak as "we" / "the team", never invent personas.
- Add: never say "Templates" or "Workflows" to the user. Always say **Visual Studio** / **Visual Types**. Never say "Discover" — say **Explore**. Never say "Freestyle" as a feature label — say **Create with Prompt** (route can still be `/app/freestyle`).

### 2. Refresh quick-reply chips in `src/components/app/StudioChat.tsx`

Update `PAGE_CHIPS` so prompts match real page features and use new labels:

- `/app/`: "What should I create first?", "How do credits work?", "Tour Visual Studio"
- `/app/workflows`: "Which Visual Type fits my product?", "Try-On vs Product Listing?", "How much per image?"
- `/app/freestyle`: "Help me write a prompt", "What quality should I pick?", "Tips for sharper results"
- `/app/perspectives`: "How do perspectives work?", "Best source image tips?", "Cost per angle?"
- `/app/catalog`: "What is Catalog Studio?", "Best for bulk shoots?", "How is it priced?"
- `/app/models`: "What's a Brand Model?", "Public vs private models?", "Cost to train?"
- `/app/video`: "Animate vs Short Film?", "What length should I pick?", "Cost per video?"
- `/app/products`: "How do I upload?", "Can I import from Shopify?", "Upload from my phone"
- `/app/library`: "How do I upscale?", "Animate this image", "Submit to Explore"
- `/app/discover`: "How do I use a preset?", "Save to my collection", "What's featured?"
- `/app/brand-profiles`: "What goes in a brand profile?", "How does it shape my images?"
- `/app/pricing`, `/app/settings`: "Which plan fits me?", "How do top-ups work?", "Compare plans"
- Add new key `/app/learn`: "Where do I start?", "Best guide for fashion?", "How long are guides?"

Update `PAGE_CHIPS` keys to also cover `/app/pricing` (currently only `/app/settings`).

Update `WELCOME_MESSAGE`: drop "studio team" persona language. New copy:

> "Hey 👋 The VOVV.AI team is here. Tell us what you're working on — products, scenes, video, brand models — and we'll point you to the right spot. What can we help with?"

### 3. Update `pageContextMap` in `studio-chat/index.ts`

Add entries for the routes the bot doesn't currently understand and rename existing labels:

- `/app/workflows` → 'Visual Studio — they're browsing Visual Types.'
- `/app/freestyle` → 'Create with Prompt — they're generating from a text prompt.'
- `/app/discover` → 'Explore — they're browsing community presets and inspiration.'
- `/app/models` → 'Brand Models — they're creating or browsing custom AI models.' (NEW)
- `/app/catalog`, `/app/catalog/new` → 'Catalog Studio — bulk catalog generation.' (NEW)
- `/app/video` → 'Video Hub — they're choosing a video flow.' (broader than today)
- `/app/video/animate`, `/app/video/start-end`, `/app/video/short-film` → specific labels (NEW)
- `/app/learn` → 'Learn hub — they're reading guides.' (NEW)
- `/app/help` → 'Help & Support — they may want a human.' (NEW; bot should escalate quickly here)
- `/app/pricing` → 'Pricing page — they're comparing plans.' (NEW alongside existing /app/settings)

### 4. No DB / route / pricing changes

The plan only updates copy + the AI system prompt + chip prompts. No migrations, no UI rebuild, no Stripe changes. Pricing source-of-truth (`mockData.ts`, `videoCreditPricing.ts`) is already correct — the bot is what's stale.

### 5. (Optional, end of plan) Add a memory entry

After implementation, add a small memory file noting that the studio-chat system prompt is the canonical bot knowledge surface and must be updated whenever Visual Types, sidebar labels, plans, or per-feature credit costs change. This prevents the same drift from happening again silently.

---

## Files touched

- `supabase/functions/studio-chat/index.ts` — rewrite `SYSTEM_PROMPT` and `pageContextMap`
- `src/components/app/StudioChat.tsx` — update `PAGE_CHIPS`, `DEFAULT_CHIPS`, `WELCOME_MESSAGE`
- `mem://features/studio-chat-knowledge-source` — new memory rule (after merge)

## Out of scope

- Persisting chat history server-side (already in `chat_sessions`; no schema change needed)
- Changing the floating widget UI (we already hid it on `/app/help` last loop)
- Live data hooks (e.g., quoting the user's current credit balance in chat) — possible follow-up
- Renaming any sidebar labels or routes
