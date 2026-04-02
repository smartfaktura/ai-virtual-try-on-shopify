

# Revert Seedream Fallback to 4.5

## Overview
Roll back the three edge functions from `Dola-Seedream-5.0-lite` to the previous `seedream-4-5-251128` model, since 5.0 Lite is returning server errors.

## Changes

### 1. `supabase/functions/generate-freestyle/index.ts`
- Change `"Dola-Seedream-5.0-lite"` → `"seedream-4-5-251128"` in the provider config map

### 2. `supabase/functions/generate-workflow/index.ts`
- Change `"Dola-Seedream-5.0-lite"` → `"seedream-4-5-251128"` in the Seedream fallback call

### 3. `supabase/functions/generate-tryon/index.ts`
- Change `"Dola-Seedream-5.0-lite"` → `"seedream-4-5-251128"` (the second reference that was upgraded)

## Risk
None — this is a straight revert to the previously working model ID.

