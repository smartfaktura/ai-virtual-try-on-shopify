import { Rocket, BookOpen, Shirt, Sparkles, Gem, Zap, Leaf, Clapperboard } from 'lucide-react';
import type { ComponentType } from 'react';
import type {
  FilmType,
  FilmTypeOption,
  StoryStructure,
  StoryStructureOption,
  ShotPlanItem,
} from '@/types/shortFilm';
import type {
  ContentIntent, Platform, PaceMode, ProductCategoryKey, EndingStyle,
} from '@/types/commerceVideo';
import {
  pickBestStructureForIntent, getStructureByValue,
} from '@/lib/commerceVideo/storyStructures';
import { getCategoryModule } from '@/lib/commerceVideo/categoryModules';
import { applyClarityFirst } from '@/lib/commerceVideo/clarityFirst';
import { planDuration } from '@/lib/commerceVideo/durationPlanner';
import { pickEnding } from '@/lib/commerceVideo/endingPlanner';

/* ------------------------------------------------------------------ */
/*  Film Type Presets                                                   */
/* ------------------------------------------------------------------ */

export const FILM_TYPE_OPTIONS: FilmTypeOption[] = [
  {
    value: 'product_launch',
    label: 'Product Launch',
    description: 'A cinematic reveal for a new product drop.',
    icon: 'Rocket',
    lucideIcon: Rocket,
    defaultStructure: 'hook_reveal_detail_closing',
    defaultTone: 'premium',
    defaultShotCount: 4,
  },
  {
    value: 'brand_story',
    label: 'Brand Story',
    description: 'Tell your brand narrative in a short cinematic film.',
    icon: 'BookOpen',
    lucideIcon: BookOpen,
    defaultStructure: 'intro_product_lifestyle_end',
    defaultTone: 'editorial',
    defaultShotCount: 4,
  },
  {
    value: 'fashion_campaign',
    label: 'Fashion Campaign',
    description: 'A stylish fashion film with model and product focus.',
    icon: 'Shirt',
    lucideIcon: Shirt,
    defaultStructure: 'atmosphere_focus_human_finish',
    defaultTone: 'editorial',
    defaultShotCount: 4,
  },
  {
    value: 'beauty_film',
    label: 'Beauty Film',
    description: 'Elegant close-ups and textures for beauty products.',
    icon: 'Sparkles',
    lucideIcon: Sparkles,
    defaultStructure: 'hook_reveal_detail_closing',
    defaultTone: 'luxury',
    defaultShotCount: 4,
  },
  {
    value: 'luxury_mood',
    label: 'Luxury Mood Film',
    description: 'Atmospheric, slow-paced film for premium brands.',
    icon: 'Gem',
    lucideIcon: Gem,
    defaultStructure: 'tease_build_highlight_resolve',
    defaultTone: 'luxury',
    defaultShotCount: 4,
  },
  {
    value: 'sports_campaign',
    label: 'Sports Campaign',
    description: 'Energetic, dynamic motion for activewear and sports.',
    icon: 'Zap',
    lucideIcon: Zap,
    defaultStructure: 'hook_reveal_detail_closing',
    defaultTone: 'energetic',
    defaultShotCount: 4,
  },
  {
    value: 'lifestyle_teaser',
    label: 'Lifestyle Teaser',
    description: 'A warm, aspirational lifestyle brand clip.',
    icon: 'Leaf',
    lucideIcon: Leaf,
    defaultStructure: 'intro_product_lifestyle_end',
    defaultTone: 'minimal',
    defaultShotCount: 4,
  },
  {
    value: 'custom',
    label: 'Custom Film',
    description: 'Build your own structure from scratch.',
    icon: 'Clapperboard',
    lucideIcon: Clapperboard,
    defaultStructure: 'custom',
    defaultTone: 'clean',
    defaultShotCount: 4,
  },
];

/* ------------------------------------------------------------------ */
/*  Story Structure Presets                                             */
/* ------------------------------------------------------------------ */

