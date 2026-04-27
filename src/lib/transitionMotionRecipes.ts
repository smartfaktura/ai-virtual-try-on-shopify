/**
 * Transition Motion Recipes — Start & End Video workflow registry.
 * Curated transition goals + style/camera/motion presets tuned for Kling
 * start+end frame interpolation.
 */

export type TransitionTier = 'strong' | 'good' | 'risky' | 'weak';

export interface TransitionGoal {
  id: string;
  title: string;
  description: string;
  /** Verb fragment used in the MOTION clause */
  verb: string;
  /** Default smoothness preset */
  defaultSmoothness: 'gradual' | 'smooth' | 'cinematic';
  /** Default camera feel */
  defaultCameraFeel: 'static' | 'soft_drift' | 'push_in' | 'pull_back' | 'orbit';
  /** Default motion strength */
  defaultMotionStrength: 'low' | 'medium' | 'high';
}

export const TRANSITION_GOALS: TransitionGoal[] = [
  {
    id: 'smooth_reveal',
    title: 'Smooth Reveal',
    description: 'Gentle unveiling between two related compositions',
    verb: 'gradually unveil',
    defaultSmoothness: 'gradual',
    defaultCameraFeel: 'push_in',
    defaultMotionStrength: 'low',
  },
  {
    id: 'product_evolution',
    title: 'Product Evolution',
    description: 'Show a product change angle, finish, or context',
    verb: 'continuously evolve',
    defaultSmoothness: 'smooth',
    defaultCameraFeel: 'soft_drift',
    defaultMotionStrength: 'low',
  },
  {
    id: 'luxury_transition',
    title: 'Luxury Transition',
    description: 'Premium, editorial morph between hero shots',
    verb: 'elegantly evolve',
    defaultSmoothness: 'cinematic',
    defaultCameraFeel: 'push_in',
    defaultMotionStrength: 'low',
  },
  {
    id: 'before_after',
    title: 'Before / After',
    description: 'Highlight a clean change between two states',
    verb: 'transform with controlled motion',
    defaultSmoothness: 'smooth',
    defaultCameraFeel: 'static',
    defaultMotionStrength: 'medium',
  },
  {
    id: 'pose_to_pose',
    title: 'Pose-to-Pose Shift',
    description: 'Subject naturally moves from one pose to another',
    verb: 'fluidly shift posture',
    defaultSmoothness: 'smooth',
    defaultCameraFeel: 'soft_drift',
    defaultMotionStrength: 'medium',
  },
  {
    id: 'angle_change',
    title: 'Camera Angle Change',
    description: 'Smooth camera move between two viewpoints',
    verb: 'sweep between angles',
    defaultSmoothness: 'smooth',
    defaultCameraFeel: 'orbit',
    defaultMotionStrength: 'medium',
  },
  {
    id: 'cinematic_dissolve',
    title: 'Cinematic Dissolve',
    description: 'Soft cross-fade for less compatible frames',
    verb: 'cinematically dissolve',
    defaultSmoothness: 'cinematic',
    defaultCameraFeel: 'soft_drift',
    defaultMotionStrength: 'low',
  },
  {
    id: 'campaign_motion',
    title: 'Campaign Motion',
    description: 'Editorial brand transition for ads and launches',
    verb: 'flow between campaign frames',
    defaultSmoothness: 'cinematic',
    defaultCameraFeel: 'push_in',
    defaultMotionStrength: 'low',
  },
];

export interface SegmentedOption<T extends string> {
  id: T;
  label: string;
}

export type TransitionStyle =
  | 'photographic'
  | 'editorial'
  | 'cinematic'
  | 'studio_clean'
  | 'soft_natural';

export const TRANSITION_STYLES: SegmentedOption<TransitionStyle>[] = [
  { id: 'photographic', label: 'Photographic' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'studio_clean', label: 'Studio Clean' },
  { id: 'soft_natural', label: 'Soft Natural' },
];

export type CameraFeel = 'static' | 'soft_drift' | 'push_in' | 'pull_back' | 'orbit';

export const CAMERA_FEELS: SegmentedOption<CameraFeel>[] = [
  { id: 'static', label: 'Static' },
  { id: 'soft_drift', label: 'Soft Drift' },
  { id: 'push_in', label: 'Push In' },
  { id: 'pull_back', label: 'Pull Back' },
  { id: 'orbit', label: 'Orbit' },
];

export type MotionStrength = 'low' | 'medium' | 'high';

