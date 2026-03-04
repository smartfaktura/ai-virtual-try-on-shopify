

## Fix Studio Chat System Prompt — Outdated Brand & Routes

### Problem
The AI system prompt in `supabase/functions/studio-chat/index.ts` (line 76-107) has two issues:
1. **Wrong brand name**: References `brandframe.ai` — should be `VOVV.AI`
2. **Outdated routes & workflow references**: Suggests `/app/generate`, `/app/bulk-generate`, `/app/templates` which no longer exist. The app uses Workflows + Freestyle.

### Current Workflows (from database)
- Virtual Try-On Set
- Product Listing Set
- Selfie / UGC Set
- Flat Lay Set
- Mirror Selfie Set
- Interior / Exterior Staging

### Current App Routes (from sidebar)
- `/app` — Dashboard
- `/app/products` — Products
- `/app/workflows` — Workflows (the main generation entry point)
- `/app/creative-drops` — Creative Drops
- `/app/discover` — Discover
- `/app/freestyle` — Freestyle (open-ended AI generation)
- `/app/library` — Library (results)
- `/app/brand-profiles` — Brand Profiles
- `/app/settings` — Settings

### Changes — 1 file

**`supabase/functions/studio-chat/index.ts`** — Rewrite the `SYSTEM_PROMPT` constant:

1. Change `brandframe.ai` → `VOVV.AI`
2. Replace platform description to reflect workflows + freestyle model
3. Update CTA routes:
   - Remove: `/app/generate`, `/app/bulk-generate`, `/app/templates`
   - Add: `/app/workflows` (primary), `/app/freestyle`, `/app/creative-drops`
   - Keep: `/app/products`, `/app/brand-profiles`, `/app/library`
4. Add awareness of the 6 actual workflows so the AI can recommend the right one based on the user's product/goal
5. Update capability references: "workflows" and "freestyle" instead of "generate images"

