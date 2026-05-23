export const BEAUTY_ARCHETYPES = [
  { value: "conceptual_light", label: "Conceptual Light" },
  { value: "liquid_splash", label: "Liquid Splash" },
  { value: "spa_tableau", label: "Spa Tableau" },
  { value: "macro_texture", label: "Macro Texture" },
  { value: "architectural_pedestal", label: "Architectural Pedestal" },
] as const;

export const BEAUTY_PRODUCT_TYPES = [
  { value: "fragrance", label: "Fragrance" },
  { value: "skincare", label: "Skincare" },
  { value: "makeup", label: "Makeup" },
  { value: "haircare", label: "Haircare" },
  { value: "tools", label: "Tools" },
] as const;

export const BEAUTY_PRESENTATIONS = [
  { value: "pedestal", label: "Pedestal", hasPerson: false },
  { value: "with_model", label: "With model / hand", hasPerson: true },
  { value: "in_use_macro", label: "In-use macro", hasPerson: true },
  { value: "flat_lay_tableau", label: "Flat-lay tableau", hasPerson: false },
  { value: "liquid_splash", label: "Liquid / splash", hasPerson: false },
] as const;

export const BEAUTY_CAMERA_FEELS = [
  "Macro detail",
  "Soft daylight",
  "Hard light",
  "Studio strobe",
  "Top-down",
  "Reflective",
  "35mm film",
] as const;

export const BEAUTY_MAX_CAMERA_FEELS = 2;
export const BEAUTY_TEXT_MAX = 160;

export type BeautyFragranceArchetype = (typeof BEAUTY_ARCHETYPES)[number]["value"];
export type BeautyFragranceProductType = (typeof BEAUTY_PRODUCT_TYPES)[number]["value"];
export type BeautyFragrancePresentation = (typeof BEAUTY_PRESENTATIONS)[number]["value"];

export const BEAUTY_PRESENTATIONS_WITH_PERSON: BeautyFragrancePresentation[] =
  BEAUTY_PRESENTATIONS.filter((p) => p.hasPerson).map((p) => p.value);
