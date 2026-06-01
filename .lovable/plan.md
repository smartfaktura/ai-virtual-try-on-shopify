# Studio Chat — Easiest, Highest-Impact Upgrade

Two files. No schema, no new components, no new dependencies.

---

## 1. Rewrite `SYSTEM_PROMPT` in `supabase/functions/studio-chat/index.ts`

### 1a. Intent Router (top of prompt)

Forces correct feature on first reply:

- "brand scene / reusable scene / signature look" → Brand Scenes (20 cr per 3 variations). Creation requires Growth+; Free/Starter can only reuse saved scenes. CTAs: `[[Design a Brand Scene|/app/brand-scenes]]` + `[[See Plans|/app/pricing]]` when plan-gated
- "swap product / replace product" → Swap Product (6 cr). CTA: `[[Swap a Product|/app/swap]]`
- "video / animate / motion" → Animate 25 cr (5s) / 50 cr (10s), premium motion 2×, Start & End 35 cr. CTA: `[[Open Video Hub|/app/video]]`
- "upscale / hi-res / 4k" → Upscaling, 4K only, 15 cr. CTA: `[[Upscale Image|/app/upscale]]`
- "AI model / person / brand model" → Brand Models (Growth+). CTA: `[[Create a Brand Model|/app/brand-models]]` or `[[See Plans|/app/pricing]]`
- "out of credits / more credits / topup" → `[[See Plans|/app/pricing]]` + mention top-ups
- everything else product-photo related → Product Visuals via Visual Studio (6 cr/image). CTA: `[[Open Visual Studio|/app/workflows]]`

### 1b. Answer Style rules

- 2–5 lines for simple questions, max 6 + 1 CTA
- Exact numbers always ("6 credits", never "around 6")
- No terminal periods in single-sentence answers (brand voice)
- Always say "VOVV.AI" and "Visual Studio" (never "workflows / templates / presets / visual types" as user-facing labels)
- Never recommend a gated feature without naming the required plan and adding `[[See Plans|/app/pricing]]`
- Never offer a CTA the user can't act on — swap creation CTAs for `[[See Plans]]` when plan-gated

### 1c. Page-aware opener

Extend the existing `pageContextMap` so the first assistant line matches the route:

- `/app/workflows` → "Want to create a new product visual in Visual Studio?"
- `/app/brand-scenes` → "Want to design a reusable signature scene?"
- `/app/swap` → "Need to swap a product into an existing image?"
- `/app/video` → "Ready to animate a still into video?"
- `/app/upscale` → "Want to push an image to 4K?"
- `/app/brand-models` → "Looking for a consistent AI model?"
- `/app/pricing` → "Want help picking the right plan?"

---

## 2. Tiny UI polish in `StudioChat.tsx` (+ minimal hook tweak in `useStudioChat.ts`)

Three low-risk additions, all reusing existing handlers:

- **Empty-state quick chips** — 3 tappable suggestions on first open: "Design a brand scene", "Make a product visual", "How do credits work?". Each calls the existing `send()`
- **Stop button** while streaming — toggled in input row; aborts the in-flight request via the AbortController already created in `useStudioChat` (expose `abort` from the hook if not already returned)
- **Error toast on 402 / 429** — copy: "Out of credits — see plans" with a link to `/app/pricing`. Hooks into the existing fetch catch

---

## Out of scope

- Sending user plan/credits into prompt (requires DB read in function)
- Conversation persistence / resume across sessions
- Regenerate button, AI-generated follow-up chips
- Markdown renderer changes
- Any pricing, route, plan, or feature logic changes

---

## Files touched

1. `supabase/functions/studio-chat/index.ts` — SYSTEM_PROMPT rewrite + `pageContextMap` additions
2. `src/components/.../StudioChat.tsx` — chips, stop button, error toast
3. `src/hooks/useStudioChat.ts` — expose `abort` if not already

Estimated diff: ~120 lines prompt, ~50 lines UI.

## Expected result

- "Can I create a brand scene?" answered correctly with right CTAs and plan info on first try
- Shorter, sharper, on-brand answers across the board
- Page-aware opener on every feature page
- Users can stop a runaway response and recover from out-of-credits gracefully
