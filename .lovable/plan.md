# Widen Food & Drink so every real commerce scenario fits

## What I broke last pass

The previous pass tightened `cast_presets`, `interactions`, and `scale` for `food-drink` and its subfamilies inside `src/features/brand-scenes/wizard/registry/categoryPresets.ts`. The food-photography vocabulary was right, the cardinality was wrong — I cut out:

- Two-people / group lifestyle (cheers on a rooftop, friends sharing a meal, family table).
- `holding` + `using` for beverages and food (a person on a beach holding a can, sipping coffee, biting a snack, opening a chip bag).
- Pocket and carry scales (a sachet, an energy can, a multi-pack of chips).
- Outdoor setting pools for food subfamilies in `settingsBySubfamily.ts` are sparse (only `outdoor_nature` is populated, no `outdoor_location`), so picking "Outdoor location" produces an empty suggestion list.

Net result: Beverages forced to hands-only studio shots, Food forced to plating, Snacks couldn't be packaged-goods.

## Fix — widen defaults, trim only what's truly impossible

### A. `categoryPresets.ts` — family-level defaults

```ts
"food-drink": {
  scale: ["pocket", "handheld", "carry"],
  default_scale: "handheld",
  lens: ["macro", "standard", "portrait"],
  depth_of_field: ["shallow", "balanced"],
  interactions: [
    "beside", "hero", "holding", "using",
    "pouring", "plating", "cutting", "garnishing", "dipping", "steaming",
  ],
  cast_presets: ["none", "hands", "solo", "two", "group"],
  default_cast: "none",
  // settings unchanged — unused by SceneTypePicker
  surfaces: [...kept],
  body_part_focus: ["hands", "face", "detail"],
  hands_on_product: ["pour", "cradle", "cap"],
  ...
}
```

### B. Subfamily blocks — additive, never trim cast presets

```ts
sub: {
  beverages: {
    default_cast: "hands",
    interactions: ["pouring", "holding", "using", "beside", "hero", "steaming"],
    hands_on_product: ["pour", "cradle", "cap"],
    // inherits cast_presets [none, hands, solo, two, group]
  },
  food: {
    default_cast: "none",
    interactions: ["plating", "garnishing", "cutting", "steaming",
                   "holding", "using", "beside", "hero"],
  },
  "snacks-food": {
    default_cast: "none",
    scale: ["pocket", "handheld", "carry"],
    interactions: ["holding", "dipping", "pouring", "using", "beside", "hero"],
  },
}
```

### C. `settingsBySubfamily.ts` — populate the missing scene-type pools

```ts
"food-drink/beverages": {
  indoor_lifestyle: [...kept, "Hotel lounge", "Co-working café"],
  outdoor_location: ["Rooftop bar", "Beach club", "Street café terrace", "Park bench"],
  outdoor_nature: ["Picnic blanket", "Garden bench", "Lakeside dock", "Mountain ridge"],
  studio: [...kept],
},
"food-drink/food": {
  indoor_lifestyle: [...kept],
  outdoor_location: ["Backyard table", "Restaurant patio", "Market stall"],
  outdoor_nature: [...kept, "Beach picnic", "Forest table"],
  studio: [...kept],
},
"food-drink/snacks-food": {
  indoor_lifestyle: [...kept, "Couch & coffee table", "Office desk", "Dorm bed"],
  outdoor_location: ["Stadium seat", "Skate park bench", "Convenience-store front", "Road-trip car"],
  outdoor_nature: ["Hiking trail rock", "Beach blanket"],
  studio: [...kept],
},
```

## Files

- `src/features/brand-scenes/wizard/registry/categoryPresets.ts` — A + B
- `src/features/brand-scenes/wizard/registry/settingsBySubfamily.ts` — C

## Out of scope

- Cast labels (`Food alone` / `Hands & cutlery` / `Person at table`) — they keep their food-aware copy and the generic labels (`Two people`, `Group`) return for the newly re-allowed presets.
- Interaction directives in `buildCastDirective.ts`, surfaces, and module-step copy — those were correctly scoped; nothing to widen.
- Other modules (fashion, footwear…) — they weren't touched in the last pass.

## Validation

1. Beverages → Cast: all 5 cast presets, chips include `Pouring`, `Using`, `Holding`; scale offers `Pocket`, `Handheld`, `Carry`.
2. Beverages → Where → Outdoor location: settings list shows Rooftop bar / Beach club / Street café terrace / Park bench.
3. Food → Cast: `Plating`, `Holding`, `Using` all selectable; `Group` available for family-meal shots.
4. Snacks → Cast: `Holding` (hold the bag), `Pouring` (into bowl), `Dipping`; scale includes `Pocket` (sachet) and `Carry` (multi-pack).
5. Generate a `Beverages + solo + using` scene with Outdoor location → directive renders sipping verbiage, setting line resolves to an outdoor location.