export const MOTION_STRENGTHS: SegmentedOption<MotionStrength>[] = [
  { id: 'low', label: 'Subtle' },
  { id: 'medium', label: 'Balanced' },
  { id: 'high', label: 'Pronounced' },
];

export type Smoothness = 'gradual' | 'smooth' | 'cinematic';

export const SMOOTHNESS_LEVELS: SegmentedOption<Smoothness>[] = [
  { id: 'gradual', label: 'Gradual' },
  { id: 'smooth', label: 'Smooth' },
  { id: 'cinematic', label: 'Cinematic' },
];

export type Realism = 'ultra_realistic' | 'realistic' | 'slightly_stylized';

export const REALISM_LEVELS: SegmentedOption<Realism>[] = [
  { id: 'ultra_realistic', label: 'Ultra Realistic' },
  { id: 'realistic', label: 'Realistic' },
  { id: 'slightly_stylized', label: 'Slightly Stylized' },
];

/** Category-specific guard tokens appended to the GUARDS clause. */
const CATEGORY_GUARD_TOKENS: Record<string, string[]> = {
  fashion_apparel: ['outfit silhouette', 'fabric texture', 'identity', 'extra fingers', 'deformed hands'],
  beauty_skincare: ['product geometry', 'label typography', 'cap shape', 'liquid color'],
  fragrances: ['bottle silhouette', 'label typography', 'glass reflections', 'cap shape'],
  jewelry: ['stone facets', 'metal finish', 'micro-detail integrity'],
  accessories: ['stitching detail', 'hardware finish', 'logo placement'],
  home_decor: ['room geometry', 'material texture', 'lighting family'],
  food_beverage: ['food shape', 'plating arrangement', 'liquid level'],
  electronics: ['device geometry', 'screen content', 'port placement'],
  sports_fitness: ['equipment shape', 'identity', 'extra limbs', 'deformed hands'],
  health_supplements: ['label typography', 'bottle geometry', 'pill count'],
};

const CATEGORY_NEGATIVE_TOKENS: Record<string, string[]> = {
  fashion_apparel: ['extra fingers', 'deformed hands', 'twisted limbs', 'morphed face', 'identity drift'],
  beauty_skincare: ['label smearing', 'distorted text', 'cap morph'],
  fragrances: ['label smearing', 'distorted text', 'glass warping'],
  jewelry: ['blurred facets', 'morphed setting'],
  accessories: ['stretched stitching', 'morphed hardware'],
  home_decor: ['warped room', 'lighting flicker'],
  food_beverage: ['liquid morph', 'plating drift'],
  electronics: ['screen morph', 'distorted ports'],
  sports_fitness: ['extra fingers', 'deformed hands', 'twisted limbs'],
  health_supplements: ['label smearing', 'distorted dosage text'],
};

export function getCategoryGuards(category: string | null | undefined): string[] {
  if (!category) return ['identity', 'product geometry', 'brand markings'];
  return CATEGORY_GUARD_TOKENS[category] ?? ['product geometry', 'brand markings'];
}

export function getCategoryNegatives(category: string | null | undefined): string[] {
  if (!category) return [];
  return CATEGORY_NEGATIVE_TOKENS[category] ?? [];
}

/**
 * Map user "motion strength" + tier to Kling cfg_scale.
 * Kling recommends 0.5 baseline for image_tail jobs; we clamp to 0.3–0.7.
 * Higher cfg_scale stiffens motion and fights interpolation.
 */
export function motionStrengthToCfgScale(strength: MotionStrength, tier: TransitionTier): number {
  const base: Record<MotionStrength, number> = { low: 0.4, medium: 0.5, high: 0.65 };
  let cfg = base[strength] ?? 0.5;
  // Weak tier → let Kling improvise more
  if (tier === 'weak') cfg = Math.min(cfg, 0.35);
  // Risky tier → soften slightly
  if (tier === 'risky') cfg = Math.min(cfg, 0.55);
  return Math.max(0.3, Math.min(0.7, Number(cfg.toFixed(2))));
}

/** Default preservation rules derived from tier + analysis. */
export function getDefaultPreservationForTransition(params: {
  tier: TransitionTier;
  hasPerson: boolean;
  category?: string | null;
}): {
  preserveScene: boolean;
  preserveProductDetails: boolean;
  preserveIdentity: boolean;
  preserveOutfit: boolean;
} {
  const { tier, hasPerson } = params;
  const isStrongOrGood = tier === 'strong' || tier === 'good';
  return {
    preserveScene: isStrongOrGood,
    preserveProductDetails: true,
    preserveIdentity: hasPerson,
    preserveOutfit: hasPerson && isStrongOrGood,
  };
}
