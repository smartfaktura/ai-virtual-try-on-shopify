/**
 * Commerce Video Engine — single source-of-truth canonical schema.
 *
 * This module unifies enums, types and defaults across:
 *  - AI Director / shot planner (edge function)
 *  - Frontend shot editor
 *  - Prompt builder
 *  - Validation layer
 *  - Generation payload builder
 *
 * All fields are OPTIONAL on existing types — adding them must never break
 * legacy drafts or projects. Use `migrateLegacyDraft()` to fill defaults.
 */

// ── Content Intent ───────────────────────────────────────────────────────
export type ContentIntent =
  | 'product_showcase'
  | 'product_detail_film'
  | 'pdp_video'
  | 'social_content'
  | 'creator_style_content'
  | 'launch_teaser'
  | 'brand_mood_film'
  | 'campaign_editorial'
  | 'feature_benefit_video'
  | 'performance_ad';

// ── Distribution platform ────────────────────────────────────────────────
export type Platform =
  | 'instagram_reels'
  | 'tiktok'
  | 'meta_feed'
  | 'website_pdp'
  | 'marketplace'
  | 'youtube_shorts'
  | 'general';

// ── Sound mode (richer than legacy audioMode) ────────────────────────────
export type SoundMode =
  | 'full_audio'
  | 'music_plus_sfx'
  | 'voiceover_plus_music'
  | 'silent_first'
  | 'caption_first'
  | 'music_only'
  | 'no_voiceover';

// ── Pace & priority ──────────────────────────────────────────────────────
export type PaceMode = 'calm' | 'balanced' | 'dynamic';

export type ProductPriority =
  | 'hero_product'
  | 'texture_detail'
  | 'usage_context'
  | 'human_connection'
  | 'brand_mood';

// ── Ending style ─────────────────────────────────────────────────────────
export type EndingStyle =
  | 'auto'
  | 'product_close'
  | 'clean_brand_close'
  | 'detail_close'
  | 'atmosphere_resolve'
  | 'soft_cta'
  | 'hard_cta'
  | 'marketplace_clean_end'
  | 'logo_safe_luxury_end';

// ── Product category ─────────────────────────────────────────────────────
export type ProductCategoryKey =
  | 'fashion_apparel'
  | 'footwear'
  | 'beauty_skincare'
  | 'makeup'
  | 'fragrance'
  | 'jewelry'
  | 'accessories'
  | 'home_decor'
  | 'food_beverage'
  | 'supplements'
  | 'electronics'
  | 'general_product';

// ── Reference type (continuity engine) ───────────────────────────────────
export type ReferenceType =
  | 'main_hero'
  | 'front'
  | 'side'
  | 'back'
  | 'top'
  | 'bottom'
  | 'texture'
  | 'packaging'
  | 'opened'
  | 'closed'
  | 'in_hand'
  | 'on_body'
  | 'scale_reference'
  | 'ingredient_reference'
  | 'variant_reference'
  | 'brand_model'
  | 'brand_scene';

// ── Continuity locks (project-level) ─────────────────────────────────────
export interface ContinuitySettings {
  keepSameModel?: boolean;
  keepSameOutfit?: boolean;
  keepSameEnvironment?: boolean;
  keepSameLightingFamily?: boolean;
  keepSameProductState?: boolean;
}

// ── Product fidelity object (per project) ────────────────────────────────
export type SensitivityLevel = 'low' | 'medium' | 'high';

export interface ProductFidelity {
  productCategory?: ProductCategoryKey;
  productName?: string;
  mustPreserveAttributes?: string[];
  forbiddenDeviations?: string[];
  logoSensitivity?: SensitivityLevel;
  packagingSensitivity?: SensitivityLevel;
  colorSensitivity?: SensitivityLevel;
  materialSensitivity?: SensitivityLevel;
  geometrySensitivity?: SensitivityLevel;
  textLegibilityPriority?: SensitivityLevel;
  wornMode?: boolean;
}

// ── Per-shot extensions (additive, all optional) ─────────────────────────
export interface ShotCommerceExtensions {
  clarity_first?: boolean;
  branding_accuracy_priority?: SensitivityLevel;
  material_accuracy_priority?: SensitivityLevel;
  shape_accuracy_priority?: SensitivityLevel;
  text_legibility_priority?: SensitivityLevel;
  continuity_lock?: ContinuitySettings;
  reference_strategy?: ReferenceType[];
}

// ── Project-level commerce settings (added to ShortFilmSettings) ─────────
export interface CommerceVideoSettings {
  contentIntent?: ContentIntent;
  platform?: Platform;
  soundMode?: SoundMode;
  paceMode?: PaceMode;
  productPriority?: ProductPriority;
  endingStyle?: EndingStyle;
  audienceContext?: string;
  offerContext?: string;
  silentFirstMode?: boolean;
  clarityFirstMode?: boolean;
  category?: ProductCategoryKey;
  continuity?: ContinuitySettings;
  productFidelity?: ProductFidelity;
}

// ── Defaults ─────────────────────────────────────────────────────────────
export const DEFAULT_CONTENT_INTENT: ContentIntent = 'product_showcase';
export const DEFAULT_PLATFORM: Platform = 'general';
export const DEFAULT_SOUND_MODE: SoundMode = 'music_plus_sfx';
export const DEFAULT_PACE_MODE: PaceMode = 'balanced';
export const DEFAULT_PRODUCT_PRIORITY: ProductPriority = 'hero_product';
export const DEFAULT_ENDING_STYLE: EndingStyle = 'auto';

// Intents where clarity-first mode should be auto-suggested ON
export const CLARITY_FIRST_INTENTS: ContentIntent[] = [
  'product_showcase',
  'pdp_video',
  'product_detail_film',
];

// Intents that benefit from CTA / persuasive VO
export const PERSUASIVE_INTENTS: ContentIntent[] = [
  'performance_ad',
  'feature_benefit_video',
];
