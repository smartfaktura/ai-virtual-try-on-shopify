## Add anti-sparkle saugiklis for all jewelry scenes

Add a jewelry-specific negative directive in the prompt builder that appends to every jewelry category scene. This prevents the AI model from adding fantasy sparkle/glitter effects.

### Implementation

**File: `src/lib/productImagePromptBuilder.ts`**

In the final prompt assembly (around the saugikliai / negative prompt area, near the end of `buildDynamicPrompt`), add a category check: if the product's category is a jewelry type (`necklaces`, `earrings`, `rings`, `bracelets`, or parent `jewelry`/`jewellery`), append a hard negative directive:

```
JEWELRY REALISM (CRITICAL): No sparkle effects, no starburst reflections, no glitter particles, no fantasy light rays, no diamond twinkle overlays, no lens flare on gemstones. Jewelry must look like a real editorial photograph — tactile, dimensional, and physically believable. Reflections on metal and stones must be smooth, controlled, and natural. Never add any post-processing glow or shimmer that would not exist in a real studio photograph.
```

This will be injected as a saugiklis for all jewelry scenes regardless of which specific scene template is used, ensuring consistent anti-sparkle enforcement even for scenes that currently use phrases like "refined sparkle" or "believable sparkle".

### Technical detail

- Check `analysis?.category` against jewelry category IDs (same set used in `categoryConstants.ts`)
- Inject after the prompt is assembled but before final cleanup, alongside existing saugikliai
- No database changes needed — this is a client-side prompt builder change only
