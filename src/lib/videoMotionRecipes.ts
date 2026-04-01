/**
 * Video Motion Recipes — Category-Aware Ecommerce Motion Engine
 * 
 * Central registry of product categories, scene types, motion goals,
 * and default preservation rules for the Animate Image workflow.
 * 
 * Now includes a CATEGORY_SCENE_MOTION_MATRIX for scene-type-aware
 * goal filtering and recommendation ranking.
 */

// ─── Product Categories ───

export interface ProductCategory {
  id: string;
  label: string;
  icon: string;
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { id: 'fashion_apparel', label: 'Fashion & Apparel', icon: 'Shirt' },
  { id: 'beauty_skincare', label: 'Beauty & Skincare', icon: 'Sparkles' },
  { id: 'fragrances', label: 'Fragrances', icon: 'Flower2' },
  { id: 'jewelry', label: 'Jewelry', icon: 'Gem' },
  { id: 'accessories', label: 'Accessories', icon: 'Watch' },
  { id: 'home_decor', label: 'Home & Decor', icon: 'Lamp' },
  { id: 'food_beverage', label: 'Food & Beverage', icon: 'UtensilsCrossed' },
  { id: 'electronics', label: 'Electronics', icon: 'Smartphone' },
  { id: 'sports_fitness', label: 'Sports & Fitness', icon: 'Dumbbell' },
  { id: 'health_supplements', label: 'Health & Supplements', icon: 'Pill' },
];

// ─── Scene Types ───

export interface SceneType {
  id: string;
  label: string;
}

export const SCENE_TYPES: SceneType[] = [
  { id: 'studio_product', label: 'Studio Product Shot' },
  { id: 'on_model', label: 'On-Model Shot' },
  { id: 'lifestyle_scene', label: 'Lifestyle Scene' },
  { id: 'hand_held', label: 'Hand-Held Product' },
  { id: 'flat_lay', label: 'Flat Lay' },
  { id: 'macro_closeup', label: 'Macro / Close-Up' },
  { id: 'interior_room', label: 'Interior / Room Scene' },
  { id: 'action_scene', label: 'Action Scene' },
  { id: 'food_plated', label: 'Food Served / Plated' },
  { id: 'device_on_desk', label: 'Device on Desk' },
  { id: 'talking_portrait', label: 'Talking Portrait' },
];

// ─── Motion Goals ───

export interface MotionGoal {
  id: string;
  title: string;
  description: string;
  subjectMotion: string;
  defaultCameraMotion: string;
  defaultIntensity: 'low' | 'medium' | 'high';
}

const FASHION_GOALS: MotionGoal[] = [
  { id: 'subtle_fashion_pose', title: 'Subtle Fashion Pose', description: 'Gentle body shift and premium campaign motion', subjectMotion: 'natural_pose_shift', defaultCameraMotion: 'slow_push_in', defaultIntensity: 'low' },
  { id: 'fabric_movement', title: 'Fabric Movement', description: 'Soft realistic motion in garment edges, sleeves, hems', subjectMotion: 'hair_fabric', defaultCameraMotion: 'camera_drift', defaultIntensity: 'low' },
  { id: 'editorial_walk_start', title: 'Editorial Walk Start', description: 'Controlled first-step energy', subjectMotion: 'action_motion', defaultCameraMotion: 'gentle_pan', defaultIntensity: 'medium' },
  { id: 'hand_adjustment', title: 'Hand Adjustment Motion', description: 'Natural hand, sleeve, collar, or accessory adjustment', subjectMotion: 'hand_object_interaction', defaultCameraMotion: 'slow_push_in', defaultIntensity: 'low' },
  { id: 'premium_campaign_reveal', title: 'Premium Campaign Reveal', description: 'Minimal body motion + elegant camera motion', subjectMotion: 'minimal', defaultCameraMotion: 'premium_handheld', defaultIntensity: 'low' },
];

