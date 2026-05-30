# Make orbit + premium handheld 2× cost ("PRO Mode")

## What changes for users

- 5s video with `product_orbit` or `premium_handheld`: **25 → 50 credits**
- 10s video with `product_orbit` or `premium_handheld`: **50 → 100 credits**
- All other camera motions stay at 25 / 50 credits.
- Both options visually labeled as **PRO Mode** in every camera-motion selector so users understand the surcharge.

## Pricing logic change

Today `premiumMotion: 2` is a flat `+2`. We replace it with a **2× multiplier** applied only when the selected camera motion is `product_orbit` or `premium_handheld`.

`src/config/videoCreditPricing.ts`
- Remove `premiumMotion: 2`; add `premiumMotionMultiplier: 2`.
- In `estimateCredits` (animate branch):
  ```ts
  let cost = duration === '10' ? rules.base10s : rules.base5s;
  if (motionRecipe && PREMIUM_MOTION_RECIPES.includes(motionRecipe)) {
    cost = cost * rules.premiumMotionMultiplier;
  }
  ```
- Export a small helper `isPremiumCameraMotion(id: string): boolean` so UI doesn't duplicate the list.

`supabase/functions/enqueue-generation/index.ts`
- Replace the existing `+2` block:
  ```ts
  let cost = dur === "10" ? 50 : 25;
  if (["product_orbit", "premium_handheld"].includes(motion)) cost *= 2;
  ```
- Redeploy `enqueue-generation`.

## UI: "PRO Mode" label

Targets — both camera-motion `<select>` dropdowns in `src/pages/video/AnimateVideo.tsx` (main picker + per-image override at line 877-879).

Approach: append ` — PRO · 2×` to the option text when `cm.id` is in the premium list. `<option>` can't render badges, but plain-text suffix is the standard pattern and matches the rest of the file.

```tsx
{CAMERA_MOTIONS.map(cm => (
  <option key={cm.id} value={cm.id}>
    {cm.label}{isPremiumCameraMotion(cm.id) ? ' — PRO · 2×' : ''}
  </option>
))}
```

Also: directly above each Camera Motion select, render a small inline hint when the currently-selected motion is premium:
```
PRO Mode active · doubles credit cost for cinematic camera work
```
Styled with existing `text-[10px] text-muted-foreground` token — no new tokens.

## Credit summary panel

The summary row already calls `estimateCredits(...)` so it will automatically display 50 / 100 after the rule change. No extra wiring.

## Not changed

- Recipe presets that *default* to `premium_handheld` / `orbit` (Premium Campaign Reveal, Editorial Perfume Ad, Premium Electronics Ad, Premium Bottle Showcase, Clean Rotation, Dynamic Training) — they inherit the new 2× cost automatically, which is the intended behavior.
- Start & End, Consistent Model, Ad Sequence, Short Film — out of scope.
- Existing queued/completed jobs — historical `credits_reserved` values unchanged.

## Files touched

- `src/config/videoCreditPricing.ts` — multiplier + helper
- `src/pages/video/AnimateVideo.tsx` — PRO suffix in both camera-motion selects + active hint
- `supabase/functions/enqueue-generation/index.ts` — `*= 2` instead of `+= 2`, then deploy
