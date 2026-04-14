import type {
  FilmType,
  FilmTypeOption,
  StoryStructure,
  StoryStructureOption,
  ShotPlanItem,
} from '@/types/shortFilm';

/* ------------------------------------------------------------------ */
/*  Film Type Presets                                                   */
/* ------------------------------------------------------------------ */

export const FILM_TYPE_OPTIONS: FilmTypeOption[] = [
  {
    value: 'product_launch',
    label: 'Product Launch',
    description: 'A cinematic reveal for a new product drop.',
    icon: '🚀',
    defaultStructure: 'hook_reveal_detail_closing',
    defaultTone: 'premium',
    defaultShotCount: 4,
  },
  {
    value: 'brand_story',
    label: 'Brand Story',
    description: 'Tell your brand narrative in a short cinematic film.',
    icon: '📖',
    defaultStructure: 'intro_product_lifestyle_end',
    defaultTone: 'editorial',
    defaultShotCount: 5,
  },
  {
    value: 'fashion_campaign',
    label: 'Fashion Campaign',
    description: 'A stylish fashion film with model and product focus.',
    icon: '👗',
    defaultStructure: 'atmosphere_focus_human_finish',
    defaultTone: 'editorial',
    defaultShotCount: 5,
  },
  {
    value: 'beauty_film',
    label: 'Beauty Film',
    description: 'Elegant close-ups and textures for beauty products.',
    icon: '💄',
    defaultStructure: 'hook_reveal_detail_closing',
    defaultTone: 'luxury',
    defaultShotCount: 4,
  },
  {
    value: 'luxury_mood',
    label: 'Luxury Mood Film',
    description: 'Atmospheric, slow-paced film for premium brands.',
    icon: '✨',
    defaultStructure: 'tease_build_highlight_resolve',
    defaultTone: 'luxury',
    defaultShotCount: 4,
  },
  {
    value: 'sports_campaign',
    label: 'Sports Campaign',
    description: 'Energetic, dynamic motion for activewear and sports.',
    icon: '⚡',
    defaultStructure: 'hook_reveal_detail_closing',
    defaultTone: 'energetic',
    defaultShotCount: 4,
  },
  {
    value: 'lifestyle_teaser',
    label: 'Lifestyle Teaser',
    description: 'A warm, aspirational lifestyle brand clip.',
    icon: '🌿',
    defaultStructure: 'intro_product_lifestyle_end',
    defaultTone: 'minimal',
    defaultShotCount: 4,
  },
  {
    value: 'custom',
    label: 'Custom Film',
    description: 'Build your own structure from scratch.',
    icon: '🎬',
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
    description: 'Grab attention, show the product, zoom into details, close strong.',
    roles: ['hook', 'product_reveal', 'detail_closeup', 'brand_finish'],
  },
  {
    value: 'intro_product_lifestyle_end',
    label: 'Intro → Product → Lifestyle → End',
    description: 'Set the scene, feature the product, show it in use, end with brand.',
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
    description: 'Define your own shot roles and sequence.',
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
  },
  product_reveal: {
    purpose: 'Hero product reveal moment',
    scene_type: 'studio_reveal',
    camera_motion: 'slow_push_in',
    subject_motion: 'minimal',
    product_visible: true,
    character_visible: false,
    preservation_strength: 'high',
  },
  detail_closeup: {
    purpose: 'Show texture, materials, craftsmanship',
    scene_type: 'macro_closeup',
    camera_motion: 'micro_pan',
    subject_motion: 'minimal',
    product_visible: true,
    character_visible: false,
    preservation_strength: 'high',
  },
  brand_finish: {
    purpose: 'Close with lasting brand impression',
    scene_type: 'hero_end_frame',
    camera_motion: 'static',
    subject_motion: 'minimal',
    product_visible: true,
    character_visible: false,
    preservation_strength: 'high',
  },
  intro: {
    purpose: 'Set the scene and mood',
    scene_type: 'establishing_wide',
    camera_motion: 'slow_pan',
    subject_motion: 'minimal',
    product_visible: false,
    character_visible: false,
    preservation_strength: 'low',
  },
  product_moment: {
    purpose: 'Feature the product prominently',
    scene_type: 'product_hero',
    camera_motion: 'orbit',
    subject_motion: 'minimal',
    product_visible: true,
    character_visible: false,
    preservation_strength: 'high',
  },
  lifestyle_moment: {
    purpose: 'Show product in real-world context',
    scene_type: 'lifestyle_context',
    camera_motion: 'handheld_gentle',
    subject_motion: 'natural_movement',
    product_visible: true,
    character_visible: true,
    preservation_strength: 'medium',
  },
  end_frame: {
    purpose: 'Brand sign-off and call-to-action',
    scene_type: 'end_card',
    camera_motion: 'static',
    subject_motion: 'minimal',
    product_visible: true,
    character_visible: false,
    preservation_strength: 'high',
  },
  atmosphere: {
    purpose: 'Build atmospheric mood',
    scene_type: 'mood_abstract',
    camera_motion: 'slow_drift',
    subject_motion: 'ambient',
    product_visible: false,
    character_visible: false,
    preservation_strength: 'low',
  },
  product_focus: {
    purpose: 'Focused product showcase',
    scene_type: 'studio_detail',
    camera_motion: 'slow_push_in',
    subject_motion: 'minimal',
    product_visible: true,
    character_visible: false,
    preservation_strength: 'high',
  },
  human_interaction: {
    purpose: 'Show human connection with product',
    scene_type: 'lifestyle_interaction',
    camera_motion: 'tracking',
    subject_motion: 'natural_movement',
    product_visible: true,
    character_visible: true,
    preservation_strength: 'medium',
  },
  tease: {
    purpose: 'Create intrigue and anticipation',
    scene_type: 'abstract_tease',
    camera_motion: 'slow_drift',
    subject_motion: 'minimal',
    product_visible: false,
    character_visible: false,
    preservation_strength: 'low',
  },
  build: {
    purpose: 'Build tension and momentum',
    scene_type: 'dynamic_sequence',
    camera_motion: 'push_in',
    subject_motion: 'ambient',
    product_visible: false,
    character_visible: true,
    preservation_strength: 'medium',
  },
  highlight: {
    purpose: 'Peak hero product moment',
    scene_type: 'hero_spotlight',
    camera_motion: 'orbit',
    subject_motion: 'minimal',
    product_visible: true,
    character_visible: false,
    preservation_strength: 'high',
  },
  resolve: {
    purpose: 'Resolve the story, leave lasting impression',
    scene_type: 'resolve_wide',
    camera_motion: 'pull_back',
    subject_motion: 'minimal',
    product_visible: true,
    character_visible: false,
    preservation_strength: 'high',
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

  const roles = structureOption?.roles?.length
    ? structureOption.roles
    : ['hook', 'product_reveal', 'detail_closeup', 'brand_finish'];

  const durationSec = Number(shotDuration);

  return roles.map((role, index) => {
    const defaults = ROLE_DEFAULTS[role] || ROLE_DEFAULTS.hook;
    return {
      shot_index: index + 1,
      role,
      purpose: defaults.purpose || '',
      scene_type: defaults.scene_type || 'general',
      camera_motion: defaults.camera_motion || 'static',
      subject_motion: defaults.subject_motion || 'minimal',
      duration_sec: durationSec,
      product_visible: defaults.product_visible ?? false,
      character_visible: defaults.character_visible ?? false,
      preservation_strength: defaults.preservation_strength || 'medium',
    };
  });
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
