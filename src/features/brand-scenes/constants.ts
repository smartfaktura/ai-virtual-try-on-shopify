/**
 * Brand Scenes — shared constants.
 * Phase 2 foundation. Not imported anywhere outside this folder yet.
 */

export const BRAND_SCENE_SCHEMA_VERSION = 1 as const;

export const BRAND_SCENE_KEY_PREFIX = "brand-" as const;

export const BRAND_SCENE_MODULES = [
  "apparel",
  "footwear",
  "eyewear",
  "bags",
  "fragrance",
  "activewear",
  "accessories",
  "beauty",
  "home",
] as const;

export type BrandSceneModule = (typeof BRAND_SCENE_MODULES)[number];
