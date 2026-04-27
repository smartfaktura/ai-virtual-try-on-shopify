## Goal

Enable the **Start & End Video** card on `/app/video` with the same `beta` badge styling as **Short Film**, and set a flat **20 credits** per generation.

## Changes

### 1. `src/pages/VideoHub.tsx` — enable card with beta badge

Replace the disabled/comingSoon Start & End card (lines 201–209) with:

```tsx
<VideoWorkflowCard
  icon={ArrowRightLeft}
  title="Start & End Video"
  description="Create a smooth video between a start image and an end image"
  bestFor={['Product reveals', 'Before / after', 'Smooth transitions']}
  to="/app/video/start-end"
  beta
/>
```

This mirrors the Short Film card pattern (also uses `beta`).

### 2. `src/config/videoCreditPricing.ts` — flat 20 credits

Update `VIDEO_CREDIT_RULES.startEnd` so every Start & End job costs exactly 20 credits regardless of style or audio mode:

```ts
startEnd: {
  base5s: 20,
  ambient: 0,
  premiumTransition: 0,
},
```

Add-on calculations in `estimateCredits()` already multiply against these values, so zeroing them keeps the engine flat at 20 without further code changes.

### 3. `supabase/functions/enqueue-generation/index.ts` — backend pricing

Match the frontend in the `wf === "start_end"` branch (lines 40–46):

```ts
if (wf === "start_end") {
  return 20; // flat: Start & End video
}
```

This is the authoritative server-side credit deduction — the frontend estimate is for display only, so both must agree.

## Files touched

- `src/pages/VideoHub.tsx`
- `src/config/videoCreditPricing.ts`
- `supabase/functions/enqueue-generation/index.ts` (auto-deploys)

## Verification

- `/app/video` — Start & End card is clickable, shows BETA badge identical to Short Film.
- `/app/video/start-end` — credit estimate UI shows **20 credits** for any combination of transition style + audio mode.
- Generating a Start & End video deducts exactly 20 credits from the user's balance.
