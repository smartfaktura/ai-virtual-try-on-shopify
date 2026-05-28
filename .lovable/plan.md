
## Updated plan — auto-detect phone model from analysis, no spec field

Drop the Compatibility-spec route. Instead: when a product is a phone case, have the image-analysis step infer the device model from the camera cutout in the reference image, save it on the analysis, and inject it into the generate-workflow prompt — phone-cases only.

### 1. `supabase/functions/analyze-product-image/index.ts` — add `deviceModel` for phone cases

Extend the PRODUCT branch of the prompt (lines 45–49) with one optional field:

```
- "deviceModel" (ONLY if the product is a phone case, AirPods case, MagSafe case, or other device-specific case): Best guess of the device the case fits, based on the visible cutout pattern. Use camera-bump shape and lens count as the primary signal (e.g. triple-lens square bump → "iPhone 15 Pro" / "iPhone 15 Pro Max"; single-lens centered → "iPhone SE 3"; horizontal triple module → "Samsung Galaxy S24 Ultra"; vertical pill cutout → "AirPods Pro 2"). If unsure between two close models, return the most likely one. Omit this field entirely for any non-case product.
```

No schema change downstream — `parsed.deviceModel` flows through whatever the client persists today (the existing code passes the entire parsed JSON back).

### 2. `src/pages/ProductImages.tsx` — pass `deviceModel` through

In `buildInstruction` (line 778) and the `handleGenerate` loop (around line 870), the local `analysis` object already gets passed into prompts. Ensure when the job payload sends `product.analysis` to `generate-workflow`, `deviceModel` is included. If `analysis_json` already round-trips the whole object verbatim there is nothing to change here — just verify by reading the existing send-site and, if the payload strips unknown fields, add `deviceModel` to the allow-list.

### 3. `supabase/functions/generate-workflow/index.ts` — phone-case fidelity block

In the `analysisBlock` builder (lines 587–598), detect phone-cases via:
- `analysisData?.category === 'phone-cases'`, OR
- regex match on `product.productType` / `product.title` reusing the existing pattern: `/phone case|iphone case|airpods case|samsung case|magsafe|silicone case|clear case|leather case/i`.

When matched, append after `analysisBlock`:

```
PHONE CASE FIDELITY (CRITICAL):
- The [PRODUCT IMAGE] is a phone case. Its camera cutout shape, lens count, MagSafe ring, and button/port cutouts are the source of truth for the device underneath. Reproduce them EXACTLY.
- The phone body under the case MUST match those cutouts. Do NOT invent a different device (no swapping a single-lens phone for a triple-lens Pro, or vice versa).
- Default to a BACK-of-phone view (case facing camera). If the scene calls for a front/angled view, the screen MUST be off/black — do not invent UI, notch art, or Dynamic Island content.
- Preserve every printed graphic, texture, color, and finish on the case at 100% fidelity.
{{deviceModelLine}}
```

`{{deviceModelLine}}` is added only if `analysisData?.deviceModel` is a non-empty string:

```
- DEVICE MODEL: The case fits a "<deviceModel>". The phone/device under the case MUST be a "<deviceModel>" — match its silhouette, corner radius, frame material, and camera bump exactly.
```

Nothing else in the function changes. Other categories render byte-identically.

### Why this is safe

- Pure additive prompt change in two existing edge functions; no DB migration, no schema change, no UI work, no Compatibility spec field anywhere.
- `deviceModel` is optional in the analyzer's output — if Gemini omits it, generate-workflow falls back to "cutouts are the source of truth" language, which is already a meaningful improvement.
- New language is gated on `phone-cases` (category + keyword regex). Every other category is untouched.
- No new model calls, no new latency, no new credit cost.

### Verification

1. Re-analyze the user's existing phone case product. Confirm `deviceModel` appears in the analysis JSON (check edge function response or `user_products.analysis_json`).
2. Re-run a generation across 3 scenes (front-of-phone, back-of-phone, in-hand). Confirm the camera bump matches the case cutout and the device silhouette matches `deviceModel`.
3. Inspect `generate-workflow` logs to verify the `PHONE CASE FIDELITY` block + DEVICE MODEL line appear only on phone-case jobs.
4. Run one non-phone-case generation (fragrance, apparel) and confirm the compiled prompt has neither block.

