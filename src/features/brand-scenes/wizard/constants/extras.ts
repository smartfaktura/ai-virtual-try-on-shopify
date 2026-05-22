/**
 * Phase 7d — flexible extras dictionary.
 *
 * Every entry powers a single "ExtrasField" pill block:
 *  - `label`     : section title in the UI
 *  - `prefix`    : friendly prefix used in the assembled prompt ("Backdrop: …")
 *  - `presets`   : suggested pill values (user can also type their own)
 *  - `category`? : if present, only show for these families
 *  - `excludes`? : never show for these families
 *  - `requires`? : show only when other extras keys are set (e.g. light_quality)
 *  - `castOnly`? : show only when cast preset is one of the listed ones
 *
 * The value stored on `base.extras[key]` (or `cast.extras[key]`) is a free
 * string — either a preset or the user's custom entry. The assembler renders
 * everything verbatim so nothing is lost.
 */

import type { BrandSceneModule } from "../../constants";
import type { CastPreset } from "./cast";
import type { SceneCtx } from "../rules/sceneRules";
import { isOutdoor, isIndoor, type SceneTypeId } from "../registry/settingsBySubfamily";

export interface ExtrasField {
  key: string;
  label: string;
  prefix: string;
  presets: string[];
  scope: "scene" | "cast";
  category?: BrandSceneModule[];
  excludes?: BrandSceneModule[];
  castOnly?: CastPreset[];
  /** Hide this field when no people are in the scene (cast = 'none'). */
  hideWhenNoCast?: boolean;
  /** Optional dynamic gate — full context aware. */
  appliesWhen?: (ctx: SceneCtx) => boolean;
  /** Hidden by default until a parent field unlocks it. */
  dependent?: boolean;
  hint?: string;
  /** Phase 7i — show only when sub_family matches one of these slugs. */
  subFamilyOnly?: string[];
  /** Phase 7i — hide when sub_family matches one of these slugs. */
  subFamilyExcept?: string[];
  /**
   * Phase 7j — resolve presets at render time based on context (e.g. swap
   * camera-angle list depending on whether people are in frame). Falls back
   * to `presets` when not provided.
   */
  presetsResolver?: (ctx: SceneCtx) => string[];
}


// ============================================================================
// SCENE extras (Step 3)
// ============================================================================

export const BACKDROP_TYPES: string[] = [
  "Solid color wall",
  "Soft gradient wall",
  "Seamless paper",
  "Studio cyclorama",
  "Raw concrete wall",
  "Plaster / lime-wash wall",
  "Brick wall",
  "Tile wall",
  "Wood paneling",
  "Marble slab",
  "Travertine slab",
  "Stone slab",
  "Linen drape",
  "Velvet drape",
  "Silk drape",
  "Mesh / scrim",
  "Glass partition",
  "Acrylic panel",
  "Mirror wall",
  "Industrial corrugated metal",
  "Painted texture",
  "Curtain backdrop",
  "Open sky",
  "Horizon line",
  "Foliage wall",
  "Sand dune backdrop",
  "Water surface",
  "Asphalt wall",
  "Graffiti wall",
  "Architectural niche",
];

export const FLOOR_TYPES: string[] = [
  "Polished concrete",
  "Raw concrete",
  "Polished stone",
  "Marble floor",
  "Terrazzo",
  "Raw wood plank",
  "Parquet",
  "Tile floor",
  "Rug",
  "Glass floor",
  "Reflective acrylic floor",
  "Painted studio floor",
  "Sand",
  "Pebble",
  "Grass",
  "Moss",
  "Water shallow",
  "Asphalt",
  "Cobblestone",
  "Gravel",
  "None — floating product",
];

export const BACKDROP_COLORS: string[] = [
  "Warm white",
  "Cool white",
  "Ivory",
  "Putty",
  "Bone",
  "Sand",
  "Taupe",
  "Sage",
  "Olive",
  "Terracotta",
  "Clay",
  "Rust",
  "Cobalt",
  "Navy",
  "Slate",
  "Charcoal",
  "Black",
  "Oxblood",
  "Plum",
  "Soft blush",
  "Butter yellow",
  "Mint",
  "Custom hex…",
];

