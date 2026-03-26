/**
 * Video Prompt Builder — Category-Specific Ecommerce Prompt Composition
 * 
 * Builds action-rich, category-aware prompts from the resolved strategy.
 * Each category has a dedicated assembler that emphasizes what matters
 * most for that product type. Shared primitives avoid duplication.
 */

import type { VideoAnalysis, VideoStrategy, ObjectGrounding } from './videoStrategyResolver';

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

// ─── Shared Prompt Primitives ───

const CAMERA_PHRASES: Record<string, string> = {
  static: 'static camera, no camera movement',
  slow_push_in: 'the camera slowly and smoothly pushes forward toward the subject. The subject stays completely still — only the camera moves closer',
  gentle_pan: 'the camera gently pans horizontally across the scene. The subject remains fixed in place — only the camera glides sideways',
  camera_drift: 'subtle natural camera drift with slight floating movement. The subject stays still — the camera drifts naturally',
  premium_handheld: 'premium cinematic handheld with slight natural shake',
  orbit: 'the camera physically orbits around the subject in a smooth arc. The subject stays completely still and fixed in place — only the camera moves. The viewing angle changes progressively as the camera circles around. The subject does NOT rotate or spin',
};

function buildCameraClause(motion: string): string {
  return `Camera: ${CAMERA_PHRASES[motion] || CAMERA_PHRASES.slow_push_in}.`;
}

function buildPreservationClause(strategy: VideoStrategy): string {
  const parts: string[] = [];
  if (strategy.preserve_scene) parts.push('scene composition and background');
  if (strategy.preserve_product_details) parts.push('product details and shape');
  if (strategy.preserve_identity) parts.push('subject identity and face');
  if (strategy.preserve_outfit) parts.push('outfit and styling');
  if (parts.length === 0) return '';
  return `Preserve: ${parts.join(', ')}.`;
}

function buildStabilityClause(movingElements: string[], strategy: VideoStrategy): string {
  // What should stay stable = everything NOT in moving elements
  const stableThings: string[] = [];
  if (strategy.preserve_scene && !movingElements.includes('atmosphere') && !movingElements.includes('ambient_light')) {
    stableThings.push('background');
  }
  if (strategy.preserve_product_details && !movingElements.includes('product')) {
    stableThings.push('product proportions');
  }
  if (strategy.preserve_identity && !movingElements.includes('body')) {
    stableThings.push('facial features');
  }
  if (stableThings.length === 0) return '';
  return `Keep stable: ${stableThings.join(', ')}.`;
}

function buildMotionDescriptor(strategy: VideoStrategy): string {
  const intensity = INTENSITY_PHRASES[strategy.motion_intensity_default] || 'moderate natural';
  const verb = strategy.action_verb;
  const style = strategy.action_style;
  return `${style} ${intensity} ${verb}`;
}

function buildLoopClause(loopStyle: string): string {
  const phrase = LOOP_PHRASES[loopStyle];
  return phrase ? ` ${phrase}` : '';
}

// ─── Object Grounding Clause ───

function buildObjectGroundingClause(grounding: ObjectGrounding): string {
  const parts: string[] = [];

  if (grounding.preserve_visible_objects_only) {
    parts.push('Only animate objects visible in the source image.');
  }

  if (!grounding.allow_new_objects && !grounding.allow_new_products) {
    parts.push('Do not introduce new products, props, bottles, accessories, or handheld items that are not already in frame.');
  }

  if (grounding.visible_product_detected && grounding.visible_object_list.length > 0) {
    const objectNames = grounding.visible_object_list.join(', ');
    parts.push(`Preserve the identity and appearance of the visible ${objectNames}. Do not replace or swap them.`);
  }

  if (!grounding.visible_product_detected && grounding.product_context_source === 'none') {
    parts.push('No product or prop is present in the source — do not invent or add one.');
  }

  return parts.join(' ');
}

const GROUNDING_NEGATIVE_TERMS = 'invented objects, added props, swapped products, hallucinated packaging, unexplained handheld items, new bottles, random accessories';

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

const REALISM_NEGATIVE_EXTRAS: Record<string, string> = {
  ultra_realistic: ', CGI look, artificial motion, animation feel, plastic skin, uncanny valley',
  slightly_stylized: '', // Remove some strict terms — handled by not appending
};

// ─── Category-Specific Prompt Assemblers ───

