import type { ShotPlanItem, ShortFilmSettings, FilmType } from '@/types/shortFilm';
import type { ReferenceAsset } from '@/components/app/video/short-film/ReferenceUploadPanel';

interface PromptContext {
  filmType: FilmType;
  tone: string;
  settings: ShortFilmSettings;
  references: ReferenceAsset[];
}

/* ─── Cinematic tone presets per film type ─── */
export const TONE_PRESETS: Record<string, string> = {
  product_launch:
    'sleek commercial film, premium product reveal, high-end advertising aesthetic, anamorphic lens flare',
  brand_story:
    'emotional brand narrative, warm cinematic tones, documentary-style intimacy, natural grain',
  fashion_campaign:
    'high-fashion editorial film, runway-grade lighting, Vogue-level production, muted desaturated palette',
  beauty_film:
    'luminous beauty cinematography, porcelain skin lighting, extreme close-up texture, soft diffusion filter',
  luxury_mood:
    'moody luxury film, rich deep shadows, slow deliberate pacing, velvet-dark color grading',
  sports_campaign:
    'dynamic sports cinematography, high frame rate slow motion, powerful kinetic energy, sharp contrasty look',
  lifestyle_teaser:
    'warm lifestyle film, golden hour warmth, relatable candid moments, organic handheld feel',
  custom:
    'cinematic professional film, studio-quality production, refined color grading',
};