const BEAUTY_GOALS: MotionGoal[] = [
  { id: 'luxury_product_reveal', title: 'Luxury Product Reveal', description: 'Clean premium motion with product-first focus', subjectMotion: 'minimal', defaultCameraMotion: 'slow_push_in', defaultIntensity: 'low' },
  { id: 'hand_held_beauty', title: 'Hand-Held Beauty Motion', description: 'Natural hand rotation and controlled presentation', subjectMotion: 'hand_object_interaction', defaultCameraMotion: 'camera_drift', defaultIntensity: 'low' },
  { id: 'soft_skincare_glow', title: 'Soft Skincare Glow', description: 'Gentle lighting and polished motion feel', subjectMotion: 'minimal', defaultCameraMotion: 'slow_push_in', defaultIntensity: 'low' },
  { id: 'texture_focus', title: 'Texture Focus', description: 'Motion that emphasizes gloss, cream, liquid, or finish', subjectMotion: 'minimal', defaultCameraMotion: 'slow_push_in', defaultIntensity: 'low' },
  { id: 'vanity_ad_motion', title: 'Vanity Ad Motion', description: 'Calm premium beauty scene movement', subjectMotion: 'minimal', defaultCameraMotion: 'camera_drift', defaultIntensity: 'low' },
];

const FRAGRANCE_GOALS: MotionGoal[] = [
  { id: 'luxury_fragrance_reveal', title: 'Luxury Fragrance Reveal', description: 'Premium bottle entrance with elegant presence', subjectMotion: 'minimal', defaultCameraMotion: 'slow_push_in', defaultIntensity: 'low' },
  { id: 'reflective_shimmer', title: 'Reflective Shimmer Motion', description: 'Light play on glass and metallic surfaces', subjectMotion: 'minimal', defaultCameraMotion: 'camera_drift', defaultIntensity: 'low' },
  { id: 'premium_bottle_showcase', title: 'Premium Bottle Showcase', description: 'Clean rotation and detail reveal', subjectMotion: 'minimal', defaultCameraMotion: 'orbit', defaultIntensity: 'low' },
  { id: 'editorial_perfume_ad', title: 'Editorial Perfume Ad', description: 'High-fashion editorial motion feel', subjectMotion: 'minimal', defaultCameraMotion: 'premium_handheld', defaultIntensity: 'low' },
  { id: 'hand_held_bottle_rotation', title: 'Hand-Held Bottle Rotation', description: 'Natural hand presentation and turn', subjectMotion: 'hand_object_interaction', defaultCameraMotion: 'slow_push_in', defaultIntensity: 'low' },
];

const JEWELRY_GOALS: MotionGoal[] = [
  { id: 'sparkle_detail', title: 'Sparkle Detail Motion', description: 'Light catching gems and metals', subjectMotion: 'minimal', defaultCameraMotion: 'camera_drift', defaultIntensity: 'low' },
  { id: 'luxury_jewelry_reveal', title: 'Luxury Jewelry Reveal', description: 'Premium entrance and showcase', subjectMotion: 'minimal', defaultCameraMotion: 'slow_push_in', defaultIntensity: 'low' },
  { id: 'hand_movement_showcase', title: 'Hand Movement Showcase', description: 'Subtle hand/wrist motion to show piece', subjectMotion: 'hand_object_interaction', defaultCameraMotion: 'slow_push_in', defaultIntensity: 'low' },
  { id: 'macro_shine', title: 'Macro Shine Effect', description: 'Close-up light shimmer on detail', subjectMotion: 'minimal', defaultCameraMotion: 'camera_drift', defaultIntensity: 'low' },
  { id: 'worn_jewelry_pose', title: 'Worn Jewelry Pose Shift', description: 'Model with slight pose to showcase jewelry', subjectMotion: 'natural_pose_shift', defaultCameraMotion: 'slow_push_in', defaultIntensity: 'low' },
];

const ACCESSORIES_GOALS: MotionGoal[] = [
  { id: 'hold_and_reveal', title: 'Hold and Reveal', description: 'Natural reveal of accessory in hand', subjectMotion: 'hand_object_interaction', defaultCameraMotion: 'slow_push_in', defaultIntensity: 'low' },
  { id: 'luxury_accessory', title: 'Luxury Accessory Motion', description: 'Premium product showcase feel', subjectMotion: 'minimal', defaultCameraMotion: 'camera_drift', defaultIntensity: 'low' },
  { id: 'wrist_detail', title: 'Wrist Detail Motion', description: 'Watch or bracelet detail with hand movement', subjectMotion: 'hand_object_interaction', defaultCameraMotion: 'slow_push_in', defaultIntensity: 'low' },
  { id: 'premium_product_showcase', title: 'Premium Product Showcase', description: 'Clean reveal and detail presentation', subjectMotion: 'minimal', defaultCameraMotion: 'orbit', defaultIntensity: 'low' },
  { id: 'on_body_lifestyle', title: 'On-Body Lifestyle Motion', description: 'Worn accessory with subtle body motion', subjectMotion: 'natural_pose_shift', defaultCameraMotion: 'camera_drift', defaultIntensity: 'medium' },
];