export const STORY_STRUCTURE_OPTIONS: StoryStructureOption[] = [
  {
    value: 'hook_reveal_detail_closing',
    label: 'Hook → Reveal → Detail → Closing',
    description: 'Grab attention, reveal the product, show detail, close strong.',
    roles: ['hook', 'product_reveal', 'detail_closeup', 'brand_finish'],
  },
  {
    value: 'intro_product_lifestyle_end',
    label: 'Intro → Product → Lifestyle → End',
    description: 'Set the scene, feature the product, show it in use, sign off.',
    roles: ['intro', 'product_moment', 'lifestyle_moment', 'end_frame'],
  },
  {
    value: 'atmosphere_focus_human_finish',
    label: 'Atmosphere → Focus → Human → Finish',
    description: 'Build mood, focus on the product, add a human element, finish.',
    roles: ['atmosphere', 'product_focus', 'human_interaction', 'brand_finish'],
  },
  {
    value: 'tease_build_highlight_resolve',
    label: 'Tease → Build → Highlight → Resolve',
    description: 'Create intrigue, build tension, highlight the hero, resolve.',
    roles: ['tease', 'build', 'highlight', 'resolve'],
  },
  {
    value: 'custom',
    label: 'Custom Structure',
    description: 'Define your own shot roles and sequence (max 6).',
    roles: [],
  },
];

/* ------------------------------------------------------------------ */
/*  Shot Role Metadata                                                  */
/* ------------------------------------------------------------------ */

const ROLE_DEFAULTS: Record<string, Partial<ShotPlanItem>> = {
  hook: {
    purpose: 'Grab attention with an arresting opening',
    scene_type: 'atmospheric_lifestyle',
    camera_motion: 'slow_drift',
    subject_motion: 'minimal',
    product_visible: false,
    character_visible: false,
    preservation_strength: 'medium',
    script_line: 'It begins.',
  },
  product_reveal: {
    purpose: 'Hero product reveal moment',
    scene_type: 'studio_reveal',
    camera_motion: 'slow_push_in',
    subject_motion: 'minimal',
    product_visible: true,
    character_visible: false,
    preservation_strength: 'high',
    script_line: 'Truly extraordinary.',
  },
  detail_closeup: {
    purpose: 'Show texture, materials, craftsmanship',
    scene_type: 'macro_closeup',
    camera_motion: 'micro_pan',
    subject_motion: 'minimal',
    product_visible: true,
    character_visible: false,
    preservation_strength: 'high',
    script_line: 'Every detail, perfected.',
  },
  brand_finish: {
    purpose: 'Close with lasting brand impression',
    scene_type: 'hero_end_frame',
    camera_motion: 'static',
    subject_motion: 'minimal',
    product_visible: true,
    character_visible: false,
    preservation_strength: 'high',
    script_line: 'A statement.',
  },
  intro: {
    purpose: 'Set the scene and mood',
    scene_type: 'establishing_wide',
    camera_motion: 'slow_pan',
    subject_motion: 'minimal',
    product_visible: false,
    character_visible: false,
    preservation_strength: 'low',
    script_line: 'A world of detail.',
  },
  product_moment: {
    purpose: 'Feature the product prominently',
    scene_type: 'product_hero',
    camera_motion: 'orbit',
    subject_motion: 'minimal',
    product_visible: true,
    character_visible: false,
    preservation_strength: 'high',
    script_line: 'Designed to stand out.',
  },
  lifestyle_moment: {
    purpose: 'Show product in real-world context',
    scene_type: 'lifestyle_context',
    camera_motion: 'handheld_gentle',
    subject_motion: 'natural_movement',
    product_visible: true,
    character_visible: true,
    preservation_strength: 'medium',
    script_line: 'Design meets life.',
  },
  end_frame: {
    purpose: 'Brand sign-off and call-to-action',
    scene_type: 'end_card',
    camera_motion: 'static',
    subject_motion: 'minimal',
    product_visible: true,
    character_visible: false,
    preservation_strength: 'high',
    script_line: 'Your story continues.',
  },
  atmosphere: {
    purpose: 'Build atmospheric mood',
    scene_type: 'mood_abstract',
    camera_motion: 'slow_drift',
    subject_motion: 'ambient',
    product_visible: false,
    character_visible: false,
    preservation_strength: 'low',
    script_line: 'Feel it.',
  },
  product_focus: {
    purpose: 'Focused product showcase',
    scene_type: 'studio_detail',
    camera_motion: 'slow_push_in',
    subject_motion: 'minimal',
    product_visible: true,
    character_visible: false,
    preservation_strength: 'high',
    script_line: 'Every angle speaks.',
  },
  human_interaction: {
    purpose: 'Show human connection with product',
    scene_type: 'lifestyle_interaction',
    camera_motion: 'tracking',
    subject_motion: 'natural_movement',
    product_visible: true,
    character_visible: true,
    preservation_strength: 'medium',
    script_line: 'Moments that matter.',
  },
  tease: {
    purpose: 'Create intrigue and anticipation',
    scene_type: 'abstract_tease',
    camera_motion: 'slow_drift',
    subject_motion: 'minimal',
    product_visible: false,
    character_visible: false,
    preservation_strength: 'low',
    script_line: 'Something awaits.',
  },
  build: {
    purpose: 'Build tension and momentum',
    scene_type: 'dynamic_sequence',
    camera_motion: 'push_in',
    subject_motion: 'ambient',
    product_visible: false,
    character_visible: true,
    preservation_strength: 'medium',
    script_line: 'Anticipation.',
  },
  highlight: {
    purpose: 'Peak hero product moment',
    scene_type: 'hero_spotlight',
    camera_motion: 'orbit',
    subject_motion: 'minimal',
    product_visible: true,
    character_visible: false,
    preservation_strength: 'high',
    script_line: 'The moment.',
  },
  resolve: {
    purpose: 'Resolve the story, leave lasting impression',
    scene_type: 'resolve_wide',
    camera_motion: 'pull_back',
    subject_motion: 'minimal',
    product_visible: true,
    character_visible: false,
    preservation_strength: 'high',
    script_line: 'Sealed in elegance.',
  },
};

