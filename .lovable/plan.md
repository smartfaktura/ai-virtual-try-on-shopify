

## Updated Plan: Product Perspectives — Reference Image Upload for Back Angle

### The Problem
When a user selects "Back Angle" as a variation, the AI has never seen the back of the product. Generating a back view from a front-facing image will produce hallucinated results. The user should be prompted to optionally upload a back reference image for that specific angle.

### Design

In the **VariationsModal / Perspectives page**, when the user checks "Back Angle":
- A conditional upload zone appears below the checkbox: *"Upload a back view of your product for best results (optional)"*
- If they upload a reference image, it's sent as a secondary `referenceImages.back` in the generation payload alongside the main source image
- If they skip it, the AI generates its best guess (with a disclaimer badge: "AI-imagined back view")
- Same pattern could extend to Left/Right side if the user has a specific side image

### Updated Variation Type Config

Each variation type gets a new `referenceUpload` config:

```typescript
interface VariationType {
  id: string;
  label: string;
  instruction: string;
  icon: LucideIcon;
  referenceUpload?: {
    prompt: string;        // "Upload back view of your product"
    recommended: boolean;  // true = show upload zone when checked
  };
}
```

Only "Back Angle" gets `referenceUpload.recommended: true` initially. Left/Right sides get it as optional (not auto-shown).

### Flow

```text
User checks "Back Angle" checkbox
  → Upload zone slides in: "Upload back product image for best results (optional)"
  → User uploads (or skips)
  → On generate: payload includes { back_reference_url: "..." } if uploaded

Edge function receives back_reference_url:
  → Sends both source + back reference to the AI model
  → Prompt: "Generate a back angle view. Use the provided back reference image for accurate product details."
```

### Files Changed

| File | Change |
|------|--------|
| `src/pages/Perspectives.tsx` | Add conditional upload zone per variation type when it has `referenceUpload` config |
| `src/hooks/useGeneratePerspectives.ts` | Include `reference_images` map in payload |
| `supabase/functions/generate-freestyle/index.ts` | Handle `reference_images` object — pass additional reference to AI model |
| `src/hooks/useFileUpload.ts` | No changes needed — reuse existing hook |

### Integration with Previous Plan
This is an **addendum** to the existing Product Perspectives plan. The conditional upload zone is part of the Perspectives page UI. The full implementation order:

1. Database migration (workflow row)
2. Perspectives page with multi-product, multi-ratio, angle checkboxes, **+ conditional reference uploads**
3. Hook for batch enqueue with reference images
4. Edge function update for variation instructions + reference images
5. Library button linking to Perspectives page