/* ─── Per-role cinematographic directives ─── */
/* ─── Per-role cinematographic directives ─── */
/* Keys match the system roles emitted by the AI Director / preset planner */
const ROLE_CINEMATICS: Record<string, {
  directive: string;
  lighting: string;
  lens: string;
  negatives: string[];
}> = {
  /* ── Story structure: hook_reveal_detail_closing ── */
  hook: {
    directive:
      'Dramatic opening shot. High visual intrigue. Silhouette-to-reveal transition with escalating energy.',
    lighting: 'High-contrast rim lighting, dramatic backlight, deep shadows with specular highlights.',
    lens: 'Wide anamorphic lens, shallow depth of field, cinematic letterbox framing.',
    negatives: ['static', 'flat lighting', 'boring composition'],
  },
  product_reveal: {
    directive:
      'Hero product reveal with dramatic emphasis. The subject emerges from shadow or motion blur into sharp focus.',
    lighting: 'Sculpted three-point lighting, key light at 45°, subtle fill, strong back-rim separation.',
    lens: 'Medium focal length, rack focus from background to subject, precision center framing.',
    negatives: ['premature reveal', 'cluttered frame', 'overlit'],
  },
  detail_closeup: {
    directive:
      'Extreme close-up detail shot. Showcase texture, craftsmanship, material quality.',
    lighting: 'Texture-revealing side light at 30°, soft fill opposite, micro-contrast enhancement.',
    lens: 'Macro lens, f/2.8 bokeh, ultra-shallow depth of field, rack focus across surface details.',
    negatives: ['wide shot', 'out of focus subject', 'flat angle'],
  },
  brand_finish: {
    directive:
      'Elegant final shot. Confident conclusion with logo-safe composition. Satisfying visual resolution.',
    lighting: 'Soft wrap-around lighting, gentle gradient falloff, clean even illumination.',
    lens: 'Slow pull-back or static lock-off, centered composition, fade-ready framing.',
    negatives: ['abrupt ending', 'busy background', 'harsh shadows'],
  },

  /* ── Story structure: intro_product_lifestyle_end ── */
  scene_intro: {
    directive:
      'Establishing shot setting mood and spatial context. Draw the viewer into the world.',
    lighting: 'Atmospheric environmental lighting, volumetric haze, motivated practical light sources.',
    lens: 'Wide angle establishing shot, deep depth of field, slow dolly or crane movement.',
    negatives: ['tight framing', 'unclear context', 'static'],
  },
  product_moment: {
    directive:
      'Hero product showcase. The product is the undeniable star — pristine, elevated, magnetic.',
    lighting: 'Studio product lighting, soft overhead diffusion, subtle gradient background, clean reflections.',
    lens: 'Medium telephoto compression, floating product feel, smooth slow orbit or push.',
    negatives: ['distracting elements', 'poor product visibility', 'cluttered'],
  },
  lifestyle_moment: {
    directive:
      'Product in real-world context. Natural human interaction, aspirational but believable setting.',
    lighting: 'Natural window light or golden hour, warm color temperature, organic soft shadows.',
    lens: 'Medium wide, shallow DOF isolating subject from environment, gentle handheld sway.',
    negatives: ['staged feeling', 'unnatural poses', 'studio look'],
  },
  end_frame: {
    directive:
      'Satisfying visual conclusion. Resolving energy, calm confident finish.',
    lighting: 'Soft even lighting, warm afterglow, gentle fade-down quality.',
    lens: 'Static or slow crane up, centered composition, clean negative space.',
    negatives: ['rushed', 'new information', 'jarring'],
  },

  /* ── Story structure: atmosphere_focus_human_finish ── */
  mood_atmosphere: {
    directive:
      'Pure mood and atmosphere. Abstract visual poetry — light, shadow, texture, movement.',
    lighting: 'Dramatic chiaroscuro or ethereal soft glow, volumetric light rays, lens flare accents.',
    lens: 'Experimental angles, anamorphic distortion, slow motion, dreamlike quality.',
    negatives: ['literal', 'explanatory', 'sharp hard edges'],
  },
  product_focus: {
    directive:
      'Tight focus on the subject. Precision framing, intentional negative space.',
    lighting: 'Spot lighting on subject, dark surround falloff, dramatic light-to-shadow ratio.',
    lens: 'Long telephoto, f/1.4 extreme bokeh, subject isolation, locked tripod.',
    negatives: ['wide framing', 'busy background', 'movement blur'],
  },
  human_interaction: {
    directive:
      'Human element — a real person with natural expression, gesture, and interaction. Emotional connection with the viewer.',
    lighting: 'Beauty lighting, soft diffused key, eye-catch reflection, warm skin tones.',
    lens: 'Portrait focal length 85-135mm, shallow DOF, intimate distance.',
    negatives: ['distorted faces', 'unflattering angle', 'harsh shadows on face', 'mannequin', 'hanger', 'clothes rack', 'faceless figure'],
  },

  /* ── Story structure: tease_build_highlight_resolve ── */
  tease: {
    directive:
      'Teaser shot — hint without full reveal. Build curiosity and anticipation.',
    lighting: 'Partial lighting, silhouette edges, mysterious shadow play.',
    lens: 'Selective focus, obscured framing, quick glimpse pacing.',
    negatives: ['full reveal', 'overexposed', 'static'],
  },
  build: {
    directive:
      'Building momentum. Escalating visual energy, increasing pace and drama.',
    lighting: 'Intensifying light, building contrast, dynamic light movement.',
    lens: 'Accelerating camera motion, tighter framing progression, rhythmic cutting feel.',
    negatives: ['flat energy', 'repetitive', 'static camera'],
  },
  highlight: {
    directive:
      'Peak visual highlight — the hero moment. Maximum impact and clarity.',
    lighting: 'Perfect hero lighting, all elements aligned, peak luminance and color saturation.',
    lens: 'Optimal framing, decisive moment capture, dynamic angle.',
    negatives: ['underwhelming', 'poor timing', 'soft focus'],
  },
  resolve: {
    directive:
      'Resolution — bring the narrative to a calm, confident close. Visual deceleration.',
    lighting: 'Softening light, warm resolution tones, peaceful quality.',
    lens: 'Gentle pull-back or settle, widening composition, breathing room.',
    negatives: ['new tension', 'abrupt', 'dark ending'],
  },

  /* ── Shared / utility roles ── */
  transition: {
    directive:
      'Smooth visual transition connecting scenes. Elegant motion bridging two moments.',
    lighting: 'Consistent transitional lighting, matching tone of adjacent shots.',
    lens: 'Flowing camera movement, wipe or morph framing, seamless continuity.',
    negatives: ['jarring cut', 'mismatched lighting', 'static'],
  },
};

