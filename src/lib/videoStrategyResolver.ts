/**
 * Video Strategy Resolver — Category-Aware Ecommerce Motion Engine
 * 
 * Resolves user selections + AI analysis into a structured strategy
 * that drives the prompt builder and Kling API configuration.
 * 
 * Now includes: scene normalization, realism/loop effects, user note
 * conflict detection, camera control config, and action resolver fields.
 */

import { resolveMainAction, type ResolvedAction } from './videoActionResolver';

export interface VideoAnalysis {
  subject_category: string;
  scene_type: string;        // Legacy field — do NOT use for motion logic
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
  ecommerce_scene_type?: string;  // Canonical scene type from analysis
  subject_type?: string;
  has_person?: boolean;
  interactive_object?: string | null;
  recommended_motion_goals?: string[];
  recommended_camera_motion?: string;
  recommended_subject_motion?: string;
  recommended_realism?: string;
  recommended_loop_style?: string;
  // Object grounding fields
  visible_product_detected?: boolean;
  visible_object_list?: string[];
  product_interaction_visible?: boolean;
}

export interface ObjectGrounding {
  visible_product_detected: boolean;
  visible_object_list: string[];
  allow_new_objects: boolean;
  allow_new_products: boolean;
  preserve_visible_objects_only: boolean;
  product_context_source: 'image_detected' | 'user_added' | 'library_selected' | 'none';
  scene_expansion_mode: 'restricted' | 'guided' | 'flexible';
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
  // New fields from action resolver
  main_action: string;
  action_verb: string;
  action_style: string;
  primary_moving_elements: string[];
  scene_type_normalized: string;
  user_note_conflict: boolean;
  cyclic_motion: boolean;
  // Camera control config (structured Kling params)
  camera_control_config?: { type: string; config: Record<string, number> };
  // CFG scale override (computed from category + realism)
  cfg_scale_override?: number;
  // Object grounding
  object_grounding: ObjectGrounding;
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
  // Optional user note for conflict detection
  userPrompt?: string;
  // Legacy
  userStylePreset?: string;
  userMotionRecipe?: string;
  userAudioMode?: 'silent' | 'ambient' | 'voice';
  consistencyLevel?: 'standard' | 'strong' | 'maximum';
}

// ─── Scene Type Normalization ───

const SCENE_TYPE_ALIASES: Record<string, string> = {
  // Legacy scene_type → canonical
  'product_shot': 'studio_product',
  'product': 'studio_product',
  'studio': 'studio_product',
  'model': 'on_model',
  'on-model': 'on_model',
  'on model': 'on_model',
  'lifestyle': 'lifestyle_scene',
  'handheld': 'hand_held',
  'hand-held': 'hand_held',
  'flatlay': 'flat_lay',
  'flat-lay': 'flat_lay',
  'macro': 'macro_closeup',
  'closeup': 'macro_closeup',
  'close-up': 'macro_closeup',
  'close_up': 'macro_closeup',
  'interior': 'interior_room',
  'room': 'interior_room',
  'action': 'action_scene',
  'plated': 'food_plated',
  'food_served': 'food_plated',
  'desk': 'device_on_desk',
  'portrait': 'talking_portrait',
};

const CANONICAL_SCENE_TYPES = new Set([
  'studio_product', 'on_model', 'lifestyle_scene', 'hand_held',
  'flat_lay', 'macro_closeup', 'interior_room', 'action_scene',
  'food_plated', 'device_on_desk', 'talking_portrait',
]);

function normalizeSceneType(raw?: string): string {
  if (!raw) return 'studio_product';
  const cleaned = raw.toLowerCase().trim();
  if (CANONICAL_SCENE_TYPES.has(cleaned)) return cleaned;
  return SCENE_TYPE_ALIASES[cleaned] || 'studio_product';
}

// ─── Category Template Map ───

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

// ─── Category CFG Scale ───

const CATEGORY_CFG: Record<string, number> = {
  fashion_apparel: 0.6,
  beauty_skincare: 0.65,
  fragrances: 0.65,
  jewelry: 0.7,
  accessories: 0.6,
  home_decor: 0.5,
  food_beverage: 0.55,
  electronics: 0.65,
  sports_fitness: 0.5,
  health_supplements: 0.6,
};

// ─── User Note Conflict Detection ───

const CONFLICT_KEYWORDS_FAST = ['spin quickly', 'fast rotation', 'rapid', 'explosive', 'zoom out quickly', 'wild motion', 'shake violently', 'extreme movement', 'chaotic'];
const CONFLICT_KEYWORDS_EXPANSION = ['zoom out', 'pull back', 'wide shot', 'expand scene', 'show more'];

function detectUserNoteConflict(
  userPrompt: string | undefined,
  realismLevel: string,
  preserveScene: boolean,
  motionIntensity: string,
): boolean {
  if (!userPrompt) return false;
  const lower = userPrompt.toLowerCase();

  // Fast motion conflicts with ultra_realistic or low intensity
  if (realismLevel === 'ultra_realistic' || motionIntensity === 'low') {
    if (CONFLICT_KEYWORDS_FAST.some(kw => lower.includes(kw))) return true;
  }

  // Scene expansion conflicts with preserve scene
  if (preserveScene) {
    if (CONFLICT_KEYWORDS_EXPANSION.some(kw => lower.includes(kw))) return true;
  }

  return false;
}

// ─── Camera Control Config ───

