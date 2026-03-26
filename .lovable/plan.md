

# Fix: Wire Framing Selection Into Freestyle Generation Prompt

## Problem

The framing pill (Full Body, Upper Body, Close-Up, etc.) is **purely cosmetic right now**. The frontend sends `framing: "full_body"` in the payload, but the edge function **never reads it or injects it into the prompt**. Selecting "Full Body" has zero effect on the AI output — which is why you got a half-portrait instead.

This affects both Nano Banana and Seedream equally — neither provider receives framing instructions.

## Fix

### File: `supabase/functions/generate-freestyle/index.ts`

**1. Add framing prompt builder function**

Port the `buildFramingPrompt()` logic from `src/lib/framingUtils.ts` into the edge function (since edge functions can't import from the frontend). This maps framing values like `full_body` to explicit AI instructions like `"Full body shot, head to toe. Show the complete outfit and full figure."`.

**2. Inject framing into the prompt construction**

In the prompt-building section (where `PRODUCT SCALE`, `GENDER RULE`, scene isolation, and brand DNA blocks are assembled), add a `FRAMING` block when `body.framing` is set:

```typescript
if (body.framing) {
  const framingInstruction = buildFramingPrompt(body.framing, !!body.modelImage);
  promptParts.push(framingInstruction);
}
```

This should be injected as a high-priority instruction (near the top of the system prompt, alongside PRODUCT SCALE) since framing directly controls composition.

**3. Pass framing to Seedream prompt too**

When building the Seedream text prompt, append the same framing instruction so both providers respect it equally.

## What This Does NOT Do
- No UI changes — the framing pill already works in the frontend
- No database changes
- No changes to fallback logic

## Files Modified
- `supabase/functions/generate-freestyle/index.ts` — add `buildFramingPrompt()`, inject framing into prompt construction for both providers

