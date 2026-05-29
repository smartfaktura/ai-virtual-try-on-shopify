Update the JEWELRY REALISM (CRITICAL) prompt injection in `src/lib/productImagePromptBuilder.ts` (line 1533).

**Current text:**
```
JEWELRY REALISM (CRITICAL): No sparkle effects, no starburst reflections, no glitter particles, no fantasy light rays, no diamond twinkle overlays, no lens flare on gemstones. Jewelry must look like a real editorial photograph — tactile, dimensional, and physically believable. Reflections on metal and stones must be smooth, controlled, and natural. Never add any post-processing glow or shimmer that would not exist in a real studio photograph.
```

**New text:**
```
JEWELRY REALISM (CRITICAL): Render the jewelry as a real editorial photograph with natural metal and gemstone reflections, accurate scale, crisp edges, and physically believable material detail. Keep reflections smooth, controlled, and realistic. Do not add sparkle effects, glitter, fantasy glow, starbursts, or artificial gemstone flares.
```

**Rationale:** The new version is more directive ("Render the jewelry as..." vs "No... no... no..."), explicitly calls out desirable qualities (accurate scale, crisp edges, believable material detail), and tightens the avoid-list into a single clean sentence. No other files or logic are affected.