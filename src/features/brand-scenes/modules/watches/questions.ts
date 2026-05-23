export const WATCHES_ARCHETYPES = [
  { value: "wrist_editorial", label: "Wrist Editorial" },
  { value: "architectural_still_life", label: "Architectural Still-Life" },
  { value: "macro_mechanism", label: "Macro Mechanism" },
  { value: "travel_lifestyle", label: "Travel Lifestyle" },
  { value: "top_down_flat_lay", label: "Top-Down Flat-Lay" },
] as const;

export const WATCHES_PRODUCT_TYPES = [
  { value: "dress", label: "Dress" },
  { value: "dive", label: "Dive" },
  { value: "chronograph", label: "Chronograph" },
  { value: "smartwatch", label: "Smartwatch" },
  { value: "field", label: "Field" },
  { value: "skeleton", label: "Skeleton" },
] as const;

export const WATCHES_PRESENTATIONS = [
  { value: "on_wrist_closeup", label: "On-wrist close-up", hasPerson: true },
  { value: "on_wrist_lifestyle", label: "On-wrist lifestyle", hasPerson: true },
  { value: "pedestal", label: "Pedestal / sculptural", hasPerson: false },
  { value: "flat_lay_fabric", label: "Flat-lay on fabric", hasPerson: false },
  { value: "macro_dial", label: "Macro dial / detail", hasPerson: false },
] as const;

export const WATCHES_CAMERA_FEELS = [
  "Macro detail",
  "Top-down",
  "Low angle",
  "Soft daylight",
  "Studio strobe",
  "35mm film",
  "Wide editorial",
] as const;

export const WATCHES_MAX_CAMERA_FEELS = 2;
export const WATCHES_TEXT_MAX = 160;

export type WatchesArchetype = (typeof WATCHES_ARCHETYPES)[number]["value"];
export type WatchesProductType = (typeof WATCHES_PRODUCT_TYPES)[number]["value"];
export type WatchesPresentation = (typeof WATCHES_PRESENTATIONS)[number]["value"];

export const WATCHES_PRESENTATIONS_WITH_PERSON: WatchesPresentation[] =
  WATCHES_PRESENTATIONS.filter((p) => p.hasPerson).map((p) => p.value);
