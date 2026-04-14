import type { ShotPlanItem, ShortFilmSettings, FilmType } from '@/types/shortFilm';
import type { ReferenceAsset } from '@/components/app/video/short-film/ReferenceUploadPanel';

interface PromptContext {
  filmType: FilmType;
  tone: string;
  settings: ShortFilmSettings;
  references: ReferenceAsset[];
}

/* ─── Cinematic tone presets per film type ─── */
const TONE_PRESETS: Record<string, string> = {
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
const ROLE_CINEMATICS: Record<string, {
  directive: string;
  lighting: string;
  lens: string;
  negatives: string[];
}> = {
  hook: {
    directive:
      'Dramatic opening shot. High visual intrigue. Silhouette-to-reveal transition with escalating energy.',
    lighting: 'High-contrast rim lighting, dramatic backlight, deep shadows with specular highlights.',
    lens: 'Wide anamorphic lens, shallow depth of field, cinematic letterbox framing.',
    negatives: ['static', 'flat lighting', 'boring composition'],
  },
  reveal: {
    directive:
      'Hero product reveal with dramatic emphasis. The subject emerges from shadow or motion blur into sharp focus.',
    lighting: 'Sculpted three-point lighting, key light at 45°, subtle fill, strong back-rim separation.',
    lens: 'Medium focal length, rack focus from background to subject, precision center framing.',
    negatives: ['premature reveal', 'cluttered frame', 'overlit'],
  },
  detail: {
    directive:
      'Extreme close-up detail shot. Showcase texture, craftsmanship, material quality.',
    lighting: 'Texture-revealing side light at 30°, soft fill opposite, micro-contrast enhancement.',
    lens: 'Macro lens, f/2.8 bokeh, ultra-shallow depth of field, rack focus across surface details.',
    negatives: ['wide shot', 'out of focus subject', 'flat angle'],
  },
  closing: {
    directive:
      'Elegant final shot. Confident conclusion with logo-safe composition. Satisfying visual resolution.',
    lighting: 'Soft wrap-around lighting, gentle gradient falloff, clean even illumination.',
    lens: 'Slow pull-back or static lock-off, centered composition, fade-ready framing.',
    negatives: ['abrupt ending', 'busy background', 'harsh shadows'],
  },
  intro: {
    directive:
      'Establishing shot setting mood and spatial context. Draw the viewer into the world.',
    lighting: 'Atmospheric environmental lighting, volumetric haze, motivated practical light sources.',
    lens: 'Wide angle establishing shot, deep depth of field, slow dolly or crane movement.',
    negatives: ['tight framing', 'unclear context', 'static'],
  },
  product: {
    directive:
      'Hero product showcase. The product is the undeniable star — pristine, elevated, magnetic.',
    lighting: 'Studio product lighting, soft overhead diffusion, subtle gradient background, clean reflections.',
    lens: 'Medium telephoto compression, floating product feel, smooth slow orbit or push.',
    negatives: ['distracting elements', 'poor product visibility', 'cluttered'],
  },
  lifestyle: {
    directive:
      'Product in real-world context. Natural human interaction, aspirational but believable setting.',
    lighting: 'Natural window light or golden hour, warm color temperature, organic soft shadows.',
    lens: 'Medium wide, shallow DOF isolating subject from environment, gentle handheld sway.',
    negatives: ['staged feeling', 'unnatural poses', 'studio look'],
  },
  atmosphere: {
    directive:
      'Pure mood and atmosphere. Abstract visual poetry — light, shadow, texture, movement.',
    lighting: 'Dramatic chiaroscuro or ethereal soft glow, volumetric light rays, lens flare accents.',
    lens: 'Experimental angles, anamorphic distortion, slow motion, dreamlike quality.',
    negatives: ['literal', 'explanatory', 'sharp hard edges'],
  },
  focus: {
    directive:
      'Tight focus on the subject. Precision framing, intentional negative space.',
    lighting: 'Spot lighting on subject, dark surround falloff, dramatic light-to-shadow ratio.',
    lens: 'Long telephoto, f/1.4 extreme bokeh, subject isolation, locked tripod.',
    negatives: ['wide framing', 'busy background', 'movement blur'],
  },
  human: {
    directive:
      'Human element — expression, gesture, interaction. Emotional connection with the viewer.',
    lighting: 'Beauty lighting, soft diffused key, eye-catch reflection, warm skin tones.',
    lens: 'Portrait focal length 85-135mm, shallow DOF, intimate distance.',
    negatives: ['distorted faces', 'unflattering angle', 'harsh shadows on face'],
  },
  finish: {
    directive:
      'Satisfying visual conclusion. Resolving energy, calm confident finish.',
    lighting: 'Soft even lighting, warm afterglow, gentle fade-down quality.',
    lens: 'Static or slow crane up, centered composition, clean negative space.',
    negatives: ['rushed', 'new information', 'jarring'],
  },
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
};

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

/**
 * Build a cinematic video prompt for a single shot in a short film.
 * Produces high-end cinematographic language optimized for Kling v3.
 */
export function buildShotPrompt(
  shot: ShotPlanItem,
  context: PromptContext,
  imageIndex?: number,
): { prompt: string; negative_prompt: string } {
  const parts: string[] = [];
  const roleCine = ROLE_CINEMATICS[shot.role] || DEFAULT_CINEMATIC;

  // 1. Cinematic header — film type tone
  const tonePreset = TONE_PRESETS[context.filmType] || context.tone || TONE_PRESETS.custom;
  parts.push(`Cinematic 4K ${tonePreset}.`);

  // 2. Image reference (Kling <<<image_N>>> syntax)
  if (typeof imageIndex === 'number' && imageIndex >= 1) {
    parts.push(`Feature the subject from <<<image_${imageIndex}>>> with photorealistic consistency.`);
  }

  // 3. Role-specific cinematographic directive
  parts.push(roleCine.directive);

  // 4. Purpose (user-defined shot intent)
  parts.push(shot.purpose);

  // 5. Lighting design
  parts.push(roleCine.lighting);

  // 6. Lens & camera
  parts.push(roleCine.lens);

  // 7. Camera motion (if not static)
  if (shot.camera_motion && shot.camera_motion !== 'static') {
    const motion = shot.camera_motion.replace(/_/g, ' ');
    parts.push(`Smooth ${motion} camera movement with professional stabilization.`);
  }

  // 8. Subject motion
  if (shot.subject_motion && shot.subject_motion !== 'none') {
    parts.push(`Subject motion: ${shot.subject_motion.replace(/_/g, ' ')}.`);
  }

  // 9. Script line visual match
  if (shot.script_line) {
    parts.push(`Visual matches: "${shot.script_line}".`);
  }

  // 10. Preservation / consistency
  if (shot.preservation_strength === 'high') {
    parts.push('Maintain strong visual consistency with reference images. Identical colors, textures, and proportions.');
  } else if (shot.preservation_strength === 'medium') {
    parts.push('Maintain visual consistency with reference styling and color palette.');
  }

  // 11. Aspect ratio composition hints
  if (context.settings.aspectRatio === '9:16') {
    parts.push('Vertical format, mobile-optimized composition, subject fills vertical frame.');
  } else if (context.settings.aspectRatio === '1:1') {
    parts.push('Square format, centered symmetrical composition.');
  } else if (context.settings.aspectRatio === '16:9') {
    parts.push('Widescreen cinematic format, horizontal composition with breathing room.');
  }

  // 12. Production quality footer
  parts.push('Professional color grading, rich dynamic range, film-grade production value.');

  // Build negative prompt — combine base + role-specific
  const allNegatives = [...BASE_NEGATIVES, ...roleCine.negatives];

  return {
    prompt: parts.join(' '),
    negative_prompt: allNegatives.join(', '),
  };
}

/**
 * Estimate total credits for the entire short film.
 * Multi-shot generates ONE combined video, so credit cost is based on total duration.
 */
export function estimateShortFilmCredits(
  shotCount: number,
  settings: ShortFilmSettings,
): number {
  const totalDuration = calculateTotalDuration(shotCount, settings.shotDuration);
  const videoCost = totalDuration <= 5 ? 10 : totalDuration <= 10 ? 18 : 25;

  const audioAdd = settings.audioMode === 'ambient' ? 0
    : settings.audioMode === 'voiceover' ? 12
    : settings.audioMode === 'music' ? 8
    : settings.audioMode === 'full_mix' ? 16
    : 0;

  return videoCost + audioAdd + 5; // 5 = planning fee
}

/**
 * Calculate total film duration, capped at 15s (Kling max for multi-shot).
 */
export function calculateTotalDuration(
  shotCount: number,
  shotDuration: '5' | '10',
): number {
  const perShot = Number(shotDuration);
  const raw = perShot * shotCount;
  return Math.min(raw, 15);
}

/**
 * Distribute total duration across shots, ensuring each is ≥ 1s and sum == total.
 */
export function distributeShotDurations(
  shotCount: number,
  totalDuration: number,
): number[] {
  if (shotCount <= 0) return [];
  const base = Math.floor(totalDuration / shotCount);
  const remainder = totalDuration - base * shotCount;

  return Array.from({ length: shotCount }, (_, i) =>
    Math.max(1, base + (i < remainder ? 1 : 0))
  );
}
