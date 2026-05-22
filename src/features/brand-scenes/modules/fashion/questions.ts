// Legacy archetype/garment values are kept as schema enums so historic
// rows still parse — they are no longer surfaced in the UI.
export const FASHION_ARCHETYPES = [
  { value: "editorial_studio", label: "Editorial Studio" },
  { value: "elevated_location", label: "Elevated Location" },
  { value: "everyday_ugc", label: "Everyday UGC" },
  { value: "campaign_statement", label: "Campaign Statement" },
] as const;

export const FASHION_GARMENTS = [
  "Outerwear",
  "Knitwear",
  "Tailoring",
  "Denim",
  "Dresses",
  "Tops",
  "Bottoms",
  "Loungewear",
] as const;

export const FASHION_WEARERS = [
  { value: "on_model_full", label: "On-model (full body)", hasPerson: true },
  { value: "on_model_crop", label: "On-model (cropped)", hasPerson: true },
  { value: "flat_lay", label: "Flat lay / Ghost mannequin", hasPerson: false },
  { value: "detail_only", label: "Detail / Texture only", hasPerson: false },
] as const;

export const FASHION_CAMERA_FEELS = [
  "Wide editorial",
  "Tight crop",
  "35mm film",
  "Soft DOF",
  "Documentary",
  "Flash-lit",
] as const;

/** New: scene-first preset chips (UI only — written into scene.location). */
export const FASHION_SETTINGS = [
  "Indoor studio",
  "Indoor lifestyle",
  "Outdoor street",
  "Outdoor nature",
  "Architectural",
  "Domestic interior",
] as const;

/** New: prop / vibe presets (UI only — joined and written into scene.props). */
export const FASHION_VIBES = [
  "Minimal",
  "Vintage props",
  "Floral",
  "Industrial",
  "Soft drapery",
  "Plants",
  "Tabletop",
  "Empty space",
] as const;

export const FASHION_MAX_GARMENTS = 3;
export const FASHION_MAX_CAMERA_FEELS = 2;
export const FASHION_MAX_VIBES = 3;
export const FASHION_TEXT_MAX = 160;

export type FashionArchetype = (typeof FASHION_ARCHETYPES)[number]["value"];
export type FashionWearer = (typeof FASHION_WEARERS)[number]["value"];

export const WEARERS_WITH_PERSON: FashionWearer[] = FASHION_WEARERS
  .filter((w) => w.hasPerson)
  .map((w) => w.value);