const HOME_DECOR_GOALS: MotionGoal[] = [
  { id: 'calm_interior', title: 'Calm Interior Motion', description: 'Gentle room atmosphere movement', subjectMotion: 'minimal', defaultCameraMotion: 'camera_drift', defaultIntensity: 'low' },
  { id: 'ambient_lifestyle', title: 'Ambient Lifestyle Movement', description: 'Natural light and environment motion', subjectMotion: 'minimal', defaultCameraMotion: 'gentle_pan', defaultIntensity: 'low' },
  { id: 'soft_atmosphere_reveal', title: 'Soft Atmosphere Reveal', description: 'Premium home setting entrance', subjectMotion: 'minimal', defaultCameraMotion: 'slow_push_in', defaultIntensity: 'low' },
  { id: 'decor_detail_showcase', title: 'Decor Detail Showcase', description: 'Focus on product craftsmanship', subjectMotion: 'minimal', defaultCameraMotion: 'slow_push_in', defaultIntensity: 'low' },
  { id: 'warm_light_motion', title: 'Warm Light Motion', description: 'Candle, lamp, or warm light atmosphere', subjectMotion: 'minimal', defaultCameraMotion: 'camera_drift', defaultIntensity: 'low' },
];

const FOOD_BEVERAGE_GOALS: MotionGoal[] = [
  { id: 'fresh_serve', title: 'Fresh Serve Motion', description: 'Natural food presentation movement', subjectMotion: 'minimal', defaultCameraMotion: 'slow_push_in', defaultIntensity: 'low' },
  { id: 'pour_and_reveal', title: 'Pour and Reveal', description: 'Liquid pour or drizzle motion', subjectMotion: 'action_motion', defaultCameraMotion: 'slow_push_in', defaultIntensity: 'medium' },
  { id: 'steam_atmosphere', title: 'Steam and Atmosphere', description: 'Rising steam and warm atmosphere', subjectMotion: 'minimal', defaultCameraMotion: 'camera_drift', defaultIntensity: 'low' },
  { id: 'beverage_shimmer', title: 'Beverage Shimmer', description: 'Condensation, bubbles, or liquid shimmer', subjectMotion: 'minimal', defaultCameraMotion: 'slow_push_in', defaultIntensity: 'low' },
  { id: 'food_closeup', title: 'Food Close-Up Movement', description: 'Detailed food texture motion', subjectMotion: 'minimal', defaultCameraMotion: 'slow_push_in', defaultIntensity: 'low' },
];

const ELECTRONICS_GOALS: MotionGoal[] = [
  { id: 'tech_product_reveal', title: 'Tech Product Reveal', description: 'Clean premium tech entrance', subjectMotion: 'minimal', defaultCameraMotion: 'slow_push_in', defaultIntensity: 'low' },
  { id: 'device_in_hand', title: 'Device in Hand Motion', description: 'Natural hand interaction with device', subjectMotion: 'hand_object_interaction', defaultCameraMotion: 'camera_drift', defaultIntensity: 'low' },
  { id: 'clean_rotation', title: 'Clean Rotation Showcase', description: 'Controlled product rotation', subjectMotion: 'minimal', defaultCameraMotion: 'orbit', defaultIntensity: 'low' },
  { id: 'premium_electronics_ad', title: 'Premium Electronics Ad', description: 'High-end tech ad motion feel', subjectMotion: 'minimal', defaultCameraMotion: 'premium_handheld', defaultIntensity: 'low' },
  { id: 'screen_glow_detail', title: 'Screen Glow Detail', description: 'Screen light and interface motion', subjectMotion: 'minimal', defaultCameraMotion: 'slow_push_in', defaultIntensity: 'low' },
];

