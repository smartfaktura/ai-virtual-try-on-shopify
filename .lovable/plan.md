
## Investigation: presets vs swimwear conflict resolution

### What user sees
On a bikini product, the "Outfit Presets" row still shows **Quiet Luxury Neutral, Streetwear Y2K, Editorial Black, Beach Linen** — but for swimwear we just hid `top`, `bottom`, `outerwear`, `shoes`. So clicking "Quiet Luxury Neutral" (which presumably defines a top + bottom + shoes outfit) does… what exactly?

### How it actually behaves today

In `OutfitPresetBar.tsx`:
```ts
const handleLoad = (preset) => {
  const cleaned = applyPresetWithLocks(preset.config, resolution);
  onLoad({ ...currentConfig, ...cleaned });
};
```

`applyPresetWithLocks` (in `outfitConflictResolver.ts`) already strips:
- the `lockedSlot` key (here: `top`)
- every key in `hiddenSlots` (here: `dress`, `outerwear`, `bottom`, `shoes`)

So for a bikini, loading "Quiet Luxury Neutral" silently drops top/bottom/shoes/outerwear/dress and only its **accessories** (bag, jewelry, watch, eyewear, hat, belt) — if the preset defines any — flow through.

**The result:** clicking the preset is technically safe (no broken prompt), but visually it's **misleading UX** — most presets don't define accessories, so the click does almost nothing. User thinks "I picked Quiet Luxury Neutral" but the panel doesn't change visibly. Confusing.

### Two reasonable fixes

**Option A — Hide irrelevant presets entirely (cleanest)**
For each preset, check if any of its config keys overlap with `availableSlots`. If zero overlap → don't render the chip. So on swimwear:
- "Quiet Luxury Neutral" → top/bottom/shoes only → hidden
- "Beach Linen" → if it has bag/hat/eyewear → kept
- Built-in presets that are pure-clothing → all hidden
- Show a one-line empty state: *"No outfit presets fit this product type — pick accessories below"*

**Option B — Show but mark as "No effect" / disabled**
Greys out incompatible presets with a tooltip "Doesn't apply to swimwear". More discoverable but visually noisy.

### Recommendation
**Option A.** ZARA-grade restraint = don't show options that don't do anything. Same philosophy we already used to hide irrelevant slots.

Bonus: same logic applies cleanly to other product types — fragrance presets won't show "Editorial Black" either, etc. Free win across categories.

### Implementation (one file, ~15 lines)

In `OutfitPresetBar.tsx`:
1. Add a `presetIsRelevant(preset, resolution)` helper:
   ```ts
   const cfg = preset.config || {};
   const definedSlots = Object.keys(cfg).filter(k => cfg[k]);
   return definedSlots.some(slot => resolution.availableSlots.includes(slot));
   ```
2. Filter `builtIn` and `userPresets` arrays through it before rendering.
3. If both filtered arrays are empty AND `availableSlots.length > 0` → render small muted hint "No presets fit this product — configure accessories below".
4. If `availableSlots.length === 0` → don't render preset row at all (already handled by parent panel).

### Files touched
- `src/components/app/product-images/OutfitPresetBar.tsx` — filter + empty state (~15 lines)

### Side-effect check
- Non-fashion / non-swimwear products: most presets define top+bottom+shoes which all stay available → no presets get hidden → zero visible change
- "Save current" button stays visible always (user can still save accessory-only outfits as a swimwear preset)
- User-saved presets get filtered the same way → if they saved "My beach look" with hat+eyewear, it stays visible on bikinis ✓

### Risk
Very low. Pure UI filter on top of the resolution we already compute. No prompt builder change, no DB change.

### Validation after fix
1. Bikini product → preset row shows only presets with accessory slots (likely just "Save current" + empty hint, or "Beach Linen" if it has accessories defined)
2. Regular tee → all 4 built-in presets still show
3. Save a bikini accessories-only preset → reappears correctly on next bikini upload
