export const WELLNESS_ARCHETYPES = [
  { value: "spa_tableau", label: "Spa Tableau" },
  { value: "lifestyle_ritual", label: "Lifestyle Ritual" },
  { value: "macro_texture", label: "Macro Texture" },
  { value: "pedestal_minimal", label: "Pedestal Minimal" },
  { value: "sun_drenched_calm", label: "Sun-Drenched Calm" },
] as const;

export const WELLNESS_PRODUCT_TYPES = [
  { value: "supplement", label: "Supplement" },
  { value: "topical", label: "Topical" },
  { value: "tool_device", label: "Tool / device" },
  { value: "apparel", label: "Apparel" },
  { value: "drink_powder", label: "Drink / powder" },
  { value: "ritual_kit", label: "Ritual kit" },
] as const;

export const WELLNESS_PRESENTATIONS = [
  { value: "pedestal", label: "Pedestal", hasPerson: false },
  { value: "in_use_with_model", label: "In-use with model", hasPerson: true },
  { value: "flat_lay_tableau", label: "Flat-lay tableau", hasPerson: false },
  { value: "macro", label: "Macro detail", hasPerson: false },
  { value: "countertop_ritual", label: "Countertop ritual", hasPerson: false },
] as const;

export const WELLNESS_CAMERA_FEELS = [
  "Soft daylight",
  "Macro detail",
  "Top-down",
  "Studio strobe",
  "Wide editorial",
  "Hard light",
  "35mm film",
] as const;

export const WELLNESS_MAX_CAMERA_FEELS = 2;
export const WELLNESS_TEXT_MAX = 160;

export type WellnessArchetype = (typeof WELLNESS_ARCHETYPES)[number]["value"];
export type WellnessProductType = (typeof WELLNESS_PRODUCT_TYPES)[number]["value"];
export type WellnessPresentation = (typeof WELLNESS_PRESENTATIONS)[number]["value"];

export const WELLNESS_PRESENTATIONS_WITH_PERSON: WellnessPresentation[] =
  WELLNESS_PRESENTATIONS.filter((p) => p.hasPerson).map((p) => p.value);