const SPORTS_FITNESS_GOALS: MotionGoal[] = [
  { id: 'realistic_sports_action', title: 'Realistic Sports Action', description: 'Controlled athletic motion and action', subjectMotion: 'action_motion', defaultCameraMotion: 'slow_push_in', defaultIntensity: 'medium' },
  { id: 'controlled_athlete', title: 'Controlled Athlete Motion', description: 'Subtle athletic body shift', subjectMotion: 'natural_pose_shift', defaultCameraMotion: 'camera_drift', defaultIntensity: 'medium' },
  { id: 'product_in_action', title: 'Product-in-Action Showcase', description: 'Sports product being used', subjectMotion: 'action_motion', defaultCameraMotion: 'gentle_pan', defaultIntensity: 'medium' },
  { id: 'dynamic_training', title: 'Dynamic Training Movement', description: 'Training/workout energy motion', subjectMotion: 'action_motion', defaultCameraMotion: 'premium_handheld', defaultIntensity: 'high' },
  { id: 'object_interaction', title: 'Object Interaction Motion', description: 'Ball bounce, equipment use, prop action', subjectMotion: 'hand_object_interaction', defaultCameraMotion: 'slow_push_in', defaultIntensity: 'medium' },
];

const HEALTH_SUPPLEMENTS_GOALS: MotionGoal[] = [
  { id: 'clean_supplement_reveal', title: 'Clean Supplement Reveal', description: 'Clinical premium product entrance', subjectMotion: 'minimal', defaultCameraMotion: 'slow_push_in', defaultIntensity: 'low' },
  { id: 'wellness_product', title: 'Wellness Product Motion', description: 'Clean and trustworthy showcase', subjectMotion: 'minimal', defaultCameraMotion: 'camera_drift', defaultIntensity: 'low' },
  { id: 'hand_held_bottle', title: 'Hand-Held Bottle Showcase', description: 'Natural hand presentation', subjectMotion: 'hand_object_interaction', defaultCameraMotion: 'slow_push_in', defaultIntensity: 'low' },
  { id: 'clinical_premium_ad', title: 'Clinical Premium Ad', description: 'Medical-grade premium feel', subjectMotion: 'minimal', defaultCameraMotion: 'slow_push_in', defaultIntensity: 'low' },
  { id: 'ingredient_atmosphere', title: 'Ingredient Atmosphere Motion', description: 'Natural ingredient showcase feel', subjectMotion: 'minimal', defaultCameraMotion: 'camera_drift', defaultIntensity: 'low' },
];

const MOTION_GOALS_BY_CATEGORY: Record<string, MotionGoal[]> = {
  fashion_apparel: FASHION_GOALS,
  beauty_skincare: BEAUTY_GOALS,
  fragrances: FRAGRANCE_GOALS,
  jewelry: JEWELRY_GOALS,
  accessories: ACCESSORIES_GOALS,
  home_decor: HOME_DECOR_GOALS,
  food_beverage: FOOD_BEVERAGE_GOALS,
  electronics: ELECTRONICS_GOALS,
  sports_fitness: SPORTS_FITNESS_GOALS,
  health_supplements: HEALTH_SUPPLEMENTS_GOALS,
};

// ─── Scene-Aware Motion Goal Matrix ───
// Maps (category, sceneType) → ordered list of valid goal IDs
// First ID in each list is the top recommendation for that combo.

