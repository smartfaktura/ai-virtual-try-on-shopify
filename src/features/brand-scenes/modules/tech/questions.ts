export const TECH_ARCHETYPES = [
  { value: "studio_floating", label: "Studio Floating" },
  { value: "desk_lifestyle", label: "Desk Lifestyle" },
  { value: "macro_detail", label: "Macro Detail" },
  { value: "in_hand_scale", label: "In-Hand Scale" },
  { value: "architectural_pedestal", label: "Architectural Pedestal" },
] as const;

export const TECH_PRODUCT_TYPES = [
  { value: "phone_tablet", label: "Phone / tablet" },
  { value: "laptop", label: "Laptop" },
  { value: "audio", label: "Audio" },
  { value: "wearable", label: "Wearable" },
  { value: "camera", label: "Camera" },
  { value: "smart_home", label: "Smart home" },
] as const;

export const TECH_PRESENTATIONS = [
  { value: "floating", label: "Floating", hasPerson: false },
  { value: "in_hand", label: "In-hand", hasPerson: true },
  { value: "on_desk_lifestyle", label: "On-desk lifestyle", hasPerson: false },
  { value: "pedestal", label: "Pedestal", hasPerson: false },
  { value: "macro", label: "Macro detail", hasPerson: false },
] as const;

export const TECH_CAMERA_FEELS = [
  "Macro detail",
  "Hard light",
  "Studio strobe",
  "Top-down",
  "Wide editorial",
  "Reflective",
  "35mm film",
] as const;

export const TECH_MAX_CAMERA_FEELS = 2;
export const TECH_TEXT_MAX = 160;

export type TechArchetype = (typeof TECH_ARCHETYPES)[number]["value"];
export type TechProductType = (typeof TECH_PRODUCT_TYPES)[number]["value"];
export type TechPresentation = (typeof TECH_PRESENTATIONS)[number]["value"];

export const TECH_PRESENTATIONS_WITH_PERSON: TechPresentation[] =
  TECH_PRESENTATIONS.filter((p) => p.hasPerson).map((p) => p.value);
