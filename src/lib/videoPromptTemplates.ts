/**
 * Video Prompt Builder
 * 
 * Template-driven prompt composition from analysis + strategy + user selections.
 * Never generates creative concepts — maps structured data to Kling-ready prompts.
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
}

const MOTION_RECIPE_PHRASES: Record<string, string> = {
  slow_push_in: 'slow smooth push-in camera movement',
  camera_drift: 'gentle subtle camera drift with natural movement',
  product_orbit: 'smooth orbiting camera movement around the subject',
  gentle_pan: 'gentle horizontal panning movement',
  premium_handheld: 'premium cinematic handheld camera movement with slight natural shake',
  minimal: 'very minimal subtle movement, almost still',
};

const INTENSITY_MODIFIERS: Record<string, string> = {
  low: 'with subtle restrained motion',
  medium: 'with moderate natural motion',
  high: 'with dynamic expressive motion',
};

const TEMPLATE_FAMILIES: Record<string, (input: PromptBuildInput) => BuiltPrompt> = {
  product_hero: (input) => {
    const motion = MOTION_RECIPE_PHRASES[input.motionRecipe || 'slow_push_in'] || MOTION_RECIPE_PHRASES.slow_push_in;
    const intensity = INTENSITY_MODIFIERS[input.motionIntensity || 'low'];
    const scene = input.analysis.scene_type === 'studio' ? 'clean studio environment' : input.analysis.scene_type;
    const lighting = input.analysis.lighting_style || 'soft premium lighting';

    let prompt = `${motion} ${intensity}. ${scene} with ${lighting}.`;
    if (input.preserveScene !== false) {
      prompt += ' Preserve the original scene composition and colors exactly.';
    }
    if (input.userPrompt) {
      prompt = `${input.userPrompt}. ${prompt}`;
    }

    return {
      prompt,
      negative_prompt: 'blurry, distorted, morphing, flickering, sudden jumps, text artifacts, watermark',
      cfg_scale: 0.6,
      prompt_template_name: 'product_hero',
    };
  },

  lifestyle_motion: (input) => {
    const motion = MOTION_RECIPE_PHRASES[input.motionRecipe || 'camera_drift'] || MOTION_RECIPE_PHRASES.camera_drift;
    const intensity = INTENSITY_MODIFIERS[input.motionIntensity || 'medium'];
    const mood = input.analysis.mood || 'natural';

    let prompt = `${motion} ${intensity}. ${mood} lifestyle atmosphere with natural motion.`;
    if (input.userPrompt) prompt = `${input.userPrompt}. ${prompt}`;

    return {
      prompt,
      negative_prompt: 'blurry, distorted, morphing, flickering, unnatural motion, text artifacts',
      cfg_scale: 0.5,
      prompt_template_name: 'lifestyle_motion',
    };
  },

  editorial_motion: (input) => {
    const motion = MOTION_RECIPE_PHRASES[input.motionRecipe || 'gentle_pan'] || MOTION_RECIPE_PHRASES.gentle_pan;
    const intensity = INTENSITY_MODIFIERS[input.motionIntensity || 'low'];

    let prompt = `${motion} ${intensity}. Editorial fashion photography style with precise controlled motion.`;
    if (input.userPrompt) prompt = `${input.userPrompt}. ${prompt}`;

    return {
      prompt,
      negative_prompt: 'blurry, distorted, morphing, flickering, casual feel, amateur quality',
      cfg_scale: 0.65,
      prompt_template_name: 'editorial_motion',
    };
  },

  beauty_motion: (input) => {
    const motion = MOTION_RECIPE_PHRASES[input.motionRecipe || 'slow_push_in'] || MOTION_RECIPE_PHRASES.slow_push_in;
    const intensity = INTENSITY_MODIFIERS[input.motionIntensity || 'low'];

    let prompt = `${motion} ${intensity}. Beauty close-up with soft flattering light, skin texture preserved.`;
    if (input.userPrompt) prompt = `${input.userPrompt}. ${prompt}`;

    return {
      prompt,
      negative_prompt: 'blurry, distorted, skin artifacts, morphing, flickering, harsh shadows',
      cfg_scale: 0.7,
      prompt_template_name: 'beauty_motion',
    };
  },

  cinematic_motion: (input) => {
    const motion = MOTION_RECIPE_PHRASES[input.motionRecipe || 'premium_handheld'] || MOTION_RECIPE_PHRASES.premium_handheld;
    const intensity = INTENSITY_MODIFIERS[input.motionIntensity || 'medium'];

    let prompt = `${motion} ${intensity}. Cinematic film quality, dramatic depth of field, rich color grading.`;
    if (input.userPrompt) prompt = `${input.userPrompt}. ${prompt}`;

    return {
      prompt,
      negative_prompt: 'blurry, distorted, morphing, flat lighting, amateur quality, text overlays',
      cfg_scale: 0.5,
      prompt_template_name: 'cinematic_motion',
    };
  },

  ad_scene: (input) => {
    const motion = MOTION_RECIPE_PHRASES[input.motionRecipe || 'slow_push_in'] || MOTION_RECIPE_PHRASES.slow_push_in;
    const intensity = INTENSITY_MODIFIERS[input.motionIntensity || 'medium'];

    let prompt = `${motion} ${intensity}. Professional advertising quality with polished production value.`;
    if (input.userPrompt) prompt = `${input.userPrompt}. ${prompt}`;

    return {
      prompt,
      negative_prompt: 'blurry, distorted, morphing, flickering, amateur, low quality',
      cfg_scale: 0.55,
      prompt_template_name: 'ad_scene',
    };
  },

  consistent_model: (input) => {
    const motion = MOTION_RECIPE_PHRASES[input.motionRecipe || 'gentle_pan'] || MOTION_RECIPE_PHRASES.gentle_pan;
    const intensity = INTENSITY_MODIFIERS[input.motionIntensity || 'low'];

    let prompt = `${motion} ${intensity}. Maintain consistent subject identity and appearance throughout.`;
    if (input.userPrompt) prompt = `${input.userPrompt}. ${prompt}`;

    return {
      prompt,
      negative_prompt: 'identity change, face morphing, blurry, distorted, flickering, different person',
      cfg_scale: 0.7,
      prompt_template_name: 'consistent_model',
    };
  },
};

export function buildVideoPrompt(input: PromptBuildInput): BuiltPrompt {
  const family = input.strategy.prompt_template_family;
  const builder = TEMPLATE_FAMILIES[family] || TEMPLATE_FAMILIES.product_hero;
  return builder(input);
}
