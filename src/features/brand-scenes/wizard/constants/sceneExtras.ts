/**
 * Brand Scenes — additional dial constants for the versatile wizard.
 * Step 3 (scene aesthetic) extras + Step 4 (cast) extras.
 */

export const SURFACES = [
  { value: "concrete", label: "Concrete", directive: "raw concrete surface" },
  { value: "linen", label: "Linen drape", directive: "soft linen drape" },
  { value: "polished_stone", label: "Polished stone", directive: "polished stone slab" },
  { value: "raw_wood", label: "Raw wood", directive: "raw natural wood" },
  { value: "glass", label: "Glass", directive: "clear glass surface" },
  { value: "sand", label: "Sand", directive: "fine sand bed" },
  { value: "water", label: "Water", directive: "shallow water surface" },
  { value: "paper", label: "Paper", directive: "matte paper backdrop" },
  { value: "velvet", label: "Velvet", directive: "deep velvet drape" },
] as const;
export type Surface = (typeof SURFACES)[number]["value"];

export const PROP_DENSITY_LABELS = [
  "None",
  "Minimal",
  "Considered",
  "Rich",
  "Maximalist",
] as const;
export type PropDensity = 0 | 1 | 2 | 3 | 4;

export const COLOR_CONTRASTS = [
  { value: "tonal", label: "Tonal / monochrome", directive: "tonal monochrome contrast" },
  { value: "soft", label: "Soft contrast", directive: "soft tonal contrast" },
  { value: "bold", label: "Bold contrast", directive: "bold high contrast" },
  { value: "complementary", label: "Complementary clash", directive: "complementary color clash" },
] as const;
export type ColorContrast = (typeof COLOR_CONTRASTS)[number]["value"];

export const SATURATIONS = [
  { value: "desaturated", label: "Desaturated", directive: "desaturated muted tones" },
  { value: "natural", label: "Natural", directive: "natural saturation" },
  { value: "vivid", label: "Vivid", directive: "vivid saturated colors" },
] as const;
export type Saturation = (typeof SATURATIONS)[number]["value"];

export const SHADOWS = [
  { value: "hard", label: "Hard shadow", directive: "hard defined shadows" },
  { value: "soft", label: "Soft shadow", directive: "soft diffuse shadows" },
  { value: "none", label: "No shadow / floating", directive: "no shadow, floating product" },
  { value: "mirror", label: "Mirror reflection", directive: "mirror reflection beneath the product" },
  { value: "wet", label: "Wet reflection", directive: "wet ground reflection" },
] as const;
export type Shadow = (typeof SHADOWS)[number]["value"];

export const COMPOSITIONS = [
  { value: "thirds", label: "Rule of thirds", directive: "rule-of-thirds composition" },
  { value: "centered", label: "Centered", directive: "centered subject" },
  { value: "symmetry", label: "Symmetry", directive: "symmetrical composition" },
  { value: "neg_left", label: "Negative space left", directive: "subject right, negative space on the left" },
  { value: "neg_right", label: "Negative space right", directive: "subject left, negative space on the right" },
  { value: "neg_top", label: "Negative space top", directive: "subject low, negative space at the top" },
] as const;
export type Composition = (typeof COMPOSITIONS)[number]["value"];

export const NEG_SPACE_INTENTS = [
  { value: "headline", label: "Reserved for headline", directive: "leave clean negative space for headline copy" },
  { value: "logo", label: "Reserved for logo", directive: "leave clean negative space for a logo placement" },
  { value: "none", label: "None", directive: "" },
] as const;
export type NegSpaceIntent = (typeof NEG_SPACE_INTENTS)[number]["value"];

export const AESTHETIC_ERAS = [
  { value: "contemporary", label: "Contemporary", directive: "contemporary editorial look" },
  { value: "90s", label: "90s editorial", directive: "90s editorial aesthetic" },
  { value: "y2k", label: "Y2K", directive: "Y2K millennium aesthetic" },
  { value: "70s_film", label: "70s film", directive: "warm 70s film grain aesthetic" },
  { value: "brutalist", label: "Brutalist", directive: "brutalist raw composition" },
  { value: "quiet_luxury", label: "Quiet luxury", directive: "quiet luxury restraint" },
  { value: "max2020s", label: "Maximalist 2020s", directive: "maximalist 2020s editorial energy" },
] as const;
export type AestheticEra = (typeof AESTHETIC_ERAS)[number]["value"];

