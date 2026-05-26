/**
 * Brand Scenes — TypeScript types.
 */

import type { BrandSceneModule, BrandSceneSource } from "./constants";
import type {
  CastAction,
  CastAge,
  CastGender,
  CastInteraction,
  CastPreset,
  CastVibe,
} from "./wizard/constants/cast";
import type { ScalePreset, ScaleUnit } from "./wizard/constants/scale";
import type { ReferenceIntent } from "./prompt/buildReferenceDirective";
import type {
  SceneWeather,
  SceneSeason,
  SceneLens,
  SceneDepthOfField,
  ScenePalette,
  SceneFinish,
  WardrobeColor,
} from "./wizard/constants/scene";
import type {
  Surface,
  PropDensity,
  ColorContrast,
  Saturation,
  Shadow,
  Composition,
  NegSpaceIntent,
  AestheticEra,
  RealismLevel,
  BrandVoice,
  OutputUseCase,
  SubjectFocus,
  BodyPartFocus,
  GazeDirection,
  GroupDynamic,
  HandsOnProduct,
  Diversity,
} from "./wizard/constants/sceneExtras";

export type SceneAspectRatio = "4:5" | "1:1" | "3:4" | "16:9";
export type SceneTimeOfDay = "morning" | "midday" | "evening" | "night";

/** Shared base shape every category wizard collects. */
export interface BrandSceneBaseAnswers {
  /** Scene type — indoor/outdoor/studio etc. */
  aesthetic?: string;
  palette?: string[];
  mood?: string;
  lighting?: string;
  location?: string;
  framing?: string;
  notes?: string;
  /** Always "4:5" — locked. Kept on type for forward-compat. */
  aspect_ratio?: SceneAspectRatio;
  time_of_day?: SceneTimeOfDay;

  // Phase 7b additions — all optional.
  setting?: string;
  weather?: SceneWeather;
  season?: SceneSeason;
  lens?: SceneLens;
  lens_custom?: string;
  depth_of_field?: SceneDepthOfField;
  depth_of_field_custom?: string;
  palette_preset?: ScenePalette;
  palette_custom?: string;
  finish?: SceneFinish;
  finish_custom?: string;
  avoid?: string;

  // Phase 7c additions — versatility dials.
  subject_focus?: SubjectFocus;
  subject_focus_custom?: string;
  surface?: Surface;
  prop_density?: PropDensity;
  color_contrast?: ColorContrast;
  color_contrast_custom?: string;
  saturation?: Saturation;
  saturation_custom?: string;
  shadows?: Shadow;
  shadows_custom?: string;
  composition?: Composition;
  composition_custom?: string;
  negative_space_intent?: NegSpaceIntent;
  negative_space_intent_custom?: string;
  aesthetic_era?: AestheticEra;
  realism?: RealismLevel;
  realism_custom?: string;
  brand_voice?: BrandVoice;
  output_use_case?: OutputUseCase;

  // Phase 7d — flexible dial map. Keys come from `wizard/constants/extras`.
  // Values are free strings (preset label OR user custom entry).
  extras?: Record<string, string>;

  // Phase 7f — scene type (Stage A) for progressive flow + rule context.
  scene_type?: "studio" | "indoor_lifestyle" | "outdoor_location" | "outdoor_nature" | "architectural";
  /** Marks which extras keys were auto-cascaded (vs user-picked). */
  auto?: Record<string, true>;
  /** Recommendations surfaced after the user clears an auto-filled value. */
  recommendations?: Record<string, string>;
}

export interface BrandSceneCast {
  preset?: CastPreset;
  gender?: CastGender[];
  age?: CastAge[];
  vibe?: CastVibe;
  interaction?: CastInteraction;
  action?: CastAction;
  action_note?: string;
  note?: string;
  wardrobe_color?: WardrobeColor;
  wardrobe_custom?: string;

  // Phase 7c additions — cast extras.
  body_part_focus?: BodyPartFocus;
  gaze?: GazeDirection;
  group_dynamic?: GroupDynamic;
  hands_on_product?: HandsOnProduct;
  diversity?: Diversity;

  // Phase 7d — flexible cast styling map.
  extras?: Record<string, string>;

  // Outfit-direction quiz (Styling tab). Each slot is preset+custom string.
  outfit?: {
    vibe?: { preset?: string; custom?: string };
    top?: { preset?: string; custom?: string };
    bottom?: { preset?: string; custom?: string };
    footwear?: { preset?: string; custom?: string };
  };

  /**
   * Optional featured model anchor. When set, generation uses this image as
   * the primary identity reference and the saved prompt swaps generic cast
   * descriptors for `[MODEL IMAGE]`.
   */
  model_ref?: {
    modelId: string;
    name: string;
    sourceImageUrl: string;
    previewUrl: string;
    gender?: string;
    ageRange?: string;
    origin: "built_in" | "brand";
  };

  /**
   * Multi-anchor support for "two" / "group" presets. Slot 0 mirrors
   * `model_ref` for backward compatibility; only slot 0's image is attached
   * to the generation request today — additional slots are emitted as
   * descriptive cast direction.
   */
  model_refs?: Array<{
    modelId: string;
    name: string;
    sourceImageUrl: string;
    previewUrl: string;
    gender?: string;
    ageRange?: string;
    origin: "built_in" | "brand";
  }>;
}

export interface BrandSceneScale {
  preset?: ScalePreset;
  note?: string;
  dimensions?: {
    w: number;
    h: number;
    d?: number;
    units: ScaleUnit;
  };
}

export interface BrandScenePreviewVariant {
  image_url: string;
  generation_id: string;
  chosen?: boolean;
}

export interface BrandSceneAnswers {
  source: BrandSceneSource;
  module?: BrandSceneModule;
  sub_family: string;
  base: BrandSceneBaseAnswers;
  module_answers: Record<string, unknown>;

  reference_image_paths?: string[];
  reference_preview_url?: string;
  reference_intent?: ReferenceIntent;
  reference_outfit?: ReferenceOutfit;
  /** @deprecated Superseded by `cast` + `scale`; kept for back-compat. */
  placement_hint?: string;

  cast?: BrandSceneCast;
  scale?: BrandSceneScale;
  negative_note?: string;
  preview_variants?: BrandScenePreviewVariant[];

  name?: string;
  note?: string;
}

export interface ReferenceOutfit {
  description: string;
  breakdown?: {
    silhouette?: string;
    top?: string;
    bottom?: string;
    outerwear?: string;
    footwear?: string;
    accessories?: string;
    palette?: string[];
    fabric_notes?: string;
    styling_notes?: string;
    era_or_vibe?: string;
  };
  source_image_path: string;
  generated_at: string;
  edited_by_user: boolean;
}

export interface BrandScene {
  id: string;
  scene_key: string;
  category_collection: string;
  is_active: boolean;
  is_brand_scene: true;
  owner_user_id: string;
  brand_scene_module: BrandSceneModule;
  brand_scene_schema_version: number;
  brand_scene_answers: BrandSceneAnswers;
  source_generation_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BrandSceneDraft {
  scene_key: string;
  category_collection: string;
  is_active: boolean;
  is_brand_scene: true;
  owner_user_id: string;
  brand_scene_module: BrandSceneModule;
  brand_scene_schema_version: number;
  brand_scene_answers: BrandSceneAnswers;
  source_generation_id?: string | null;
  sort_order: number;
}
