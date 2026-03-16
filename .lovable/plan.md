

## Analysis: Is the optimization reducing generation detail?

**Short answer**: Likely yes, but only slightly. The `optimizeImageForAI` helper reduces model and scene reference images to **1536px width, quality 80**. While these are reference images (not the output), Gemini uses them to understand fine details like facial features, pose, and environment texture. Lower-quality inputs can subtly reduce the AI's ability to reproduce those details in output.

The optimization is correct in principle (saves tokens, prevents timeouts), but the settings may be too aggressive for model images where facial likeness and pose accuracy matter most.

### Proposed fix

Increase quality and add model-specific sizing in the `optimizeImageForAI` helper across both edge functions:

**`supabase/functions/generate-freestyle/index.ts`** and **`supabase/functions/generate-tryon/index.ts`**:

```typescript
// Before (current)
function optimizeImageForAI(url: string): string {
  ...
  return `${transformed}${sep}width=1536&quality=80`;
}

// After — higher quality, no width constraint for better detail
function optimizeImageForAI(url: string): string {
  ...
  return `${transformed}${sep}quality=85`;
}
```

The key change: **remove the `width=1536` constraint entirely** and only apply light quality compression (`85`). This preserves the original resolution (important for model face/body detail) while still reducing file size by ~30-40% vs raw PNG. The token savings from quality compression alone are meaningful since most uploaded images are high-res PNGs.

This is a minimal, safe change — 2 lines in 2 files.

