/**
 * Brand Scenes — TypeScript types.
 * Mirrors the 6 new columns added to product_image_scenes in Phase 1.
 */

import type { BrandSceneModule, BrandSceneSource } from "./constants";

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
 * Discriminated union keyed by `module`. Each category wizard fills its
 * own slot in its dedicated phase.
 */
export interface BrandSceneAnswers {
  /** Origin of the scene inputs. */
  source: BrandSceneSource;
  module: BrandSceneModule;
  /** Sub-family slug — becomes category_collection on the saved row. */
  sub_family: string;
  base: BrandSceneBaseAnswers;
  /** Per-module question payload. Filled in by category wizards. */
  module_answers: Record<string, unknown>;
  /** Storage paths of uploaded reference images (only when source === 'reference'). */
  reference_image_paths?: string[];
}

/** Full row shape (post-insert). */
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

/** Pre-insert wizard payload. */
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