/* ------------------------------------------------------------------ */
/*  Tone → motion style mapping                                         */
/* ------------------------------------------------------------------ */

const TONE_MOTION_MAP: Record<string, { camera_speed: string; pacing: string }> = {
  premium: { camera_speed: 'slow', pacing: 'deliberate' },
  luxury: { camera_speed: 'very_slow', pacing: 'languid' },
  editorial: { camera_speed: 'medium', pacing: 'rhythmic' },
  energetic: { camera_speed: 'fast', pacing: 'dynamic' },
  minimal: { camera_speed: 'slow', pacing: 'minimal' },
  emotional: { camera_speed: 'medium', pacing: 'flowing' },
  clean: { camera_speed: 'medium', pacing: 'steady' },
};

/* ------------------------------------------------------------------ */
/*  Generate Shot Plan                                                  */
/* ------------------------------------------------------------------ */

export function generateShotPlan(
  filmType: FilmType,
  structure: StoryStructure,
  shotDuration: '5' | '10' = '5',
): ShotPlanItem[] {
  const filmOption = FILM_TYPE_OPTIONS.find(f => f.value === filmType);
  const structureOption = STORY_STRUCTURE_OPTIONS.find(s => s.value === structure);

  const tone = filmOption?.defaultTone || 'clean';
  const _toneStyle = TONE_MOTION_MAP[tone] || TONE_MOTION_MAP.clean;

  const allRoles = structureOption?.roles?.length
    ? structureOption.roles
    : ['hook', 'product_reveal', 'detail_closeup', 'brand_finish'];

  // Cap at 6 shots max (Kling multi-shot limit)
  const roles = allRoles.slice(0, 6);

  return roles.map((role, index) => {
    const defaults = ROLE_DEFAULTS[role] || ROLE_DEFAULTS.hook;
    const ROLE_SFX_DEFAULTS: Record<string, string> = {
      hook: 'dramatic cinematic whoosh impact with bass hit',
      tease: 'subtle mysterious tension riser, soft wind',
      build: 'rising cinematic tension swells, building energy',
      intro: 'soft ambient cinematic opening, gentle atmospheric pad',
      atmosphere: 'deep ambient atmosphere, ethereal soundscape',
      product_reveal: 'elegant reveal shimmer with subtle sparkle whoosh',
      highlight: 'powerful cinematic impact with reverb tail',
      product_moment: 'satisfying premium product sound, smooth mechanical',
      detail_closeup: 'soft mechanical focus click, precision close-up sound',
      product_focus: 'clean studio ambience with gentle product handling',
      lifestyle_moment: 'warm natural ambient, gentle background life sounds',
      human_interaction: 'soft fabric movement, gentle human presence',
      brand_finish: 'deep cinematic bass hit with elegant resolve',
      end_frame: 'soft logo resolve sound, gentle cinematic ending',
      resolve: 'warm cinematic resolution, satisfying closing tone',
      closing: 'gentle fade-out ambience, soft cinematic outro',
    };
    const SFX_TRIGGER_DEFAULTS: Record<string, number> = {
      hook: 0,
      tease: 0,
      product_reveal: 0.5,
      highlight: 0.3,
      closing: 0,
      brand_finish: 0,
      end_frame: 0,
    };
    return {
      shot_index: index + 1,
      role,
      purpose: defaults.purpose || '',
      scene_type: defaults.scene_type || 'general',
      camera_motion: defaults.camera_motion || 'static',
      subject_motion: defaults.subject_motion || 'minimal',
      duration_sec: getDefaultDurationForRole(role),
      script_line: defaults.script_line,
      sfx_prompt: ROLE_SFX_DEFAULTS[role] || 'subtle cinematic ambient sound',
      sfx_trigger_at: SFX_TRIGGER_DEFAULTS[role] ?? 0,
      product_visible: defaults.product_visible ?? false,
      character_visible: defaults.character_visible ?? false,
      preservation_strength: defaults.preservation_strength || 'medium',
    };
  });
}

