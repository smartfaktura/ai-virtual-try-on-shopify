/**
 * Video Action Resolver — Concrete Motion Action Engine
 * 
 * Resolves category + scene type + motion goal + analysis signals into
 * a structured action plan with concrete verbs, moving elements, and
 * resolved subject motion (no more generic fallbacks).
 */

// ─── Types ───

export interface ResolvedAction {
  main_action: string;
  action_verb: string;
  action_style: string;
  primary_moving_elements: string[];
  resolved_subject_motion: string;
}

export interface ActionResolverInput {
  category: string;
  sceneType: string;
  motionGoalId: string;
  subjectMotion: string;
  interactiveObject: string | null;
  hasPerson: boolean;
  subjectType: string | null;
  userPrompt?: string;
  sceneComplexity: 'low' | 'medium' | 'high';
}

// ─── Action Lookup Table ───
// Key format: `${category}::${motionGoalId}` or `${category}::${motionGoalId}::${object}`

interface ActionEntry {
  main_action: string;
  action_verb: string;
  action_style: string;
}

const ACTION_TABLE: Record<string, ActionEntry> = {
  // ── Fashion & Apparel ──
  'fashion_apparel::subtle_fashion_pose': { main_action: 'subtle_pose_shift', action_verb: 'shift', action_style: 'gentle' },
  'fashion_apparel::fabric_movement': { main_action: 'subtle_fabric_sway', action_verb: 'sway', action_style: 'gentle' },
  'fashion_apparel::editorial_walk_start': { main_action: 'controlled_first_step', action_verb: 'step', action_style: 'controlled' },
  'fashion_apparel::hand_adjustment': { main_action: 'natural_hand_adjustment', action_verb: 'adjust', action_style: 'natural' },
  'fashion_apparel::premium_campaign_reveal': { main_action: 'premium_reveal', action_verb: 'reveal', action_style: 'elegant' },

  // ── Beauty & Skincare ──
  'beauty_skincare::luxury_product_reveal': { main_action: 'clean_product_reveal', action_verb: 'reveal', action_style: 'clean' },
  'beauty_skincare::hand_held_beauty': { main_action: 'controlled_hand_rotation', action_verb: 'rotate', action_style: 'controlled' },
  'beauty_skincare::soft_skincare_glow': { main_action: 'soft_glow_shift', action_verb: 'glow', action_style: 'soft' },
  'beauty_skincare::texture_focus': { main_action: 'texture_reveal', action_verb: 'reveal', action_style: 'detailed' },
  'beauty_skincare::vanity_ad_motion': { main_action: 'calm_scene_drift', action_verb: 'drift', action_style: 'calm' },

  // ── Fragrances ──
  'fragrances::luxury_fragrance_reveal': { main_action: 'premium_bottle_entrance', action_verb: 'reveal', action_style: 'elegant' },
  'fragrances::reflective_shimmer': { main_action: 'light_play_shimmer', action_verb: 'shimmer', action_style: 'micro' },
  'fragrances::premium_bottle_showcase': { main_action: 'controlled_bottle_rotation', action_verb: 'rotate', action_style: 'controlled' },
  'fragrances::editorial_perfume_ad': { main_action: 'editorial_reveal', action_verb: 'reveal', action_style: 'cinematic' },
  'fragrances::hand_held_bottle_rotation': { main_action: 'hand_bottle_turn', action_verb: 'turn', action_style: 'natural' },

  // ── Jewelry ──
  'jewelry::sparkle_detail': { main_action: 'micro_light_shift', action_verb: 'shimmer', action_style: 'micro' },
  'jewelry::luxury_jewelry_reveal': { main_action: 'premium_jewelry_entrance', action_verb: 'reveal', action_style: 'elegant' },
  'jewelry::hand_movement_showcase': { main_action: 'hand_showcase_motion', action_verb: 'present', action_style: 'controlled' },
  'jewelry::macro_shine': { main_action: 'macro_reflection_shift', action_verb: 'reflect', action_style: 'micro' },
  'jewelry::worn_jewelry_pose': { main_action: 'worn_piece_pose_shift', action_verb: 'shift', action_style: 'subtle' },

  // ── Accessories ──
  'accessories::hold_and_reveal': { main_action: 'hand_reveal_present', action_verb: 'present', action_style: 'natural' },
  'accessories::luxury_accessory': { main_action: 'premium_accessory_reveal', action_verb: 'reveal', action_style: 'elegant' },
  'accessories::wrist_detail': { main_action: 'wrist_movement_showcase', action_verb: 'move', action_style: 'controlled' },
  'accessories::premium_product_showcase': { main_action: 'clean_product_rotation', action_verb: 'rotate', action_style: 'clean' },
  'accessories::on_body_lifestyle': { main_action: 'lifestyle_body_shift', action_verb: 'shift', action_style: 'natural' },

  // ── Home & Decor ──
  'home_decor::calm_interior': { main_action: 'gentle_atmosphere_drift', action_verb: 'drift', action_style: 'gentle' },
  'home_decor::ambient_lifestyle': { main_action: 'ambient_light_movement', action_verb: 'shift', action_style: 'subtle' },
  'home_decor::soft_atmosphere_reveal': { main_action: 'room_reveal', action_verb: 'reveal', action_style: 'soft' },
  'home_decor::decor_detail_showcase': { main_action: 'detail_focus_motion', action_verb: 'focus', action_style: 'controlled' },
  'home_decor::warm_light_motion': { main_action: 'flame_flicker', action_verb: 'flicker', action_style: 'gentle' },

  // ── Food & Beverage ──
  'food_beverage::fresh_serve': { main_action: 'fresh_presentation', action_verb: 'present', action_style: 'natural' },
  'food_beverage::pour_and_reveal': { main_action: 'controlled_pour', action_verb: 'pour', action_style: 'controlled' },
  'food_beverage::steam_atmosphere': { main_action: 'steam_rise', action_verb: 'rise', action_style: 'gentle' },
  'food_beverage::beverage_shimmer': { main_action: 'condensation_shimmer', action_verb: 'shimmer', action_style: 'micro' },
  'food_beverage::food_closeup': { main_action: 'texture_detail_motion', action_verb: 'reveal', action_style: 'detailed' },

  // ── Electronics ──
  'electronics::tech_product_reveal': { main_action: 'clean_tech_reveal', action_verb: 'reveal', action_style: 'clean' },
  'electronics::device_in_hand': { main_action: 'hand_device_interaction', action_verb: 'interact', action_style: 'natural' },
  'electronics::clean_rotation': { main_action: 'product_rotation', action_verb: 'rotate', action_style: 'controlled' },
  'electronics::premium_electronics_ad': { main_action: 'premium_tech_entrance', action_verb: 'reveal', action_style: 'cinematic' },
  'electronics::screen_glow_detail': { main_action: 'screen_light_shift', action_verb: 'glow', action_style: 'subtle' },

  // ── Sports & Fitness ──
  'sports_fitness::realistic_sports_action': { main_action: 'controlled_athletic_action', action_verb: 'perform', action_style: 'controlled' },
  'sports_fitness::controlled_athlete': { main_action: 'subtle_athletic_shift', action_verb: 'shift', action_style: 'controlled' },
  'sports_fitness::product_in_action': { main_action: 'product_action_showcase', action_verb: 'showcase', action_style: 'dynamic' },
  'sports_fitness::dynamic_training': { main_action: 'training_movement', action_verb: 'train', action_style: 'dynamic' },
  'sports_fitness::object_interaction': { main_action: 'sports_object_interaction', action_verb: 'interact', action_style: 'controlled' },

  // ── Health & Supplements ──
  'health_supplements::clean_supplement_reveal': { main_action: 'clinical_product_reveal', action_verb: 'reveal', action_style: 'clean' },
  'health_supplements::wellness_product': { main_action: 'wellness_showcase', action_verb: 'showcase', action_style: 'calm' },
  'health_supplements::hand_held_bottle': { main_action: 'hand_bottle_presentation', action_verb: 'present', action_style: 'natural' },
  'health_supplements::clinical_premium_ad': { main_action: 'clinical_entrance', action_verb: 'reveal', action_style: 'clean' },
  'health_supplements::ingredient_atmosphere': { main_action: 'ingredient_atmosphere_motion', action_verb: 'drift', action_style: 'gentle' },
};

