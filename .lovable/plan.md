

## Regenerate 3 Mirror Selfie Scene Previews

The user wants to update 3 scene prompts in `supabase/functions/generate-scene-previews/index.ts` and then regenerate their preview images.

### Changes — 1 file

**`supabase/functions/generate-scene-previews/index.ts`**

**1. "Hair Salon" (line 88)** — Remove "ring lights or vanity bulbs around mirror frame" and replace with natural salon lighting:
```
"Hair Salon": `Photorealistic mirror selfie of ${getModelDesc(1)} sitting at a salon mirror with styling station visible, holding smartphone with back of phone toward camera and screen facing the mirror capturing reflection, soft natural diffused salon lighting from overhead and side, hair products and tools on counter, warm inviting beauty atmosphere, iPhone quality, Instagram aesthetic, ${MIRROR_FORMAT}, ${MASTER_SUFFIX}`
```

**2. "Entryway Console" (line 94)** — Change scene from a console table foyer to a more interesting entryway with better visual context:
```
"Entryway Console": `Photorealistic mirror selfie of ${getModelDesc(5)} standing in front of a tall leaning floor mirror in a bright modern entryway, holding smartphone with back of phone toward camera and screen facing the mirror capturing reflection, natural daylight from glass front door, woven basket and potted plant beside mirror, minimal floating shelf with keys and candle, warm welcoming home entrance, iPhone quality, Instagram aesthetic, ${MIRROR_FORMAT}, ${MASTER_SUFFIX}`
```

**3. "Hotel Lobby Boutique" (line 110)** — Fix perspective issues, make the scene more grounded with clearer spatial composition:
```
"Hotel Lobby Boutique": `Photorealistic mirror selfie of ${getModelDesc(5)} standing in front of a large ornate floor mirror in a boutique hotel lounge area, holding smartphone with back of phone toward camera and screen facing the mirror capturing reflection, lush indoor plants flanking the mirror, warm ambient lighting from vintage sconces, velvet armchair and side table nearby, eclectic curated decor, warm earthy tones, full body visible with clear spatial depth, iPhone quality, Instagram aesthetic, ${MIRROR_FORMAT}, ${MASTER_SUFFIX}`
```

After updating the prompts, the previews will regenerate next time the edge function is called for these scenes. No other files need changes.