export const BACKDROP_GRADIENT_STYLES: string[] = [
  "Linear top → bottom",
  "Linear bottom → top",
  "Linear left → right",
  "Diagonal",
  "Radial center",
  "Radial off-center",
  "Vignette",
  "Two-tone hard split",
];

export const GRADIENT_DIRECTIONS: string[] = [
  "Top → bottom",
  "Bottom → top",
  "Left → right",
  "Right → left",
  "Diagonal ↗",
  "Diagonal ↘",
  "Radial",
];

export const STUDIO_FX: string[] = [
  "Practical rain rig",
  "Water mist",
  "Wet-look spray",
  "Reflective wet floor",
  "Smoke / fog machine",
  "Hazer atmosphere",
  "Wind machine",
  "Confetti drop",
  "Petal drop",
];


export const TIMES_OF_DAY_EXT: string[] = [
  "Pre-dawn blue",
  "Sunrise",
  "Golden hour morning",
  "Mid-morning",
  "Midday",
  "Overcast noon",
  "Late afternoon",
  "Golden hour evening",
  "Sunset",
  "Twilight",
  "Blue hour",
  "Night",
  "Moonlit",
  "Studio (timeless)",
];

export const LIGHT_DIRECTIONS: string[] = [
  "Front-lit",
  "¾ key light",
  "Side rim",
  "Back-lit silhouette",
  "Top-down",
  "Bottom up-light",
  "Ring light",
  "Cross-light",
  "Wraparound",
];

export const LIGHT_QUALITIES: string[] = [
  "Softbox diffuse",
  "Hard direct sun",
  "Dappled through leaves",
  "Practical neon",
  "Candle / fire",
  "Mixed practical",
  "Bounced fill",
  "Window light",
  "Skylight",
  "Spot pool",
  "Cinematic chiaroscuro",
];

export const MOTION_ENERGY: string[] = [
  "Perfectly still",
  "Subtle breeze",
  "Fabric in motion",
  "Hair in motion",
  "Mid-stride freeze",
  "Jump freeze",
  "Long-exposure trail",
  "Splash freeze",
  "Pour mid-air",
  "Steam rising",
];

export const COMPOSITION_ENERGY: string[] = [
  "Quiet & restrained",
  "Bold & graphic",
  "Layered storytelling",
  "Single-subject focus",
  "Asymmetric",
  "Symmetric",
  "Off-balance tension",
];

export const CROP_SAFETY: string[] = [
  "Title-safe top",
  "Title-safe bottom",
  "Title-safe left",
  "Title-safe right",
  "Center-safe (works for square crop)",
  "No copy zone needed",
];

/** Phase 7k — minimal generic fallback. Per-subfamily lists live in storytellingBySubfamily.ts. */
export const STORYTELLING_MOMENT: string[] = [
  "Arriving",
  "Mid-action",
  "Resting",
  "Quiet pause",
];

// ============================================================================
// CAST extras (Step 4)
// ============================================================================

export const SKIN_FINISHES: string[] = [
  "Natural",
  "Dewy",
  "Matte editorial",
  "Glossy editorial",
  "Sun-kissed",
  "Bare / no-makeup",
];

export const HAIR_STYLES: string[] = [
  "Natural loose",
  "Wet-look",
  "Slicked back",
  "Tousled",
  "Braided",
  "Updo",
  "Ponytail",
  "Bun",
  "Covered (hat / scarf)",
  "Short crop",
  "Curly defined",
];

export const MAKEUP_LOOKS: string[] = [
  "Bare",
  "No-makeup makeup",
  "Editorial neutral",
  "Graphic liner",
  "Glossy lip",
  "Bold lip",
  "Smoked eye",
  "Monochrome flush",
];

export const POSE_ENERGY: string[] = [
  "Relaxed",
  "Powerful",
  "Candid",
  "Dynamic",
  "Contemplative",
  "Playful",
  "Confident stance",
  "Seated grounded",
  "Leaning",
  "Walking past camera",
];

export const AGE_BANDS: string[] = [
  "18 – 25",
  "25 – 35",
  "35 – 50",
  "50+",
  "Mixed",
];

export const BUILDS: string[] = [
  "Slim",
  "Athletic",
  "Curvy",
  "Plus",
  "Mixed",
];