// ── Object-Specific Action Overrides ──
// When a specific interactive object is detected, override the action with more concrete language
const OBJECT_ACTION_OVERRIDES: Record<string, Record<string, ActionEntry>> = {
  sports_fitness: {
    basketball: { main_action: 'single_dribble', action_verb: 'dribble', action_style: 'controlled' },
    tennis_ball: { main_action: 'controlled_ball_interaction', action_verb: 'bounce', action_style: 'controlled' },
    soccer_ball: { main_action: 'foot_ball_touch', action_verb: 'touch', action_style: 'controlled' },
    football: { main_action: 'ball_grip_shift', action_verb: 'grip', action_style: 'controlled' },
    dumbbell: { main_action: 'controlled_curl', action_verb: 'curl', action_style: 'controlled' },
    barbell: { main_action: 'controlled_lift', action_verb: 'lift', action_style: 'controlled' },
    tennis_racket: { main_action: 'racket_ready_shift', action_verb: 'ready', action_style: 'controlled' },
    yoga_mat: { main_action: 'pose_hold_breath', action_verb: 'hold', action_style: 'gentle' },
    jump_rope: { main_action: 'rope_swing_start', action_verb: 'swing', action_style: 'controlled' },
  },
  food_beverage: {
    wine_glass: { main_action: 'wine_swirl', action_verb: 'swirl', action_style: 'gentle' },
    coffee_cup: { main_action: 'steam_rise_from_cup', action_verb: 'rise', action_style: 'gentle' },
    bottle: { main_action: 'bottle_pour', action_verb: 'pour', action_style: 'controlled' },
    plate: { main_action: 'steam_rise_from_plate', action_verb: 'rise', action_style: 'gentle' },
    cocktail: { main_action: 'cocktail_shimmer', action_verb: 'shimmer', action_style: 'micro' },
  },
  beauty_skincare: {
    lipstick: { main_action: 'lipstick_twist_reveal', action_verb: 'twist', action_style: 'controlled' },
    cream_jar: { main_action: 'cream_texture_reveal', action_verb: 'reveal', action_style: 'detailed' },
    dropper: { main_action: 'serum_drop', action_verb: 'drop', action_style: 'controlled' },
    brush: { main_action: 'brush_sweep', action_verb: 'sweep', action_style: 'gentle' },
    compact: { main_action: 'compact_open_reveal', action_verb: 'open', action_style: 'controlled' },
  },
  electronics: {
    phone: { main_action: 'phone_screen_reveal', action_verb: 'reveal', action_style: 'clean' },
    laptop: { main_action: 'laptop_screen_glow', action_verb: 'glow', action_style: 'subtle' },
    headphones: { main_action: 'headphone_showcase', action_verb: 'showcase', action_style: 'controlled' },
    watch: { main_action: 'watch_face_reveal', action_verb: 'reveal', action_style: 'clean' },
    tablet: { main_action: 'tablet_screen_interaction', action_verb: 'interact', action_style: 'natural' },
  },
  home_decor: {
    candle: { main_action: 'candle_flame_flicker', action_verb: 'flicker', action_style: 'gentle' },
    vase: { main_action: 'vase_light_shift', action_verb: 'shift', action_style: 'subtle' },
    lamp: { main_action: 'lamp_glow_warmth', action_verb: 'glow', action_style: 'gentle' },
    curtain: { main_action: 'curtain_breeze_sway', action_verb: 'sway', action_style: 'gentle' },
    plant: { main_action: 'leaf_gentle_movement', action_verb: 'sway', action_style: 'subtle' },
  },
  fragrances: {
    perfume_bottle: { main_action: 'bottle_light_catch', action_verb: 'catch', action_style: 'micro' },
    spray: { main_action: 'mist_spray_burst', action_verb: 'spray', action_style: 'controlled' },
  },
  jewelry: {
    ring: { main_action: 'ring_sparkle_rotation', action_verb: 'rotate', action_style: 'micro' },
    necklace: { main_action: 'pendant_sway', action_verb: 'sway', action_style: 'micro' },
    earring: { main_action: 'earring_dangle', action_verb: 'dangle', action_style: 'micro' },
    bracelet: { main_action: 'bracelet_wrist_shift', action_verb: 'shift', action_style: 'subtle' },
    watch: { main_action: 'watch_detail_showcase', action_verb: 'showcase', action_style: 'controlled' },
  },
};

