

## Fix: outfit picker for "Wearing" interaction — pair the product, don't lock it out

### The bug
When the user picks the **Wearing** interaction (e.g. a crop top), the Outfit card collapses to *"Outfit is locked by the product you're wearing."* But a crop top only covers the torso — the model still needs **bottoms, shoes, and accessories**. Today the AI fills those slots arbitrarily (random jeans, sneakers, jewellery), which breaks the clean luxury look.

### The fix — "Pair with…" mode
When interaction = `wearing` (or `worn`), the Outfit card stays visible but switches to **Pair Mode**:

- Card title becomes: **Pair Outfit**
- Subtitle: *"Style the rest of the look around the {product type} you're wearing."*
- Same 8-tile grid layout, but with **complement presets** that only describe **the other slots** (never the product's own slot).
- "Auto" stays as the first/default tile and means *"let the AI pick neutral complementary pieces."*

For non-wearing interactions (applying, holding, spraying, etc.) the existing Outfit card stays exactly as today.

### Slot detection (lightweight)
We infer which slot the product occupies from the product's normalized category (already present on the product analysis: `garments`, `shoes`, `jewellery`, `bags`, `eyewear`, `accessories`, etc.) plus a quick keyword scan on the product name/type for sub-slots:

- **top** → tee, shirt, blouse, top, crop, sweater, knit, hoodie, jacket, blazer, coat, dress (full), set
- **bottom** → jeans, trousers, pants, shorts, skirt, leggings
- **shoes** → all `shoes` category
- **bag / jewellery / eyewear** → those categories

If the product is a **dress / set / jumpsuit** → it covers top+bottom, so pair mode only suggests shoes + accessories.

### The 8 "Pair with…" presets
All slot-aware. Each preset's phrase is generated dynamically so it skips the product's slot. Concept labels (≤4 words):

| # | Label | Pairs (when product = top) | Pairs (when product = bottom) | Pairs (when product = shoes) |
|---|---|---|---|---|
| 1 | **Auto Pair** ⭐ | neutral complement | neutral complement | neutral complement |
| 2 | **Light Denim** | light-wash straight jeans + white sneakers | crisp white tee + white sneakers | light-wash jeans + plain white tee |
| 3 | **Tailored Black** | black tailored trousers + black loafers | plain black tee + black loafers | black tee + black tailored trousers |
| 4 | **Cream Linen** | wide-leg cream linen trousers + tan sandals | cream linen shirt + tan sandals | cream linen shirt + wide-leg trousers |
| 5 | **Soft Beige** | tonal beige joggers + clean white sneakers | tonal beige hoodie + clean sneakers | beige hoodie + tonal joggers |
| 6 | **Crisp White** | white wide-leg trousers + minimal sandals | crisp white shirt + minimal sandals | white shirt + white wide-leg trousers |
| 7 | **Grey Knit** | mid-grey straight trousers + white sneakers | oversized grey knit + white sneakers | grey knit + grey straight trousers |
| 8 | **Camel Trench** | dark slim jeans + clean leather boots | white tee + camel trench + leather boots | white tee + camel trench + slim jeans |

Each preset stores a small structured config (`{ bottom, shoes, top, outerwear, accessories }`) and the resolver assembles the final phrase by concatenating only the slots the product does **not** occupy. Final injected phrase pattern: `"paired with {bottom}, {shoes}, accessories minimal and quiet"`.

When product = full coverage (dress / jumpsuit / co-ord set), pair presets reduce to footwear + accessory only (e.g. *"paired with clean white sneakers, minimal silver jewellery"*).

### Backend (`generate-workflow/index.ts`)
No structural change — the new phrases still flow through the existing `outfit_phrase` field and get injected into the **OUTFIT STYLING** block. The existing safeguard (no logos, no costume vibe, neutral palette, no competing patterns) already covers pair mode. We add one extra negative-prompt line **only in pair mode**: *"do not replace or duplicate the product the subject is already wearing; complement it with the paired pieces only."*

### Files touched
1. **Edit** `src/lib/ugcOutfitPresets.ts`
   - Add a second preset list `UGC_PAIR_PRESETS` with the slot-structured config above.
   - Add helper `detectProductSlot(productCategory, productName)` → returns `'top' | 'bottom' | 'shoes' | 'dress' | 'bag' | 'jewellery' | 'eyewear' | 'other'`.
   - Add helper `resolveUgcPairPhrase(presetId, productSlot)` → returns the assembled "paired with …" phrase, skipping the product's slot.
   - Replace `isOutfitLockedByInteraction` usage with `isWearingInteraction` (same detection, clearer name).
2. **Edit** `src/components/app/generate/WorkflowSettingsPanel.tsx`
   - Accept new prop `productSlot?: string`.
   - When `isWearingInteraction(ugcInteractionPhrase)` is true → render the Pair Mode header + the 8 `UGC_PAIR_PRESETS` tiles (instead of the locked info note).
   - Otherwise → keep current outfit picker.
3. **Edit** `src/pages/Generate.tsx`
   - Compute `productSlot` from the selected product's category + name and pass into the panel.
   - In both enqueue payloads, branch:
     - if wearing interaction → `outfit_phrase = resolveUgcPairPhrase(ugcOutfit, productSlot)`
     - else → existing `resolveUgcOutfitPhrase(...)`
   - Reset `ugcOutfit` to `'auto'` whenever the interaction switches into/out of wearing (avoid carrying stale IDs between modes).
4. **Edit** `supabase/functions/generate-workflow/index.ts`
   - When the `outfit_phrase` starts with `"paired with"`, append the pair-mode safeguard line to negative prompt additions. (Tiny conditional, no template change.)

### Validation
- Pick a **crop top** + **Wearing it** → Outfit card now shows *"Pair Outfit"* with 8 tiles. Picking *Light Denim* → results show the crop top on the model with light-wash jeans + white sneakers across all scenes. No random bottoms.
- Pick a **dress** + **Wearing it** → pair tiles still show, but the assembled phrase only adds shoes + accessories.
- Pick a **fragrance** + **Spraying** → existing outfit picker behaviour, unchanged.
- Pick **Wearing**, then switch to **Holding it up** → outfit card reverts to the current full presets, `ugcOutfit` resets to Auto.

### Out of scope
No new presets for non-wearing mode, no DB schema change, no new admin tools, no other workflows touched.

