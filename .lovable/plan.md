## Why home page images look bad

I traced every `<img>` source on the home sections and found they're all served at **half the resolution they're being displayed at**, plus quality 55–60 (which is JPEG-mush territory for portrait product shots).

### Measured evidence

I fetched one real hero tile (`1776689318257-yahkye.jpg`) at the size we currently serve vs. the size needed for sharp rendering at the user's 1310 px viewport with 2× DPR:

| Component | CSS rendered | Served | DPR-2 needed | Weight today | Weight after |
|---|---|---|---|---|---|
| **HomeHero** marquee tile | 180–210 px wide | **320 px @ q=55** | 420 px | 12 KB | ~30 KB @ 480/q72 |
| **HomeTransformStrip** | up to 280 px | **320 px @ q=60** | 560 px | ~12 KB | ~30 KB @ 480/q72 |
| **HomeCreateCards** | up to 440 px | **480 px @ q=60** | 880 px | 22 KB | ~85 KB @ 960/q72 |
| **HomeOnBrand** | ~280 px | **360 px @ q=60** | 560 px | similar | ~30 KB @ 600/q72 |
| **HomeStudioTeam** avatar | ~220 px | **320 px @ q=55** | 440 px | small | small |

Two compounding issues:

1. **Width is too small.** A 320 px image displayed in a 210-px CSS slot on a 2× DPR screen has to be upscaled by the browser → soft, blurry edges, especially on text and skin.
2. **Quality 55–60 is too low** for fashion/beauty crops — visible JPEG blocking in shadows, crushed gradients on skin/fabric. The original tuning (q=55) was set when we feared bandwidth; in practice the bytes saved at this size are tiny (12 KB → 30 KB is +18 KB per tile, totally fine).

The home was tuned aggressively for "fast first paint", but it sacrificed clarity. We can keep the page fast **and** sharp.

---

## The fix

Bump every home tile to a width that comfortably covers 2× DPR and raise quality to 72. Add a `srcSet` so 1× displays don't pay for retina pixels.

### Per-component changes

**`src/components/home/HomeHero.tsx`** (line 58)
```ts
// before
getOptimizedUrl(src, { width: 320, height: 426, quality: 55, resize: 'cover' })
// after
getOptimizedUrl(src, { width: 480, height: 640, quality: 72, resize: 'cover' })
// + srcSet with 320w/480w/640w variants
```

**`src/components/home/HomeTransformStrip.tsx`** (lines 169 and 229 — keep them in sync because line 229 is the preload)
```ts
{ width: 480, height: 640, quality: 72, resize: 'cover' }
```

**`src/components/home/HomeCreateCards.tsx`** (line 63)
```ts
{ width: 960, height: 1200, quality: 72, resize: 'cover' }
// + srcSet 480w/720w/960w
```
These cards render up to ~440 px wide on desktop; 960 px covers 2× DPR with headroom.

**`src/components/home/HomeOnBrand.tsx`** (line 77)
```ts
{ width: 600, height: 800, quality: 72, resize: 'cover' }
```

**`src/components/home/HomeStudioTeam.tsx`** (lines 138, 143 — poster + img)
```ts
{ width: 480, height: 600, quality: 72, resize: 'cover' }
```

### Add a tiny `srcSet` helper to `src/lib/imageOptimization.ts`

The existing `getOptimizedSrcSet` warns against width-only crop, but we now pass `width + height + resize=cover` so it's safe. Add a sibling helper:

```ts
getResizedSrcSet(url, { aspect: [3, 4], widths: [320, 480, 640], quality: 72 })
// → "...?width=320&height=426&... 320w, ...?width=480&height=640&... 480w, ..."
```

Use it on the larger-card components (HomeHero, HomeTransformStrip, HomeCreateCards, HomeOnBrand) along with a `sizes` attribute so the browser picks the right variant.

### Update memory rule

`mem://style/image-optimization-no-crop` currently bans the `width` param. The real rule is "**width without height crops**". Update it to allow `width + height + resize=cover` for fixed-aspect cells — that's a clean resize, not a crop, and is the only way to get sharp retina-grade tiles.

---

## Net impact

- **Visual quality**: noticeably sharper edges, cleaner skin/fabric, no JPEG blocking. Especially obvious in `HomeCreateCards` and `HomeHero` marquee.
- **Page weight**: home grows from ~0.4 MB of tiles to ~1.3 MB — still well under the typical 2–3 MB hero budget, and `srcSet` keeps non-retina users near today's number.
- **No layout, no JSX restructure**: just URL parameters + an optional `srcSet` attribute.

## Files to change

- `src/lib/imageOptimization.ts` — add `getResizedSrcSet` helper
- `src/components/home/HomeHero.tsx`
- `src/components/home/HomeTransformStrip.tsx`
- `src/components/home/HomeCreateCards.tsx`
- `src/components/home/HomeOnBrand.tsx`
- `src/components/home/HomeStudioTeam.tsx`
- `mem://style/image-optimization-no-crop` — refine rule

## Out of scope

- Hub pages (`/ai-product-photography/*`) — same root cause, same fix shape, but separate plan to keep this scoped to the home page the user asked about.
- No backend / Supabase changes; the render endpoint already supports `width+height+resize=cover`.
