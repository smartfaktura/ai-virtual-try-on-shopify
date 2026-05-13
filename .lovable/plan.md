## Goal

Apply the same 3-layer treatment we used for Padel to the 8 **Tennis Editorial** scenes in the activewear category — guarantee authentic tennis court shoes, and dial scene lighting from "bright/sunny" toward **clean, soft, balanced daylight** (still daylight, just not blown-out hero sun).

## Scope — 8 scenes (sub_category = "Tennis Editorial")

```
activewear-tennis-grass-court-natural        (Grass Court Morning)
activewear-tennis-grass-court-volley-ready   (Grass Court Volley Ready)
activewear-tennis-clay-bench-rest            (Clay Court Bench Rest)
activewear-tennis-clay-natural-rally         (Clay Court Between Points)
activewear-tennis-hard-court-blue-serve-prep (Blue Hard Court Serve Prep)
activewear-tennis-hard-court-blue-stride     (Blue Hard Court Stride)
activewear-tennis-court-baseline             (Tennis Court Baseline)
activewear-tennis-club-lounge                (Tennis Club Lounge)
```

Out of scope: `beverage-ugc-tennis-court`, `tennis-court` (Creative Shots) — generic, not Tennis Editorial.

## Changes

### 1. `outfit_hint` — strict tennis-shoe lock (DB update)

Rewrite the footwear paragraph in every scene's `outfit_hint` to require authentic, logo-free **tennis court shoes** with the right outsole for the surface:

- **Grass scenes** → smooth nub/pimple outsole (classic grass-court).
- **Clay scenes** → full herringbone outsole, slight reddish dust patina allowed.
- **Hard-court & club scenes** → durable modified-herringbone outsole, pristine white.

All shoes: low-cut court silhouette below the ankle, reinforced rounded rubber toe cap, lateral side-support panels, padded collar, structured heel counter, predominantly white with subtle cream/grey/tonal accents only, **no logos / wordmarks / stripes / swooshes / text**, worn with low white ankle socks.

Add the same explicit ban list: no running shoes, knit-sock runners, chunky lifestyle sneakers, basketball shoes, platform sneakers, slip-ons, sandals, Converse-style canvas, Vans-style flats, fashion trainers.

### 2. `prompt_template` — clean (not too bright) lighting

For each of the 8 scenes, soften the LIGHT paragraph:

- Replace "bright midday sun", "harsh sunlight", "high-noon", "blown highlights" cues with **soft overcast daylight, light cloud-diffused sun, open shade, or early/late-side daylight** — still daylight, no studio look.
- Keep highlights creamy, shadows airy and short, contrast medium-low.
- Add: "no harsh hot spots, no blown whites on the garment, balanced clean exposure, court surface evenly lit".

Also tighten the FOOTWEAR sentence inside the prompt body to repeat the tennis-shoe spec (matches outfit_hint).

All other content (subject anchor, pose, framing, grade, closing line) stays verbatim.

### 3. Backend safeguard (`src/lib/productImagePromptBuilder.ts`)

Add a sibling to the existing padel block — appended only when `scene.id` includes `activewear-tennis`:

> TENNIS FOOTWEAR VALIDATION (HARD CONSTRAINT — overrides any default sneaker styling): The model MUST wear authentic logo-free tennis court shoes — low-cut court silhouette below the ankle, rounded reinforced rubber toe cap, lateral side-support panels, padded collar, structured stable heel counter, firm flat non-marking court outsole (herringbone for clay/hard, smooth nub/pimple for grass), predominantly pristine white with optional subtle cream/grey/tonal accents only. Worn with low white ankle socks. STRICTLY FORBIDDEN: running shoes, knit-upper sock-runner sneakers, chunky lifestyle sneakers, fashion trainers, basketball shoes, platform sneakers, retro dad-shoes, slip-ons, sandals, hiking shoes, skate shoes, Converse-style canvas, Vans-style flats, ANY brand logos / wordmarks / swooshes / three-stripe motifs / monograms / text. Must read at first glance as real performance tennis court shoes.

This is the final unambiguous shoe spec the model sees, mirroring how Padel was fixed.

## Validation

After approval and execution, regenerate **Grass Court Morning** and **Blue Hard Court Stride** first to confirm:
- shoes read as real tennis court shoes (right outsole per surface, no logos),
- daylight is clean/balanced — no blown highlights, no harsh hot spots.