/* ── Legacy alias map: short names → system role keys ── */
const ROLE_ALIASES: Record<string, string> = {
  reveal: 'product_reveal',
  detail: 'detail_closeup',
  closing: 'brand_finish',
  intro: 'scene_intro',
  product: 'product_moment',
  lifestyle: 'lifestyle_moment',
  finish: 'end_frame',
  atmosphere: 'mood_atmosphere',
  focus: 'product_focus',
  human: 'human_interaction',
  hero: 'highlight',
};

/** Look up cinematic directives by role, with alias fallback */
function lookupRoleCinematic(role: string) {
  return ROLE_CINEMATICS[role]
    || ROLE_CINEMATICS[ROLE_ALIASES[role] || '']
    || DEFAULT_CINEMATIC;
}

const DEFAULT_CINEMATIC = {
  directive: 'Cinematic shot with professional production quality.',
  lighting: 'Studio-quality three-point lighting with soft fill.',
  lens: 'Standard cinematic lens, shallow depth of field.',
  negatives: [] as string[],
};

/* ─── Core negative terms (always included) ─── */
const BASE_NEGATIVES = [
  'blurry', 'low quality', 'watermark', 'text overlay', 'logo',
  'distorted faces', 'unrealistic proportions', 'overexposed',
  'underexposed', 'noise', 'grain artifacts', 'compression artifacts',
  'amateur', 'shaky camera', 'lens distortion',
];

/* ─── Human-shot specific negatives ─── */
const HUMAN_NEGATIVES = [
  'mannequin', 'hanger', 'clothes rack', 'faceless', 'plastic figure',
  'doll', 'ghost figure', 'invisible person', 'empty clothes',
  'no person visible', 'product only without human',
];

/**
 * Build a cinematic video prompt for a single shot in a short film.
 * Produces high-end cinematographic language optimized for Kling v3.
 */
export function buildShotPrompt(
  shot: ShotPlanItem,
  context: PromptContext,
  imageIndex?: number,
): { prompt: string; negative_prompt: string } {
  const MAX_PROMPT_LENGTH = 510;
  const roleCine = lookupRoleCinematic(shot.role);

  // Priority 1 — must have
  const p1: string[] = [];
  if (typeof imageIndex === 'number' && imageIndex >= 1) {
    p1.push(`Feature subject from <<<image_${imageIndex}>>>.`);
  }

  // For character-visible shots, add strong human directives
  if (shot.character_visible) {
    p1.push('A real human person with natural skin, visible face, and authentic expression.');
    // Lip-sync: if character has voiceover script, tell Kling to animate lips
    if (shot.script_line && shot.vo_enabled !== false) {
      p1.push('Character speaking dialogue, natural lip movement, conversational expression.');
    }
  }

  p1.push(roleCine.directive);
  p1.push(shot.purpose);

  // Priority 1.5 — user-selected style & scene presets (high priority, should not be truncated)
  const styleRef = context.references?.find(r => r.role === 'style' && !r.url && r.name);
  if (styleRef?.name) {
    const keywords = styleRef.name.includes(':') ? styleRef.name.split(':').slice(1).join(':').trim() : styleRef.name;
    if (keywords) p1.push(`Visual style: ${keywords}.`);
  }

  const sceneRef = context.references?.find(r => r.role === 'scene' && !r.url && r.name);
  if (sceneRef?.name) {
    const sceneDesc = sceneRef.name.includes(':') ? sceneRef.name.split(':').slice(1).join(':').trim() : sceneRef.name;
    if (sceneDesc) p1.push(`Environment: ${sceneDesc}.`);
  }

  // Priority 2 — important
  const p2: string[] = [];
  if (shot.camera_motion && shot.camera_motion !== 'static') {
    p2.push(`Smooth ${shot.camera_motion.replace(/_/g, ' ')} camera movement.`);
  }
  if (shot.subject_motion && shot.subject_motion !== 'none') {
    p2.push(`Subject motion: ${shot.subject_motion.replace(/_/g, ' ')}.`);
  }
  if (shot.user_notes) {
    p2.push(shot.user_notes);
  }

  const tonePreset = TONE_PRESETS[context.filmType] || context.tone || TONE_PRESETS.custom;
  p2.push(`Cinematic 4K ${tonePreset}.`);

  // Priority 3 — nice to have
  const p3: string[] = [];
  p3.push(roleCine.lighting);
  p3.push(roleCine.lens);
  if (shot.script_line) {
    p3.push(`Visual matches: "${shot.script_line}".`);
  }
  if (shot.preservation_strength === 'high') {
    p3.push('Maintain strong visual consistency with references.');
  } else if (shot.preservation_strength === 'medium') {
    p3.push('Maintain visual consistency with reference styling.');
  }
  p3.push('Professional color grading, film-grade production.');

  // Build prompt respecting char limit
  let prompt = p1.join(' ');
  for (const part of [...p2, ...p3]) {
    const next = prompt + ' ' + part;
    if (next.length > MAX_PROMPT_LENGTH) break;
    prompt = next;
  }

  // Hard truncate safety net
  if (prompt.length > MAX_PROMPT_LENGTH) {
    prompt = prompt.slice(0, MAX_PROMPT_LENGTH).replace(/\s\S*$/, '');
  }

  // Build negative prompt — add human-specific negatives when character is visible
  const allNegatives = [...BASE_NEGATIVES, ...roleCine.negatives];
  if (shot.character_visible) {
    allNegatives.push(...HUMAN_NEGATIVES);
  }

  return {
    prompt,
    negative_prompt: allNegatives.join(', '),
  };
}

