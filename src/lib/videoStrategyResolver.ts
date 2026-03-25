/**
 * Video Strategy Resolver — Category-Aware Ecommerce Motion Engine
 * 
 * Resolves user selections + AI analysis into a structured strategy
 * that drives the prompt builder and Kling API configuration.
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
    identity_sensitive?: boolean;
    product_detail_sensitive?: boolean;
    background_should_stay_static?: boolean;
  };
  // Ecommerce-aware fields (from extended analysis)
  category?: string;
  ecommerce_scene_type?: string;
  subject_type?: string;
  has_person?: boolean;
  interactive_object?: string | null;
  recommended_motion_goals?: string[];
  recommended_camera_motion?: string;
  recommended_subject_motion?: string;
  recommended_realism?: string;
  recommended_loop_style?: string;
}

export interface VideoStrategy {
  workflow_strategy: string;
  preserve_scene: boolean;
  preserve_product_details: boolean;
  preserve_identity: boolean;
  preserve_outfit: boolean;
  allow_scene_expansion: boolean;
  recommended_model_route: 'kling_v3' | 'kling_v3_omni' | 'motion_control';
  recommended_audio_mode: 'silent' | 'ambient' | 'voice';
  motion_intensity_default: 'low' | 'medium' | 'high';
  validation_level: 'standard' | 'strict';
  prompt_template_family: string;
  camera_motion: string;
  subject_motion: string;
  realism_level: string;
  loop_style: string;
  motion_goal_id: string;
  result_label: string;
}

export type WorkflowType = 'animate' | 'ad_sequence' | 'consistent_model';

interface ResolverInput {
  analysis: VideoAnalysis;
  workflowType: WorkflowType;
  // Ecommerce params
  category?: string;
  sceneType?: string;
  motionGoalId?: string;
  cameraMotion?: string;
  subjectMotion?: string;
  realismLevel?: string;
  loopStyle?: string;
  motionIntensity?: 'low' | 'medium' | 'high';
  preserveScene?: boolean;
  preserveProductDetails?: boolean;
  preserveIdentity?: boolean;
  preserveOutfit?: boolean;
  // Legacy
  userStylePreset?: string;
  userMotionRecipe?: string;
  userAudioMode?: 'silent' | 'ambient' | 'voice';
  consistencyLevel?: 'standard' | 'strong' | 'maximum';
}

// Map category to prompt template family
const CATEGORY_TEMPLATE_MAP: Record<string, string> = {
  fashion_apparel: 'fashion_apparel_motion',
  beauty_skincare: 'beauty_skincare_reveal',
  fragrances: 'fragrance_premium_reveal',
  jewelry: 'jewelry_macro_motion',
  accessories: 'accessories_showcase',
  home_decor: 'home_decor_ambient',
  food_beverage: 'food_beverage_motion',
  electronics: 'electronics_clean_reveal',
  sports_fitness: 'sports_fitness_action',
  health_supplements: 'health_supplements_reveal',
};

// Build a human-readable result label
function buildResultLabel(category: string, goalTitle: string, cameraMotion: string): string {
  const cameraLabels: Record<string, string> = {
    static: 'static shot',
    slow_push_in: 'slow push-in',
    gentle_pan: 'gentle pan',
    camera_drift: 'camera drift',
    premium_handheld: 'premium handheld',
    orbit: 'orbit',
  };
  const cam = cameraLabels[cameraMotion] || cameraMotion;
  return `${goalTitle} with ${cam}`;
}

export function resolveVideoStrategy(input: ResolverInput): VideoStrategy {
  const { analysis, workflowType, userAudioMode = 'silent' } = input;

  const category = input.category || analysis.category || 'fashion_apparel';
  const motionGoalId = input.motionGoalId || 'luxury_product_reveal';
  const cameraMotion = input.cameraMotion || analysis.recommended_camera_motion || 'slow_push_in';
  const subjectMotion = input.subjectMotion || analysis.recommended_subject_motion || 'minimal';
  const realismLevel = input.realismLevel || 'realistic';
  const loopStyle = input.loopStyle || 'none';
  const motionIntensity = input.motionIntensity || 'low';

  const strategy: VideoStrategy = {
    workflow_strategy: `${category}_${motionGoalId}`,
    preserve_scene: input.preserveScene !== false,
    preserve_product_details: input.preserveProductDetails !== false,
    preserve_identity: input.preserveIdentity ?? (analysis.identity_sensitive || false),
    preserve_outfit: input.preserveOutfit ?? false,
    allow_scene_expansion: false,
    recommended_model_route: 'kling_v3',
    recommended_audio_mode: userAudioMode,
    motion_intensity_default: motionIntensity,
    validation_level: 'standard',
    prompt_template_family: CATEGORY_TEMPLATE_MAP[category] || 'fashion_apparel_motion',
    camera_motion: cameraMotion,
    subject_motion: subjectMotion,
    realism_level: realismLevel,
    loop_style: loopStyle,
    motion_goal_id: motionGoalId,
    result_label: '',
  };

  // --- Animate Image (ecommerce) ---
  if (workflowType === 'animate') {
    // High complexity or risky scenes
    if (analysis.scene_complexity === 'high' || analysis.risk_flags.busy_background) {
      strategy.validation_level = 'strict';
      if (motionIntensity === 'high') strategy.motion_intensity_default = 'medium';
    }

    // Identity-sensitive
    if (analysis.identity_sensitive || analysis.risk_flags.identity_sensitive) {
      strategy.preserve_identity = true;
      strategy.preserve_outfit = true;
    }

    // Action motion may benefit from omni route
    if (subjectMotion === 'action_motion' && motionIntensity !== 'low') {
      strategy.recommended_model_route = 'kling_v3';
    }

    // Build result label from motion goal title (approx from ID)
    const goalTitle = motionGoalId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    strategy.result_label = buildResultLabel(category, goalTitle, cameraMotion);
  }

  // --- Ad Sequence ---
  if (workflowType === 'ad_sequence') {
    strategy.recommended_model_route = 'kling_v3_omni';
    strategy.prompt_template_family = 'ad_scene';
    strategy.workflow_strategy = 'multi_shot_sequence';
    strategy.validation_level = 'strict';
    strategy.result_label = 'Ad sequence';
  }

  // --- Consistent Model ---
  if (workflowType === 'consistent_model') {
    strategy.prompt_template_family = 'consistent_model';
    strategy.validation_level = 'strict';
    strategy.preserve_scene = true;
    strategy.preserve_identity = true;
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
    strategy.result_label = 'Consistent model';
  }

  return strategy;
}
