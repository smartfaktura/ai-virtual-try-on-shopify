export const FOOD_ARCHETYPES = [
  { value: "overhead_tableau", label: "Overhead Tableau" },
  { value: "editorial_closeup", label: "Editorial Close-Up" },
  { value: "in_pour_action", label: "In-Pour / In-Action" },
  { value: "rustic_table", label: "Rustic Table" },
  { value: "architectural_still_life", label: "Architectural Still-Life" },
] as const;

export const FOOD_PRODUCT_TYPES = [
  { value: "beverage", label: "Beverage" },
  { value: "snack", label: "Snack" },
  { value: "meal", label: "Meal" },
  { value: "dessert", label: "Dessert" },
  { value: "ingredient", label: "Ingredient" },
  { value: "packaged_good", label: "Packaged good" },
] as const;

export const FOOD_PRESENTATIONS = [
  { value: "top_down", label: "Top-down flat-lay", hasPerson: false },
  { value: "editorial_45", label: "Three-quarter editorial", hasPerson: false },
  { value: "in_pour_motion", label: "Pour / steam / drip", hasPerson: false },
  { value: "macro", label: "Macro detail (texture)", hasPerson: false },
  { value: "paired_with_hands", label: "Hands plating / serving", hasPerson: true },
] as const;

/** Curated food-photography surfaces surfaced as chips on the module step. */
export const FOOD_SURFACE_CHIPS = [
  { value: "marble_slab", label: "Marble slab" },
  { value: "butcher_block", label: "Butcher block" },
  { value: "slate", label: "Slate" },
  { value: "ceramic_glaze", label: "Ceramic plate" },
  { value: "parchment", label: "Parchment" },
  { value: "raw_wood", label: "Raw wood" },
  { value: "linen", label: "Linen drape" },
  { value: "polished_stone", label: "Polished stone" },
] as const;

export const FOOD_CAMERA_FEELS = [
  "Top-down",
  "Macro detail",
  "Soft daylight",
  "Hard light",
  "Studio strobe",
  "35mm film",
  "Wide editorial",
] as const;

export const FOOD_MAX_CAMERA_FEELS = 2;
export const FOOD_TEXT_MAX = 160;

export type FoodDrinkArchetype = (typeof FOOD_ARCHETYPES)[number]["value"];
export type FoodDrinkProductType = (typeof FOOD_PRODUCT_TYPES)[number]["value"];
export type FoodDrinkPresentation = (typeof FOOD_PRESENTATIONS)[number]["value"];

export const FOOD_PRESENTATIONS_WITH_PERSON: FoodDrinkPresentation[] =
  FOOD_PRESENTATIONS.filter((p) => p.hasPerson).map((p) => p.value);