const CATEGORY_SCENE_MOTION_MATRIX: Record<string, Record<string, string[]>> = {
  fashion_apparel: {
    on_model: ['subtle_fashion_pose', 'fabric_movement', 'editorial_walk_start', 'hand_adjustment', 'tracking_follow'],
    studio_product: ['premium_campaign_reveal', 'fabric_movement', 'tilt_reveal'],
    flat_lay: ['premium_campaign_reveal', 'fabric_movement', 'crane_up'],
    lifestyle_scene: ['subtle_fashion_pose', 'fabric_movement', 'editorial_walk_start', 'tracking_follow'],
    action_scene: ['editorial_walk_start', 'fabric_movement', 'subtle_fashion_pose', 'tracking_follow'],
    hand_held: ['hand_adjustment', 'premium_campaign_reveal'],
    macro_closeup: ['fabric_movement', 'premium_campaign_reveal', 'dolly_zoom'],
    talking_portrait: ['subtle_fashion_pose', 'hand_adjustment'],
  },
  beauty_skincare: {
    studio_product: ['luxury_product_reveal', 'soft_skincare_glow', 'texture_focus', 'tilt_reveal'],
    hand_held: ['hand_held_beauty', 'texture_focus', 'luxury_product_reveal'],
    on_model: ['vanity_ad_motion', 'soft_skincare_glow', 'hand_held_beauty'],
    flat_lay: ['luxury_product_reveal', 'texture_focus', 'crane_up'],
    macro_closeup: ['texture_focus', 'soft_skincare_glow', 'dolly_zoom'],
    lifestyle_scene: ['vanity_ad_motion', 'soft_skincare_glow', 'luxury_product_reveal'],
  },
  fragrances: {
    studio_product: ['luxury_fragrance_reveal', 'reflective_shimmer', 'premium_bottle_showcase', 'tilt_reveal'],
    hand_held: ['hand_held_bottle_rotation', 'luxury_fragrance_reveal'],
    on_model: ['editorial_perfume_ad', 'hand_held_bottle_rotation'],
    macro_closeup: ['reflective_shimmer', 'premium_bottle_showcase', 'dolly_zoom'],
    lifestyle_scene: ['editorial_perfume_ad', 'luxury_fragrance_reveal'],
    flat_lay: ['luxury_fragrance_reveal', 'reflective_shimmer', 'crane_up'],
  },
  jewelry: {
    macro_closeup: ['sparkle_detail', 'macro_shine', 'luxury_jewelry_reveal', 'dolly_zoom'],
    on_model: ['worn_jewelry_pose', 'hand_movement_showcase', 'sparkle_detail'],
    studio_product: ['luxury_jewelry_reveal', 'sparkle_detail', 'macro_shine', 'tilt_reveal'],
    hand_held: ['hand_movement_showcase', 'sparkle_detail'],
    flat_lay: ['luxury_jewelry_reveal', 'sparkle_detail', 'crane_up'],
    lifestyle_scene: ['worn_jewelry_pose', 'luxury_jewelry_reveal'],
  },
  accessories: {
    hand_held: ['hold_and_reveal', 'wrist_detail', 'luxury_accessory'],
    on_model: ['on_body_lifestyle', 'hold_and_reveal', 'wrist_detail', 'tracking_follow'],
    studio_product: ['luxury_accessory', 'premium_product_showcase', 'tilt_reveal'],
    macro_closeup: ['wrist_detail', 'luxury_accessory', 'dolly_zoom'],
    lifestyle_scene: ['on_body_lifestyle', 'hold_and_reveal', 'tracking_follow'],
    flat_lay: ['luxury_accessory', 'premium_product_showcase', 'crane_up'],
  },
  home_decor: {
    interior_room: ['calm_interior', 'ambient_lifestyle', 'warm_light_motion', 'crane_up'],
    studio_product: ['decor_detail_showcase', 'soft_atmosphere_reveal', 'tilt_reveal'],
    lifestyle_scene: ['ambient_lifestyle', 'calm_interior', 'warm_light_motion', 'crane_up'],
    macro_closeup: ['decor_detail_showcase', 'warm_light_motion', 'dolly_zoom'],
    flat_lay: ['decor_detail_showcase', 'soft_atmosphere_reveal', 'crane_up'],
  },
  food_beverage: {
    food_plated: ['fresh_serve', 'steam_atmosphere', 'food_closeup', 'crane_up'],
    studio_product: ['fresh_serve', 'beverage_shimmer', 'tilt_reveal'],
    hand_held: ['pour_and_reveal', 'beverage_shimmer'],
    macro_closeup: ['food_closeup', 'steam_atmosphere', 'beverage_shimmer', 'dolly_zoom'],
    lifestyle_scene: ['fresh_serve', 'steam_atmosphere', 'pour_and_reveal', 'crane_up'],
    action_scene: ['pour_and_reveal', 'fresh_serve', 'tracking_follow'],
  },
  electronics: {
    device_on_desk: ['screen_glow_detail', 'tech_product_reveal', 'tilt_reveal'],
    studio_product: ['tech_product_reveal', 'clean_rotation', 'premium_electronics_ad', 'tilt_reveal'],
    hand_held: ['device_in_hand', 'tech_product_reveal'],
    macro_closeup: ['screen_glow_detail', 'tech_product_reveal', 'dolly_zoom'],
    lifestyle_scene: ['premium_electronics_ad', 'device_in_hand', 'tracking_follow'],
    flat_lay: ['tech_product_reveal', 'clean_rotation', 'crane_up'],
    on_model: ['device_in_hand', 'premium_electronics_ad'],
  },
  sports_fitness: {
    action_scene: ['realistic_sports_action', 'dynamic_training', 'object_interaction', 'tracking_follow'],
    on_model: ['controlled_athlete', 'object_interaction', 'realistic_sports_action', 'tracking_follow'],
    studio_product: ['product_in_action', 'controlled_athlete', 'premium_campaign_reveal', 'tilt_reveal'],
    hand_held: ['object_interaction', 'product_in_action'],
    lifestyle_scene: ['controlled_athlete', 'product_in_action', 'dynamic_training', 'tracking_follow'],
  },
  health_supplements: {
    studio_product: ['clean_supplement_reveal', 'wellness_product', 'clinical_premium_ad', 'tilt_reveal'],
    hand_held: ['hand_held_bottle', 'clean_supplement_reveal'],
    on_model: ['hand_held_bottle', 'wellness_product'],
    lifestyle_scene: ['wellness_product', 'ingredient_atmosphere', 'crane_up'],
    flat_lay: ['clean_supplement_reveal', 'ingredient_atmosphere', 'crane_up'],
    macro_closeup: ['clean_supplement_reveal', 'wellness_product', 'dolly_zoom'],
  },
};