// ─── Primary Moving Elements Resolution ───

function resolvePrimaryMovingElements(input: ActionResolverInput): string[] {
  const { category, sceneType, subjectMotion, hasPerson, interactiveObject } = input;
  const elements: string[] = [];

  // Person-based elements
  if (hasPerson) {
    elements.push('body');
    if (subjectMotion === 'action_motion') elements.push('limbs');
    if (subjectMotion === 'hand_object_interaction' || sceneType === 'hand_held') elements.push('hands');
    if (subjectMotion === 'hair_fabric') { elements.push('hair'); elements.push('fabric'); }
    if (subjectMotion === 'natural_pose_shift') elements.push('torso');
  }

  // Interactive object
  if (interactiveObject) {
    elements.push(interactiveObject);
  }

  // Category-specific defaults
  switch (category) {
    case 'jewelry':
      if (sceneType === 'macro_closeup') {
        if (!elements.includes('jewelry_surface')) elements.push('jewelry_surface');
        elements.push('light_reflection');
      }
      break;
    case 'home_decor':
      if (sceneType === 'interior_room') {
        elements.push('ambient_light');
        elements.push('atmosphere');
      }
      break;
    case 'food_beverage':
      if (sceneType === 'food_plated') {
        elements.push('steam');
        elements.push('garnish');
      }
      break;
    case 'fashion_apparel':
      if (subjectMotion === 'hair_fabric' || sceneType === 'on_model') {
        if (!elements.includes('fabric')) elements.push('fabric');
      }
      if (sceneType === 'flat_lay') {
        elements.push('product');
        elements.push('fabric');
      }
      break;
    case 'beauty_skincare':
      if (sceneType === 'hand_held') {
        if (!elements.includes('hands')) elements.push('hands');
        if (!elements.includes('product')) elements.push('product');
      }
      break;
    case 'electronics':
      elements.push('product');
      if (sceneType === 'device_on_desk') elements.push('screen_light');
      break;
    case 'sports_fitness':
      if (!interactiveObject && sceneType === 'action_scene') {
        elements.push('athletic_gear');
      }
      break;
    case 'fragrances':
      elements.push('bottle');
      elements.push('light_reflection');
      break;
  }

  // If nothing resolved, add generic
  if (elements.length === 0) elements.push('product');

  // Deduplicate
  return [...new Set(elements)];
}

