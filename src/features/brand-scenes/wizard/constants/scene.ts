/**
 * Brand Scenes — Step 3 scene aesthetic extras.
 * Setting, weather, season, lens, depth of field, palette, finish.
 */

export const SCENE_SETTINGS = [
  "Urban street",
  "Architectural interior",
  "Nature",
  "Beach / water",
  "Studio cyclorama",
  "Tabletop surface",
  "Vehicle / transit",
  "Domestic",
] as const;

export const SCENE_WEATHER = [
  { value: "clear", label: "Clear" },
  { value: "overcast", label: "Overcast" },
  { value: "rain", label: "Rain / wet" },
  { value: "fog", label: "Fog / haze" },
  { value: "snow", label: "Snow" },
  { value: "dusty", label: "Dusty / desert" },
  { value: "smoke", label: "Smoke / steam" },
] as const;
export type SceneWeather = (typeof SCENE_WEATHER)[number]["value"];

export const SCENE_SEASONS = [
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "autumn", label: "Autumn" },
  { value: "winter", label: "Winter" },
  { value: "seasonless", label: "Season-less" },
] as const;
export type SceneSeason = (typeof SCENE_SEASONS)[number]["value"];

export const SCENE_LENSES = [
  { value: "wide", label: "Wide perspective (24mm)", directive: "24mm wide-angle perspective" },
  { value: "standard", label: "Standard (35mm)", directive: "35mm natural perspective" },
  { value: "portrait", label: "Portrait (50mm)", directive: "50mm portrait lens, flattering compression" },
  { value: "tele", label: "Tele compression (85mm)", directive: "85mm telephoto compression" },
  { value: "macro", label: "Macro detail", directive: "macro close-up, extreme product detail" },
] as const;
export type SceneLens = (typeof SCENE_LENSES)[number]["value"];

export const SCENE_DEPTH_OF_FIELD = [
  { value: "deep", label: "Deep — everything sharp", directive: "deep depth of field, everything in focus" },
  { value: "balanced", label: "Balanced", directive: "balanced depth of field" },
  { value: "shallow", label: "Shallow — subject pop", directive: "shallow depth of field, subject pops from soft background" },
  { value: "extreme", label: "Extreme bokeh", directive: "very shallow depth of field, creamy bokeh background" },
] as const;
export type SceneDepthOfField = (typeof SCENE_DEPTH_OF_FIELD)[number]["value"];

export const SCENE_PALETTES = [
  { value: "warm_neutral", label: "Warm neutral", directive: "warm neutral palette — sand, cream, soft tan" },
  { value: "cool_neutral", label: "Cool neutral", directive: "cool neutral palette — stone, fog, soft grey" },
  { value: "terracotta", label: "Earthy terracotta", directive: "earthy palette — terracotta, clay, burnt sienna" },
  { value: "sage_cream", label: "Sage & cream", directive: "calm palette — sage green and warm cream" },
  { value: "monochrome", label: "Monochrome", directive: "monochrome palette — black, white, greyscale only" },
  { value: "bold_accent", label: "Bold accent", directive: "neutral base with a single saturated accent color" },
] as const;
export type ScenePalette = (typeof SCENE_PALETTES)[number]["value"];

export const SCENE_FINISHES = [
  { value: "clean_digital", label: "Clean digital", directive: "clean digital finish, no grain" },
  { value: "film_grain", label: "Soft film grain", directive: "subtle film grain, analog character" },
  { value: "editorial_matte", label: "Editorial matte", directive: "editorial matte finish, muted contrast" },
  { value: "glossy", label: "High-contrast glossy", directive: "high contrast, glossy magazine finish" },
  { value: "sun_bleached", label: "Sun-bleached", directive: "sun-bleached pastel tones, faded highlights" },
] as const;
export type SceneFinish = (typeof SCENE_FINISHES)[number]["value"];

export const WARDROBE_COLORS = [
  { value: "neutral_light", label: "Neutral light", directive: "off-white / cream wardrobe" },
  { value: "neutral_dark", label: "Neutral dark", directive: "charcoal / black wardrobe" },
  { value: "earth_tones", label: "Earth tones", directive: "earth-tone wardrobe — clay, olive, sand" },
  { value: "denim", label: "Denim", directive: "denim wardrobe basics" },
  { value: "monochrome_product", label: "Match product", directive: "wardrobe tonally matches the product palette" },
  { value: "contrast", label: "Contrast accent", directive: "wardrobe in a contrasting accent that frames the product" },
] as const;
export type WardrobeColor = (typeof WARDROBE_COLORS)[number]["value"];

export function meta<T extends { value: string }>(arr: readonly T[], v: string | undefined): T | undefined {
  if (!v) return undefined;
  return arr.find((x) => x.value === v);
}