/**
 * Estimate total credits for the entire short film.
 */
export function estimateShortFilmCredits(
  shotCount: number,
  settings: ShortFilmSettings,
): number {
  const totalDuration = Math.min(shotCount * 3, 15);
  const videoCost = totalDuration <= 5 ? 10 : totalDuration <= 10 ? 18 : 25;

  // Use audioLayers if available, fall back to audioMode
  const layers = settings.audioLayers;
  let audioAdd = 0;
  if (layers) {
    if (layers.music) audioAdd += 8;
    if (layers.sfx) audioAdd += 4;
    if (layers.voiceover) audioAdd += 8;
  } else {
    audioAdd = settings.audioMode === 'ambient' ? 0
      : settings.audioMode === 'voiceover' ? 12
      : settings.audioMode === 'music' ? 8
      : settings.audioMode === 'full_mix' ? 16
      : 0;
  }

  return videoCost + audioAdd + 5;
}

/**
 * Calculate total film duration from actual shot durations, capped at 15s.
 */
export function calculateTotalDuration(
  shots: ShotPlanItem[],
): number {
  const safeShots = shots.slice(0, 6);
  const total = safeShots.reduce((sum, s) => sum + (s.duration_sec || 3), 0);
  return Math.min(Math.max(total, 3), 15);
}

/**
 * Distribute total duration across shots using their actual durations.
 * If total exceeds 15s, proportionally scale down.
 */
export function distributeShotDurations(
  shots: ShotPlanItem[],
): number[] {
  const safeShots = shots.slice(0, 6);
  const rawTotal = safeShots.reduce((sum, s) => sum + (s.duration_sec || 3), 0);
  
  if (rawTotal <= 15) {
    return safeShots.map(s => Math.max(1, s.duration_sec || 3));
  }
  
  const scale = 15 / rawTotal;
  const scaled = safeShots.map(s => Math.max(1, Math.round((s.duration_sec || 3) * scale)));
  
  let diff = 15 - scaled.reduce((a, b) => a + b, 0);
  for (let i = 0; diff !== 0 && i < scaled.length; i++) {
    const adj = diff > 0 ? 1 : -1;
    if (scaled[i] + adj >= 1) {
      scaled[i] += adj;
      diff -= adj;
    }
  }
  
  return scaled;
}
