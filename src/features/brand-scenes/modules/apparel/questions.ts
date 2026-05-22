export const APPAREL_ARCHETYPES = [
  { value: "editorial_studio", label: "Editorial Studio" },
  { value: "elevated_location", label: "Elevated Location" },
  { value: "everyday_ugc", label: "Everyday UGC" },
  { value: "campaign_statement", label: "Campaign Statement" },
] as const;

export const APPAREL_GARMENTS = [
  "Outerwear",
  "Knitwear",
  "Tailoring",
  "Denim",
  "Dresses",
  "Tops",
  "Bottoms",
  "Loungewear",
] as const;

export const APPAREL_WEARERS = [
  { value: "on_model_full", label: "On-model (full body)", hasPerson: true },
  { value: "on_model_crop", label: "On-model (cropped)", hasPerson: true },
  { value: "flat_lay", label: "Flat lay / Ghost mannequin", hasPerson: false },
  { value: "detail_only", label: "Detail / Texture only", hasPerson: false },
] as const;

export const APPAREL_CAMERA_FEELS = [
  "Wide editorial",
  "Tight crop",
  "35mm film",
  "Soft DOF",
  "Documentary",
  "Flash-lit",
] as const;

export const APPAREL_MAX_GARMENTS = 3;
export const APPAREL_MAX_CAMERA_FEELS = 2;
export const APPAREL_TEXT_MAX = 160;

export type ApparelArchetype = (typeof APPAREL_ARCHETYPES)[number]["value"];
export type ApparelWearer = (typeof APPAREL_WEARERS)[number]["value"];

export const WEARERS_WITH_PERSON: ApparelWearer[] = APPAREL_WEARERS
  .filter((w) => w.hasPerson)
  .map((w) => w.value);
