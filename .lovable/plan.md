

## Problem: Polish Function Conflicts with Detailed User Prompts

### What's happening

When you write a detailed prompt (900+ chars with specific camera settings, lighting, style), the `polishUserPrompt` function adds **conflicting layers** on top:

| Your prompt says | Polish adds | Conflict |
|---|---|---|
| "50mm lens, aperture f/2.8" | "Shot on 85mm f/2.8 lens" | Different focal length |
| "natural daylight, overcast sky" | "Professional studio lighting with sculpted shadows" | Studio vs natural |
| "luxury streetwear editorial" | Generic "Professional photography:" prefix | Redundant |
| Detailed framing description | Default "upper body, rule of thirds" framing | Overrides your intent |

The polished prompt becomes ~3000+ chars of often contradictory instructions, confusing the AI model.

### Fix: Detect Expert Prompts and Use Light Polish

Add a **prompt sophistication check** in `polishUserPrompt`. If the user's prompt is already detailed (contains camera/lens terms, is longer than ~300 chars, includes lighting descriptions), use a **light polish** that only adds:
- Model identity matching (when model chip selected)
- Anatomy/negative constraints
- Brand profile (if selected)

But **skips**:
- Photography DNA (the conflicting 85mm/studio lighting block)
- Default framing override
- "Professional photography:" prefix

### Changes in `supabase/functions/generate-freestyle/index.ts`

**1. Add expert prompt detection function (~line 83)**
```typescript
function isExpertPrompt(prompt: string): boolean {
  const lower = prompt.toLowerCase();
  const signals = [
    /\d+mm/, /f\/\d/, /iso\s*\d/, /aperture/, /focal length/,
    /shutter speed/, /depth of field/, /bokeh/, /lens/,
    /color balance/, /color temperature/, /kelvin/,
  ];
  const matchCount = signals.filter(r => r.test(lower)).length;
  return prompt.length > 300 && matchCount >= 2;
}
```

**2. Update the non-selfie branch in `polishUserPrompt` (~line 230-237)**

Currently:
```typescript
layers.push(`Professional photography: ${rawPrompt}`);
const wantsPeople = context.hasModel || context.hasProduct || !!rawPrompt.trim();
layers.push(wantsPeople ? buildPhotographyDNA() : buildGenericDNA());
```

Changed to:
```typescript
const expert = isExpertPrompt(rawPrompt);
if (expert) {
  // Expert prompt: user already specified camera/lighting — don't override
  layers.push(rawPrompt);
} else {
  layers.push(`Professional photography: ${rawPrompt}`);
  const wantsPeople = context.hasModel || context.hasProduct || !!rawPrompt.trim();
  layers.push(wantsPeople ? buildPhotographyDNA() : buildGenericDNA());
}
```

**3. Skip default framing for expert prompts (~line 317-327)**

Currently adds default "upper body, rule of thirds" framing when no explicit framing chip is selected. For expert prompts, skip this — the user's prompt already describes the composition.

```typescript
if (!framing && !expert) {
  // ... existing default framing logic
}
```

**4. Keep essential layers for expert prompts**

These layers are still added even for expert prompts (they don't conflict):
- MODEL IDENTITY (line 290) — needed for face matching
- PORTRAIT QUALITY (line 313) — skin detail rules
- Negative/anatomy constraints (line 370+)
- Brand profile (line 240)
- Camera style override if "natural" selected (line 339)

### Result

- **Short/simple prompts** ("girl wearing hoodie in city"): Full polish as before
- **Detailed expert prompts** (900+ chars with camera specs): Light polish — keeps your settings, only adds model identity + safety constraints

### Files Changed
| File | Change |
|---|---|
| `supabase/functions/generate-freestyle/index.ts` | Add `isExpertPrompt()`, conditionally skip DNA/framing for detailed prompts |

