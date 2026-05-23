export const BAGS_ARCHETYPES = [
  { value: "carried_editorial", label: "Carried Editorial" },
  { value: "studio_pedestal", label: "Studio Pedestal" },
  { value: "open_contents", label: "Open Contents" },
  { value: "travel_scene", label: "Travel Scene" },
  { value: "architectural_still_life", label: "Architectural Still-Life" },
] as const;

export const BAGS_PRODUCT_TYPES = [
  { value: "tote", label: "Tote" },
  { value: "crossbody", label: "Crossbody" },
  { value: "backpack", label: "Backpack" },
  { value: "clutch", label: "Clutch" },
  { value: "weekender", label: "Weekender" },
  { value: "wallet", label: "Wallet" },
  { value: "belt", label: "Belt" },
] as const;

export const BAGS_PRESENTATIONS = [
  { value: "on_model_carrying", label: "On-model carrying", hasPerson: true },
  { value: "seated_handheld", label: "Seated / hand-held", hasPerson: true },
  { value: "standing_pedestal", label: "Standing pedestal", hasPerson: false },
  { value: "open_interior", label: "Open showing interior", hasPerson: false },
  { value: "top_down_flat_lay", label: "Top-down flat-lay", hasPerson: false },
] as const;

export const BAGS_CAMERA_FEELS = [
  "Wide editorial",
  "Macro detail",
  "Top-down",
  "Low angle",
  "Soft daylight",
  "Studio strobe",
  "35mm film",
] as const;

export const BAGS_MAX_CAMERA_FEELS = 2;
export const BAGS_TEXT_MAX = 160;

export type BagsAccessoriesArchetype = (typeof BAGS_ARCHETYPES)[number]["value"];
export type BagsAccessoriesProductType = (typeof BAGS_PRODUCT_TYPES)[number]["value"];
export type BagsAccessoriesPresentation = (typeof BAGS_PRESENTATIONS)[number]["value"];

export const BAGS_PRESENTATIONS_WITH_PERSON: BagsAccessoriesPresentation[] =
  BAGS_PRESENTATIONS.filter((p) => p.hasPerson).map((p) => p.value);
