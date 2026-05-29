## Add Socks option to SHOES slot

In `src/lib/outfitVocabulary.ts`, append a new entry to `SHOE_TYPES` (after Mule):

```ts
{ id: 'socks', label: 'Socks', subtypes: ['ankle', 'crew', 'knee-high', 'sheer', 'ribbed'], materials: ['cotton', 'wool', 'sheer nylon'] },
```

This makes "Socks" selectable in the Outfit Styling → SHOES row when manual styling is used. It flows through the existing OUTFIT LOCK directive automatically (e.g. `Shoes: black ribbed crew socks`), no prompt-builder changes needed.

No other files require changes — the chip grid renders directly from `SHOE_TYPES`.