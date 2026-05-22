export const EYEWEAR_ARCHETYPES = [
  { value: "studio_portrait", label: "Studio Portrait" },
  { value: "cinematic_street", label: "Cinematic Street" },
  { value: "architectural_still_life", label: "Architectural Still-Life" },
  { value: "sun_drenched", label: "Sun-Drenched Editorial" },
  { value: "minimal_macro", label: "Minimal Product Macro" },
] as const;

export const EYEWEAR_TYPES = [
  { value: "sunglasses", label: "Sunglasses" },
  { value: "optical", label: "Optical / clear" },
  { value: "sport", label: "Sport / performance" },
  { value: "reading", label: "Reading" },
  { value: "aviator", label: "Aviator" },
  { value: "round_cat_eye", label: "Round / cat-eye" },
] as const;

export const EYEWEAR_PRESENTATIONS = [
  { value: "on_model_face", label: "On-model (face close-up)", hasPerson: true },
  { value: "on_model_half", label: "On-model (half-body editorial)", hasPerson: true },
  { value: "pedestal", label: "Pedestal / sculptural", hasPerson: false },
  { value: "pair_flat", label: "Pair laid flat (open)", hasPerson: false },
  { value: "macro_detail", label: "Macro / detail", hasPerson: false },
] as const;

export const EYEWEAR_CAMERA_FEELS = [
  "Macro detail",
  "Wide editorial",
  "Top-down",
  "Low angle",
  "35mm film",
  "Flash-lit",
  "Soft daylight",
] as const;

export const EYEWEAR_MAX_CAMERA_FEELS = 2;
export const EYEWEAR_TEXT_MAX = 160;

export type EyewearArchetype = (typeof EYEWEAR_ARCHETYPES)[number]["value"];
export type EyewearType = (typeof EYEWEAR_TYPES)[number]["value"];
export type EyewearPresentation =
  (typeof EYEWEAR_PRESENTATIONS)[number]["value"];

export const EYEWEAR_PRESENTATIONS_WITH_PERSON: EyewearPresentation[] =
  EYEWEAR_PRESENTATIONS.filter((p) => p.hasPerson).map((p) => p.value);
