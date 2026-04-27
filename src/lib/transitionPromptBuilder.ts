/**
 * Transition Prompt Builder — Kling-tuned prompt engine for Start & End Video.
 *
 * Produces prompts using a strict 5-clause structure:
 *   [ANCHOR]  what stays stable across both frames
 *   [MOTION]  the transition verb + camera feel + pacing
 *   [STYLE]   realism + lighting continuity + premium descriptors
 *   [GUARDS]  what must NOT distort
 *   [FEEL]    one-line emotional/brand tone
 *
 * Builder rules:
 * 1. NEVER re-describe both frames — Kling sees them. Describe only what connects them.
 * 2. Anchor phrasing comes from `sharedElements` from the compatibility resolver.
 * 3. Negative prompt always sent — base set + category-specific additions.
 * 4. Compatibility tier rewrites verbs and clamps cfg_scale.
 * 5. Goal-specific verb maps replace generic phrasing.
 * 6. Hard length guard — trim FEEL first, then GUARDS; never trim ANCHOR or MOTION.
 *    Final cap 2400 chars (Kling allows 2500).
 */

import type { TransitionCompatibility } from '@/lib/transitionCompatibilityResolver';
import {
  TRANSITION_GOALS,
  type CameraFeel,
  type MotionStrength,
  type Smoothness,
  type Realism,
  type TransitionStyle,
  motionStrengthToCfgScale,
  getCategoryGuards,
  getCategoryNegatives,
} from '@/lib/transitionMotionRecipes';

const HARD_CAP = 2400;

const BASE_NEGATIVES = [
  'morphing',
  'warping',
  'distorted text',
  'melting',
  'jitter',
  'ghost limbs',
  'identity drift',
  'label smearing',
  'double exposure',
  'abrupt cut',
  'flicker',
];

const STYLE_DESCRIPTORS: Record<TransitionStyle, string> = {
  photographic: 'Photographic realism, continuous lighting family, premium editorial finish',
  editorial: 'High-fashion editorial finish, considered composition, premium magazine quality',
  cinematic: 'Cinematic film look, controlled grading, premium motion-picture finish',
  studio_clean: 'Clean studio finish, neutral background continuity, polished commercial look',
  soft_natural: 'Soft natural light, warm palette continuity, gentle premium feel',
};

const REALISM_DESCRIPTORS: Record<Realism, string> = {
  ultra_realistic: 'ultra-realistic photography',
  realistic: 'photographic realism',
  slightly_stylized: 'lightly stylized realism',
};

const CAMERA_FEEL_PHRASES: Record<CameraFeel, string> = {
  static: 'a stable, locked camera',
  soft_drift: 'a soft camera drift',
  push_in: 'a slow controlled push-in',
  pull_back: 'a measured pull-back',
  orbit: 'a gentle orbital sweep',
};

const SMOOTHNESS_PHRASES: Record<Smoothness, string> = {
  gradual: 'paced gradually',
  smooth: 'paced smoothly',
  cinematic: 'paced with cinematic restraint',
};

const STRENGTH_PHRASES: Record<MotionStrength, string> = {
  low: 'motion intensity low',
  medium: 'motion intensity balanced',
  high: 'motion intensity pronounced',
};

const FEEL_BY_GOAL: Record<string, string> = {
  smooth_reveal: 'Calm, considered, intentional.',
  product_evolution: 'Premium, controlled, brand-safe.',
  luxury_transition: 'Calm, luxurious, intentional.',
  before_after: 'Clear, confident, satisfying.',
  pose_to_pose: 'Natural, fluid, editorial.',
  angle_change: 'Considered, dimensional, controlled.',
  cinematic_dissolve: 'Cinematic, atmospheric, refined.',
  campaign_motion: 'Editorial, premium, brand-led.',
};

export interface BuildTransitionPromptParams {
  goalId: string;
  style: TransitionStyle;
  cameraFeel: CameraFeel;
  motionStrength: MotionStrength;
  smoothness: Smoothness;
  realism: Realism;
  preserveScene: boolean;
  preserveProductDetails: boolean;
  preserveIdentity: boolean;
  preserveOutfit: boolean;
  audioMode: 'silent' | 'ambient';
  duration: '5' | '10';
  category?: string | null;
  compatibility: TransitionCompatibility;
  /** Optional user note appended as a final single-sentence override. */
  userNote?: string;
}

export interface BuildTransitionPromptResult {
  prompt: string;
  negative_prompt: string;
  cfg_scale: number;
}