interface AssemblerInput {
  strategy: VideoStrategy;
  analysis: VideoAnalysis;
  userPrompt?: string;
  realism: string;
  intensity: string;
}

function assembleUserNote(userPrompt: string | undefined, conflict: boolean): { prefix: string; suffix: string } {
  if (!userPrompt?.trim()) return { prefix: '', suffix: '' };
  const note = userPrompt.trim();
  if (conflict) {
    return { prefix: '', suffix: `Additional note: ${note}.` };
  }
  return { prefix: `${note}. `, suffix: '' };
}

function buildSportsPrompt(input: AssemblerInput): string {
  const { strategy, analysis, userPrompt } = input;
  const note = assembleUserNote(userPrompt, strategy.user_note_conflict);
  const elements = strategy.primary_moving_elements;
  const object = analysis.interactive_object;

  const parts: string[] = [];
  if (note.prefix) parts.push(note.prefix);

  // Core action with concrete verb
  if (object) {
    parts.push(`One ${strategy.action_style} realistic ${strategy.action_verb} of the ${object} while maintaining grounded athletic stance.`);
  } else {
    parts.push(`${input.realism} sports and fitness video with ${strategy.action_style} ${strategy.action_verb} motion${buildLoopClause(strategy.loop_style)}.`);
  }

  // Body realism emphasis
  if (elements.includes('body') || elements.includes('limbs')) {
    parts.push(`Athletic body motion must be physically grounded with natural weight distribution.`);
  }

  // Object physics
  if (object) {
    parts.push(`${object} motion follows realistic physics with proper momentum and gravity.`);
  }

  parts.push(buildCameraClause(strategy.camera_motion));
  parts.push(buildPreservationClause(strategy));
  parts.push(buildStabilityClause(elements, strategy));

  const lighting = analysis.lighting_style || 'natural sports lighting';
  parts.push(`Maintain ${lighting} quality throughout.`);

  if (note.suffix) parts.push(note.suffix);

  return parts.filter(Boolean).join(' ');
}

function buildFashionPrompt(input: AssemblerInput): string {
  const { strategy, analysis, userPrompt } = input;
  const note = assembleUserNote(userPrompt, strategy.user_note_conflict);
  const elements = strategy.primary_moving_elements;

  const parts: string[] = [];
  if (note.prefix) parts.push(note.prefix);

  parts.push(`Create a ${input.realism} fashion campaign video${buildLoopClause(strategy.loop_style)}.`);

  // Fabric emphasis
  if (elements.includes('fabric') || elements.includes('hair')) {
    parts.push(`Soft realistic ${strategy.action_verb} in garment fabric at the sleeve, hem, and collar while preserving the silhouette shape.`);
    if (elements.includes('hair')) parts.push(`Natural hair movement following the body motion.`);
  } else {
    parts.push(`${buildMotionDescriptor(strategy)} motion.`);
  }

  // Identity protection
  if (strategy.preserve_identity) {
    parts.push(`Subject face and identity must remain exactly consistent throughout.`);
  }

  parts.push(buildCameraClause(strategy.camera_motion));
  parts.push(buildPreservationClause(strategy));
  parts.push(buildStabilityClause(elements, strategy));

  const lighting = analysis.lighting_style || 'studio fashion lighting';
  parts.push(`Maintain ${lighting} quality throughout.`);

  if (note.suffix) parts.push(note.suffix);

  return parts.filter(Boolean).join(' ');
}

function buildJewelryPrompt(input: AssemblerInput): string {
  const { strategy, analysis, userPrompt } = input;
  const note = assembleUserNote(userPrompt, strategy.user_note_conflict);
  const elements = strategy.primary_moving_elements;

  const parts: string[] = [];
  if (note.prefix) parts.push(note.prefix);

  parts.push(`Create a ${input.realism} luxury jewelry video${buildLoopClause(strategy.loop_style)}.`);

  // Micro-motion and reflection emphasis
  if (elements.includes('light_reflection') || elements.includes('jewelry_surface')) {
    parts.push(`Micro reflective ${strategy.action_verb} across the jewelry surface with stable metal geometry and gem proportions.`);
  } else if (elements.includes('hands')) {
    parts.push(`${strategy.action_style} hand ${strategy.action_verb} to showcase the piece with precise wrist control.`);
  } else {
    parts.push(`${buildMotionDescriptor(strategy)} motion with extreme detail preservation.`);
  }

  parts.push(`Every facet, setting, and metal finish must remain sharp and undistorted.`);
  parts.push(buildCameraClause(strategy.camera_motion));
  parts.push(buildPreservationClause(strategy));

  const lighting = analysis.lighting_style || 'premium jewelry lighting';
  parts.push(`Maintain ${lighting} with controlled light reflections.`);

  if (note.suffix) parts.push(note.suffix);

  return parts.filter(Boolean).join(' ');
}

