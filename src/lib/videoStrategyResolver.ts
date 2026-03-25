/**
 * Workflow Strategy Resolver
 * 
 * Sits between AI analysis (descriptive JSON) and prompt builder (template-driven).
 * Makes business-logic decisions about how to generate the video.
 */

export interface VideoAnalysis {
  subject_category: string;
  scene_type: string;
  shot_type: string;
  camera_angle: string;
  lighting_style: string;
  mood: string;
  motion_recommendation: string;
  identity_sensitive: boolean;
  scene_complexity: 'low' | 'medium' | 'high';
  risk_flags: {
    busy_background: boolean;
    text_present: boolean;
    multiple_people: boolean;
    low_resolution: boolean;
    transparent_png: boolean;
  };
}

export interface VideoStrategy {
  workflow_strategy: string;
  preserve_scene: boolean;
  allow_scene_expansion: boolean;
  recommended_model_route: 'kling_v3' | 'kling_v3_omni' | 'motion_control';
  recommended_audio_mode: 'silent' | 'ambient' | 'voice';
  motion_intensity_default: 'low' | 'medium' | 'high';
  validation_level: 'standard' | 'strict';
  prompt_template_family: string;
}

export type WorkflowType = 'animate' | 'ad_sequence' | 'consistent_model';

interface ResolverInput {
  analysis: VideoAnalysis;
  workflowType: WorkflowType;
  userStylePreset?: string;
  userMotionRecipe?: string;
  userAudioMode?: 'silent' | 'ambient' | 'voice';
  consistencyLevel?: 'standard' | 'strong' | 'maximum';
}

export function resolveVideoStrategy(input: ResolverInput): VideoStrategy {
  const { analysis, workflowType, userStylePreset, userAudioMode = 'silent' } = input;

  // Default strategy
  const strategy: VideoStrategy = {
    workflow_strategy: 'default',
    preserve_scene: true,
    allow_scene_expansion: false,
    recommended_model_route: 'kling_v3',
    recommended_audio_mode: userAudioMode,
    motion_intensity_default: 'low',
    validation_level: 'standard',
    prompt_template_family: 'product_hero',
  };

  // --- Animate Image logic ---
  if (workflowType === 'animate') {
    // Map style presets to template families
    const styleToFamily: Record<string, string> = {
      product_motion: 'product_hero',
      lifestyle: 'lifestyle_motion',
      editorial: 'editorial_motion',
      beauty: 'beauty_motion',
      cinematic: 'cinematic_motion',
    };
    strategy.prompt_template_family = styleToFamily[userStylePreset || ''] || 'product_hero';

    // Product shots: tight preserve, minimal motion
    if (analysis.subject_category === 'product' || analysis.scene_type === 'studio') {
      strategy.workflow_strategy = 'product_subtle_motion';
      strategy.preserve_scene = true;
      strategy.allow_scene_expansion = false;
      strategy.motion_intensity_default = 'low';
    }
    // Lifestyle/outdoor: allow more motion
    else if (analysis.scene_type === 'outdoor' || analysis.scene_type === 'lifestyle') {
      strategy.workflow_strategy = 'lifestyle_natural_motion';
      strategy.preserve_scene = true;
      strategy.allow_scene_expansion = true;
      strategy.motion_intensity_default = 'medium';
    }
    // Complex scenes: be careful
    else if (analysis.scene_complexity === 'high') {
      strategy.workflow_strategy = 'complex_cautious';
      strategy.preserve_scene = true;
      strategy.allow_scene_expansion = false;
      strategy.motion_intensity_default = 'low';
      strategy.validation_level = 'strict';
    }
    // Default fallback
    else {
      strategy.workflow_strategy = 'general_motion';
      strategy.motion_intensity_default = 'medium';
    }

    // Risk-based overrides
    if (analysis.risk_flags.busy_background) {
      strategy.motion_intensity_default = 'low';
      strategy.preserve_scene = true;
    }
    if (analysis.identity_sensitive) {
      strategy.preserve_scene = true;
      strategy.allow_scene_expansion = false;
    }
  }

  // --- Ad Sequence logic ---
  if (workflowType === 'ad_sequence') {
    strategy.recommended_model_route = 'kling_v3_omni';
    strategy.prompt_template_family = 'ad_scene';
    strategy.workflow_strategy = 'multi_shot_sequence';
    strategy.validation_level = 'strict';
  }

  // --- Consistent Model logic ---
  if (workflowType === 'consistent_model') {
    strategy.prompt_template_family = 'consistent_model';
    strategy.validation_level = 'strict';
    strategy.preserve_scene = true;

    const level = input.consistencyLevel || 'standard';
    if (level === 'maximum') {
      strategy.recommended_model_route = 'motion_control';
      strategy.workflow_strategy = 'identity_maximum';
    } else if (level === 'strong') {
      strategy.recommended_model_route = 'kling_v3_omni';
      strategy.workflow_strategy = 'identity_strong';
    } else {
      strategy.recommended_model_route = 'kling_v3';
      strategy.workflow_strategy = 'identity_standard';
    }
  }

  return strategy;
}
