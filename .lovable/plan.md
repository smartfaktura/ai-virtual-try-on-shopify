

# Switch Catalog to Seedream 5.0 Lite as Primary Model

## What Changes

**Single file**: `supabase/functions/generate-tryon/index.ts`

### 1. Make Seedream 5.0 Lite the primary model for catalog mode

In the generation loop (~line 799), when `isCatalogMode` is true, call `generateImageSeedream()` with model `"Dola-Seedream-5.0-lite"` as the **first** attempt instead of Gemini Pro.

### 2. Adjust fallback chain for catalog mode

```text
Catalog mode fallback order:
  1. Seedream 5.0 Lite (NEW primary)
  2. Gemini Pro (current primary becomes fallback)
  3. Gemini Flash (unchanged last resort)
```

Non-catalog (regular try-on) stays unchanged — Gemini Pro remains primary there.

### 3. No other changes needed

The existing `generateImageSeedream()` function already supports arbitrary model strings and handles ARK API calls, timeouts, moderation codes, and error handling. The `BYTEPLUS_ARK_API_KEY` secret is already configured.

## Technical Detail

The change is ~10 lines in the generation loop: wrap the existing `generateImage()` call in an `if (isCatalogMode)` branch that calls Seedream first, then falls back to the existing Gemini chain if Seedream returns no result.

