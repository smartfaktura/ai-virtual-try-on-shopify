/**
 * Video Prompt Builder — Category-Aware Ecommerce Prompt Composition
 * 
 * Builds action-rich prompts from category, motion goal, camera, subject motion,
 * realism, loop style, and preservation rules. No more generic camera-only prompts.
 */

import type { VideoAnalysis, VideoStrategy } from './videoStrategyResolver';

interface PromptBuildInput {
  analysis: VideoAnalysis;
  strategy: VideoStrategy;
  userPrompt?: string;
  motionRecipe?: string;
  motionIntensity?: 'low' | 'medium' | 'high';
  preserveScene?: boolean;
}

interface BuiltPrompt {
  prompt: string;
  negative_prompt: string;
  cfg_scale: number;
  prompt_template_name: string;
  result_label: string;
}

// ─── Phrase Maps ───

const CAMERA_PHRASES: Record<string, string> = {
  static: 'static camera, no camera movement',
  slow_push_in: 'slow smooth push-in camera movement',
  gentle_pan: 'gentle horizontal panning movement',
  camera_drift: 'subtle natural camera drift',
  premium_handheld: 'premium cinematic handheld with slight natural shake',
  orbit: 'smooth orbiting camera movement around the subject',
};

const SUBJECT_PHRASES: Record<string, string> = {
  minimal: 'very minimal subtle movement',
  natural_pose_shift: 'natural subtle body pose shift',
  action_motion: 'controlled realistic action motion',
  hand_object_interaction: 'natural hand and object interaction movement',
  hair_fabric: 'soft realistic hair and fabric movement',
  auto: 'natural movement appropriate to the scene',
};

const REALISM_PHRASES: Record<string, string> = {
  ultra_realistic: 'ultra photorealistic',
  realistic: 'realistic',
  slightly_stylized: 'slightly stylized cinematic',
};

const LOOP_PHRASES: Record<string, string> = {
  none: '',
  short_repeatable: 'suitable for a short repeatable loop',
  seamless_loop: 'with seamless looping motion',
  one_natural: 'as one natural continuous movement',
};

const INTENSITY_PHRASES: Record<string, string> = {
  low: 'subtle restrained',
  medium: 'moderate natural',
  high: 'dynamic expressive',
};

// ─── Preservation Builder ───

function buildPreservationClause(strategy: VideoStrategy): string {
  const parts: string[] = [];
  if (strategy.preserve_scene) parts.push('scene composition and background');
  if (strategy.preserve_product_details) parts.push('product details and shape');
  if (strategy.preserve_identity) parts.push('subject identity and face');
  if (strategy.preserve_outfit) parts.push('outfit and styling');
  if (parts.length === 0) return '';
  return `Preserve: ${parts.join(', ')}.`;
}

// ─── Category-Specific Negative Prompts ───

const CATEGORY_NEGATIVES: Record<string, string> = {
  fashion_apparel_motion: 'blurry, distorted, morphing face, flickering, garment deformation, text artifacts, watermark, unnatural body proportions',
  beauty_skincare_reveal: 'blurry, distorted, skin artifacts, morphing, flickering, harsh shadows, label warping, watermark',
  fragrance_premium_reveal: 'blurry, distorted, morphing, flickering, bottle deformation, label warping, cap distortion, watermark',
  jewelry_macro_motion: 'blurry, distorted, morphing, flickering, gem distortion, metal warping, loss of detail, watermark',
  accessories_showcase: 'blurry, distorted, morphing, flickering, material warping, hardware distortion, watermark',
  home_decor_ambient: 'blurry, distorted, morphing, flickering, furniture warping, object shifting, watermark',
  food_beverage_motion: 'blurry, distorted, morphing, flickering, food deformation, plate warping, unappetizing, watermark',
  electronics_clean_reveal: 'blurry, distorted, morphing, flickering, screen warping, button distortion, port deformation, watermark',
  sports_fitness_action: 'blurry, distorted, morphing face, flickering, unnatural body motion, identity change, watermark',
  health_supplements_reveal: 'blurry, distorted, morphing, flickering, label warping, package deformation, watermark',
};

// ─── Category-Specific Context Phrases ───

const CATEGORY_CONTEXT: Record<string, string> = {
  fashion_apparel_motion: 'fashion campaign video',
  beauty_skincare_reveal: 'beauty product video',
  fragrance_premium_reveal: 'luxury fragrance video',
  jewelry_macro_motion: 'luxury jewelry video',
  accessories_showcase: 'premium accessories video',
  home_decor_ambient: 'home decor atmosphere video',
  food_beverage_motion: 'food and beverage video',
  electronics_clean_reveal: 'tech product video',
  sports_fitness_action: 'sports and fitness video',
  health_supplements_reveal: 'health and wellness product video',
};

// ─── CFG Scale by category ───

const CATEGORY_CFG: Record<string, number> = {
  fashion_apparel_motion: 0.6,
  beauty_skincare_reveal: 0.65,
  fragrance_premium_reveal: 0.65,
  jewelry_macro_motion: 0.7,
  accessories_showcase: 0.6,
  home_decor_ambient: 0.5,
  food_beverage_motion: 0.55,
  electronics_clean_reveal: 0.65,
  sports_fitness_action: 0.5,
  health_supplements_reveal: 0.6,
};

// ─── Main Builder ───

export function buildVideoPrompt(input: PromptBuildInput): BuiltPrompt {
  const { analysis, strategy, userPrompt } = input;
  const family = strategy.prompt_template_family;

  const realism = REALISM_PHRASES[strategy.realism_level] || 'realistic';
  const intensity = INTENSITY_PHRASES[strategy.motion_intensity_default] || 'moderate natural';
  const camera = CAMERA_PHRASES[strategy.camera_motion] || CAMERA_PHRASES.slow_push_in;
  const subject = SUBJECT_PHRASES[strategy.subject_motion] || SUBJECT_PHRASES.minimal;
  const loop = LOOP_PHRASES[strategy.loop_style] || '';
  const context = CATEGORY_CONTEXT[family] || 'commercial product video';
  const preservation = buildPreservationClause(strategy);

  // Build the structured prompt
  const parts: string[] = [];

  // User's specific note first
  if (userPrompt) parts.push(userPrompt.trim());

  // Core instruction
  parts.push(`Create a ${realism} ${context}${loop ? ` ${loop}` : ''}.`);

  // Subject motion
  parts.push(`Subject: ${subject} with ${intensity} motion.`);

  // Interactive object from analysis
  if (analysis.interactive_object) {
    parts.push(`Interactive element: realistic ${analysis.interactive_object} motion.`);
  }

  // Camera
  parts.push(`Camera: ${camera}.`);

  // Preservation
  if (preservation) parts.push(preservation);

  // Scene context from analysis
  const lighting = analysis.lighting_style || 'natural lighting';
  parts.push(`Maintain ${lighting} quality throughout.`);

  const prompt = parts.join(' ');
  const negative_prompt = CATEGORY_NEGATIVES[family] || 'blurry, distorted, morphing, flickering, watermark';
  const cfg_scale = CATEGORY_CFG[family] || 0.6;

  return {
    prompt,
    negative_prompt,
    cfg_scale,
    prompt_template_name: family,
    result_label: strategy.result_label || family,
  };
}