// ─── Auto Subject Motion Resolution ───

function resolveAutoSubjectMotion(input: ActionResolverInput): string {
  const { category, sceneType, hasPerson, interactiveObject, sceneComplexity } = input;

  // High complexity → conservative
  if (sceneComplexity === 'high') return 'minimal';

  // Hand-held scenes always use hand interaction
  if (sceneType === 'hand_held') return 'hand_object_interaction';

  // Macro → minimal to preserve detail
  if (sceneType === 'macro_closeup') return 'minimal';

  // Flat lay → minimal product movement
  if (sceneType === 'flat_lay') return 'minimal';

  // Person-based resolution
  if (hasPerson) {
    // Action scenes with sports
    if (sceneType === 'action_scene' && (category === 'sports_fitness' || interactiveObject)) {
      return 'action_motion';
    }
    // On-model fashion → fabric or pose
    if (sceneType === 'on_model') {
      if (category === 'fashion_apparel') return 'natural_pose_shift';
      if (category === 'jewelry') return 'natural_pose_shift';
      if (category === 'accessories') return 'natural_pose_shift';
      return 'natural_pose_shift';
    }
    // Lifestyle with person
    if (sceneType === 'lifestyle_scene') return 'natural_pose_shift';
    // Talking portrait
    if (sceneType === 'talking_portrait') return 'natural_pose_shift';
    // Person holding something
    if (interactiveObject) return 'hand_object_interaction';
    return 'natural_pose_shift';
  }

  // No person
  if (sceneType === 'studio_product') return 'minimal';
  if (sceneType === 'interior_room') return 'minimal';
  if (sceneType === 'device_on_desk') return 'minimal';
  if (sceneType === 'food_plated') return 'minimal';

  return 'minimal';
}

// ─── Main Resolver ───

export function resolveMainAction(input: ActionResolverInput): ResolvedAction {
  const { category, motionGoalId, interactiveObject, subjectMotion } = input;

  // 1. Resolve subject motion if auto
  const resolved_subject_motion = subjectMotion === 'auto'
    ? resolveAutoSubjectMotion(input)
    : subjectMotion;

  // 2. Check for object-specific override first
  let actionEntry: ActionEntry | undefined;
  if (interactiveObject) {
    const categoryOverrides = OBJECT_ACTION_OVERRIDES[category];
    if (categoryOverrides) {
      // Try exact match
      actionEntry = categoryOverrides[interactiveObject];
      // Try partial match (e.g., "tennis_ball" matches "tennis_ball")
      if (!actionEntry) {
        const objLower = interactiveObject.toLowerCase().replace(/\s+/g, '_');
        actionEntry = categoryOverrides[objLower];
      }
    }
  }

  // 3. Fall back to category + goal lookup
  if (!actionEntry) {
    const key = `${category}::${motionGoalId}`;
    actionEntry = ACTION_TABLE[key];
  }

  // 4. Ultimate fallback
  if (!actionEntry) {
    actionEntry = { main_action: 'product_reveal', action_verb: 'reveal', action_style: 'controlled' };
  }

  // 5. Resolve primary moving elements
  const inputWithResolved = { ...input, subjectMotion: resolved_subject_motion };
  const primary_moving_elements = resolvePrimaryMovingElements(inputWithResolved);

  return {
    main_action: actionEntry.main_action,
    action_verb: actionEntry.action_verb,
    action_style: actionEntry.action_style,
    primary_moving_elements,
    resolved_subject_motion,
  };
}
