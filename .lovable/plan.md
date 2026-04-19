
## How outfit instructions are applied per-shot today

### The flow (per scene, independently)
For **every** scene in your batch, the prompt builder runs `resolveOutfitHintText(scene, details)` and decides what wardrobe text to inject. There are 3 possible outcomes per scene:

| Scene has `outfit_hint`? | User edited outfit? | Result for that scene |
|---|---|---|
| ✅ Yes | Override OFF | Scene's `outfit_hint` injected (your "WARDROBE NOTE: …") |
| ✅ Yes | Override ON + ≥1 slot filled | Scene hint **bypassed**, user outfit injected |
| ❌ No | User has outfit slots filled | User's outfit injected as wardrobe note |
| ❌ No | No user outfit | Falls through to category default (e.g., "neutral coordinated outfit") |

### Why your last batch looked like "only 1 shot got styling"
You picked, say, 3 scenes — only **1** of them had a curated `outfit_hint` in the DB (the scene-controlled one with the takeover banner). The other 2 had no `outfit_hint`. Because you didn't fill any slots in the Style & Outfit panel either (banner was hiding it), those 2 scenes fell into row 4 — they got the **category default** outfit text only ("simple coordinated tee + jeans + sneakers" type fallback). Not your aesthetic, not the scene's curation. That's the root of the inconsistency you noticed.

### Three problems with current behavior

1. **Outfit override is global, but scene hints are per-scene.** When you click "Edit outfit" today, your override only takes effect on scenes that *had* a hint. Scenes without a hint were already using your panel — but if the panel was empty (because the banner hid it), they got nothing custom.

2. **No "fill the gaps" mode.** If 1 of 5 scenes has a hint, the user has no way to say "use the hint where it exists, use my outfit everywhere else" cleanly — that's actually the current default but it's invisible to the user, so it feels random.

3. **Aesthetic color leaks unevenly.** Scene hints resolve `{{aestheticColor}}` to your picked color. Scenes *without* hints fall back to category defaults that **ignore** your aesthetic color → the styling visibly diverges between shots.

### Proposal — make it predictable + visible

**A. Per-scene preview chip in Step 3 (read-only this turn — proposal)**
Under the Style & Outfit panel, show a tiny list:
```
Coastal Editorial    → Scene styling (sarong + linen shirt, sand tones)
Studio Hero          → Your outfit (or "Category default — pick outfit")
Beach Detail         → Your outfit (or "Category default — pick outfit")
```
So before generating, you see exactly which scenes will be scene-controlled vs which will use your panel vs which will fall through to a default.

**B. Apply user outfit to gap-scenes too**
When `details.outfitConfig` has any slot filled, scenes **without** an `outfit_hint` should automatically use it (already happens in `defaultOutfitDirective`) **AND** explicitly carry the aesthetic color so they match the scene-controlled shots' color story. This is a one-line tweak in `defaultOutfitDirective` — pipe `aestheticColorHex/Label` into the wardrobe note.

**C. Override semantics clarified**
- Override OFF (default): scene hint wins where it exists, user outfit fills the rest, defaults only when neither
- Override ON: user outfit wins on **all** selected scenes (ignores all scene hints)

That matches mental model: "I want consistent styling across all shots = turn override on."

### Files that would change (after approval)
- `src/components/app/product-images/ProductImagesStep3Refine.tsx` — add the per-scene preview chip list (~25 lines)
- `src/lib/productImagePromptBuilder.ts` — pipe aesthetic color into `defaultOutfitDirective` so gap-scenes match (~5 lines)
- Optional: small banner copy update so it says "Active on N of M shots"

### Risk
Low. Read-only preview chip + one-line color piping. Behavior of scene-hint shots unchanged.

### Validation after fix
1. Pick 3 scenes (1 with hint, 2 without) → preview chips show "Scene styling / Your outfit / Your outfit"
2. Don't fill any slots → chips show "Scene styling / Default / Default" with subtle warning color
3. Fill outfit + flip override ON → all 3 chips read "Your outfit (override active)"
4. Generate → all 3 shots share consistent wardrobe colors keyed off the aesthetic palette
