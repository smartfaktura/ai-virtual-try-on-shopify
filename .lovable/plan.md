

# Upgrade Seedream Fallback to 5.0 Lite

## Overview
Replace all remaining `seedream-4-5-251128` references with `Dola-Seedream-5.0-lite` across the three edge functions that use it as a fallback engine.

## Changes

### 1. `supabase/functions/generate-freestyle/index.ts`
- Line ~352: Change `"seedream-4-5-251128"` → `"Dola-Seedream-5.0-lite"` in the provider config map

### 2. `supabase/functions/generate-workflow/index.ts`
- Line ~1172: Change `"seedream-4-5-251128"` → `"Dola-Seedream-5.0-lite"` in the Seedream fallback call

### 3. `supabase/functions/generate-tryon/index.ts`
- Line ~830: Change the remaining `"seedream-4-5-251128"` → `"Dola-Seedream-5.0-lite"` (the other reference on line ~808 is already upgraded)

## Risk
Minimal — same API endpoint and request format, just a model ID string swap. No schema or client-side changes needed.

