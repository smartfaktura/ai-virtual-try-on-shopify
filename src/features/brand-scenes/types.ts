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
  aspect_ratio?: SceneAspectRatio;
  time_of_day?: SceneTimeOfDay;
}

export interface BrandSceneCast {
  preset: CastPreset;
  gender?: CastGender[];
  age?: CastAge[];
  vibe?: CastVibe;
  interaction?: CastInteraction;
  action?: CastAction;
  note?: string;
}

export interface BrandSceneScale {
  preset: ScalePreset;
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
  /** @deprecated Superseded by `cast` + `scale`; kept for back-compat. */
  placement_hint?: string;

  cast?: BrandSceneCast;
  scale?: BrandSceneScale;
  negative_note?: string;
  preview_variants?: BrandScenePreviewVariant[];

  name?: string;
  note?: string;
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
