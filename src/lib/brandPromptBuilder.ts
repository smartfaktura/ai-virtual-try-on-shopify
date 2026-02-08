/**
 * Shared Brand Prompt Builder
 *
 * Converts a brand profile into structured prompt text that can be used by:
 * 1. The wizard "What the AI will see" preview
 * 2. Edge functions to build the actual prompt
 */

export interface BrandProfileData {
  name: string;
  brand_description: string;
  tone: string;
  color_temperature: string; // now stores Color Feel value
  color_palette: string[];
  brand_keywords: string[];
  do_not_rules: string[];
  target_audience: string;
  // Legacy fields (kept for backward compat, no longer collected)
  lighting_style?: string;
  background_style?: string;
  composition_bias?: string;
  preferred_scenes?: string[];
  photography_reference?: string;
}

export interface BrandPromptOutput {
  /** Full style guide block injected into the AI prompt */
  styleGuide: string;
  /** All negative / do-not rules merged */
  negatives: string[];
  /** Human-readable summary for UI display */
  summary: string;
}

// ── Tone descriptions used in prompts ────────────────────────────────────
export const TONE_DESCRIPTIONS: Record<string, string> = {
  luxury: 'premium, sophisticated, elegant with refined details',
  clean: 'minimalist, uncluttered, modern and professional',
  bold: 'striking, high-contrast, attention-grabbing',
  minimal: 'extremely simple, lots of negative space, zen-like',
  playful: 'vibrant, energetic, fun with dynamic composition',
};

// ── Color Feel descriptions ─────────────────────────────────────────────
export const COLOR_FEEL_DESCRIPTIONS: Record<string, string> = {
  'warm-earthy': 'warm earth tones, natural warmth, amber and terracotta accents',
  'cool-crisp': 'cool tones, clean whites, blue and silver undertones',
  'neutral-natural': 'true-to-life colors, balanced exposure, no heavy grading',
  'rich-saturated': 'deep saturated colors, bold and vivid palette, high color impact',
  'muted-soft': 'desaturated pastels, soft muted tones, dreamy and gentle palette',
  'vibrant-bold': 'high energy colors, bright and punchy, strong contrast',
  'monochrome': 'black, white, and grayscale tones, achromatic, high contrast',
  'pastel-dreamy': 'soft pastel tones, lavender, baby pink, baby blue, light and airy',
};

// ── Color Feel friendly labels ──────────────────────────────────────────
export const COLOR_FEEL_LABELS: Record<string, string> = {
  'warm-earthy': 'Warm & Earthy',
  'cool-crisp': 'Cool & Crisp',
  'neutral-natural': 'Neutral & Natural',
  'rich-saturated': 'Rich & Saturated',
  'muted-soft': 'Muted & Soft',
  'vibrant-bold': 'Vibrant & Bold',
  'monochrome': 'Monochrome',
  'pastel-dreamy': 'Pastel & Dreamy',
};

// ── Full prompt builder ──────────────────────────────────────────────────

export function buildBrandPrompt(data: Partial<BrandProfileData>): BrandPromptOutput {
  const guideParts: string[] = [];

  // 1. Tone
  if (data.tone) {
    const desc = TONE_DESCRIPTIONS[data.tone] || data.tone;
    guideParts.push(`Visual tone: ${desc}`);
  }

  // 2. Brand description
  if (data.brand_description) {
    guideParts.push(`Brand identity: ${data.brand_description}`);
  }

  // 3. Target audience
  if (data.target_audience) {
    guideParts.push(`Target audience: ${data.target_audience}`);
  }

  // 4. Brand keywords
  if (data.brand_keywords && data.brand_keywords.length > 0) {
    guideParts.push(`Brand DNA keywords: ${data.brand_keywords.join(', ')}`);
  }

  // 5. Color Feel (replaces old color_temperature, lighting, background)
  if (data.color_temperature) {
    const colorDesc = COLOR_FEEL_DESCRIPTIONS[data.color_temperature] || data.color_temperature;
    guideParts.push(`Color direction: ${colorDesc}`);
  }

  // 6. Brand accent colors
  if (data.color_palette && data.color_palette.length > 0) {
    guideParts.push(`Brand accent colors: ${data.color_palette.join(', ')}`);
  }

  const styleGuide =
    guideParts.length > 0
      ? `BRAND STYLE GUIDE:\n${guideParts.join('.\n')}.`
      : '';

  // Negatives
  const negatives = data.do_not_rules && data.do_not_rules.length > 0 ? [...data.do_not_rules] : [];

  // Human-readable summary
  const summaryParts: string[] = [];
  if (data.tone) summaryParts.push(data.tone);
  if (data.color_temperature) {
    summaryParts.push(COLOR_FEEL_LABELS[data.color_temperature] || data.color_temperature);
  }
  const summary = summaryParts.join(' · ');

  return { styleGuide, negatives, summary };
}
