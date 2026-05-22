/**
 * Brand Scenes — shared constants.
 * Aligned with the 12 canonical product families from src/lib/categoryConstants.ts.
 */

export const BRAND_SCENE_SCHEMA_VERSION = 1 as const;

export const BRAND_SCENE_KEY_PREFIX = "brand-" as const;

/** 12 canonical product families (mirrors PRODUCT_CATEGORIES minus `any`). */
export const BRAND_SCENE_MODULES = [
  "fashion",
  "footwear",
  "bags-accessories",
  "hats-caps-beanies",
  "watches",
  "eyewear",
  "jewelry",
  "beauty-fragrance",
  "home",
  "tech",
  "food-drink",
  "wellness",
] as const;

export type BrandSceneModule = (typeof BRAND_SCENE_MODULES)[number];

/** User-facing labels — match PRODUCT_CATEGORIES copy. */
export const BRAND_SCENE_MODULE_LABELS: Record<BrandSceneModule, string> = {
  fashion: "Fashion & Apparel",
  footwear: "Footwear",
  "bags-accessories": "Bags & Accessories",
  "hats-caps-beanies": "Hats, Caps & Beanies",
  watches: "Watches",
  eyewear: "Eyewear",
  jewelry: "Jewelry",
  "beauty-fragrance": "Beauty & Fragrance",
  home: "Home",
  tech: "Tech",
  "food-drink": "Food & Drink",
  wellness: "Wellness",
};

/** Families with question forms shipped. Others render with a "Coming soon" chip. */
export const BRAND_SCENE_UNLOCKED_MODULES: readonly BrandSceneModule[] = [
  "fashion",
  "footwear",
  "eyewear",
] as const;

export function isBrandSceneModuleUnlocked(m: BrandSceneModule): boolean {
  return BRAND_SCENE_UNLOCKED_MODULES.includes(m);
}

/** Scene source — wizard inputs vs uploaded reference images. */
export const BRAND_SCENE_SOURCES = ["wizard", "reference"] as const;
export type BrandSceneSource = (typeof BRAND_SCENE_SOURCES)[number];

/** Generation economics — mirrors brand-models flow. */
export const BRAND_SCENE_GENERATION_COST = 20 as const;
export const BRAND_SCENE_VARIATIONS_PER_GENERATION = 3 as const;

/** Reference-image upload limits (Path B). */
export const BRAND_SCENE_REFERENCE_MAX_IMAGES = 3 as const;
export const BRAND_SCENE_REFERENCE_MAX_BYTES = 8 * 1024 * 1024;
