import type { ShotPlanItem, ShortFilmSettings, FilmType } from '@/types/shortFilm';
import type { ReferenceAsset } from '@/components/app/video/short-film/ReferenceUploadPanel';

interface PromptContext {
  filmType: FilmType;
  tone: string;
  settings: ShortFilmSettings;
  references: ReferenceAsset[];
}

const TONE_MAP: Record<string, string> = {
  product_launch: 'sleek, premium, high-energy reveal',
  brand_story: 'emotional, authentic, narrative-driven',
  fashion_campaign: 'editorial, aspirational, high-fashion',
  beauty_film: 'luminous, close-up, skin-focused',
  luxury_mood: 'moody, rich tones, slow cinematic pacing',
  sports_campaign: 'dynamic, powerful, kinetic energy',
  lifestyle_teaser: 'warm, lifestyle, relatable',
  custom: 'cinematic, professional',
};

const ROLE_DIRECTIVES: Record<string, string> = {
  hook: 'This is the attention-grabbing opening shot. Start with visual intrigue.',
  reveal: 'Reveal the hero product or subject with dramatic emphasis.',
  detail: 'Close-up detail shot showcasing texture, craftsmanship, or key features.',
  closing: 'Final branding shot. Elegant conclusion with logo or tagline placement.',
  intro: 'Establishing shot setting the mood and context.',
  product: 'Hero product showcase — make it the undeniable star of the frame.',
  lifestyle: 'Show the product in a real-world context or lifestyle setting.',
  atmosphere: 'Pure mood and atmosphere — set the visual tone.',
  focus: 'Tight focus on the subject — shallow depth of field, precision framing.',
  human: 'Human element — model interaction, expression, or gesture.',
  finish: 'Wrap-up shot — satisfying visual conclusion.',
  tease: 'Teaser shot — hint at what\'s coming without full reveal.',
  build: 'Building momentum — escalating visual energy.',
  highlight: 'Spotlight moment — the peak visual highlight.',
  resolve: 'Resolution — bring the narrative to a calm, confident close.',
};

/**
 * Build a structured video prompt for a single shot in a short film.
 * When imageIndex is provided, embeds <<<image_N>>> Kling reference syntax.
 */
export function buildShotPrompt(
  shot: ShotPlanItem,
  context: PromptContext,
  imageIndex?: number,
): { prompt: string; negative_prompt: string } {
  const parts: string[] = [];

  // 1. Tone directive
  const tone = TONE_MAP[context.filmType] || context.tone || 'cinematic, professional';
  parts.push(`Cinematic ${tone} video.`);

  // 2. Image reference (for Kling Omni <<<image_N>>> syntax)
  if (typeof imageIndex === 'number' && imageIndex >= 1) {
    parts.push(`Feature the subject from <<<image_${imageIndex}>>>.`);
  }

  // 3. Role directive
  const roleDirective = ROLE_DIRECTIVES[shot.role] || `Shot role: ${shot.role}.`;
  parts.push(roleDirective);

  // 4. Purpose
  parts.push(shot.purpose);

  // 5. Scene type
  parts.push(`Scene type: ${shot.scene_type.replace(/_/g, ' ')}.`);

  // 6. Camera motion
  if (shot.camera_motion && shot.camera_motion !== 'static') {
    parts.push(`Camera motion: ${shot.camera_motion.replace(/_/g, ' ')}.`);
  }

  // 7. Subject motion
  if (shot.subject_motion) {
    parts.push(`Subject motion: ${shot.subject_motion.replace(/_/g, ' ')}.`);
  }

  // 8. Script line (if any)
  if (shot.script_line) {
    parts.push(`Visual matches: "${shot.script_line}".`);
  }

  // 9. Preservation strength
  if (shot.preservation_strength === 'high') {
    parts.push('Maintain strong visual consistency with reference images.');
  }

  // 10. Aspect ratio hint
  if (context.settings.aspectRatio === '9:16') {
    parts.push('Vertical format, optimized for mobile viewing.');
  } else if (context.settings.aspectRatio === '1:1') {
    parts.push('Square format, centered composition.');
  }

  // Build negative prompt
  const negatives = [
    'blurry', 'low quality', 'watermark', 'text overlay',
    'distorted faces', 'unrealistic proportions', 'overexposed',
  ];

  return {
    prompt: parts.join(' '),
    negative_prompt: negatives.join(', '),
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
  // Base cost: one combined video (duration-based)
  const totalDuration = calculateTotalDuration(shotCount, settings.shotDuration);
  const videoCost = totalDuration <= 5 ? 10 : totalDuration <= 10 ? 18 : 25;

  // Audio add-on (generated separately via ElevenLabs)
  const audioAdd = settings.audioMode === 'ambient' ? 0 // ambient is native Kling audio, no extra cost
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