function buildFoodPrompt(input: AssemblerInput): string {
  const { strategy, analysis, userPrompt } = input;
  const note = assembleUserNote(userPrompt, strategy.user_note_conflict);
  const elements = strategy.primary_moving_elements;
  const object = analysis.interactive_object;

  const parts: string[] = [];
  if (note.prefix) parts.push(note.prefix);

  parts.push(`Create a ${input.realism} food and beverage video${buildLoopClause(strategy.loop_style)}.`);

  // Freshness cues
  if (elements.includes('steam')) {
    parts.push(`Gentle rising steam from the dish creating warm appetizing atmosphere while food composition stays perfectly fixed.`);
  } else if (elements.includes('garnish')) {
    parts.push(`Subtle motion in garnish and fresh elements while the plate arrangement stays stable.`);
  } else if (object) {
    parts.push(`${strategy.action_style} realistic ${strategy.action_verb} of ${object} with appetizing visual quality.`);
  } else {
    parts.push(`${buildMotionDescriptor(strategy)} food presentation motion.`);
  }

  parts.push(`Food must look fresh, appetizing, and never deformed.`);
  parts.push(buildCameraClause(strategy.camera_motion));
  parts.push(buildPreservationClause(strategy));

  const lighting = analysis.lighting_style || 'warm food photography lighting';
  parts.push(`Maintain ${lighting} throughout.`);

  if (note.suffix) parts.push(note.suffix);

  return parts.filter(Boolean).join(' ');
}

function buildElectronicsPrompt(input: AssemblerInput): string {
  const { strategy, analysis, userPrompt } = input;
  const note = assembleUserNote(userPrompt, strategy.user_note_conflict);
  const elements = strategy.primary_moving_elements;

  const parts: string[] = [];
  if (note.prefix) parts.push(note.prefix);

  parts.push(`Create a ${input.realism} tech product video${buildLoopClause(strategy.loop_style)}.`);

  // Hard geometry preservation
  if (elements.includes('screen_light')) {
    parts.push(`${strategy.action_style} ${strategy.action_verb} effect on the screen with stable device geometry and sharp edges.`);
  } else if (elements.includes('hands')) {
    parts.push(`Natural hand ${strategy.action_verb} with the device maintaining exact proportions, ports, and button positions.`);
  } else {
    parts.push(`${buildMotionDescriptor(strategy)} product motion with hard geometry perfectly preserved.`);
  }

  parts.push(`Device proportions, screen aspect ratio, ports, and buttons must remain perfectly stable.`);
  parts.push(buildCameraClause(strategy.camera_motion));
  parts.push(buildPreservationClause(strategy));

  const lighting = analysis.lighting_style || 'clean tech product lighting';
  parts.push(`Maintain ${lighting} throughout.`);

  if (note.suffix) parts.push(note.suffix);

  return parts.filter(Boolean).join(' ');
}

function buildBeautyPrompt(input: AssemblerInput): string {
  const { strategy, analysis, userPrompt } = input;
  const note = assembleUserNote(userPrompt, strategy.user_note_conflict);
  const elements = strategy.primary_moving_elements;

  const parts: string[] = [];
  if (note.prefix) parts.push(note.prefix);

  parts.push(`Create a ${input.realism} beauty product video${buildLoopClause(strategy.loop_style)}.`);

  // Hand control and luxury finish
  if (elements.includes('hands') && elements.includes('product')) {
    parts.push(`Subtle hand-led product ${strategy.action_verb} presenting the label and finish with controlled precision.`);
  } else {
    parts.push(`${buildMotionDescriptor(strategy)} motion with luxury polish and clean finish.`);
  }

  parts.push(`Product surface gloss, label, and packaging details must stay sharp.`);
  parts.push(buildCameraClause(strategy.camera_motion));
  parts.push(buildPreservationClause(strategy));

  const lighting = analysis.lighting_style || 'soft beauty product lighting';
  parts.push(`Maintain ${lighting} with clean luxury feel throughout.`);

  if (note.suffix) parts.push(note.suffix);

  return parts.filter(Boolean).join(' ');
}