// ─── Camera Motion Options ───

export interface CameraMotionOption {
  id: string;
  label: string;
  /** Relative path inside landing-assets bucket for hover preview video */
  preview?: string;
}

export const CAMERA_MOTIONS: CameraMotionOption[] = [
  { id: 'static', label: 'Static', preview: 'video-previews/static.mp4' },
  { id: 'slow_push_in', label: 'Slow Push-in', preview: 'video-previews/slow_push_in.mp4' },
  { id: 'gentle_pan', label: 'Gentle Pan', preview: 'video-previews/gentle_pan.mp4' },
  { id: 'camera_drift', label: 'Camera Drift', preview: 'video-previews/camera_drift.mp4' },
  { id: 'premium_handheld', label: 'Premium Handheld', preview: 'video-previews/premium_handheld.mp4' },
  { id: 'orbit', label: 'Orbit', preview: 'video-previews/orbit.mp4' },
  { id: 'dolly_zoom', label: 'Dolly Zoom', preview: 'video-previews/dolly_zoom.mp4' },
  { id: 'tilt_reveal', label: 'Tilt Reveal', preview: 'video-previews/tilt_reveal.mp4' },
  { id: 'tracking_follow', label: 'Tracking Follow', preview: 'video-previews/tracking_follow.mp4' },
  { id: 'crane_up', label: 'Crane Up', preview: 'video-previews/crane_up.mp4' },
];

// ─── Subject Motion Options ───

export interface SubjectMotionOption {
  id: string;
  label: string;
}

export const SUBJECT_MOTIONS: SubjectMotionOption[] = [
  { id: 'minimal', label: 'Minimal' },
  { id: 'natural_pose_shift', label: 'Natural Pose Shift' },
  { id: 'action_motion', label: 'Action Motion' },
  { id: 'hand_object_interaction', label: 'Hand/Object Interaction' },
  { id: 'hair_fabric', label: 'Hair / Fabric' },
  { id: 'auto', label: 'Auto' },
];

// ─── Realism Levels ───

export const REALISM_LEVELS = [
  { id: 'ultra_realistic', label: 'Ultra Realistic' },
  { id: 'realistic', label: 'Realistic' },
  { id: 'slightly_stylized', label: 'Slightly Stylized' },
];

// ─── Loop Styles ───

