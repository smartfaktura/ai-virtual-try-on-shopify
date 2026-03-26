

# Seedream Multi-Image Role Assignment via Numbered References

## Problem

Seedream receives multiple reference images (product, model, scene) as a flat array with no way to know which is which. The prompt currently says generic things like "the model from the reference" — but Seedream doesn't know which image IS the model. This causes it to blend features randomly (e.g. blonde hair from a product photo onto the model).

## Key Discovery

The Seedream docs explicitly state:

> **When using multiple input images, clearly assign roles: Refer to the images as image 1, image 2, etc. Which one supplies the subject, which supplies the outfit/style/background?**

So the solution is to **number the images** in a deterministic order and **rewrite the prompt** to use `image 1`, `image 2`, `image 3` labels that map exactly to the array positions.

## Solution

### Changes in `supabase/functions/generate-freestyle/index.ts`

**1. Refactor `convertContentToSeedreamInput()` — structured role tracking**

Instead of just splitting images into "model" vs "other", track each image with its role:

```text
Parse content array → build typed list:
  [{ url, role: "product" }, { url, role: "model" }, { url, role: "scene" }]
```

Detection uses the label text before each image (`[PRODUCT REFERENCE]`, `[MODEL REFERENCE]`, `[SCENE REFERENCE]`, `[PRODUCT IMAGE]`, `[REFERENCE IMAGE]`).

Order images deterministically: **model → product → scene → other** (model first for identity priority).

**2. Add a `buildSeedreamRoleDirective()` helper**

Generates a numbered role block appended to the cleaned prompt:

```text
IMAGE ROLES:
- Image 1 is the MODEL (person/face to match — preserve exact face, hair color, skin tone, body type)
- Image 2 is the PRODUCT (item to feature in the scene)
- Image 3 is the BACKGROUND/SCENE (use for environment, lighting, atmosphere only)
```

This maps 1:1 to the image array order sent to the API.

**3. Update `cleanPromptForSeedream()` — replace `[TAG]` labels with numbered refs**

Instead of replacing `[MODEL REFERENCE]` with "the model from the reference", replace with `the person from image 1` (matching the actual array position). This makes the full prompt consistent with the role directive.

### Example transformation

```text
Images array: [model.jpg, product.jpg, scene.jpg]

Prompt includes:
"IMAGE ROLES:
- Image 1 is the MODEL: preserve exact face, hair color, skin tone, body type
- Image 2 is the PRODUCT: the item to showcase
- Image 3 is the BACKGROUND: use for environment and lighting only

...
REFERENCES:
1. MODEL: The person must match the person from image 1 (Female, brown hair) — same face, features, skin tone, hair, body.
2. PRODUCT: Feature the product from image 2 naturally.
3. SCENE: Place into the environment from image 3. Match lighting and perspective."
```

### What stays the same
- Gemini (Nano Banana) path is completely untouched
- The `buildContentArray()` function stays as-is (Gemini uses it fine)
- User prompt content, brand directives, quality, framing — all preserved
- Image ordering: model still comes first

## Files Modified
- `supabase/functions/generate-freestyle/index.ts` — refactor `convertContentToSeedreamInput()`, add `buildSeedreamRoleDirective()`, update `cleanPromptForSeedream()` tag replacements to use numbered image refs

