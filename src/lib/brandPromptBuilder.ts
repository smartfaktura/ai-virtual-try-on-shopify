/**
 * Shared Brand Prompt Builder
 *
 * Converts a brand profile into structured prompt text that can be used by:
 * 1. The wizard "Review" step to show what gets injected
 * 2. Each wizard step's "Prompt Impact" preview
 * 3. Edge functions to build the actual prompt
 */

export interface BrandProfileData {
  name: string;
  brand_description: string;
  tone: string;
  lighting_style: string;
  background_style: string;
  color_temperature: string;
  composition_bias: string;
  do_not_rules: string[];
  color_palette: string[];
  brand_keywords: string[];
  preferred_scenes: string[];
  target_audience: string;
  photography_reference: string;
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

// ── Step-level prompt impact previews ────────────────────────────────────

export function getIdentityImpact(data: Partial<BrandProfileData>): string {
  const parts: string[] = [];
  if (data.brand_description) parts.push(`Brand context: "${data.brand_description}"`);
  if (data.target_audience) parts.push(`Target audience: ${data.target_audience}`);
  return parts.length > 0
    ? parts.join('\n')
    : 'These anchor every prompt so the AI knows your brand\'s personality.';
}

export function getToneImpact(data: Partial<BrandProfileData>): string {
  const parts: string[] = [];
  if (data.tone) {
    const desc = TONE_DESCRIPTIONS[data.tone] || data.tone;
    parts.push(`Visual tone: ${desc}`);
  }
  if (data.brand_keywords && data.brand_keywords.length > 0) {
    parts.push(`Brand DNA: ${data.brand_keywords.join(', ')}`);
  }
  return parts.length > 0 ? parts.join('\n') : 'Select a tone to see prompt impact.';
}

export function getLightingImpact(data: Partial<BrandProfileData>): string {
  const parts: string[] = [];
  if (data.lighting_style) parts.push(`Lighting: ${data.lighting_style}`);
  if (data.color_temperature) parts.push(`Color temperature: ${data.color_temperature}`);
  if (data.color_palette && data.color_palette.length > 0) {
    parts.push(`Preferred palette: ${data.color_palette.join(', ')}`);
  }
  return parts.length > 0 ? parts.join('\n') : 'Configure lighting to see prompt impact.';
}

export function getCompositionImpact(data: Partial<BrandProfileData>): string {
  const parts: string[] = [];
  if (data.background_style) parts.push(`Background: ${data.background_style}`);
  if (data.composition_bias) parts.push(`Composition: ${data.composition_bias}`);
  if (data.preferred_scenes && data.preferred_scenes.length > 0) {
    parts.push(`Preferred environments: ${data.preferred_scenes.join(', ')}`);
  }
  return parts.length > 0 ? parts.join('\n') : 'Set composition to see prompt impact.';
}

export function getExclusionImpact(data: Partial<BrandProfileData>): string {
  const parts: string[] = [];
  if (data.do_not_rules && data.do_not_rules.length > 0) {
    parts.push(`Excluded: ${data.do_not_rules.join(', ')}`);
  }
  if (data.photography_reference) {
    parts.push(`Reference notes: "${data.photography_reference}"`);
  }
  return parts.length > 0
    ? parts.join('\n')
    : 'These are injected as negative prompts in every generation.';
}

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

  // 5. Lighting
  if (data.lighting_style) {
    guideParts.push(`Lighting: ${data.lighting_style}`);
  }

  // 6. Color temperature
  if (data.color_temperature) {
    guideParts.push(`Color temperature: ${data.color_temperature}`);
  }

  // 7. Color palette
  if (data.color_palette && data.color_palette.length > 0) {
    guideParts.push(`Preferred color palette: ${data.color_palette.join(', ')}`);
  }

  // 8. Background style
  if (data.background_style) {
    guideParts.push(`Background preference: ${data.background_style}`);
  }

  // 9. Composition
  if (data.composition_bias) {
    guideParts.push(`Composition: ${data.composition_bias}`);
  }

  // 10. Preferred scenes
  if (data.preferred_scenes && data.preferred_scenes.length > 0) {
    guideParts.push(`Preferred environments: ${data.preferred_scenes.join(', ')}`);
  }

  // 11. Photography reference
  if (data.photography_reference) {
    guideParts.push(`Creative direction: ${data.photography_reference}`);
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
  if (data.lighting_style) summaryParts.push(data.lighting_style);
  if (data.color_temperature) summaryParts.push(data.color_temperature);
  if (data.background_style) summaryParts.push(data.background_style);
  if (data.composition_bias) summaryParts.push(data.composition_bias);
  const summary = summaryParts.join(' · ');

  return { styleGuide, negatives, summary };
}
