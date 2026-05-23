export const HOME_ARCHETYPES = [
  { value: "lived_in_interior", label: "Lived-In Interior" },
  { value: "architectural_minimal", label: "Architectural Minimal" },
  { value: "sunlit_vignette", label: "Sunlit Vignette" },
  { value: "top_down_tableau", label: "Top-Down Tableau" },
  { value: "editorial_detail", label: "Editorial Detail" },
] as const;

export const HOME_PRODUCT_TYPES = [
  { value: "furniture", label: "Furniture" },
  { value: "lighting", label: "Lighting" },
  { value: "decor_object", label: "Decor object" },
  { value: "textile", label: "Textile" },
  { value: "tableware", label: "Tableware" },
  { value: "storage", label: "Storage" },
] as const;

export const HOME_PRESENTATIONS = [
  { value: "in_room", label: "In-room", hasPerson: false },
  { value: "pedestal", label: "Pedestal", hasPerson: false },
  { value: "top_down_flat_lay", label: "Top-down flat-lay", hasPerson: false },
  { value: "macro_detail", label: "Macro detail", hasPerson: false },
  { value: "paired_with_model", label: "Paired with model", hasPerson: true },
] as const;

export const HOME_CAMERA_FEELS = [
  "Wide editorial",
  "Soft daylight",
  "Top-down",
  "Low angle",
  "Macro detail",
  "35mm film",
  "Architectural",
] as const;

export const HOME_MAX_CAMERA_FEELS = 2;
export const HOME_TEXT_MAX = 160;

export type HomeArchetype = (typeof HOME_ARCHETYPES)[number]["value"];
export type HomeProductType = (typeof HOME_PRODUCT_TYPES)[number]["value"];
export type HomePresentation = (typeof HOME_PRESENTATIONS)[number]["value"];

export const HOME_PRESENTATIONS_WITH_PERSON: HomePresentation[] =
  HOME_PRESENTATIONS.filter((p) => p.hasPerson).map((p) => p.value);