/** Phase 7k — "Mixed" only meaningful for two/group casts. */
export function buildsForCast(cast: CastPreset | undefined): string[] {
  if (cast === "two" || cast === "group") return BUILDS;
  return BUILDS.filter((b) => b !== "Mixed");
}

export const ETHNICITY_HINT: string[] = [
  "As-cast",
  "Pan-European",
  "East Asian",
  "South Asian",
  "Black",
  "Latine",
  "Middle Eastern",
  "Mixed-heritage",
  "Globally diverse",
];

// ============================================================================
// CAMERA ANGLES — grouped by category context
// ============================================================================

export const CAMERA_ANGLES_HUMAN: string[] = [
  "Straight on, eye level",
  "¾ left, eye level",
  "¾ right, eye level",
  "Profile left",
  "Profile right",
  "Back ¾",
  "Worm's eye low",
  "Low ¾",
  "High 45°",
  "High ¾",
  "Dutch tilt 5°",
  "Dutch tilt 15°",
];

export const CAMERA_ANGLES_PRODUCT: string[] = [
  "Straight on, eye level",
  "¾ left, eye level",
  "¾ right, eye level",
  "Top-down 90°",
  "High 45°",
  "Eye level macro",
  "Pour shot",
  "Splash shot",
  "Steam shot",
  "Floating product",
  "Dutch tilt 5°",
];

/** @deprecated kept for back-compat. Use CAMERA_ANGLES_HUMAN / _PRODUCT. */
export const CAMERA_ANGLES_GENERAL: string[] = CAMERA_ANGLES_HUMAN;


export const CAMERA_ANGLES_APPAREL: string[] = [
  "Full-length front",
  "Full-length back",
  "Full-length ¾",
  "Half-body",
  "Bust crop",
  "Hip crop",
  "Knee crop",
  "Ankle crop",
  "Walking toward",
  "Walking away",
  "Mid-stride side",
  "Seated full-length",
  "Leaning candid",
  "Detail — collar",
  "Detail — cuff",
  "Detail — hem",
  "Detail — pocket",
  "Detail — zip / button",
  "Detail — seam / label",
  "Detail — lining",
];

export const CAMERA_ANGLES_FOOTWEAR: string[] = [
  "Top-down pair",
  "Single shoe ¾",
  "Sole-up",
  "Heel-back detail",
  "Tongue close-up",
  "Lace detail",
  "Side profile pair",
  "Stacked pair",
  "On-foot walking",
  "On-foot seated",
  "On-foot on stairs",
  "Kicked-off arrangement",
  "In hand offering",
];

export const CAMERA_ANGLES_EYEWEAR: string[] = [
  "Front on-face",
  "¾ on-face",
  "Profile on-face",
  "Top-down folded",
  "Top-down open",
  "Lens detail macro",
  "Temple detail macro",
  "Bridge detail macro",
  "On-hair pushed up",
  "In-hand offering",
];

export const CAMERA_ANGLES_JEWELRY: string[] = [
  "Macro stone",
  "Macro clasp",
  "Macro engraving",
  "On-finger ¾",
  "On-finger top-down",
  "On-wrist",
  "On-neck",
  "On-ear ¾",
  "On-ear profile",
  "Paired on tray",
  "In-hand offering",
  "Falling / floating",
];

// Phase 7k — CAMERA_ANGLES_TABLETOP removed (tabletop scene type dropped).
// Useful product-only angles live in CAMERA_ANGLES_PRODUCT.

// ============================================================================
// FIELD DEFINITIONS — one entry per extras key.
// ============================================================================

