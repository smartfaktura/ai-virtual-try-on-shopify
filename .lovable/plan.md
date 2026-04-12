

# Fix Brand Logo System — Make It Actually Work End-to-End

## Problem Found

The brand logo system has a gap between frontend and backend:

1. **Logo image upload** ✅ Works — sent as `extra_reference_image_url` with a branded label, AI sees it as a reference image
2. **Logo text** ❌ Broken — frontend sends `brand_logo_text` in payload but the **edge function never reads it**. The text only appears in the prompt via `BRAND TEXT DIRECTIVE` appended client-side by the prompt builder — which works, but admins can't control *where* the text goes using `{{brandLogoText}}` in templates
3. **No `{{brandLogoText}}` token resolution** — if an admin writes `{{brandLogoText}}` in a `prompt_template`, it stays as literal text in the final prompt

## What This Plan Fixes

### 1. Add `{{brandLogoText}}` token resolution in prompt builder
**File: `src/lib/productImagePromptBuilder.ts`**
- Add `.replace(/\{\{brandLogoText\}\}/gi, details.brandLogoText || '')` in the token replacement chain
- Make the auto-appended `BRAND TEXT DIRECTIVE` conditional: skip if the template already used `{{brandLogoText}}`

### 2. Document the token in prompt reference
**File: `src/data/promptTokenReference.ts`**
- Add `brandLogoText` entry so admins can discover it on the tokens page

## How Admins Use It

**Option A — Auto mode (current behavior, no template change needed):**
Scene template doesn't mention `{{brandLogoText}}` → system auto-appends `BRAND TEXT DIRECTIVE` at end of prompt. AI decides where to put it.

**Option B — Precise placement (new):**
Admin writes in `prompt_template`:
```
Luxury editorial of {{productName}} with "{{brandLogoText}}" engraved on marble backdrop
```
→ Token resolves to the user's input (e.g. "BOTTEGA VENETA"), and the generic directive is skipped.

## About the logo image
The uploaded logo image already works correctly — it's sent as a labeled reference image alongside the product photo. The AI uses it visually. No changes needed there.

## Files changed
1. `src/lib/productImagePromptBuilder.ts` — add token resolution + conditional directive
2. `src/data/promptTokenReference.ts` — document new token

