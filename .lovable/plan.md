

# Freestyle Edge Function: Redundancy Audit and Scene Reference Quality

## Analysis Summary

After reviewing all 1102 lines, I found **4 areas of code duplication** and **1 scene reference quality issue**.

---

## Redundancy Issues

### 1. Framing Prompts Map — Duplicated Verbatim (lines 242-254 vs 760-772)
The exact same 8-entry `framingPrompts` record is defined twice: once inside `polishUserPrompt()` and again in the unpolished path of the main handler. They're identical maps with identical string templates.

**Fix:** Extract into a shared `buildFramingInstruction(framing, hasModel)` helper function used by both paths.

### 2. freestyle_generations Insert — Copy-Pasted 2x (lines 916-953 vs 988-1024)
The logic to save a record to `freestyle_generations` (building `insertData`, inserting, logging, early-finalizing the queue job) is duplicated nearly identically between the main generation path and the 429 fallback path. ~35 lines repeated.

**Fix:** Extract into a `saveFreestyleGeneration()` helper that handles insert + early finalize + cancellation check. Both paths call it.

### 3. buildContentArray Called Twice with Same Args (lines 843-850 vs 969-976)
The 429 fallback block rebuilds the content array with the same images. The only difference is the prompt text (it uses `fallbackPrompt` instead of `promptWithVariation`).

**Fix:** Minor — could reuse the content array and just swap the first text item, but low priority.

### 4. Multiple Supabase Client Instantiations (~6 separate `createClient` calls)
Lines 812, 879, 893, 907, 917, 989 each create a new Supabase client with the same URL and service role key. Each adds cold overhead.

**Fix:** Create ONE `supabase` client at the top of the request handler (around line 655) and reuse it everywhere.

---

## Scene Reference Quality Issue

### `optimizeImageForAI()` — Missing Width Constraint (line 12-19)

The function transforms Storage URLs to use the render endpoint and adds `quality=85`, but it does **not** set a `width` parameter. This means:

- **Large scene images** (e.g., 4000px originals) are sent at full resolution to Gemini. This wastes bandwidth, increases edge function latency, and doesn't improve AI output quality (Gemini resizes internally).
- **Inconsistency:** The frontend `useCustomScenes.ts` already builds optimized URLs with `width=1536&quality=80`, but if a scene was saved without pre-optimization, the edge function sends the raw full-size image.

**Current code:**
```typescript
return `${transformed}${sep}quality=85`;
```

**Fix:** Add a width cap for AI input — 1536px is the sweet spot (matches what custom scenes use, gives Gemini enough detail without waste):
```typescript
return `${transformed}${sep}width=1536&quality=85`;
```

This applies to both `modelImage` and `sceneImage` (both go through `optimizeImageForAI` at lines 491 and 496). Product images and source images are NOT optimized — they're sent raw, which is correct since product detail fidelity is critical.

---

## Implementation Plan

### File: `supabase/functions/generate-freestyle/index.ts`

**Step 1 — Fix `optimizeImageForAI` (Issue: scene quality)**
Add `width=1536` to the render URL alongside `quality=85`.

**Step 2 — Extract shared `buildFramingInstruction()` helper**
Move the framing prompts map into a single function. Use it in both `polishUserPrompt` (line 242) and the unpolished path (line 758).

**Step 3 — Extract `saveFreestyleGeneration()` helper**
Consolidate the duplicate insert + early-finalize logic into one function. Replace both call sites (main path line 916 and fallback path line 988).

**Step 4 — Single Supabase client**
Create one `createClient()` at the top of the handler and pass it to `completeQueueJob` and the inline DB operations instead of creating 6 separate instances.

**Net result:** ~80-100 lines removed, faster execution (fewer client instantiations, smaller image payloads), and a single place to maintain framing/save logic.