export const SCENE_EXTRAS_FIELDS: ExtrasField[] = [
  {
    key: "backdrop_type",
    scope: "scene",
    label: "Backdrop type",
    prefix: "Backdrop",
    presets: BACKDROP_TYPES,
    // Backdrops are studio / tabletop / architectural only.
    appliesWhen: (c) => isIndoor(c.scene_type),
  },
  {
    key: "backdrop_color",
    scope: "scene",
    label: "Backdrop color / gradient anchor",
    prefix: "Backdrop color",
    presets: BACKDROP_COLORS,
    appliesWhen: (c) =>
      isIndoor(c.scene_type) &&
      // Hide once a hard split is chosen — color A/B take over.
      c.values.backdrop_type !== "Two-tone hard split",
  },
  {
    key: "backdrop_color_a",
    scope: "scene",
    label: "Backdrop color A (split / gradient)",
    prefix: "Backdrop color A",
    presets: BACKDROP_COLORS,
    dependent: true,
    appliesWhen: (c) =>
      c.values.backdrop_type === "Two-tone hard split" ||
      c.values.backdrop_type === "Soft gradient wall",
  },
  {
    key: "backdrop_color_b",
    scope: "scene",
    label: "Backdrop color B (split / gradient)",
    prefix: "Backdrop color B",
    presets: BACKDROP_COLORS,
    dependent: true,
    appliesWhen: (c) =>
      c.values.backdrop_type === "Two-tone hard split" ||
      c.values.backdrop_type === "Soft gradient wall",
  },
  {
    key: "backdrop_gradient",
    scope: "scene",
    label: "Backdrop gradient style",
    prefix: "Gradient",
    presets: BACKDROP_GRADIENT_STYLES,
    appliesWhen: (c) => isIndoor(c.scene_type),
  },
  {
    key: "gradient_direction",
    scope: "scene",
    label: "Gradient direction",
    prefix: "Gradient direction",
    presets: GRADIENT_DIRECTIONS,
    dependent: true,
    appliesWhen: (c) => c.values.backdrop_type === "Soft gradient wall",
  },
  {
    key: "floor",
    scope: "scene",
    label: "Floor surface",
    prefix: "Floor",
    presets: FLOOR_TYPES,
    // Phase 7j — only meaningful indoors. Outdoors implies the floor (sand, rock…).
    appliesWhen: (c) => isIndoor(c.scene_type),
  },
  {
    key: "studio_fx",
    scope: "scene",
    label: "Studio FX",
    prefix: "Studio FX",
    presets: STUDIO_FX,
    dependent: true,
    hint: "Practical effects rigged inside the studio — rain rig, haze, wet floor",
    appliesWhen: (c) => c.scene_type === "studio",
  },
  {
    key: "time_of_day_detail",
    scope: "scene",
    label: "Time of day (detail)",
    prefix: "Time",
    presets: TIMES_OF_DAY_EXT,
  },
  {
    key: "light_direction",
    scope: "scene",
    label: "Light direction",
    prefix: "Light direction",
    presets: LIGHT_DIRECTIONS,
  },
  {
    key: "light_quality",
    scope: "scene",
    label: "Light quality",
    prefix: "Light quality",
    presets: LIGHT_QUALITIES,
  },
  {
    key: "motion",
    scope: "scene",
    label: "Motion / energy",
    prefix: "Motion",
    presets: MOTION_ENERGY,
  },
  {
    key: "composition_energy",
    scope: "scene",
    label: "Composition energy",
    prefix: "Composition energy",
    presets: COMPOSITION_ENERGY,
  },
  {
    key: "crop_safety",
    scope: "scene",
    label: "Crop-safe zones (for copy)",
    prefix: "Crop safety",
    presets: CROP_SAFETY,
  },
  {
    key: "camera_angle",
    scope: "scene",
    label: "Camera angle",
    prefix: "Camera angle",
    presets: CAMERA_ANGLES_HUMAN,
    // Phase 7j — swap the preset list based on whether people are in frame.
    presetsResolver: (c) =>
      c.cast === "none" || c.cast === "hands"
        ? CAMERA_ANGLES_PRODUCT
        : CAMERA_ANGLES_HUMAN,
  },
  {
    key: "camera_angle_apparel",
    scope: "scene",
    label: "Apparel-specific angle",
    prefix: "Apparel angle",
    presets: CAMERA_ANGLES_APPAREL,
    category: ["fashion"],
    hideWhenNoCast: true,
  },
  {
    key: "camera_angle_footwear",
    scope: "scene",
    label: "Footwear-specific angle",
    prefix: "Footwear angle",
    presets: CAMERA_ANGLES_FOOTWEAR,
    category: ["footwear"],
    hideWhenNoCast: true,
  },
  {
    key: "camera_angle_eyewear",
    scope: "scene",
    label: "Eyewear-specific angle",
    prefix: "Eyewear angle",
    presets: CAMERA_ANGLES_EYEWEAR,
    category: ["eyewear"],
    hideWhenNoCast: true,
  },
  {
    key: "camera_angle_jewelry",
    scope: "scene",
    label: "Jewelry-specific angle",
    prefix: "Jewelry angle",
    presets: CAMERA_ANGLES_JEWELRY,
    category: ["jewelry", "watches"],
    hideWhenNoCast: true,
  },
  // Phase 7i — generic camera angles already include the useful tabletop ones
  // (Top-down 90°, Pour, Splash, Steam, Floating). The dedicated tabletop
  // field is removed because the Tabletop scene type was removed too.
];

