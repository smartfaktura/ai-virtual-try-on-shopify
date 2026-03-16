

## Audit: Studio Chat — What It Has vs What's Missing

### Current State

**System prompt covers these routes/CTAs:**
- ✅ `/app/workflows` — Browse Workflows
- ✅ `/app/freestyle` — Try Freestyle
- ✅ `/app/brand-profiles` — Set Up Brand Profile
- ✅ `/app/products` — Upload/Manage Products
- ✅ `/app/creative-drops` — Creative Drops
- ✅ `/app/library` — View Library (aliased as Jobs)
- ✅ `/app/discover` — Browse Discover
- ✅ `/app/video` — Generate Video
- ✅ `/app/settings` — Upgrade Plan / Buy Credits
- ✅ `__contact__` — Talk to a Human (inline contact form)

**Missing routes — features that exist but chat can't link to:**
- ❌ `/app/perspectives` — Perspectives (multi-angle generation)
- ❌ `/app/` — Dashboard
- ❌ `/app/products/new` — Add new product directly
- ❌ `/pricing` — Public pricing page (for non-logged-in context)
- ❌ `/team` — Meet the team page

**Missing platform knowledge in system prompt:**
- ❌ **Perspectives** — no mention at all. Users can generate 4-angle views (front, back, left, right) of products. This is a key feature.
- ❌ **Upscale pricing** — prompt mentions upscale exists but doesn't state the credit cost
- ❌ **Mobile Upload** — mentioned under Product Management but no CTA
- ❌ **Shopify Import** — mentioned but no direct CTA to trigger it

**UI/UX gaps:**
- ❌ No page-context awareness — chat doesn't know which page the user is currently on (the `pageUrl` is stored in session but not sent to the AI)
- ❌ No user context — doesn't know user's plan, credit balance, or product count
- ❌ Starter chips are static — same 3 chips regardless of which page the user is on
- ❌ No "suggested follow-ups" after assistant responses — user has to type everything
- ❌ No typing indicator text — just dots, no "Sophia is typing..." flavor

---

### Suggested Improvements Plan

**1. Add Perspectives to system prompt**
- Add `/app/perspectives` route knowledge and CTA: `[[Generate Perspectives|/app/perspectives]]`
- Describe it: "Generate front, back, left-side, right-side views of any product from a single image. Great for marketplace listings that need multi-angle shots."
- Add pricing info (if applicable)

**2. Send current page context to the AI**
- Pass `pageUrl` (already tracked in `useStudioChat`) as part of the request body to the edge function
- Inject it into the system prompt as: `"The user is currently on: {pageUrl}"`
- This lets the AI give contextual advice (e.g., on `/app/freestyle` → suggest prompt tips; on `/app/workflows` → help pick a workflow)

**3. Add upscale pricing to system prompt**
- Include credit cost for upscale (check current pricing logic and add it)

**4. Context-aware starter chips**
- Replace static `STARTER_CHIPS` with page-aware chips:
  - Dashboard → "What should I create first?", "How do credits work?"
  - Workflows → "Which workflow fits my product?", "Try-on vs Product Listing?"
  - Freestyle → "Help me write a prompt", "What quality should I pick?"
  - Perspectives → "How do perspectives work?", "Best source image tips?"
  - Library → "How do I upscale?", "Can I generate video from this?"
  - Settings → "Which plan is right for me?", "How do top-ups work?"

**5. Add Dashboard CTA to system prompt**
- `[[Go to Dashboard|/app/]]` — for when users ask "where do I start?" or want an overview

**6. Add "Sophia is typing..." indicator**
- Replace the bouncing dots with a subtle text like "Sophia is thinking..." above the dots for more personality

### Files to change:
- `supabase/functions/studio-chat/index.ts` — update system prompt (add Perspectives, upscale pricing, dashboard CTA, page context injection)
- `src/hooks/useStudioChat.ts` — send `pageUrl` in the request body
- `src/components/app/StudioChat.tsx` — context-aware starter chips, typing indicator text

