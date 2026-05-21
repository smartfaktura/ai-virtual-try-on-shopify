# Brand Models — reference photo becomes the source of truth

## Scope and safety

All changes are isolated to one edge function: `supabase/functions/generate-user-model/index.ts`, plus a small UI tweak in `src/pages/BrandModels.tsx` / `src/components/app/GenerateModelModal.tsx`. Nothing else in the app is touched — Product Images, Catalog Studio, Short Film, Video generation, billing, RLS, and DB schema are all unaffected.

All new behavior fires **only when a reference image is uploaded**. Pure text-to-model generation (no upload) keeps today's exact behavior — same prompt, same model, same output, same chips.

The reference image is — and stays — passed to Gemini 3 Pro Image as raw `inlineData` (base64 pixels), placed before the text in the request. Gemini sees the actual photo, not a paraphrase.

Two bugs to fix:

1. The uploaded photo doesn't drive the face — it's treated as loose inspiration, combined with chip choices that often contradict it.
2. Sometimes only 2 of 3 variations come back; failures are silently dropped.

## Fix 1 — When a reference image is added, the photo *is* the brief

The current flow mixes signals:
- Sends upload to Gemini 2.5 Flash → gets a short text description.
- Calls Gemini 3 Pro Image with `[image] + [long studio prompt] + [chip values for gender/body/ethnicity/age/hair/etc]`.

The chips and the paraphrase fight the actual pixels. If you upload a 45-year-old Asian man and "young-adult / female / slim" is still on the form, Gemini averages it out and you get a stranger.

### The face comes from the image, never from text

This is the core rule. When a reference image is uploaded:

- The uploaded photo is sent to Gemini 3 Pro Image **as the actual image** (raw base64 pixels via `inlineData`), placed before the text part of the request. Gemini looks at the real face.
- We **do not** describe the face in words anywhere in the image prompt. No "30 year old woman with brown hair and green eyes." That kind of paraphrase is what's currently destroying identity — Gemini follows the description and ignores the photo.
- The old code's Gemini 2.5 Flash "appearance_description" step is **removed from the image prompt path**. We still call Flash once to auto-fill the *saved model card metadata* (name, gender, body_type, ethnicity, age_range) so filters and labels work, but that text never enters the image generation request.
- Chip inputs (gender, body type, ethnicity, age, hair, expression, facial hair, clothing description) are **ignored for the image prompt** when a reference is uploaded. The photo already answers all of those questions, and including them creates conflicts ("young-adult / female / slim" + a photo of a 45-year-old man = a stranger).

### What the prompt actually contains

Still rich and beautiful — just framed around the person in the photo, with zero face description. Direction (function composes the final string):

> "Create a polished studio portrait of the exact person shown in the reference image. Preserve their identity completely — same face, bone structure, skin tone, hair, eye color, age, ethnicity, and body type. This is the same human being photographed again, not a similar-looking person.
>
> Studio setup: seamless light grey backdrop (#E8E8E8), soft three-point lighting with a large key softbox camera-left, gentle fill, subtle rim. Shot on an 85mm lens at f/2.8, head-and-shoulders framing, eye-level, sharp focus on the eyes, shallow background separation. Wardrobe: clean neutral basics (white tee or simple knit), nothing branded. Expression: relaxed, natural, looking at the camera. Skin retains real texture — no smoothing, no beautification, no age shift, no ethnicity shift, no stylization."

### UI follow-through

In `GenerateModelModal.tsx` and `BrandModels.tsx`, when a reference image is uploaded, hide or visually disable the gender / body / ethnicity / age / hair chips with a short note: "Using your reference photo — these are detected automatically." Prevents conflicting inputs and makes the behavior obvious.

### Generator mode (no image)

Completely unchanged. Same chips, same prompt builder, same output as today.


## Fix 2 — Always return 3 variations

Currently: `Promise.allSettled(3 calls)` → filter fulfilled → return survivors. Failures are swallowed.

Changes:

- Per-slot retry: each of the 3 slots gets up to 2 attempts (initial + 1 retry with 1.5s backoff). On 429, respect the retry-after hint.
- Log every failure with slot index and the Gemini error body so issues are visible in edge function logs.
- If after retries a slot still failed, return `partial: true` and `failed_count: N` alongside the variations we do have.
- `BrandModels.tsx` / modal: when `partial` is true, render the missing slot as a placeholder with a "Generate one more" button that re-invokes the function for a single image. No extra credits — credits are still only spent on save.

## Out of scope

- No DB schema changes.
- No pricing/credit changes.
- No changes to `create-model-from-image` (separate metadata-only path used by the "Add as Model" modal).
- No model swap — Gemini 3 Pro Image stays.

## Risk

- Per-slot retries lengthen worst-case latency by ~10–15s; acceptable for a 20-credit save action.
- Hiding the chips when an image is uploaded is a visible UX change. It's the right call (otherwise users will keep setting contradictory values and blaming the output), but worth flagging.

## Effort

Small. ~60 lines in the edge function, ~40 lines across the two UI files. No migrations. Couple hours including QA with a real reference upload.
