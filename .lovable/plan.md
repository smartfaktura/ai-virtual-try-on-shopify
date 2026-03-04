

## Improve Studio Chat & Fix Outdated Help Center Content

### Issues Found

**Studio Chat (`supabase/functions/studio-chat/index.ts`)** — mostly good after recent updates, but missing:
1. No mention of **VOVV.AI** brand name in the welcome message or chat header
2. No knowledge of **Discover** page (community presets, scenes, poses)
3. No knowledge of **upscale/enhance** feature (available in Library)
4. No knowledge of **video generation** details (available at `/app/video`)
5. No knowledge of **mobile upload** via QR code
6. No knowledge of **Shopify import** for products
7. No knowledge of **custom models** and **custom scenes** users can create

**Help Center (`src/pages/HelpCenter.tsx`)** — has **wrong credit pricing**:
- Line 34: Says "Standard quality uses 1 credit, HD uses 2, Ultra uses 3, Video costs 5" — completely wrong
- Should be: Standard 8 credits, High Quality 16 credits, Video 30 credits, etc.
- Line 13: References "Workflows or Generate" — should just be "Workflows"
- Line 63: References "Bulk Generate" and "Jobs section" — should reference Workflows activity section

**Studio Chat UI (`src/components/app/StudioChat.tsx`)**:
- Header says "Studio Team" — should say "VOVV.AI Studio Team" or at least mention VOVV.AI in subtitle
- Welcome message doesn't mention VOVV.AI
- Starter chips are decent but could add a pricing/credits chip

### Changes — 3 files

**1. `supabase/functions/studio-chat/index.ts`** — Expand SYSTEM_PROMPT:
- Add knowledge of Discover page (`/app/discover`) — browse community presets, scenes, poses
- Add knowledge of upscale/enhance feature in Library
- Add knowledge of video generation (`/app/video`) — turn images into short videos
- Add knowledge of Shopify product import and mobile upload via QR
- Add knowledge of custom models and custom scenes users can create
- Add CTA routes: `[[Discover|/app/discover]]`, `[[Generate Video|/app/video]]`

**2. `src/pages/HelpCenter.tsx`** — Fix incorrect credit pricing:
- Update "How do credits work?" answer with correct pricing (8/16/12/15/20/30 credits)
- Fix "How do I create my first product image?" to reference Workflows correctly (remove "Generate")
- Fix "Can I generate images in bulk?" to reference Workflows batch feature instead of "Bulk Generate"

**3. `src/components/app/StudioChat.tsx`** — Brand the chat:
- Change subtitle from "Your creative advisors" to "VOVV.AI creative advisors" 
- Update welcome message to mention VOVV.AI
- Add a starter chip for credits/pricing: "How much does it cost?"

