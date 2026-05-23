export const JEWELRY_ARCHETYPES = [
  { value: "editorial_portrait", label: "Editorial Portrait" },
  { value: "macro_light_sculpture", label: "Macro Light Sculpture" },
  { value: "on_skin_detail", label: "On-Skin Detail" },
  { value: "velvet_pedestal", label: "Velvet Pedestal" },
  { value: "reflective_surface", label: "Reflective Surface" },
] as const;

export const JEWELRY_PRODUCT_TYPES = [
  { value: "ring", label: "Ring" },
  { value: "necklace", label: "Necklace" },
  { value: "earrings", label: "Earrings" },
  { value: "bracelet", label: "Bracelet" },
  { value: "brooch", label: "Brooch" },
  { value: "anklet", label: "Anklet" },
] as const;

export const JEWELRY_PRESENTATIONS = [
  { value: "on_model_closeup", label: "On-model close-up", hasPerson: true },
  { value: "on_skin_macro", label: "On-skin macro", hasPerson: true },
  { value: "pedestal", label: "Pedestal", hasPerson: false },
  { value: "floating", label: "Floating / suspended", hasPerson: false },
  { value: "flat_lay", label: "Flat-lay", hasPerson: false },
] as const;

export const JEWELRY_CAMERA_FEELS = [
  "Macro detail",
  "Soft daylight",
  "Hard light",
  "Top-down",
  "Reflective",
  "35mm film",
  "Studio strobe",
] as const;

export const JEWELRY_MAX_CAMERA_FEELS = 2;
export const JEWELRY_TEXT_MAX = 160;

export type JewelryArchetype = (typeof JEWELRY_ARCHETYPES)[number]["value"];
export type JewelryProductType = (typeof JEWELRY_PRODUCT_TYPES)[number]["value"];
export type JewelryPresentation = (typeof JEWELRY_PRESENTATIONS)[number]["value"];

export const JEWELRY_PRESENTATIONS_WITH_PERSON: JewelryPresentation[] =
  JEWELRY_PRESENTATIONS.filter((p) => p.hasPerson).map((p) => p.value);
