/**
 * Category-aware planning modules.
 *
 * Each module describes how a product category should typically be filmed.
 * The planner reads these to bias shot selection, scene types, camera
 * motions, mandatory coverage, negatives and ending tendencies.
 */
import type { ProductCategoryKey, EndingStyle, PaceMode } from '@/types/commerceVideo';

export interface CategoryModule {
  key: ProductCategoryKey;
  label: string;
  preferredShotRoles: string[];
  preferredSceneTypes: string[];
  preferredCameraMotions: string[];
  mandatoryCoverage: string[]; // human-readable cues for the planner
  negatives: string[];
  referenceRequirements: string[]; // recommended reference types
  continuityRules: string[];
  pacingBias: PaceMode;
  endingTendencies: EndingStyle[];
}

export const CATEGORY_MODULES: Record<ProductCategoryKey, CategoryModule> = {
  fashion_apparel: {
    key: 'fashion_apparel',
    label: 'Fashion & Apparel',
    preferredShotRoles: ['atmosphere', 'product_reveal', 'human_interaction', 'detail_closeup', 'brand_finish'],
    preferredSceneTypes: ['lifestyle_context', 'studio_reveal', 'lifestyle_interaction', 'macro_closeup'],
    preferredCameraMotions: ['handheld_gentle', 'tracking', 'slow_pan', 'orbit'],
    mandatoryCoverage: ['on-model framing', 'fabric texture detail', 'silhouette read'],
    negatives: ['distorted body anatomy', 'wrong garment color', 'logo deformation'],
    referenceRequirements: ['main_hero', 'on_body', 'texture'],
    continuityRules: ['keepSameModel', 'keepSameOutfit', 'keepSameLightingFamily'],
    pacingBias: 'balanced',
    endingTendencies: ['clean_brand_close', 'product_close'],
  },
  footwear: {
    key: 'footwear',
    label: 'Footwear',
    preferredShotRoles: ['product_reveal', 'detail_closeup', 'human_interaction', 'brand_finish'],
    preferredSceneTypes: ['studio_reveal', 'macro_closeup', 'lifestyle_context'],
    preferredCameraMotions: ['orbit', 'micro_pan', 'tracking', 'slow_push_in'],
    mandatoryCoverage: ['side profile silhouette', 'sole/heel detail', 'material texture'],
    negatives: ['warped silhouette', 'incorrect colorway', 'misaligned branding'],
    referenceRequirements: ['main_hero', 'side', 'texture'],
    continuityRules: ['keepSameProductState', 'keepSameLightingFamily'],
    pacingBias: 'balanced',
    endingTendencies: ['product_close', 'clean_brand_close'],
  },
  beauty_skincare: {
    key: 'beauty_skincare',
    label: 'Beauty & Skincare',
    preferredShotRoles: ['atmosphere', 'product_reveal', 'detail_closeup', 'human_interaction', 'brand_finish'],
    preferredSceneTypes: ['macro_closeup', 'studio_detail', 'studio_reveal', 'lifestyle_interaction'],
    preferredCameraMotions: ['micro_pan', 'slow_push_in', 'static', 'slow_drift'],
    mandatoryCoverage: ['packaging elegance', 'formula or surface detail', 'hand interaction'],
    negatives: ['unrealistic skin tone shifts', 'label distortion'],
    referenceRequirements: ['main_hero', 'packaging', 'texture'],
    continuityRules: ['keepSameProductState', 'keepSameLightingFamily'],
    pacingBias: 'calm',
    endingTendencies: ['detail_close', 'logo_safe_luxury_end', 'clean_brand_close'],
  },
  makeup: {
    key: 'makeup',
    label: 'Makeup',
    preferredShotRoles: ['product_reveal', 'detail_closeup', 'human_interaction', 'brand_finish'],
    preferredSceneTypes: ['macro_closeup', 'studio_detail', 'lifestyle_interaction'],
    preferredCameraMotions: ['micro_pan', 'slow_push_in', 'orbit'],
    mandatoryCoverage: ['swatch / pigment detail', 'application moment', 'packaging close'],
    negatives: ['skin oversaturation', 'wrong shade', 'label distortion'],
    referenceRequirements: ['main_hero', 'packaging', 'texture', 'opened'],
    continuityRules: ['keepSameProductState'],
    pacingBias: 'balanced',
    endingTendencies: ['detail_close', 'product_close'],
  },
  fragrance: {
    key: 'fragrance',
    label: 'Fragrance',
    preferredShotRoles: ['atmosphere', 'tease', 'product_reveal', 'detail_closeup', 'brand_finish'],
    preferredSceneTypes: ['mood_abstract', 'studio_reveal', 'macro_closeup', 'hero_end_frame'],
    preferredCameraMotions: ['slow_drift', 'slow_push_in', 'micro_pan', 'static'],
    mandatoryCoverage: ['bottle silhouette', 'cap/spray detail', 'luxury surface light'],
    negatives: ['plastic-looking glass', 'logo distortion'],
    referenceRequirements: ['main_hero', 'packaging'],
    continuityRules: ['keepSameLightingFamily', 'keepSameEnvironment'],
    pacingBias: 'calm',
    endingTendencies: ['logo_safe_luxury_end', 'atmosphere_resolve', 'clean_brand_close'],
  },
  jewelry: {
    key: 'jewelry',
    label: 'Jewelry',
    preferredShotRoles: ['atmosphere', 'product_reveal', 'detail_closeup', 'human_interaction', 'brand_finish'],
    preferredSceneTypes: ['macro_closeup', 'studio_detail', 'studio_reveal'],
    preferredCameraMotions: ['micro_pan', 'slow_drift', 'static'],
    mandatoryCoverage: ['micro reflections', 'clasp / setting detail', 'skin contact'],
    negatives: ['blurred metal', 'incorrect gem color'],
    referenceRequirements: ['main_hero', 'detail', 'on_body'],
    continuityRules: ['keepSameLightingFamily', 'keepSameProductState'],
    pacingBias: 'calm',
    endingTendencies: ['logo_safe_luxury_end', 'detail_close'],
  },
  accessories: {
    key: 'accessories',
    label: 'Accessories',
    preferredShotRoles: ['product_reveal', 'detail_closeup', 'human_interaction', 'brand_finish'],
    preferredSceneTypes: ['studio_reveal', 'macro_closeup', 'lifestyle_context'],
    preferredCameraMotions: ['orbit', 'slow_pan', 'micro_pan'],
    mandatoryCoverage: ['hardware detail', 'in-hand or on-body context', 'silhouette read'],
    negatives: ['logo distortion', 'material misread'],
    referenceRequirements: ['main_hero', 'side', 'texture'],
    continuityRules: ['keepSameLightingFamily'],
    pacingBias: 'balanced',
    endingTendencies: ['product_close', 'clean_brand_close'],
  },
  home_decor: {
    key: 'home_decor',
    label: 'Home Decor',
    preferredShotRoles: ['atmosphere', 'product_reveal', 'lifestyle_moment', 'detail_closeup', 'brand_finish'],
    preferredSceneTypes: ['establishing_wide', 'lifestyle_context', 'macro_closeup'],
    preferredCameraMotions: ['slow_pan', 'slow_push_in', 'tracking'],
    mandatoryCoverage: ['placement context', 'material detail', 'scale reference'],
    negatives: ['warped geometry', 'unrealistic scale'],
    referenceRequirements: ['main_hero', 'scale_reference', 'texture'],
    continuityRules: ['keepSameEnvironment', 'keepSameLightingFamily'],
    pacingBias: 'calm',
    endingTendencies: ['atmosphere_resolve', 'product_close'],
  },
  food_beverage: {
    key: 'food_beverage',
    label: 'Food & Beverage',
    preferredShotRoles: ['atmosphere', 'product_reveal', 'detail_closeup', 'human_interaction', 'brand_finish'],
    preferredSceneTypes: ['studio_reveal', 'macro_closeup', 'lifestyle_interaction'],
    preferredCameraMotions: ['slow_push_in', 'micro_pan', 'static'],
    mandatoryCoverage: ['packaging clarity', 'pour / texture moment', 'serving context'],
    negatives: ['unrealistic gloss', 'label distortion'],
    referenceRequirements: ['main_hero', 'packaging', 'texture'],
    continuityRules: ['keepSameLightingFamily'],
    pacingBias: 'balanced',
    endingTendencies: ['product_close', 'clean_brand_close'],
  },
  supplements: {
    key: 'supplements',
    label: 'Supplements',
    preferredShotRoles: ['product_reveal', 'detail_closeup', 'human_interaction', 'brand_finish'],
    preferredSceneTypes: ['studio_reveal', 'macro_closeup', 'studio_detail'],
    preferredCameraMotions: ['slow_push_in', 'micro_pan', 'static'],
    mandatoryCoverage: ['packaging clarity', 'label readability', 'in-hand scale'],
    negatives: ['label distortion', 'misread ingredient panel'],
    referenceRequirements: ['main_hero', 'packaging', 'ingredient_reference'],
    continuityRules: ['keepSameProductState'],
    pacingBias: 'balanced',
    endingTendencies: ['product_close', 'marketplace_clean_end', 'clean_brand_close'],
  },
  electronics: {
    key: 'electronics',
    label: 'Electronics',
    preferredShotRoles: ['product_reveal', 'detail_closeup', 'product_focus', 'human_interaction', 'brand_finish'],
    preferredSceneTypes: ['studio_reveal', 'macro_closeup', 'studio_detail', 'lifestyle_interaction'],
    preferredCameraMotions: ['orbit', 'slow_push_in', 'micro_pan'],
    mandatoryCoverage: ['port / button detail', 'material finish', 'in-use context'],
    negatives: ['warped geometry', 'logo distortion', 'fake screen content'],
    referenceRequirements: ['main_hero', 'side', 'back', 'texture'],
    continuityRules: ['keepSameProductState', 'keepSameLightingFamily'],
    pacingBias: 'balanced',
    endingTendencies: ['product_close', 'clean_brand_close'],
  },
  general_product: {
    key: 'general_product',
    label: 'General Product',
    preferredShotRoles: ['product_reveal', 'detail_closeup', 'lifestyle_moment', 'brand_finish'],
    preferredSceneTypes: ['studio_reveal', 'macro_closeup', 'lifestyle_context', 'hero_end_frame'],
    preferredCameraMotions: ['slow_push_in', 'micro_pan', 'orbit', 'static'],
    mandatoryCoverage: ['hero shot', 'detail shot', 'context shot'],
    negatives: ['warped geometry', 'logo distortion'],
    referenceRequirements: ['main_hero'],
    continuityRules: ['keepSameLightingFamily'],
    pacingBias: 'balanced',
    endingTendencies: ['product_close', 'clean_brand_close'],
  },
};

export function getCategoryModule(key: ProductCategoryKey | undefined | null): CategoryModule {
  if (!key) return CATEGORY_MODULES.general_product;
  return CATEGORY_MODULES[key] || CATEGORY_MODULES.general_product;
}
