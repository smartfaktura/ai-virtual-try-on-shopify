/**
 * Brand Scenes — per-family / per-sub-family pill bundle registry.
 * Single source of truth for the category-aware wizard menus.
 *
 * Resolution cascade (most → least specific) is handled by `resolvePresets.ts`:
 *   1. PRESETS[family].sub[sub_family]
 *   2. PRESETS[family]
 *   3. Global defaults from constants/scene.ts & constants/cast.ts
 */

import type { BrandSceneModule } from "../../constants";
import type { ScalePreset } from "../constants/scale";
import type {
  CastInteraction,
  CastPreset,
} from "../constants/cast";
import type {
  SceneLens,
  SceneDepthOfField,
  ScenePalette,
  SceneFinish,
  WardrobeColor,
} from "../constants/scene";
import type {
  Surface,
  PropDensity,
  HandsOnProduct,
  BodyPartFocus,
} from "../constants/sceneExtras";

export interface PresetBundle {
  scale?: ScalePreset[];
  default_scale?: ScalePreset;
  settings?: string[];
  lighting?: string[];
  lens?: SceneLens[];
  depth_of_field?: SceneDepthOfField[];
  framings?: string[];
  moods?: string[];
  palette_presets?: ScenePalette[];
  finishes?: SceneFinish[];
  interactions?: CastInteraction[];
  wardrobe_colors?: WardrobeColor[];
  cast_presets?: CastPreset[];
  default_cast?: CastPreset;
  surfaces?: Surface[];
  prop_density_max?: PropDensity;
  hands_on_product?: HandsOnProduct[];
  body_part_focus?: BodyPartFocus[];
}

type Bundle = PresetBundle & { sub?: Record<string, Partial<PresetBundle>> };

