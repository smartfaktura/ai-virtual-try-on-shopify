

## Freestyle Settings → Prompt Engineering Audit

### Methodology
Traced every UI setting from `Freestyle.tsx` (client) → `queuePayload` → `generate-freestyle/index.ts` (edge function) → final AI prompt.

---

### Setting-by-Setting Validation

| # | UI Setting | Sent in Payload? | Used in Prompt? | Verdict |
|---|-----------|-----------------|----------------|---------|
| 1 | **Prompt** (text) | ✅ `prompt` | ✅ Core of every prompt | ✅ OK |
| 2 | **Upload Image** (reference) | ✅ `sourceImage` (URL) | ✅ Labeled `[PRODUCT IMAGE]` or `[REFERENCE IMAGE]` + prompt instructions | ✅ OK |
| 3 | **Add Product** | ✅ `productImage` (URL) | ✅ Labeled `[PRODUCT IMAGE]` + identity preservation instructions | ✅ OK |
| 4 | **Product + Reference together** | ✅ Both sent | ✅ Dual-reference path with explicit roles | ✅ OK |
| 5 | **Model** | ✅ `modelImage` + `modelContext` | ✅ Identity matching instructions, face-aware framing | ✅ OK |
| 6 | **Scene** | ✅ `sceneImage` | ✅ Environment reproduction instructions | ✅ OK |
| 7 | **Framing** | ✅ `framing` | ✅ Detailed framing prompts for all 8 options, model-aware | ✅ OK |
| 8 | **Aspect Ratio** | ✅ `aspectRatio` | ✅ Appended to prompt text AND sent as `image_config.aspect_ratio` API param | ✅ OK |
| 9 | **Quality** (Standard/High) | ✅ `quality` | ✅ Controls AI model selection (flash vs pro) | ✅ OK |
| 10 | **Camera Style** (Pro/Natural) | ✅ `cameraStyle` | ✅ Full iPhone rendering block when "natural"; studio DNA when "pro" | ✅ OK |
| 11 | **Polish** toggle | ✅ `polishPrompt` | ✅ Gates the `polishUserPrompt()` function — raw vs enriched | ✅ OK |
| 12 | **Style Presets** | ✅ `stylePresets` (keywords) | ✅ Appended as "Style direction: ..." | ✅ OK |
| 13 | **Brand Profile** | ✅ `brandProfile` (tone, colorFeel, doNotRules, keywords, palette, audience) | ✅ Full `BRAND STYLE GUIDE` block in polished path; condensed in multi-ref path; basic in unpolished path | ✅ OK |
| 14 | **Negatives** (Exclude) | ✅ `negatives` | ✅ Merged with brand doNotRules, deduped, appended to negative block | ✅ OK |
| 15 | **Product Dimensions** | ✅ `productDimensions` | ✅ Scale instructions in product identity block | ✅ OK |
| 16 | **Selfie Detection** | N/A (auto) | ✅ Keyword detection → selfie composition, framing, iPhone override | ✅ OK |
| 17 | **Full-body Detection** | N/A (auto) | ✅ Keyword detection → full-body framing fallback | ✅ OK |

**Result: All 17 settings are correctly wired end-to-end.** No setting is silently dropped.

---

### Issues Found (3 improvements)

#### 1. Style Presets injected as raw keywords, not as prompt-engineered instructions
**Problem:** Line 708-709 in edge function: `Style direction: cinematic lighting, shallow depth of field, warm tones, dramatic shadows, film grain`. This is injected *before* `polishUserPrompt()` processes the prompt, so it becomes part of the raw text that gets wrapped in professional photography instructions. The keywords work but could conflict with camera style (e.g., "shallow depth of field" from Cinematic preset contradicts Natural camera style's "deep depth of field" instruction).

**Fix:** In the edge function, after polish is applied, detect conflicting preset keywords vs camera style and strip contradictions. Specifically: if `cameraStyle === 'natural'`, filter out "shallow depth of field" and "bokeh" from preset keywords before injection.

#### 2. Polish OFF path missing framing instructions
**Problem:** When `polishPrompt` is `false` (lines 722-745), the unpolished path handles brand profile and negatives and camera style, but does **NOT** inject framing instructions. A user who selects "Hand / Wrist" framing but turns off Polish will get no framing guidance in the prompt.

**Fix:** Add framing prompt injection to the unpolished path, using the same `framingPrompts` map.

#### 3. Polish OFF path missing style presets
**Problem:** Style presets are injected at line 708 *before* the polish/unpolished branch, so they ARE included in both paths — this is actually fine. ~~No issue here.~~ However, the presets are injected as raw comma-separated keywords without any structural framing (e.g., no "Apply these visual styles:" prefix in the unpolished path). Minor but could be clearer.

**Fix:** No action needed — works correctly.

---

### Recommended Changes — 2 files

#### `supabase/functions/generate-freestyle/index.ts`

**Fix 1 — Strip conflicting preset keywords when Natural camera:**
After line 709, add logic:
```typescript
if (body.cameraStyle === 'natural' && body.stylePresets?.length) {
  const conflicting = ['shallow depth of field', 'bokeh', 'film grain'];
  const filtered = body.stylePresets.filter(kw => 
    !conflicting.some(c => kw.toLowerCase().includes(c))
  );
  if (filtered.length > 0) {
    enrichedPrompt = `${enrichedPrompt}\n\nStyle direction: ${filtered.join(", ")}`;
  }
} else if (body.stylePresets?.length) {
  enrichedPrompt = `${enrichedPrompt}\n\nStyle direction: ${body.stylePresets.join(", ")}`;
}
```
Replace existing lines 708-709.

**Fix 2 — Add framing to unpolished path:**
After the camera style block in the unpolished branch (after line 744), add:
```typescript
if (body.framing) {
  const framingPrompts: Record<string, string> = { /* same map as in polishUserPrompt */ };
  if (framingPrompts[body.framing]) {
    unpolished += `\n\n${framingPrompts[body.framing]}`;
  }
}
```

---

### Summary

The freestyle pipeline is well-engineered — all settings reach the AI prompt correctly. The two actionable fixes are:
1. **Preset ↔ Camera Style conflict resolution** (prevents "shallow DOF" fighting "deep DOF")
2. **Framing support in unpolished path** (edge case when Polish is off)

Both are small, targeted changes to the edge function only.