export const CAST_EXTRAS_FIELDS: ExtrasField[] = [
  // Phase 7j — ethnicity, age_band removed from here.
  //   • Age is captured by the hardcoded "Age feel" section (cast.age).
  //   • Ethnicity is rendered by the bespoke EthnicityChips component in Step4Cast.
  {
    key: "build",
    scope: "cast",
    label: "Build",
    prefix: "Build",
    presets: BUILDS,
    castOnly: ["solo", "two", "group"],
  },
  {
    key: "pose_energy",
    scope: "cast",
    label: "Pose energy",
    prefix: "Pose",
    presets: POSE_ENERGY,
    castOnly: ["solo", "two", "group", "hands"],
  },
  {
    key: "skin_finish",
    scope: "cast",
    label: "Skin finish",
    prefix: "Skin",
    presets: SKIN_FINISHES,
    castOnly: ["solo", "two", "group"],
  },
  {
    key: "hair",
    scope: "cast",
    label: "Hair styling",
    prefix: "Hair",
    presets: HAIR_STYLES,
    castOnly: ["solo", "two", "group"],
    subFamilyExcept: ["swimwear", "lingerie"],
  },
  {
    key: "makeup",
    scope: "cast",
    label: "Makeup",
    prefix: "Makeup",
    presets: MAKEUP_LOOKS,
    castOnly: ["solo", "two", "group"],
  },
  // Swimwear-specific styling, replaces generic clothing pills.
  {
    key: "swim_styling",
    scope: "cast",
    label: "Swim styling",
    prefix: "Swim styling",
    presets: ["One-piece", "Bikini", "High-waist bottom", "Surf shorts", "Cover-up over", "Wrap skirt over"],
    castOnly: ["solo", "two", "group"],
    subFamilyOnly: ["swimwear"],
  },
  {
    key: "wetness",
    scope: "cast",
    label: "Wetness",
    prefix: "Wetness",
    presets: ["Dry", "Damp / misted", "Freshly out of water", "Glistening / sun-dried"],
    castOnly: ["solo", "two", "group"],
    subFamilyOnly: ["swimwear"],
  },
  {
    key: "lingerie_layer",
    scope: "cast",
    label: "Lingerie layering",
    prefix: "Layer",
    presets: ["Bare", "Robe open", "Sheet draped", "Slip dress over", "Cardigan over"],
    castOnly: ["solo", "two", "group"],
    subFamilyOnly: ["lingerie"],
  },
  // ===== Phase 7o — subfamily-gated product attribute pills =====
  {
    key: "strap_material",
    scope: "scene",
    label: "Strap material",
    prefix: "Strap material",
    presets: ["Leather", "Metal bracelet", "Metal mesh", "Rubber / silicone", "NATO fabric", "Suede"],
    subFamilyOnly: ["watches"],
  },
  {
    key: "dial_time",
    scope: "scene",
    label: "Dial time",
    prefix: "Dial time",
    presets: ["10:10 convention", "Live time", "6:00", "3:00", "12:00"],
    subFamilyOnly: ["watches"],
  },
  {
    key: "lens_tint",
    scope: "scene",
    label: "Lens tint",
    prefix: "Lens tint",
    presets: ["Clear optical", "Smoke", "Mirror finish", "Gradient", "Amber", "Rose", "Green G15"],
    subFamilyOnly: ["eyewear"],
  },
  {
    key: "frame_material",
    scope: "scene",
    label: "Frame material",
    prefix: "Frame material",
    presets: ["Acetate", "Metal", "Titanium", "Tortoise shell", "Wireframe", "Combination"],
    subFamilyOnly: ["eyewear"],
  },
  {
    key: "metal_tone",
    scope: "scene",
    label: "Metal tone",
    prefix: "Metal tone",
    presets: ["Yellow gold", "White gold", "Rose gold", "Sterling silver", "Platinum", "Brushed steel", "Mixed metals"],
    subFamilyOnly: [
      "jewellery-rings",
      "jewellery-necklaces",
      "jewellery-earrings",
      "jewellery-bracelets",
    ],
  },
  {
    key: "stone_presence",
    scope: "scene",
    label: "Stones",
    prefix: "Stones",
    presets: ["No stone", "Single solitaire", "Pavé", "Cluster", "Channel set", "Baguette"],
    subFamilyOnly: [
      "jewellery-rings",
      "jewellery-necklaces",
      "jewellery-earrings",
      "jewellery-bracelets",
    ],
  },
  {
    key: "lacing_state",
    scope: "scene",
    label: "Lacing state",
    prefix: "Lacing",
    presets: ["Fully laced", "Loosely laced", "Unlaced tongue out", "Kicked-off pair"],
    subFamilyOnly: ["sneakers", "boots"],
  },
  {
    key: "sweat_finish",
    scope: "cast",
    label: "Sweat finish",
    prefix: "Sweat",
    presets: ["Dry pre-workout", "Light sheen", "Mid-workout glow", "Post-shower fresh"],
    castOnly: ["solo", "two", "group"],
    subFamilyOnly: ["activewear"],
  },
  {
    key: "skincare_texture",
    scope: "scene",
    label: "Texture state",
    prefix: "Texture state",
    presets: ["Closed jar", "Open jar reveal", "Dollop on hand", "On-skin application", "Cap-off macro"],
    subFamilyOnly: ["beauty-skincare"],
  },
  {
    key: "beverage_state",
    scope: "scene",
    label: "Liquid state",
    prefix: "Liquid state",
    presets: ["Still in glass", "Pouring mid-air", "Fizz rising", "Condensation beads", "Ice cubes", "Steaming hot"],
    subFamilyOnly: ["beverages"],
  },
  {
    key: "supplement_packaging",
    scope: "scene",
    label: "Packaging state",
    prefix: "Packaging state",
    presets: ["Label-front sealed", "Cap-off macro", "Pills out on tray", "Single capsule held", "Powder scoop"],
    subFamilyOnly: ["supplements-wellness"],
  },
  {
    key: "storytelling_moment",
    scope: "cast",
    label: "Storytelling moment",
    prefix: "Moment",
    // Step4Cast overrides via getStorytellingMoments(module, subFamily).
    presets: STORYTELLING_MOMENT,
    castOnly: ["solo", "two", "group", "hands"],
  },
];