function buildFragrancePrompt(input: AssemblerInput): string {
  const { strategy, analysis, userPrompt } = input;
  const note = assembleUserNote(userPrompt, strategy.user_note_conflict);
  const elements = strategy.primary_moving_elements;

  const parts: string[] = [];
  if (note.prefix) parts.push(note.prefix);

  parts.push(`Create a ${input.realism} luxury fragrance video${buildLoopClause(strategy.loop_style)}.`);

  if (elements.includes('light_reflection') || elements.includes('bottle')) {
    parts.push(`${strategy.action_style} light play ${strategy.action_verb} across the glass bottle surface with preserved label and cap detail.`);
  } else if (elements.includes('hands')) {
    parts.push(`${strategy.action_style} hand ${strategy.action_verb} presenting the bottle with precise controlled rotation.`);
  } else {
    parts.push(`${buildMotionDescriptor(strategy)} motion with elegant premium presence.`);
  }

  parts.push(`Bottle shape, label typography, and cap must remain undistorted.`);
  parts.push(buildCameraClause(strategy.camera_motion));
  parts.push(buildPreservationClause(strategy));

  const lighting = analysis.lighting_style || 'premium fragrance lighting';
  parts.push(`Maintain ${lighting} throughout.`);

  if (note.suffix) parts.push(note.suffix);

  return parts.filter(Boolean).join(' ');
}

function buildHomeDecorPrompt(input: AssemblerInput): string {
  const { strategy, analysis, userPrompt } = input;
  const note = assembleUserNote(userPrompt, strategy.user_note_conflict);
  const elements = strategy.primary_moving_elements;

  const parts: string[] = [];
  if (note.prefix) parts.push(note.prefix);

  parts.push(`Create a ${input.realism} home decor atmosphere video${buildLoopClause(strategy.loop_style)}.`);

  if (elements.includes('ambient_light') || elements.includes('atmosphere')) {
    parts.push(`Gentle ambient ${strategy.action_verb} in the room atmosphere with stable furniture and object positions.`);
  } else {
    parts.push(`${buildMotionDescriptor(strategy)} motion in the interior scene.`);
  }

  parts.push(`Room layout, furniture positions, and decor arrangement must stay fixed.`);
  parts.push(buildCameraClause(strategy.camera_motion));
  parts.push(buildPreservationClause(strategy));

  const lighting = analysis.lighting_style || 'warm interior lighting';
  parts.push(`Maintain ${lighting} throughout.`);

  if (note.suffix) parts.push(note.suffix);

  return parts.filter(Boolean).join(' ');
}

function buildAccessoriesPrompt(input: AssemblerInput): string {
  const { strategy, analysis, userPrompt } = input;
  const note = assembleUserNote(userPrompt, strategy.user_note_conflict);
  const elements = strategy.primary_moving_elements;

  const parts: string[] = [];
  if (note.prefix) parts.push(note.prefix);

  parts.push(`Create a ${input.realism} premium accessories video${buildLoopClause(strategy.loop_style)}.`);

  if (elements.includes('hands')) {
    parts.push(`${strategy.action_style} hand ${strategy.action_verb} presenting the accessory with natural wrist movement.`);
  } else {
    parts.push(`${buildMotionDescriptor(strategy)} motion showcasing the product.`);
  }

  parts.push(`Material texture, hardware details, and stitching must remain sharp.`);
  parts.push(buildCameraClause(strategy.camera_motion));
  parts.push(buildPreservationClause(strategy));

  const lighting = analysis.lighting_style || 'premium product lighting';
  parts.push(`Maintain ${lighting} throughout.`);

  if (note.suffix) parts.push(note.suffix);

  return parts.filter(Boolean).join(' ');
}