function resolveCameraControlConfig(cameraMotion: string): { type: string; config: Record<string, number> } | undefined {
  switch (cameraMotion) {
    case 'orbit':
      return { type: 'simple', config: { horizontal: 10, vertical: 0, zoom: 0, tilt: 0, pan: 0, roll: 0 } };
    case 'slow_push_in':
      return { type: 'simple', config: { horizontal: 0, vertical: 0, zoom: 3, tilt: 0, pan: 0, roll: 0 } };
    default:
      return undefined; // Prompt-only for static, gentle_pan, camera_drift, premium_handheld
  }
}

// ─── Result Label Builder ───

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

// ─── Main Resolver ───

export function resolveVideoStrategy(input: ResolverInput): VideoStrategy {
  const { analysis, workflowType, userAudioMode = 'silent' } = input;

  const category = input.category || analysis.category || 'fashion_apparel';
  const motionGoalId = input.motionGoalId || 'luxury_product_reveal';
  const cameraMotion = input.cameraMotion || analysis.recommended_camera_motion || 'slow_push_in';
  const subjectMotion = input.subjectMotion || analysis.recommended_subject_motion || 'minimal';
  const realismLevel = input.realismLevel || 'realistic';
  const loopStyle = input.loopStyle || 'none';
  let motionIntensity = input.motionIntensity || 'low';

  // Normalize scene type from user input or analysis
  const sceneTypeNormalized = normalizeSceneType(
    input.sceneType || analysis.ecommerce_scene_type || analysis.scene_type
  );

  // ─── Resolve Action ───
  const actionResult: ResolvedAction = resolveMainAction({
    category,
    sceneType: sceneTypeNormalized,
    motionGoalId,
    subjectMotion,
    interactiveObject: analysis.interactive_object || null,
    hasPerson: analysis.has_person ?? analysis.identity_sensitive,
    subjectType: analysis.subject_type || null,
    userPrompt: input.userPrompt,
    sceneComplexity: analysis.scene_complexity,
  });

  // ─── Realism Level Effects ───
  let allowSceneExpansion = false;
  let validationLevel: 'standard' | 'strict' = 'standard';

  if (realismLevel === 'ultra_realistic') {
    allowSceneExpansion = false;
    validationLevel = 'strict';
    if (motionIntensity === 'high') motionIntensity = 'medium'; // Cap intensity
  } else if (realismLevel === 'slightly_stylized') {
    allowSceneExpansion = true;
    // Looser validation, full intensity range
  }

  // ─── Loop Style Effects ───
  let cyclicMotion = false;

  if (loopStyle === 'short_repeatable') {
    if (motionIntensity === 'high') motionIntensity = 'medium'; // Cap for containment
  } else if (loopStyle === 'seamless_loop') {
    if (motionIntensity !== 'low') motionIntensity = 'low'; // Force low for cyclic
    cyclicMotion = true;
  }
  // 'one_natural' and 'none': no constraints

  // ─── CFG Scale with Realism Adjustment ───
  let cfgScale = CATEGORY_CFG[category] || 0.6;
  if (realismLevel === 'ultra_realistic') cfgScale = Math.min(cfgScale + 0.1, 1.0);
  else if (realismLevel === 'slightly_stylized') cfgScale = Math.max(cfgScale - 0.05, 0.3);

  // ─── User Note Conflict ───
  const preserveScene = input.preserveScene !== false;
  const userNoteConflict = detectUserNoteConflict(input.userPrompt, realismLevel, preserveScene, motionIntensity);

  // ─── Camera Control ───
  const cameraControlConfig = resolveCameraControlConfig(cameraMotion);

  const strategy: VideoStrategy = {
    workflow_strategy: `${category}_${motionGoalId}`,
    preserve_scene: preserveScene,
    preserve_product_details: input.preserveProductDetails !== false,
    preserve_identity: input.preserveIdentity ?? (analysis.identity_sensitive || false),
    preserve_outfit: input.preserveOutfit ?? false,
    allow_scene_expansion: allowSceneExpansion,
    recommended_model_route: 'kling_v3',
    recommended_audio_mode: userAudioMode,
    motion_intensity_default: motionIntensity,
    validation_level: validationLevel,
    prompt_template_family: CATEGORY_TEMPLATE_MAP[category] || 'fashion_apparel_motion',
    camera_motion: cameraMotion,
    subject_motion: actionResult.resolved_subject_motion,
    realism_level: realismLevel,
    loop_style: loopStyle,
    motion_goal_id: motionGoalId,
    result_label: '',
    // Action resolver fields
    main_action: actionResult.main_action,
    action_verb: actionResult.action_verb,
    action_style: actionResult.action_style,
    primary_moving_elements: actionResult.primary_moving_elements,
    scene_type_normalized: sceneTypeNormalized,
    user_note_conflict: userNoteConflict,
    cyclic_motion: cyclicMotion,
    camera_control_config: cameraControlConfig,
    cfg_scale_override: cfgScale,
  };

  // --- Animate Image (ecommerce) ---
  if (workflowType === 'animate') {
    // High complexity or risky scenes
    if (analysis.scene_complexity === 'high' || analysis.risk_flags.busy_background) {
      strategy.validation_level = 'strict';
      if (strategy.motion_intensity_default === 'high') strategy.motion_intensity_default = 'medium';
    }

    // Identity-sensitive
    if (analysis.identity_sensitive || analysis.risk_flags.identity_sensitive) {
      strategy.preserve_identity = true;
      strategy.preserve_outfit = true;
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