/** Tier-aware verb override — overrides goal verb when compatibility is risky/weak. */
function tierVerb(tier: TransitionCompatibility['tier'], goalVerb: string): string {
  switch (tier) {
    case 'strong':
      return `smoothly ${goalVerb}`;
    case 'good':
      return `${goalVerb} with controlled motion`;
    case 'risky':
      return `softly cross-fade through controlled camera movement, allowing the frame to ${goalVerb}`;
    case 'weak':
      return 'cinematically dissolve from the opening composition to the resolving composition';
  }
}

function buildAnchorClause(sharedElements: string[]): string {
  const list = sharedElements.slice(0, 5).join(', ');
  return `Maintain ${list} throughout`;
}

function buildMotionClause(
  verb: string,
  cameraFeel: CameraFeel,
  smoothness: Smoothness,
  strength: MotionStrength,
  duration: '5' | '10',
): string {
  return `Transition with ${CAMERA_FEEL_PHRASES[cameraFeel]} as the frame ${verb}, ${STRENGTH_PHRASES[strength]}, ${SMOOTHNESS_PHRASES[smoothness]} across ${duration} seconds`;
}

function buildStyleClause(style: TransitionStyle, realism: Realism): string {
  return `${STYLE_DESCRIPTORS[style]}, ${REALISM_DESCRIPTORS[realism]}`;
}

function buildGuardsClause(params: BuildTransitionPromptParams): string {
  const guards: string[] = [];
  const categoryGuards = getCategoryGuards(params.category);
  if (params.preserveProductDetails) guards.push(...categoryGuards.slice(0, 3));
  if (params.preserveScene) guards.push('scene framing', 'background continuity');
  if (params.preserveIdentity) guards.push('subject identity', 'facial features');
  if (params.preserveOutfit) guards.push('outfit details', 'fabric continuity');
  // Always-on protections
  guards.push('brand markings');

  // Dedupe while preserving order
  const seen = new Set<string>();
  const unique = guards.filter((g) => {
    const k = g.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return `Preserve ${unique.join(', ')} without warping, morphing, or letter drift`;
}

function buildFeelClause(goalId: string): string {
  return FEEL_BY_GOAL[goalId] ?? 'Premium, controlled, brand-safe.';
}

function trimToCap(parts: { anchor: string; motion: string; style: string; guards: string; feel: string }): string {
  // Try full first
  let full = `${parts.anchor}. ${parts.motion}. ${parts.style}. ${parts.guards}. ${parts.feel}`;
  if (full.length <= HARD_CAP) return full;

  // Drop FEEL first
  full = `${parts.anchor}. ${parts.motion}. ${parts.style}. ${parts.guards}.`;
  if (full.length <= HARD_CAP) return full;

  // Drop GUARDS next
  full = `${parts.anchor}. ${parts.motion}. ${parts.style}.`;
  if (full.length <= HARD_CAP) return full;

  // Last resort: ANCHOR + MOTION only (never trim these)
  full = `${parts.anchor}. ${parts.motion}.`;
  return full.slice(0, HARD_CAP);
}

export function buildTransitionPrompt(params: BuildTransitionPromptParams): BuildTransitionPromptResult {
  const goal = TRANSITION_GOALS.find((g) => g.id === params.goalId) ?? TRANSITION_GOALS[0];
  const verb = tierVerb(params.compatibility.tier, goal.verb);

  const anchor = buildAnchorClause(params.compatibility.sharedElements);
  const motion = buildMotionClause(verb, params.cameraFeel, params.smoothness, params.motionStrength, params.duration);
  const style = buildStyleClause(params.style, params.realism);
  const guards = buildGuardsClause(params);
  const feel = buildFeelClause(goal.id);

  let prompt = trimToCap({ anchor, motion, style, guards, feel });

  // Append user note last as a single sentence (still respect cap)
  if (params.userNote && params.userNote.trim()) {
    const note = params.userNote.trim().replace(/[.!?]+$/, '');
    const withNote = `${prompt} ${note}.`;
    if (withNote.length <= HARD_CAP) prompt = withNote;
  }

  // Negative prompt — always sent
  const categoryNegatives = getCategoryNegatives(params.category);
  const negativeSet = new Set<string>([...BASE_NEGATIVES, ...categoryNegatives]);
  const negative_prompt = Array.from(negativeSet).join(', ');

  const cfg_scale = motionStrengthToCfgScale(params.motionStrength, params.compatibility.tier);

  return { prompt, negative_prompt, cfg_scale };
}