/** Cinematic default durations per shot role — sums to ≤15s for 4-shot structures */
function getDefaultDurationForRole(role: string): number {
  const ROLE_DURATIONS: Record<string, number> = {
    hook: 2,
    tease: 2,
    build: 2,
    intro: 3,
    atmosphere: 3,
    product_reveal: 4,
    highlight: 4,
    product_moment: 4,
    detail_closeup: 3,
    product_focus: 3,
    lifestyle_moment: 3,
    human_interaction: 3,
    brand_finish: 3,
    end_frame: 3,
    resolve: 3,
    closing: 3,
  };
  return ROLE_DURATIONS[role] || 3;
}

export function formatRoleLabel(role: string): string {
  return role
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function formatCameraMotion(motion: string): string {
  return motion
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/* ------------------------------------------------------------------ */
/*  Intent-aware planner (Phase 2 — Commerce Video Engine)             */
/* ------------------------------------------------------------------ */

export interface CommercePlannerContext {
  contentIntent?: ContentIntent | null;
  platform?: Platform;
  paceMode?: PaceMode;
  category?: ProductCategoryKey;
  clarityFirstMode?: boolean;
  endingStyle?: EndingStyle;
  offerContext?: string;
  /** When true, auto-pick a structure for the given intent if the user
   *  has not explicitly selected one. */
  autoPickStructure?: boolean;
}

/**
 * Build a shot plan that's aware of content intent, category, pace,
 * clarity-first mode, and adaptive duration. Falls back to the legacy
 * `generateShotPlan` behavior when no commerce context is provided.
 */
export function generateCommerceShotPlan(
  filmType: FilmType,
  structure: StoryStructure,
  shotDuration: '5' | '10' = '5',
  ctx: CommercePlannerContext = {},
): ShotPlanItem[] {
  // 1) Resolve roles — prefer commerce structure if intent given and either
  //    user picked a commerce structure value or asked for auto-pick.
  let roles: string[] | undefined;
  const commerceDef =
    getStructureByValue(structure as string) ||
    (ctx.autoPickStructure ? pickBestStructureForIntent(ctx.contentIntent ?? null) : null);

  if (commerceDef) {
    roles = commerceDef.roles.slice(0, 6);
  }

  let plan: ShotPlanItem[];
  if (roles && roles.length > 0) {
    plan = roles.map((role, index) => {
      const defaults = ROLE_DEFAULTS[role] || ROLE_DEFAULTS.hook;
      return {
        shot_index: index + 1,
        role,
        purpose: defaults.purpose || '',
        scene_type: defaults.scene_type || 'general',
        camera_motion: defaults.camera_motion || 'static',
        subject_motion: defaults.subject_motion || 'minimal',
        duration_sec: getDefaultDurationForRole(role),
        script_line: defaults.script_line,
        sfx_prompt: 'subtle cinematic ambient sound',
        sfx_trigger_at: 0,
        product_visible: defaults.product_visible ?? false,
        character_visible: defaults.character_visible ?? false,
        preservation_strength: defaults.preservation_strength || 'medium',
      };
    });
  } else {
    plan = generateShotPlan(filmType, structure, shotDuration);
  }

  // 2) Category bias — bump preservation on categories with high fidelity needs
  if (ctx.category) {
    const cat = getCategoryModule(ctx.category);
    for (const s of plan) {
      if (cat.preferredShotRoles.includes(s.role) && s.product_visible) {
        if (s.preservation_strength === 'low') s.preservation_strength = 'medium';
      }
    }
  }

  // 3) Adaptive duration — choose total based on intent/platform/pace/category
  const dur = planDuration({
    intent: ctx.contentIntent ?? null,
    platform: ctx.platform,
    pace: ctx.paceMode,
    category: ctx.category,
    clarityFirst: ctx.clarityFirstMode,
    shotCount: plan.length,
  });
  // Distribute target total across shots, keeping cinematic role weights
  const weights = plan.map(s => getDefaultDurationForRole(s.role));
  const weightSum = weights.reduce((a, b) => a + b, 0) || plan.length;
  let remaining = dur.totalSec;
  plan.forEach((s, i) => {
    if (i === plan.length - 1) {
      s.duration_sec = Math.max(1, Math.min(15, remaining));
    } else {
      const share = Math.max(1, Math.round((weights[i] / weightSum) * dur.totalSec));
      s.duration_sec = Math.min(15, share);
      remaining -= s.duration_sec;
    }
  });

  // 4) Clarity-first transformations
  if (ctx.clarityFirstMode) {
    const result = applyClarityFirst(plan);
    plan = result.shots;
    if (result.changes.length > 0) {
      console.log('[commerce-planner] clarity-first changes:', result.changes);
    }
  }

  // 5) Ending style — adjust last shot's scene_type to match resolved ending
  const ending = pickEnding({
    intent: ctx.contentIntent ?? null,
    platform: ctx.platform,
    clarityFirst: ctx.clarityFirstMode,
    offerContext: ctx.offerContext,
    category: ctx.category,
    userOverride: ctx.endingStyle,
  });
  if (plan.length > 0) {
    const last = plan[plan.length - 1];
    if (ending === 'product_close' || ending === 'marketplace_clean_end') {
      last.scene_type = 'hero_end_frame';
      last.product_visible = true;
    } else if (ending === 'detail_close') {
      last.scene_type = 'macro_closeup';
      last.product_visible = true;
    } else if (ending === 'atmosphere_resolve') {
      last.scene_type = 'resolve_wide';
    } else if (ending === 'logo_safe_luxury_end' || ending === 'clean_brand_close') {
      last.scene_type = 'hero_end_frame';
    }
  }

  return plan;
}