/** Filter helper: returns fields applicable to the current category + cast. */
export function applicableFields(
  fields: ExtrasField[],
  module: BrandSceneModule | undefined,
  castPreset: CastPreset | undefined,
  subFamily?: string,
): ExtrasField[] {
  return fields.filter((f) => {
    if (f.category && (!module || !f.category.includes(module))) return false;
    if (f.excludes && module && f.excludes.includes(module)) return false;
    if (f.castOnly && (!castPreset || !f.castOnly.includes(castPreset))) return false;
    if (f.hideWhenNoCast && castPreset === "none") return false;
    if (f.subFamilyOnly && (!subFamily || !f.subFamilyOnly.includes(subFamily))) return false;
    if (f.subFamilyExcept && subFamily && f.subFamilyExcept.includes(subFamily)) return false;
    return true;
  });
}

/** Phase 7f — context-aware filter (scene_type + dependent fields). */
export function applicableFieldsCtx(
  fields: ExtrasField[],
  ctx: SceneCtx,
): ExtrasField[] {
  return applicableFields(fields, ctx.module, ctx.cast, ctx.sub_family).filter((f) => {
    if (f.appliesWhen && !f.appliesWhen(ctx)) return false;
    return true;
  });
}


void isOutdoor;
void isIndoor;
export type { SceneTypeId };
