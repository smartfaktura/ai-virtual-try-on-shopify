## Goal

Raise video generation costs so they cover Kling API spend:

- **Animate an Image** (5s): `10 → 25` credits
- **Start & End Video** (5s): `20 → 35` credits

This is a small change — pricing lives in a single source-of-truth file that both the UI and the queue (`enqueue_generation`) consume.

## Files to change

### 1. `src/config/videoCreditPricing.ts` (core)
The whole estimator reads from one constant object. Update:

```ts
animate: {
  base5s: 25,        // was 10
  base10s: 40,       // was 18  (scaled proportionally; see note)
  premiumMotion: 2,
  ambient: 4,
},
startEnd: {
  base5s: 35,        // was 20
  ambient: 0,
  premiumTransition: 0,
},
```

All these consumers automatically pick up the new numbers:
- `src/pages/video/AnimateVideo.tsx` (cost chip, generate button, bulk estimator)
- `src/pages/video/StartEndVideo.tsx`
- `src/hooks/useGenerateVideo.ts` (sent to `enqueue_generation` as `credits_reserved`)
- `src/components/app/video/CreditEstimateBox.tsx`

No backend pricing constants to touch — `generate-video` edge function just trusts `credits_reserved` reserved by the RPC.

### 2. `supabase/functions/studio-chat/index.ts` (user-facing copy)
Two lines in the SYSTEM_PROMPT pricing block:

```
- Animate an Image: **25 credits** (5s) / **40 credits** (10s); +2 for premium motion, +4 for ambient audio
- Start & End Video: **35 credits** flat
```

### 3. `src/pages/AppPricing.tsx` (FAQ)
Current FAQ text says *"Video generation runs 30–60 credits per clip"*. After the bump, animate-5s starts at 25, start-end at 35, short-films/ad-sequences/consistent-model already higher — recommend updating wording to **"25–60 credits per clip"** to stay accurate.

## Open question — 10-second Animate pricing

You only specified the 5s cost. Animate currently has a 10s tier at 18 credits. I propose **40 credits** for 10s (keeps the same ~1.6× ratio vs 5s). If you want a different number (e.g. flat 50, or leave at 18), say so before I implement.

Also leaving these unchanged unless you say otherwise:
- Short Film, Ad Sequence, Consistent Model pricing
- Add-ons (ambient +4, premium motion +2)

## Out of scope
- No DB migrations needed — credits are deducted via `enqueue_generation` RPC using whatever cost the client sends.
- No refunds for previously generated videos.
- Memory `mem://features/studio-chat-knowledge-source` already enforces re-syncing studio-chat when credit costs change — covered by step 2.

## Effort
~5 minutes of edits, no schema changes, takes effect immediately on next deploy.
