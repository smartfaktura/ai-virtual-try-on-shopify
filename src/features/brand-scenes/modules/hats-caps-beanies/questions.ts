export const HATS_ARCHETYPES = [
  { value: "studio_portrait", label: "Studio Portrait" },
  { value: "street_editorial", label: "Street Editorial" },
  { value: "sport_action", label: "Sport Action" },
  { value: "pedestal_still_life", label: "Pedestal Still-Life" },
  { value: "top_down_flat_lay", label: "Top-Down Flat-Lay" },
] as const;

export const HATS_PRODUCT_TYPES = [
  { value: "cap", label: "Cap" },
  { value: "beanie", label: "Beanie" },
  { value: "bucket", label: "Bucket" },
  { value: "fedora", label: "Fedora" },
  { value: "sun_hat", label: "Sun hat" },
  { value: "visor", label: "Visor" },
] as const;

export const HATS_PRESENTATIONS = [
  { value: "on_model_face", label: "On-model face", hasPerson: true },
  { value: "on_model_half", label: "On-model half-body", hasPerson: true },
  { value: "pedestal", label: "Floating / pedestal", hasPerson: false },
  { value: "flat_lay", label: "Flat-lay", hasPerson: false },
  { value: "macro_detail", label: "Macro detail", hasPerson: false },
] as const;

export const HATS_CAMERA_FEELS = [
  "Soft daylight",
  "Studio strobe",
  "Wide editorial",
  "Low angle",
  "Top-down",
  "35mm film",
  "Flash-lit",
] as const;

export const HATS_MAX_CAMERA_FEELS = 2;
export const HATS_TEXT_MAX = 160;

export type HatsCapsBeaniesArchetype = (typeof HATS_ARCHETYPES)[number]["value"];
export type HatsCapsBeaniesProductType = (typeof HATS_PRODUCT_TYPES)[number]["value"];
export type HatsCapsBeaniesPresentation = (typeof HATS_PRESENTATIONS)[number]["value"];

export const HATS_PRESENTATIONS_WITH_PERSON: HatsCapsBeaniesPresentation[] =
  HATS_PRESENTATIONS.filter((p) => p.hasPerson).map((p) => p.value);