export const LOOP_STYLES = [
  { id: 'none', label: 'No Preference' },
  { id: 'short_repeatable', label: 'Short Repeatable' },
  { id: 'seamless_loop', label: 'Seamless Loop' },
  { id: 'one_natural', label: 'One Natural Movement' },
];

// ─── Preservation Defaults ───

export interface PreservationDefaults {
  preserveScene: boolean;
  preserveProductDetails: boolean;
  preserveIdentity: boolean;
  preserveOutfit: boolean;
}

const PRESERVATION_BY_CATEGORY: Record<string, PreservationDefaults> = {
  fashion_apparel: { preserveScene: true, preserveProductDetails: true, preserveIdentity: true, preserveOutfit: true },
  beauty_skincare: { preserveScene: true, preserveProductDetails: true, preserveIdentity: false, preserveOutfit: false },
  fragrances: { preserveScene: true, preserveProductDetails: true, preserveIdentity: false, preserveOutfit: false },
  jewelry: { preserveScene: true, preserveProductDetails: true, preserveIdentity: false, preserveOutfit: false },
  accessories: { preserveScene: true, preserveProductDetails: true, preserveIdentity: false, preserveOutfit: false },
  home_decor: { preserveScene: true, preserveProductDetails: true, preserveIdentity: false, preserveOutfit: false },
  food_beverage: { preserveScene: true, preserveProductDetails: true, preserveIdentity: false, preserveOutfit: false },
  electronics: { preserveScene: true, preserveProductDetails: true, preserveIdentity: false, preserveOutfit: false },
  sports_fitness: { preserveScene: true, preserveProductDetails: true, preserveIdentity: true, preserveOutfit: true },
  health_supplements: { preserveScene: true, preserveProductDetails: true, preserveIdentity: false, preserveOutfit: false },
};

// Scene-type overrides for preservation
const SCENE_PRESERVATION_OVERRIDES: Record<string, Partial<PreservationDefaults>> = {
  on_model: { preserveIdentity: true, preserveOutfit: true },
  talking_portrait: { preserveIdentity: true },
  action_scene: { preserveIdentity: true },
  hand_held: { preserveProductDetails: true },
  macro_closeup: { preserveProductDetails: true },
};

// ─── Public API ───

export function getMotionGoalsForCategory(category: string, sceneType?: string): MotionGoal[] {
  const allGoals = MOTION_GOALS_BY_CATEGORY[category] || MOTION_GOALS_BY_CATEGORY.fashion_apparel;

  if (!sceneType) return allGoals;

  const matrix = CATEGORY_SCENE_MOTION_MATRIX[category];
  if (!matrix) return allGoals;

  const validGoalIds = matrix[sceneType];
  if (!validGoalIds || validGoalIds.length === 0) return allGoals;

  // Return goals ordered by matrix priority, filtering to only valid ones
  const orderedGoals: MotionGoal[] = [];
  for (const goalId of validGoalIds) {
    const goal = allGoals.find(g => g.id === goalId);
    if (goal) orderedGoals.push(goal);
  }

  // If matrix had entries but none matched, fall back to all
  return orderedGoals.length > 0 ? orderedGoals : allGoals;
}

export function getDefaultPreservation(category: string, sceneType?: string): PreservationDefaults {
  const base = PRESERVATION_BY_CATEGORY[category] || PRESERVATION_BY_CATEGORY.fashion_apparel;

  if (!sceneType) return { ...base };

  const sceneOverride = SCENE_PRESERVATION_OVERRIDES[sceneType];
  if (!sceneOverride) return { ...base };

  return { ...base, ...sceneOverride };
}

export function getCategoryLabel(id: string): string {
  return PRODUCT_CATEGORIES.find(c => c.id === id)?.label || id;
}

export function getSceneTypeLabel(id: string): string {
  return SCENE_TYPES.find(s => s.id === id)?.label || id;
}

/**
 * Get the recommended goal IDs for a category + scene type combo.
 * Returns the ordered list from the matrix, or empty if no matrix entry.
 */
export function getRecommendedGoalIds(category: string, sceneType: string): string[] {
  const matrix = CATEGORY_SCENE_MOTION_MATRIX[category];
  if (!matrix) return [];
  return matrix[sceneType] || [];
}
