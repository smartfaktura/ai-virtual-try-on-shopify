

## Freestyle Generator — Confirmed Fix Plan

### What's real and safe to fix (3 targeted changes)

**Fix 1: Editing intent bypass** (P1 — biggest user-facing bug)
- File: `supabase/functions/generate-freestyle/index.ts`, inside `polishUserPrompt()` (line ~153)
- Add `detectEditingIntent()` function (~15 lines) checking keywords: extract, remove, isolate, cut out, erase, clean up, change background, replace, recolor, crop, make transparent, delete text, fix, enhance, sharpen
- At the top of `polishUserPrompt`, if editing intent is detected AND `refCount === 1` AND no model/scene attached: return the raw prompt + minimal quality line ("High resolution, clean result, no AI artifacts, no collage layouts.") — skip ALL photography DNA, product identity, framing, portrait quality, and anatomy rules
- This only triggers for simple single-image edits. Multi-ref generations are completely untouched

**Fix 2: Framing suppression** (P2 — conflicting instructions)
- File: `supabase/functions/generate-freestyle/index.ts`
- Lines 322-327: Wrap the product-only framing block in `if (!framing)` so explicit framing chip suppresses it
- Lines 371-381: Already have `if (!framing && !expert)` guard — confirmed correct, no change needed
- Condensed path (line 215): Already handles framing correctly — no change needed
- Net change: 1 line added (`if (!framing)` before line 323)

**Fix 3: Condensed mode numbering** (P2 — duplicate step numbers)
- File: `supabase/functions/generate-freestyle/index.ts`, lines 166-197
- Replace the boolean arithmetic on lines 170, 178, 196 with a simple `let stepNum = 1` counter that increments after each section
- Current bug: `[context.hasProduct, context.hasModel].filter(Boolean).length + 1` can produce duplicate "2." when product+source are both present
- Fix is mechanical: `stepNum++` after each `parts.push()`

### What I'm NOT touching (and why)
- **Model/scene URL expiration**: Most URLs are public Supabase storage — low risk, can be Phase 2
- **Retry data loss**: Real but lower priority — no generation failures caused by this
- **Duplicate useEffect line 536**: Harmless, can clean up separately
- **Prompt layering rewrite**: The layers work well for 95% of cases; the 3 fixes above handle the actual conflicts
- **Queue race conditions**: Current trigger-based system is solid; no evidence of real user-facing issues
- **Credit timing / cost tiers**: Working correctly as-is

### Risk assessment
- Fix 1: Zero risk to existing generations — only triggers on editing keywords with single image input. The 95% photography path is completely untouched
- Fix 2: One-line guard — if user selected a framing chip, we skip the generic "creative angle" text. Strictly better
- Fix 3: Mechanical counter replacement — same sections, same content, correct numbering

### Files changed
- `supabase/functions/generate-freestyle/index.ts` only (auto-deploys)
- No database changes
- No frontend changes
- No new dependencies

