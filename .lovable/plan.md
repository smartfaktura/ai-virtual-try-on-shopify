## Fix confusing "Who's at the table" copy for Food & Drink

The previous pass over-indexed on plated-meal photography and renamed cast/interaction copy to table/dish vocabulary. That breaks for beverages (can outdoors), snacks (pack of chips), ingredients, and packaged goods — none of which involve a table.

### Changes (copy only, no logic)

**`src/features/brand-scenes/wizard/steps/Step4Cast.tsx`**
- Remove the `isFood` rename branch (lines ~149–163). Food now uses the same neutral labels as other categories:
  - Cast title: "Who's in the shot"
  - Interaction title: "How the product appears"
  - Interaction help: default
- Keep the chip labels generic: `hands` → "Hands holding" (instead of "Hands & cutlery"), `solo` → "Person with product" (instead of "Person at table"). These work for a barista pouring, someone holding a chip bag, or plating a dish.

**`src/features/brand-scenes/wizard/step4Flow.ts`**
- Drop the `isFood` validation-message branch (lines ~125–129). Use the default "Choose who's in the shot" / "Pick how the product appears".

**`src/features/brand-scenes/wizard/BrandSceneWizard.tsx`**
- Drop the food-specific step title/subtitle override (lines ~102–112). Cast step uses the default "Who's in the shot?" title and standard subtitle for every module, including Food & Drink.

### Out of scope
Interaction options (Pouring / Holding / Using / Steaming / Placed beside / Product only) and surface/setting pools stay — those additions are correct and not tied to a "table" assumption.