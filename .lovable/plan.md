

# Inject Theme & Brand into Try-On for Creative Drops

## Situation

Creative drops dispatch jobs to two different generation functions based on the workflow type:

- **Non-try-on workflows** → `generate-workflow` → Already injects `SEASONAL DIRECTION` and `BRAND GUIDELINES` into the prompt ✅
- **Try-on workflows** → `generate-tryon` → Ignores theme and brand entirely ❌

So the gap is **only in `generate-tryon`**, but that's the only function that breaks the chain. All other workflow types already work correctly with themes and brand profiles in creative drops.

## Change

### File: `supabase/functions/generate-tryon/index.ts`

**1. Update `buildPrompt()` signature** to accept optional creative drop context:

```ts
function buildPrompt(req: TryOnRequest, dropContext?: {
  theme?: string;
  themeNotes?: string;
  brandProfile?: Record<string, unknown>;
}): string
```

**2. Add conditional blocks** between section 3 (Photography style) and section 4 (Quality requirements), ~line 170:

- If `dropContext.theme` exists and isn't `'custom'` → inject `SEASONAL DIRECTION` block (e.g., "autumn aesthetic — warm golden lighting, fall atmosphere")
- If `dropContext.themeNotes` exists → inject `CREATIVE DIRECTION` block with user's notes
- If `dropContext.brandProfile` exists → inject `BRAND GUIDELINES` block (tone, lighting_style, color_temperature, background_style)

These blocks are only appended when the data exists — standalone try-on from `/app/generate` passes no drop context, so behavior is unchanged.

**3. Pass fields from the payload** (~line 519 where `body` is read):

```ts
const prompt = buildPrompt(body, body.creative_drop_id ? {
  theme: body.theme,
  themeNotes: body.theme_notes,
  brandProfile: body.brand_profile,
} : undefined);
```

## What This Covers

| Workflow Type | Function | Theme/Brand Support |
|---|---|---|
| Product Photography | `generate-workflow` | Already works ✅ |
| Flat Lay | `generate-workflow` | Already works ✅ |
| Interior Design | `generate-workflow` | Already works ✅ |
| All other non-try-on | `generate-workflow` | Already works ✅ |
| Virtual Try-On | `generate-tryon` | **Fixed by this change** |

## Summary
- 1 file, ~30 lines added
- Only `generate-tryon` needs the fix — all other workflow types already support themes/brand in creative drops
- Zero impact on standalone try-on (no `creative_drop_id` = no theme blocks)

