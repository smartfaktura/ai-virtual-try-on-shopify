
## Plan: Swimwear-aware outfit slots

### The problem
User uploaded swimwear → Style & Outfit panel still shows Top, Bottom, Outerwear, Shoes etc. For swimwear, none of those make sense. Only **accessories** (sunglasses, hat, bag, jewelry, watch) should appear. Shoes should be hidden by default (barefoot/beach).

### Root cause
`src/lib/outfitConflictResolver.ts` already has a swimwear branch, but it's too permissive:

```ts
// Generic bikini → treat as set
return { lockedSlot: 'top', hiddenSlots: new Set(['dress', 'outerwear']),
         availableSlots: ['shoes', ...ACCESSORY_SLOTS], hideOutfitPanel: false };
```

Two issues:
1. `shoes` is in `availableSlots` → shouldn't be (beach context)
2. `bottom` is NOT hidden for the bikini-set case → leaks through as a configurable slot
3. One-piece swimsuit branch hides top/bottom/outerwear but still leaves `shoes` available

### Fix (one file, ~10 lines)

Update all 3 swimwear branches in `resolveOutfitConflicts`:

| Case | Locked | Hidden | Available |
|------|--------|--------|-----------|
| One-piece / monokini | `dress` | top, bottom, outerwear, shoes | accessories only |
| Bikini top only | `top` | dress, outerwear, bottom, shoes | accessories only |
| Bikini bottom only | `bottom` | dress, outerwear, top, shoes | accessories only |
| Generic bikini set | `top` | dress, outerwear, bottom, shoes | accessories only |

Same logic for `cat === 'swimwear'`.

### Why no shoes by default
Beach / pool / water editorial = barefoot. If a user really wants sandals, Phase 4 can add a tiny "+ Add footwear" escape hatch — but for v1 the cleanest ZARA-grade behavior is barefoot default.

### Side-effect check
- Prompt builder already skips empty/hidden slots → no broken prompts
- Scene-hint takeover banner unaffected
- Presets: `applyPresetWithLocks` already strips hidden keys silently → loading a "casual outfit" preset onto a bikini cleanly drops top/bottom/shoes
- Non-swimwear products: zero change

### File touched
- `src/lib/outfitConflictResolver.ts` — swimwear block only (~10 lines)

### Validation after fix
1. Upload bikini top → only accessories appear in Style & Outfit
2. Upload one-piece swimsuit → only accessories appear, dress slot locked to product
3. Upload generic "swimwear set" → top locks to product, accessories show, no shoes
4. Upload regular tee → unchanged (top/bottom/shoes/outerwear all show)

### Risk
Very low. Single function, single category branch, additive hide list.
