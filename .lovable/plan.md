## Audit findings — Studio Chat answers

After cross-checking `supabase/functions/studio-chat/index.ts` against the real pricing/scene data, I found 3 inaccuracies. All fixes are copy-only inside the SYSTEM_PROMPT.

### 1. Annual savings wrong (~17% → ~20%)
Prompt line 203 says "annual saves ~17%". Real numbers from `mockData.ts`:
- Starter: $39 × 12 = $468 vs $372 annual → **20.5% off**
- Growth: $79 × 12 = $948 vs $756 annual → **20.2% off**
- Pro: $179 × 12 = $2,148 vs $1,716 annual → **20.1% off**

Fix: change "~17%" → "~20%".

### 2. Scene count inconsistent (1000+ vs 1600+)
Prompt mentions "1000+ scenes" in two places (intent router line 97, Product Visuals line 117) and "1000+ scenes" in Free plan line 204. The actual Free plan feature in `mockData.ts` says **"1600+ scenes"**, and Visual Studio markets 1600+.

Fix: bump every "1000+ scenes" to "1600+ scenes" for consistency with what users see on Pricing.

### 3. Free plan feature label drift
Prompt line 204 lists Free plan with "Create with Prompt" — correct user-facing name and matches our terminology rule, but `mockData.ts` still ships the legacy "Freestyle creation" string. Not a chat bug — flagging only so we know the chat is already ahead of the data file. **No change needed in chat prompt.**

### Items intentionally NOT changed
- LandingPricing FAQ still says "Brand Model images are 20 credits each" — that's a marketing-page bug, not the chat. User scoped this task to chat answers only.
- Top-up packs ($15 / $29 / $69), plan prices, credit counts, all routes (`/app/perspectives`, `/app/product-swap`, `/app/video/animate`, `/app/video/start-end`, `/app/models`, `/app/brand-scenes`) — verified correct.
- Credit costs (6 / 20 / 25 / 50 / 35 / 15) — all verified correct.

### Changes to apply
File: `supabase/functions/studio-chat/index.ts` only.
1. Line 97: "1000+ scenes" → "1600+ scenes"
2. Line 117: "1000+ studio and editorial scenes" → "1600+ studio and editorial scenes"
3. Line 203: "annual saves ~17%" → "annual saves ~20%"
4. Line 204: Free plan "1000+ scenes" → "1600+ scenes"

Also update `mem://features/studio-chat-knowledge-source` to note: scenes = 1600+, annual discount = ~20%.

No code, no routes, no backend logic touched.
