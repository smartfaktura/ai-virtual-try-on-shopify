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
 */
export function buildShotPrompt(
  shot: ShotPlanItem,
  context: PromptContext,
): { prompt: string; negative_prompt: string } {
  const parts: string[] = [];

  // 1. Tone directive
  const tone = TONE_MAP[context.filmType] || context.tone || 'cinematic, professional';
  parts.push(`Cinematic ${tone} video.`);

  // 2. Role directive
  const roleDirective = ROLE_DIRECTIVES[shot.role] || `Shot role: ${shot.role}.`;
  parts.push(roleDirective);

  // 3. Purpose
  parts.push(shot.purpose);

  // 4. Scene type
  parts.push(`Scene type: ${shot.scene_type.replace(/_/g, ' ')}.`);

  // 5. Camera motion
  if (shot.camera_motion && shot.camera_motion !== 'static') {
    parts.push(`Camera motion: ${shot.camera_motion.replace(/_/g, ' ')}.`);
  }

  // 6. Subject motion
  if (shot.subject_motion) {
    parts.push(`Subject motion: ${shot.subject_motion.replace(/_/g, ' ')}.`);
  }

  // 7. Script line (if any)
  if (shot.script_line) {
    parts.push(`Visual matches: "${shot.script_line}".`);
  }

  // 8. Preservation strength
  if (shot.preservation_strength === 'high') {
    parts.push('Maintain strong visual consistency with reference images.');
  }

  // 9. Aspect ratio hint
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
 */
export function estimateShortFilmCredits(
  shotCount: number,
  settings: ShortFilmSettings,
): number {
  const perShot = settings.shotDuration === '10' ? 18 : 10;
  const audioAdd = settings.audioMode === 'ambient' ? 4 : settings.audioMode === 'voice' ? 12 : 0;
  return (perShot + audioAdd) * shotCount + 5; // 5 = planning fee
}
