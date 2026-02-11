

## Improved "Natural / Pro" Camera Style Toggle — Enhanced Prompt Engineering

### Overview
Add a camera style toggle that applies a **post-processing and rendering style layer only** — it changes HOW the image looks (color science, depth of field, lighting rendering) without altering WHAT is in the image (scene, model, product, composition).

### Key Insight
The prompt layer must be carefully scoped so it only affects rendering characteristics, not scene content. It should sit as one of the last layers before the negative prompt, so it overrides default "commercial photography" aesthetics without conflicting with model identity, scene environment, or product fidelity layers.

---

### Files Changed

| File | Change |
|------|--------|
| `src/pages/Freestyle.tsx` | Add `cameraStyle` state (`'pro' \| 'natural'`), default `'pro'`, pass down |
| `src/components/app/freestyle/FreestylePromptPanel.tsx` | Thread `cameraStyle` + `onCameraStyleToggle` props through |
| `src/components/app/freestyle/FreestyleSettingsChips.tsx` | Render toggle chip: Smartphone icon + "Natural" / camera icon + "Pro" |
| `src/hooks/useGenerateFreestyle.ts` | Add `cameraStyle` to `FreestyleParams` and request body |
| `supabase/functions/generate-freestyle/index.ts` | Add `cameraStyle` field, inject rendering-only prompt layer |

---

### Prompt Engineering — The Core

The "Natural" layer will be injected in `polishUserPrompt` right before the negative prompt (so it's one of the last instructions the model reads). It focuses purely on **rendering characteristics**:

```text
CAMERA RENDERING STYLE — NATURAL (iPhone):
Apply these rendering characteristics ONLY — do NOT change the subject, scene,
environment, model, or composition in any way:
- LENS: Slight wide-angle perspective typical of smartphone main camera (26mm equivalent).
  Deep depth of field — foreground AND background stay sharp and in focus. No artificial
  bokeh, no shallow depth of field, no blurred backgrounds unless the scene naturally
  has extreme distance.
- COLOR SCIENCE: Apple iPhone-style computational photography color rendering. True-to-life,
  neutral color reproduction — no cinematic color grading, no orange-and-teal push, no
  lifted shadows, no crushed blacks. Colors should look exactly as the human eye would
  see them. Whites are pure neutral white, not warm-tinted.
- LIGHTING: Use whatever lighting exists in the scene naturally. No added studio strobes,
  softboxes, or artificial rim lights. If indoors, the light comes from windows and room
  lights. If outdoors, from the sun and sky. Slight HDR-like dynamic range (shadows are
  not pitch black, highlights are not blown out) — similar to iPhone Smart HDR processing.
- TEXTURE & DETAIL: Ultra-sharp across the entire frame. High pixel-level detail on skin,
  fabric, hair, and surfaces. No heavy skin smoothing or frequency separation retouching.
  Natural skin texture including pores and fine lines is visible. Detail level comparable
  to a 48MP smartphone sensor.
- OVERALL FEEL: The image should look like it was taken by someone with a latest-generation
  iPhone and posted directly — no Lightroom, no Photoshop, no professional retouching.
  Clean, sharp, true-to-life. The hallmark is "impressive but clearly a phone photo."
```

When `cameraStyle === 'pro'` (default), no additional layer is added — the current behavior (studio lighting, commercial color grading, shallow DOF) remains unchanged.

This layer is **additive and scoped**: it only says "render like this" and explicitly states "do NOT change the subject, scene, environment, model, or composition." This means:
- Model identity stays intact
- Scene environment stays intact  
- Product fidelity stays intact
- Brand profile colors still apply (they describe the product/brand, not the camera rendering)
- Selfie composition rules still apply separately

---

### UI Design

Toggle chip placed next to the Quality chip:
- **Pro** (default): neutral chip, Camera icon, reads "Pro"
- **Natural**: highlighted chip (primary border/bg), Smartphone icon, reads "Natural"
- Tooltip: "Pro: Studio-grade commercial look" / "Natural: Raw iPhone-style photo, sharp details, true-to-life colors"

---

### Technical Flow

1. User toggles to "Natural"
2. `cameraStyle: 'natural'` sent in request body
3. Edge function receives it, passes to `polishUserPrompt`
4. The natural rendering layer is inserted as the second-to-last layer (before negatives)
5. AI generates with all existing scene/model/product constraints, but renders with iPhone-style aesthetics

