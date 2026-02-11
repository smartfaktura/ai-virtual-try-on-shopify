

## Make Prompt Optional + Smart Auto-Prompt Engineering

### Overview
When the user skips typing a prompt but has selected assets (product, model, scene, brand profile, style presets), the system will auto-build a detailed, high-quality prompt that feeds into the existing `polishUserPrompt` pipeline — ensuring the same professional output quality.

### What Changes

#### 1. Frontend — `src/pages/Freestyle.tsx`

**Relax `canGenerate`:**
```
const hasAssets = !!selectedProduct || !!selectedModel || !!selectedScene || !!sourceImage;
const canGenerate = (prompt.trim().length > 0 || hasAssets) && !isLoading && balance >= creditCost;
```

**Auto-build a rich base prompt in `handleGenerate` when prompt is empty:**

Instead of a simple "Product photo of X", build a detailed contextual prompt:

```
let basePrompt = prompt.trim();
if (!basePrompt) {
  const parts: string[] = [];

  // Product context
  if (selectedProduct) {
    parts.push(`High-end product photography of "${selectedProduct.title}"`);
    if (selectedProduct.category) parts.push(`(${selectedProduct.category})`);
  } else if (sourceImage) {
    parts.push("Professional photo based on the provided reference image");
  }

  // Model context
  if (selectedModel) {
    const modelDesc = [selectedModel.gender, selectedModel.bodyType, selectedModel.ethnicity]
      .filter(Boolean).join(', ');
    if (selectedProduct) {
      parts.push(`worn/held by a ${modelDesc} model`);
    } else {
      parts.push(`Portrait of a ${modelDesc} model`);
    }
  }

  // Scene context
  if (selectedScene) {
    parts.push(`set in a ${selectedScene.name} environment`);
    if (selectedScene.promptHint) parts.push(`— ${selectedScene.promptHint}`);
  }

  // Brand tone hint
  if (selectedBrandProfile?.tone) {
    parts.push(`with a ${selectedBrandProfile.tone} visual tone`);
  }

  // Fallback
  if (parts.length === 0) {
    parts.push("Professional commercial photography");
  }

  basePrompt = parts.join(' ');
}
```

This auto-generated prompt then flows through the same `polishUserPrompt` function on the backend, which adds all the detailed layers (product fidelity, model identity, scene matching, camera style, brand profile, negatives).

#### 2. Backend — `supabase/functions/generate-freestyle/index.ts`

Relax the empty-prompt validation (lines 393-398):

```typescript
// Allow empty prompt if at least one image reference is provided
if (!body.prompt?.trim() && !body.sourceImage && !body.modelImage && !body.sceneImage) {
  return new Response(
    JSON.stringify({ error: "Please provide a prompt or select at least one reference (product, model, or scene)" }),
    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

If prompt arrives empty but images are present, use a sensible default:
```typescript
let enrichedPrompt = body.prompt?.trim() || "Professional commercial photography of the provided subject";
```

This ensures the `polishUserPrompt` pipeline still receives a valid base string to layer all its context on top of.

#### 3. Dynamic Placeholder — `src/components/app/freestyle/FreestylePromptPanel.tsx`

Update the textarea placeholder based on selected assets:
- **No assets selected:** "Describe what you want to create..."
- **Assets selected:** "Optional — describe extra details, or leave empty to auto-generate"

This signals to users that prompt is no longer required.

### Why Output Quality Stays High

The auto-generated prompt feeds into the existing `polishUserPrompt` function which already adds:
- Product fidelity instructions (shape, color, texture, branding)
- Model identity matching (exact face, skin tone, hair)
- Scene environment replication
- Camera rendering style (Pro/Natural layers)
- Brand profile integration (tone, color feel, keywords, palette)
- Style preset keywords
- Comprehensive negative prompts
- Selfie/UGC detection and rules

So even a simple auto-prompt like `High-end product photography of "Summer Dress" worn by a female model set in Beach Sunset environment` gets expanded into a multi-paragraph, layered professional prompt by the polish pipeline.

### Files Changed

| File | Change |
|------|--------|
| `src/pages/Freestyle.tsx` | Relax `canGenerate`; build smart auto-prompt from selected assets |
| `supabase/functions/generate-freestyle/index.ts` | Allow empty prompt when images are present; add fallback base text |
| `src/components/app/freestyle/FreestylePromptPanel.tsx` | Dynamic placeholder text when assets are selected |

