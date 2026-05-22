/**
 * Brand Scenes — TypeScript types.
 * Mirrors the 6 new columns added to product_image_scenes in Phase 1.
 */

import type { BrandSceneModule } from "./constants";

/** Shared base shape every category wizard collects. */
export interface BrandSceneBaseAnswers {
  aesthetic?: string;
  palette?: string[];
  mood?: string;
  lighting?: string;
  location?: string;
  framing?: string;
  notes?: string;
}

/**
 * Discriminated union keyed by `module`. Phase 2 ships only the shared
 * base shape + an empty per-module slot. Each category wizard fills its
 * own slot in its dedicated future phase.
 */
export interface BrandSceneAnswers {
  module: BrandSceneModule;
  base: BrandSceneBaseAnswers;
  /** Per-module question payload. Filled in by category wizards later. */
  module_answers: Record<string, unknown>;
}

/** Full row shape (post-insert) matching product_image_scenes + brand fields. */
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

/** Pre-insert wizard payload (no id, no timestamps). */
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