function buildHealthPrompt(input: AssemblerInput): string {
  const { strategy, analysis, userPrompt } = input;
  const note = assembleUserNote(userPrompt, strategy.user_note_conflict);

  const parts: string[] = [];
  if (note.prefix) parts.push(note.prefix);

  parts.push(`Create a ${input.realism} health and wellness product video${buildLoopClause(strategy.loop_style)}.`);
  parts.push(`${buildMotionDescriptor(strategy)} motion with clean, trustworthy clinical feel.`);
  parts.push(`Product labels, packaging text, and proportions must remain perfectly clear.`);
  parts.push(buildCameraClause(strategy.camera_motion));
  parts.push(buildPreservationClause(strategy));

  const lighting = analysis.lighting_style || 'clean clinical lighting';
  parts.push(`Maintain ${lighting} throughout.`);

  if (note.suffix) parts.push(note.suffix);

  return parts.filter(Boolean).join(' ');
}

// ─── Assembler Dispatch ───

const CATEGORY_ASSEMBLERS: Record<string, (input: AssemblerInput) => string> = {
  sports_fitness_action: buildSportsPrompt,
  fashion_apparel_motion: buildFashionPrompt,
  jewelry_macro_motion: buildJewelryPrompt,
  food_beverage_motion: buildFoodPrompt,
  electronics_clean_reveal: buildElectronicsPrompt,
  beauty_skincare_reveal: buildBeautyPrompt,
  fragrance_premium_reveal: buildFragrancePrompt,
  home_decor_ambient: buildHomeDecorPrompt,
  accessories_showcase: buildAccessoriesPrompt,
  health_supplements_reveal: buildHealthPrompt,
};

// ─── Main Builder ───

export function buildVideoPrompt(input: PromptBuildInput): BuiltPrompt {
  const { analysis, strategy, userPrompt } = input;
  const family = strategy.prompt_template_family;

  const realism = REALISM_PHRASES[strategy.realism_level] || 'realistic';
  const intensity = INTENSITY_PHRASES[strategy.motion_intensity_default] || 'moderate natural';

  const assemblerInput: AssemblerInput = {
    strategy,
    analysis,
    userPrompt,
    realism,
    intensity,
  };

  // Dispatch to category-specific assembler or fallback
  const assembler = CATEGORY_ASSEMBLERS[family];
  let prompt: string;

  if (assembler) {
    prompt = assembler(assemblerInput);
  } else {
    // Generic fallback
    prompt = buildGenericPrompt(assemblerInput);
  }

  // Single-shot guardrail — prevent AI from improvising cuts or multi-scene edits
  prompt += ' One continuous uninterrupted shot — no cuts, no split-screen, no scene transitions.';

  // Object grounding clause
  const groundingClause = buildObjectGroundingClause(strategy.object_grounding);
  if (groundingClause) {
    prompt += ' ' + groundingClause;
  }

  // Negative prompt with realism extras + grounding negatives
  let negative_prompt = CATEGORY_NEGATIVES[family] || 'blurry, distorted, morphing, flickering, watermark';
  const realismExtra = REALISM_NEGATIVE_EXTRAS[strategy.realism_level];
  if (realismExtra) negative_prompt += realismExtra;
  // Always add grounding negatives
  negative_prompt += ', ' + GROUNDING_NEGATIVE_TERMS;

  // CFG scale from strategy (already computed with realism adjustment)
  const cfg_scale = strategy.cfg_scale_override ?? 0.6;

  return {
    prompt,
    negative_prompt,
    cfg_scale,
    prompt_template_name: family,
    result_label: strategy.result_label || family,
  };
}

// ─── Generic Fallback Assembler ───

function buildGenericPrompt(input: AssemblerInput): string {
  const { strategy, analysis, userPrompt } = input;
  const note = assembleUserNote(userPrompt, strategy.user_note_conflict);

  const parts: string[] = [];
  if (note.prefix) parts.push(note.prefix);

  parts.push(`Create a ${input.realism} commercial product video${buildLoopClause(strategy.loop_style)}.`);
  parts.push(`${buildMotionDescriptor(strategy)} motion.`);

  if (analysis.interactive_object) {
    parts.push(`Realistic ${analysis.interactive_object} interaction.`);
  }

  parts.push(buildCameraClause(strategy.camera_motion));
  parts.push(buildPreservationClause(strategy));
  parts.push(buildStabilityClause(strategy.primary_moving_elements, strategy));

  const lighting = analysis.lighting_style || 'natural lighting';
  parts.push(`Maintain ${lighting} quality throughout.`);

  if (note.suffix) parts.push(note.suffix);

  return parts.filter(Boolean).join(' ');
}
