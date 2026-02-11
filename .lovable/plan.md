

## Fix: Product Looks Copy-Pasted Instead of Naturally Integrated

### Problem

The current prompt instructions tell the AI to **"Reproduce the exact product"** and **"identical shape, color, texture, branding"** — this causes the AI to literally paste the product image into the scene rather than naturally re-rendering it in the environment. The result looks like a clipping/compositing job, not a real photograph.

### Root Cause

Three phrases in the condensed multi-ref prompt (lines 112-131) cause this:

1. **"Reproduce the exact product from [PRODUCT IMAGE]"** — "reproduce" implies copy
2. **"identical shape, color, texture, branding. This is the highest priority."** — forces pixel-level matching over natural integration
3. **"Place everything in the exact environment"** — "place" implies compositing, not natural scene creation

### Solution

Rewrite the product and scene instructions to prioritize **natural integration** over pixel-perfect reproduction. The AI should understand the product's design, material, and colors, then **re-render** it naturally within the scene — matching the environment's lighting, perspective, and shadows.

### Changes

#### `supabase/functions/generate-freestyle/index.ts`

**1. Rewrite the PRODUCT requirement (line 122):**

| Before | After |
|--------|-------|
| "Reproduce the exact product from [PRODUCT IMAGE] -- identical shape, color, texture, branding. This is the highest priority." | "PRODUCT: Reference [PRODUCT IMAGE] for the product's design, shape, color, and material. Re-render it naturally within the scene -- matching the environment's lighting, perspective, shadows, and reflections. The product must look like it physically exists in the scene, NOT composited or pasted in." |

**2. Rewrite the SCENE requirement (line 130):**

| Before | After |
|--------|-------|
| "Place everything in the exact environment from [SCENE IMAGE] -- same background, lighting, atmosphere." | "SCENE: Use [SCENE IMAGE] as the environment reference. Render the entire image as one unified photograph -- consistent lighting, color temperature, and perspective across all elements. Everything must appear to exist in the same physical space." |

**3. Update the opening line for product + scene (without model) combinations:**

When user has product + scene but no model, change the generic fallback "Create a photorealistic image combining the provided references" to: "Create a photorealistic image where the product naturally exists within the scene environment."

**4. Add an anti-compositing negative instruction** to `buildNegativePrompt`:

Add: "No compositing artifacts, no mismatched lighting between elements, no pasted-in look, no cut-out edges"

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/generate-freestyle/index.ts` | Rewrite product/scene integration instructions to prioritize natural rendering over copy-paste reproduction; add anti-compositing negatives |

### Expected Result

Instead of the AI treating [PRODUCT IMAGE] as a sticker to paste onto [SCENE IMAGE], it will understand the product's design and re-render it as if it was actually photographed in that environment -- with correct lighting, shadows, perspective, and reflections.