export const PRESETS: Partial<Record<BrandSceneModule, Bundle>> = {
  jewelry: {
    scale: ["pocket"],
    default_scale: "pocket",
    lens: ["macro", "portrait", "tele"],
    depth_of_field: ["extreme", "shallow"],
    interactions: ["wearing", "holding", "beside", "hero"],
    cast_presets: ["solo", "hands", "none"],
    default_cast: "hands",
    settings: ["Studio cyclorama", "Tabletop surface", "Architectural interior", "Domestic"],
    surfaces: ["polished_stone", "velvet", "linen", "paper", "glass"],
    prop_density_max: 2,
    finishes: ["clean_digital", "editorial_matte", "glossy"],
    body_part_focus: ["hands", "wrist", "neck", "face", "detail"],
    sub: {
      "jewellery-rings": {
        cast_presets: ["hands", "none"],
        default_cast: "hands",
        interactions: ["wearing", "holding", "beside", "hero"],
        body_part_focus: ["hands", "detail"],
      },
      "jewellery-earrings": {
        cast_presets: ["solo", "none"],
        default_cast: "solo",
        body_part_focus: ["face", "neck", "detail"],
      },
      "jewellery-necklaces": {
        cast_presets: ["solo", "hands", "none"],
        default_cast: "solo",
        body_part_focus: ["neck", "face", "detail"],
      },
      "jewellery-bracelets": {
        cast_presets: ["hands", "solo", "none"],
        default_cast: "hands",
        body_part_focus: ["wrist", "hands", "detail"],
      },
    },
  },

  watches: {
    scale: ["pocket"],
    default_scale: "pocket",
    lens: ["macro", "portrait", "tele"],
    depth_of_field: ["extreme", "shallow"],
    interactions: ["wearing", "holding", "beside", "hero"],
    cast_presets: ["hands", "solo", "none"],
    default_cast: "hands",
    settings: ["Studio cyclorama", "Tabletop surface", "Architectural interior"],
    surfaces: ["polished_stone", "linen", "velvet", "paper"],
    prop_density_max: 2,
    finishes: ["clean_digital", "editorial_matte", "glossy"],
    body_part_focus: ["wrist", "hands", "detail"],
    hands_on_product: ["wrist_show", "pinch"],
  },

  eyewear: {
    scale: ["pocket"],
    default_scale: "pocket",
    lens: ["portrait", "standard", "tele"],
    depth_of_field: ["shallow", "balanced"],
    interactions: ["wearing", "holding", "beside", "hero"],
    cast_presets: ["solo", "none"],
    default_cast: "solo",
    settings: ["Studio cyclorama", "Outdoor location", "Urban street", "Architectural interior"],
    surfaces: ["polished_stone", "linen", "paper"],
    prop_density_max: 3,
    body_part_focus: ["face", "detail"],
  },

  fashion: {
    scale: ["on_body"],
    default_scale: "on_body",
    lens: ["portrait", "standard", "tele"],
    depth_of_field: ["shallow", "balanced"],
    interactions: ["wearing", "hero"],
    cast_presets: ["solo", "two", "group", "none"],
    default_cast: "solo",
    settings: ["Urban street", "Architectural interior", "Nature", "Studio cyclorama", "Domestic"],
    prop_density_max: 4,
    sub: {
      activewear: {
        moods: ["Energetic", "Confident", "Cinematic"],
        interactions: ["wearing", "hero"],
      },
      dresses: {
        depth_of_field: ["shallow", "balanced"],
        interactions: ["wearing", "hero"],
      },
      lingerie: {
        settings: ["Studio cyclorama", "Domestic", "Architectural interior"],
        interactions: ["wearing", "hero"],
      },
      swimwear: {
        settings: ["Beach / water", "Studio cyclorama", "Outdoor location"],
      },
    },
  },

  footwear: {
    scale: ["on_body", "handheld"],
    default_scale: "on_body",
    lens: ["standard", "tele", "macro"],
    depth_of_field: ["shallow", "balanced"],
    interactions: ["wearing", "holding", "beside", "hero"],
    cast_presets: ["solo", "hands", "none"],
    default_cast: "solo",
    settings: ["Urban street", "Studio cyclorama", "Tabletop surface", "Nature", "Architectural interior"],
    surfaces: ["concrete", "polished_stone", "raw_wood", "sand"],
    body_part_focus: ["feet", "full_body", "detail"],
    sub: {
      "high-heels": {
        settings: ["Studio cyclorama", "Architectural interior", "Urban street"],
        lens: ["portrait", "tele"],
        cast_presets: ["solo", "hands", "none"],
      },
      sneakers: {
        settings: ["Urban street", "Studio cyclorama", "Tabletop surface"],
      },
      boots: {
        settings: ["Nature", "Urban street", "Studio cyclorama"],
      },
    },
  },

  "bags-accessories": {
    scale: ["carry", "handheld", "pocket"],
    default_scale: "carry",
    lens: ["standard", "tele", "portrait"],
    depth_of_field: ["shallow", "balanced"],
    interactions: ["wearing", "holding", "beside", "hero"],
    cast_presets: ["solo", "hands", "none"],
    default_cast: "solo",
    settings: ["Urban street", "Architectural interior", "Studio cyclorama", "Tabletop surface"],
    sub: {
      backpacks: {
        scale: ["carry"],
        default_scale: "carry",
        interactions: ["wearing", "holding", "hero"],
        cast_presets: ["solo", "none"],
      },
      "wallets-cardholders": {
        scale: ["pocket", "handheld"],
        default_scale: "pocket",
        interactions: ["holding", "beside", "hero"],
        cast_presets: ["hands", "none"],
        default_cast: "hands",
        body_part_focus: ["hands", "detail"],
      },
      belts: {
        cast_presets: ["solo", "hands", "none"],
        interactions: ["wearing", "holding", "hero"],
      },
      scarves: {
        cast_presets: ["solo", "none"],
        interactions: ["wearing", "hero"],
      },
    },
  },

  "hats-caps-beanies": {
    scale: ["pocket", "handheld"],
    default_scale: "handheld",
    lens: ["portrait", "standard"],
    depth_of_field: ["shallow", "balanced"],
    interactions: ["wearing", "holding", "beside", "hero"],
    cast_presets: ["solo", "hands", "none"],
    default_cast: "solo",
    body_part_focus: ["face", "full_body", "detail"],
    settings: ["Urban street", "Outdoor location", "Studio cyclorama", "Architectural interior", "Domestic", "Nature"],
    sub: {
      // Phase 7o — sport / skate energy.
      caps: {
        settings: ["Urban street", "Studio cyclorama", "Outdoor location"],
        moods: ["Confident", "Energetic", "Cinematic"],
        interactions: ["wearing", "holding", "hero"],
        body_part_focus: ["face", "full_body"],
      },
      // Phase 7o — editorial / formal millinery.
      hats: {
        settings: ["Architectural interior", "Nature", "Studio cyclorama", "Domestic"],
        moods: ["Editorial", "Romantic", "Cinematic"],
        interactions: ["wearing", "holding", "hero"],
        lens: ["portrait", "tele"],
        body_part_focus: ["face", "full_body", "detail"],
      },
      // Phase 7o — cold-weather / cozy.
      beanies: {
        settings: ["Nature", "Urban street", "Studio cyclorama"],
        moods: ["Cozy", "Cinematic", "Quiet"],
        interactions: ["wearing", "holding", "hero"],
        body_part_focus: ["face", "full_body"],
      },
    },
  },


  "beauty-fragrance": {
    scale: ["pocket"],
    default_scale: "pocket",
    lens: ["macro", "portrait"],
    depth_of_field: ["extreme", "shallow"],
    interactions: ["holding", "beside", "hero"],
    cast_presets: ["none", "hands", "solo"],
    default_cast: "none",
    settings: ["Studio cyclorama", "Tabletop surface", "Architectural interior", "Nature"],
    surfaces: ["polished_stone", "linen", "velvet", "water", "paper"],
    prop_density_max: 3,
    sub: {
      fragrance: {
        cast_presets: ["none", "hands"],
        default_cast: "none",
        hands_on_product: ["cradle", "pinch", "cap"],
      },
      "beauty-skincare": {
        cast_presets: ["hands", "none", "solo"],
        default_cast: "hands",
        hands_on_product: ["cradle", "pinch", "cap", "pour"],
      },
      "makeup-lipsticks": {
        cast_presets: ["hands", "solo", "none"],
        default_cast: "hands",
        body_part_focus: ["face", "hands", "detail"],
        hands_on_product: ["cap", "pinch", "tap"],
      },
    },
  },

  home: {
    scale: ["furniture", "architectural", "carry", "handheld"],
    default_scale: "furniture",
    lens: ["wide", "standard"],
    depth_of_field: ["deep", "balanced"],
    interactions: ["beside", "using", "hero"],
    cast_presets: ["none", "solo"],
    default_cast: "none",
    settings: ["Architectural interior", "Domestic", "Studio cyclorama"],
    surfaces: ["raw_wood", "polished_stone", "concrete"],
    prop_density_max: 4,
    sub: {
      furniture: {
        scale: ["furniture", "architectural"],
        default_scale: "furniture",
        interactions: ["beside", "using", "hero"],
        cast_presets: ["none", "solo"],
      },
      "home-decor": {
        scale: ["handheld", "carry", "furniture"],
        default_scale: "handheld",
        interactions: ["beside", "holding", "using", "hero"],
        cast_presets: ["none", "hands", "solo"],
      },
    },
  },

  tech: {
    scale: ["pocket", "handheld"],
    default_scale: "handheld",
    lens: ["macro", "standard", "portrait"],
    depth_of_field: ["shallow", "balanced"],
    interactions: ["using", "holding", "beside", "hero"],
    cast_presets: ["hands", "solo", "none"],
    default_cast: "hands",
    settings: ["Studio cyclorama", "Tabletop surface", "Architectural interior", "Domestic"],
    surfaces: ["polished_stone", "raw_wood", "paper", "concrete"],
    body_part_focus: ["hands", "detail", "face"],
    hands_on_product: ["tap", "cradle", "pinch"],
  },

  "food-drink": {
    scale: ["handheld"],
    default_scale: "handheld",
    lens: ["macro", "standard", "portrait"],
    depth_of_field: ["shallow", "balanced"],
    interactions: ["using", "holding", "beside", "hero"],
    cast_presets: ["none", "hands", "solo"],
    default_cast: "none",
    settings: ["Tabletop surface", "Domestic", "Studio cyclorama", "Architectural interior"],
    surfaces: ["raw_wood", "linen", "polished_stone", "paper"],
    sub: {
      beverages: {
        cast_presets: ["hands", "none", "solo"],
        default_cast: "hands",
        hands_on_product: ["pour", "cradle", "cap"],
      },
      food: {
        cast_presets: ["none", "hands"],
        default_cast: "none",
      },
      "snacks-food": {
        cast_presets: ["none", "hands"],
        default_cast: "none",
      },
    },
  },

  wellness: {
    scale: ["pocket", "handheld"],
    default_scale: "pocket",
    lens: ["macro", "portrait"],
    depth_of_field: ["shallow", "balanced"],
    interactions: ["holding", "beside", "hero"],
    cast_presets: ["hands", "none", "solo"],
    default_cast: "hands",
    settings: ["Studio cyclorama", "Tabletop surface", "Domestic", "Architectural interior"],
    surfaces: ["linen", "polished_stone", "raw_wood", "paper"],
    hands_on_product: ["cradle", "cap", "pinch"],
  },
};
