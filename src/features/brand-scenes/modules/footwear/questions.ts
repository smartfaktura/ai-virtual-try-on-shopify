export const FOOTWEAR_ARCHETYPES = [
  { value: "architectural_still_life", label: "Architectural Still-Life" },
  { value: "dynamic_on_body", label: "Dynamic On-Body" },
  { value: "quiet_luxury", label: "Quiet Luxury Editorial" },
  { value: "street_documentary", label: "Street / Documentary" },
] as const;

export const FOOTWEAR_TYPES = [
  { value: "sneakers", label: "Sneakers" },
  { value: "boots", label: "Boots" },
  { value: "heels", label: "Heels" },
  { value: "loafers", label: "Loafers" },
  { value: "sandals", label: "Sandals" },
  { value: "flats", label: "Flats" },
  { value: "athletic", label: "Athletic / Performance" },
] as const;

export const FOOTWEAR_PRESENTATIONS = [
  { value: "on_foot_full", label: "On-foot (full leg)", hasPerson: true },
  { value: "on_foot_close", label: "On-foot (close crop)", hasPerson: true },
  { value: "pedestal", label: "Pedestal / sculptural", hasPerson: false },
  { value: "pair_flat", label: "Pair laid flat", hasPerson: false },
  { value: "macro_detail", label: "Macro / detail", hasPerson: false },
] as const;

export const FOOTWEAR_CAMERA_FEELS = [
  "Macro detail",
  "Wide editorial",
  "Top-down",
  "Low angle",
  "35mm film",
  "Flash-lit",
] as const;

export const FOOTWEAR_MAX_CAMERA_FEELS = 2;
export const FOOTWEAR_TEXT_MAX = 160;

export type FootwearArchetype = (typeof FOOTWEAR_ARCHETYPES)[number]["value"];
export type FootwearType = (typeof FOOTWEAR_TYPES)[number]["value"];
export type FootwearPresentation =
  (typeof FOOTWEAR_PRESENTATIONS)[number]["value"];

export const PRESENTATIONS_WITH_PERSON: FootwearPresentation[] =
  FOOTWEAR_PRESENTATIONS.filter((p) => p.hasPerson).map((p) => p.value);