export const REALISM_LEVELS = [
  { value: "photoreal", label: "Photorealistic", directive: "photorealistic" },
  { value: "high_fashion", label: "Editorial high-fashion", directive: "editorial high-fashion polish" },
  { value: "documentary", label: "Documentary", directive: "documentary candid realism" },
  { value: "stylised", label: "Stylised render", directive: "stylised rendered look" },
  { value: "surreal", label: "Surreal", directive: "surreal dreamlike composition" },
] as const;
export type RealismLevel = (typeof REALISM_LEVELS)[number]["value"];

export const BRAND_VOICES = [
  { value: "premium_quiet", label: "Premium quiet", directive: "premium quiet brand voice" },
  { value: "energetic", label: "Energetic", directive: "energetic brand voice" },
  { value: "playful", label: "Playful", directive: "playful brand voice" },
  { value: "technical", label: "Technical", directive: "technical precise brand voice" },
  { value: "romantic", label: "Romantic", directive: "romantic brand voice" },
  { value: "bold_rebel", label: "Bold rebel", directive: "bold rebellious brand voice" },
] as const;
export type BrandVoice = (typeof BRAND_VOICES)[number]["value"];

export const OUTPUT_USE_CASES = [
  { value: "web_hero", label: "Website hero", directive: "designed for website hero placement" },
  { value: "social_square", label: "Social square sibling", directive: "must survive a centered 1:1 social crop" },
  { value: "lookbook", label: "Lookbook page", directive: "designed for a printed lookbook page" },
  { value: "paid_ad", label: "Paid ad", directive: "designed for a paid ad with safe-area for copy" },
  { value: "editorial_print", label: "Editorial print", directive: "editorial print spread" },
] as const;
export type OutputUseCase = (typeof OUTPUT_USE_CASES)[number]["value"];

export const SUBJECT_FOCUSES = [
  { value: "product", label: "Product is hero", directive: "product is the hero focus" },
  { value: "person", label: "Person is hero", directive: "person is the hero focus" },
  { value: "equal", label: "Equal weight", directive: "product and person share equal visual weight" },
  { value: "environment", label: "Environment is hero", directive: "environment is the hero focus, subjects sit inside it" },
] as const;
export type SubjectFocus = (typeof SUBJECT_FOCUSES)[number]["value"];

// ---- Cast extras ----

export const BODY_PART_FOCUS = [
  { value: "face", label: "Face" },
  { value: "hands", label: "Hands" },
  { value: "wrist", label: "Wrist" },
  { value: "neck", label: "Neck / decolleté" },
  { value: "feet", label: "Feet" },
  { value: "full_body", label: "Full body" },
  { value: "detail", label: "Detail crop" },
] as const;
export type BodyPartFocus = (typeof BODY_PART_FOCUS)[number]["value"];

export const GAZE_DIRECTIONS = [
  { value: "to_camera", label: "To camera" },
  { value: "away", label: "Away" },
  { value: "down_at_product", label: "Down at product" },
  { value: "closed_eyes", label: "Closed eyes" },
] as const;
export type GazeDirection = (typeof GAZE_DIRECTIONS)[number]["value"];

export const GROUP_DYNAMICS = [
  { value: "independent", label: "Independent" },
  { value: "interacting", label: "Interacting" },
  { value: "mirrored", label: "Mirrored" },
  { value: "lined_up", label: "Lined up" },
] as const;
export type GroupDynamic = (typeof GROUP_DYNAMICS)[number]["value"];

export const HANDS_ON_PRODUCT = [
  { value: "cradle", label: "Both hands cradling", directive: "both hands cradling the product" },
  { value: "pinch", label: "Fingertip pinch", directive: "held delicately with a fingertip pinch" },
  { value: "cap", label: "Pinching cap", directive: "fingers pinch the cap of the product" },
  { value: "pour", label: "Pouring", directive: "in the act of pouring" },
  { value: "wrist_show", label: "Wrist showing watch", directive: "wrist turned to camera, showing the watch" },
  { value: "tap", label: "Tapping / using", directive: "fingertip tapping the product" },
] as const;
export type HandsOnProduct = (typeof HANDS_ON_PRODUCT)[number]["value"];

export const DIVERSITY_OPTIONS = [
  { value: "as_cast", label: "As-cast", directive: "" },
  { value: "diverse", label: "Diverse cast", directive: "visibly diverse cast across skin tones and ages" },
] as const;
export type Diversity = (typeof DIVERSITY_OPTIONS)[number]["value"];

export function metaX<T extends { value: string }>(arr: readonly T[], v: string | undefined): T | undefined {
  if (!v) return undefined;
  return arr.find((x) => x.value === v);
}
