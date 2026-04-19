
## Plan: "Edit Outfit" override for scene-controlled outfits + Appearance audit

### Part A — Edit Outfit override

**Current behavior**
When ANY selected scene has `outfit_hint`, the Style & Outfit panel is fully replaced by the banner ("Outfit is directed by your selected shots") and the user has zero way to override. Scene `outfit_hint` always wins in `productImagePromptBuilder.ts`.

**Proposed change**

1. **Add "Edit outfit" button** inside the takeover banner (right-aligned, ghost style).
2. **Click reveals the full OutfitSlotCard grid below the banner** (collapsible, smooth expand). Banner copy updates to: *"Scene styling is active. Your edits will override it for this generation."*
3. **Add a per-product flag** `outfitOverrideEnabled: boolean` (UI state only, lives in Step 3 component state — no DB change).
4. **Prompt builder priority update** (`productImagePromptBuilder.ts`): when `outfitOverrideEnabled === true` AND user `outfitConfig` has any non-empty slot → use user's outfit and IGNORE `scene.outfitHint`. Falls back to scene hint otherwise (today's behavior).
5. **Visual cue**: when override is active, banner switches to a subtle "Custom outfit active · Reset to scene styling" pill so the user always knows which mode they're in.

**Why this is safe**
- Pure additive UI + one extra branch in the prompt builder priority chain
- Scene-hint default behavior unchanged for users who don't click Edit
- No DB migration, no schema change
- Multi-scene case: override applies to ALL selected scenes uniformly (matches how scene-hint takeover already works)

**Files touched**
- `src/components/app/product-images/ProductImagesStep3Refine.tsx` — banner + button + collapsible outfit grid (~30 lines)
- `src/lib/productImagePromptBuilder.ts` — priority flip when override flag is set (~5 lines)

---

### Part B — Appearance setup audit

User asks "does appearance setup work?" — I need to verify before claiming. Will inspect this turn (read-only):

- The Appearance section UI in Step 3 (skin tone / hair / makeup / etc. controls)
- Whether selections flow into `outfitConfig` or a separate `appearanceConfig`
- Whether the prompt builder reads those fields and injects them into the final prompt
- Whether `wantsPeople` / `personDirective` token picks them up

**If broken**: separate small fix in next turn — wire appearance fields into `personDirective` builder so they actually reach Gemini.

**If working**: confirm to user with the exact prompt fragment that gets injected so they can trust it.

---

### Risk
Very low. Part A is additive UI + one prompt-builder branch. Part B is read-only audit this turn; any fix will be a small targeted edit.

### Validation after Part A ships
1. Pick a scene with `outfit_hint` (e.g., "Coastal Editorial") + jeans → banner appears with Edit button
2. Click Edit → outfit grid expands, banner copy updates
3. Pick a top color/material → generate → outfit appears in image, scene mood preserved
4. Click "Reset to scene styling" → grid collapses, scene hint takes over again
