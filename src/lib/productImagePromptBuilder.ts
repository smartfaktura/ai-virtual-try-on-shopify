import type { ProductImageScene, DetailSettings, ProductAnalysis } from '@/components/app/product-images/types';

// ── Lighting sentence map ──
const LIGHTING_MAP: Record<string, string> = {
  'soft-studio': 'Soft diffused studio lighting with even fill and no harsh shadows.',
  'directional-side': 'Directional side lighting creating gentle gradients, dramatic highlights, and controlled shadows.',
  'natural-window': 'Natural window light casting soft, warm, organic shadows with gentle falloff.',
  'dramatic-high-contrast': 'High-contrast dramatic lighting with deep blacks and crisp specular highlights.',
  'golden-hour': 'Warm golden-hour lighting with rich amber tones and long, elegant shadows.',
  'flat-commercial': 'Flat, even commercial lighting with minimal shadows for clean packshot clarity.',
  'rim-backlit': 'Rim lighting and backlighting creating a luminous product silhouette with a subtle halo.',
  'overhead-beauty': 'Overhead beauty lighting with a soft, even glow and minimal under-shadows.',
};

// ── Shadow sentence map ──
const SHADOW_MAP: Record<string, string> = {
  'natural': 'Product grounded with a soft, natural contact shadow.',
  'none': 'No visible shadows — pure floating product on seamless background.',
  'minimal': 'Product grounded with a barely-visible subtle shadow.',
  'dramatic': 'Product anchored with a strong, dramatic cast shadow adding depth.',
  'soft-diffused': 'Gentle diffused shadow beneath the product for a refined, airy feel.',
};

// ── Background sentence map ──
const BG_MAP: Record<string, string> = {
  'pure-white': 'pure seamless white (#FFFFFF)',
  'warm-beige': 'warm beige / cream',
  'light-gray': 'soft neutral light gray',
  'cool-gray': 'cool mid-gray',
  'off-white': 'off-white / ivory',
  'black': 'deep matte black',
  'gradient': 'subtle gradient',
  'colored': 'solid colored',
};

// ── Consistency sentence map ──
const CONSISTENCY_MAP: Record<string, string> = {
  'high': 'Maintain strong visual consistency with other shots in this series — same lighting direction, color temperature, and style language.',
  'balanced': 'Maintain balanced visual consistency with the series while allowing natural scene variation.',
  'loose': 'Allow creative variation while keeping the product recognizable.',
};

// ── Category-aware defaults ──
function defaultLighting(category?: string): string {
  switch (category) {
    case 'fragrance': return 'Soft directional side lighting with gentle glass refraction highlights.';
    case 'beauty-skincare':
    case 'makeup-lipsticks': return 'Soft overhead beauty lighting with even glow and subtle specular accents.';
    case 'tech-devices': return 'Crisp controlled studio lighting with clean specular reflections.';
    case 'food-beverage': return 'Warm natural diffused lighting with appetite-enhancing warmth.';
    case 'garments': return 'Even soft studio lighting revealing fabric texture and true color.';
    case 'bags-accessories':
    case 'shoes': return 'Controlled directional lighting revealing leather grain and material depth.';
    case 'home-decor': return 'Warm ambient interior lighting with natural window-light feel.';
    default: return 'Professional studio lighting with soft fill and controlled highlights.';
  }
}

function defaultMaterial(materialFamily?: string, finish?: string): string {
  if (materialFamily && finish) return `visible ${materialFamily} texture, ${finish} finish`;
  if (materialFamily) return `visible ${materialFamily} texture and surface detail`;
  return 'sharp surface texture and material detail';
}

// ── Person directive builder ──
function buildPersonDirective(d: DetailSettings): string {
  const parts: string[] = [];
  if (d.presentation) parts.push(`${d.presentation} presentation`);
  if (d.ageRange) parts.push(`age ${d.ageRange}`);
  if (d.skinTone) parts.push(`${d.skinTone} skin tone`);
  if (d.expression) parts.push(`${d.expression} expression`);
  if (d.hairVisibility) parts.push(`${d.hairVisibility} hair visibility`);
  if (d.cropType) parts.push(`${d.cropType} crop`);
  if (parts.length === 0) return '';
  return `Model: ${parts.join(', ')}. Hyper-realistic skin texture with visible pores and natural anatomy.`;
}

function buildHandDirective(d: DetailSettings): string {
  const parts: string[] = [];
  if (d.handStyle) parts.push(d.handStyle);
  if (d.nails) parts.push(`${d.nails} nails`);
  if (d.jewelryVisible) parts.push(`jewelry ${d.jewelryVisible}`);
  if (parts.length === 0) return 'realistic human hand with natural skin texture and visible pores';
  return parts.join(', ');
}

function buildOutfitDirective(d: DetailSettings): string {
  // outfitStyle and outfitColorDirection are in refine person fields
  const style = (d as any).outfitStyle;
  const color = (d as any).outfitColorDirection;
  if (!style && !color) return '';
  const s = style ? `Wearing ${style} outfit` : 'Outfit';
  const c = color ? ` in ${color} tones` : '';
  return `${s}${c}.`;
}

// ── Packaging directive builder ──
function buildPackagingDirective(d: DetailSettings): string {
  const parts: string[] = [];
  if (d.packagingType) parts.push(d.packagingType);
  if (d.packagingState) parts.push(d.packagingState);
  if (d.packagingComposition) parts.push(d.packagingComposition);
  if (d.packagingFocus) parts.push(`focus on ${d.packagingFocus}`);
  if (parts.length === 0) return 'Product shown alongside its packaging.';
  return `Packaging: ${parts.join(', ')}.`;
}

// ── Token resolution ──
interface TokenContext {
  productName: string;
  productType: string;
  analysis: ProductAnalysis | null;
  details: DetailSettings;
  selectedModelId?: string;
}

function resolveToken(token: string, ctx: TokenContext): string {
  const { productName, productType, analysis, details } = ctx;
  const cat = analysis?.category;

  switch (token) {
    case 'productName': return productName;
    case 'productType': return productType || cat || 'product';
    case 'background': return BG_MAP[details.backgroundTone || ''] || details.backgroundTone || 'clean neutral';
    case 'lightingDirective': return LIGHTING_MAP[details.lightingStyle || ''] || details.lightingStyle || defaultLighting(cat);
    case 'shadowDirective': return SHADOW_MAP[details.shadowStyle || ''] || details.shadowStyle || 'Product grounded with a soft, natural contact shadow.';
    case 'materialTexture': return defaultMaterial(analysis?.materialFamily, analysis?.finish);
    case 'surfaceDirective': return details.surfaceType ? `placed on ${details.surfaceType} surface` : 'on a premium styled surface';
    case 'personDirective': return buildPersonDirective(details);
    case 'handStyle': return buildHandDirective(details);
    case 'nailDirective': return details.nails ? `${details.nails} nails with clean manicure` : 'natural clean nails';
    case 'outfitDirective': return buildOutfitDirective(details);
    case 'focusArea': return details.focusArea || 'key product construction details';
    case 'accentDirective': return (details as any).accentColor ? `Accent tones: ${(details as any).accentColor}.` : '';
    case 'consistencyDirective': return CONSISTENCY_MAP[details.consistency || ''] || '';
    case 'productSize': return analysis?.sizeClass || 'medium';
    case 'colorFamily': return analysis?.colorFamily || 'neutral tones';
    case 'stylingDirective': return (details as any).stylingDirection ? `${(details as any).stylingDirection} styling direction.` : '';
    case 'moodDirective': return details.mood ? `${details.mood} mood and atmosphere.` : '';
    case 'environmentDirective': return details.environmentType ? `Set in a ${details.environmentType} environment.` : '';
    case 'brandingDirective': return details.brandingVisibility ? `Branding: ${details.brandingVisibility}.` : '';
    case 'customNote': return details.customNote || '';
    case 'modelDirective': return ctx.selectedModelId ? 'Use the specific model reference provided in the source image.' : '';
    case 'packagingDirective': return buildPackagingDirective(details);
    case 'cropDirective': return details.cropIntensity ? `Crop intensity: ${details.cropIntensity}.` : '';
    case 'actionDirective': {
      const parts: string[] = [];
      if (details.actionType) parts.push(details.actionType);
      if (details.actionIntensity) parts.push(`intensity: ${details.actionIntensity}`);
      return parts.length ? `Action: ${parts.join(', ')}.` : '';
    }
    case 'compositionDirective': return details.compositionFraming ? `Composition: ${details.compositionFraming}.` : '';
    case 'negativeSpaceDirective': return details.negativeSpace ? `Negative space: ${details.negativeSpace}.` : '';
    case 'productProminenceDirective': return details.productProminence ? `Product prominence: ${details.productProminence}.` : '';
    case 'sceneIntensityDirective': return details.sceneIntensity ? `Scene intensity: ${details.sceneIntensity}.` : '';
    default: return '';
  }
}

const QUALITY_SUFFIX = 'Professional product photography, ultra-sharp focus, hyper-realistic textures and materials, 8K commercial quality, photorealistic rendering.';

export function buildDynamicPrompt(
  scene: ProductImageScene,
  product: { title: string; product_type?: string; description?: string; dimensions?: string | null },
  analysis: ProductAnalysis | null,
  details: DetailSettings,
): string {
  const template = scene.promptTemplate;

  const ctx: TokenContext = {
    productName: product.title,
    productType: product.product_type || analysis?.category || '',
    analysis,
    details,
    selectedModelId: details.selectedModelId,
  };

  if (!template) {
    // Fallback: old-style concatenation but enriched
    const parts: string[] = [scene.description];
    parts.push(`Product: ${product.title}.`);
    if (analysis?.materialFamily) parts.push(`Material: ${defaultMaterial(analysis.materialFamily, analysis.finish)}.`);
    if (details.backgroundTone) parts.push(`Background: ${resolveToken('background', ctx)}.`);
    if (details.lightingStyle) parts.push(resolveToken('lightingDirective', ctx));
    if (details.mood) parts.push(resolveToken('moodDirective', ctx));
    if (details.environmentType) parts.push(resolveToken('environmentDirective', ctx));
    if (details.surfaceType) parts.push(resolveToken('surfaceDirective', ctx) + '.');
    if (details.presentation) parts.push(resolveToken('personDirective', ctx));
    if (details.focusArea) parts.push(`Focus: ${details.focusArea}.`);
    if (details.customNote) parts.push(details.customNote);
    parts.push(QUALITY_SUFFIX);
    return parts.filter(Boolean).join(' ');
  }

  // Resolve all {{token}} placeholders
  let prompt = template.replace(/\{\{(\w+)\}\}/g, (_, token) => resolveToken(token, ctx));

  // Clean up: remove double spaces, empty sentences, etc.
  prompt = prompt.replace(/\.\s*\./g, '.').replace(/\s{2,}/g, ' ').trim();

  // Append quality suffix if not already present
  if (!prompt.includes('8K commercial quality')) {
    prompt += ' ' + QUALITY_SUFFIX;
  }

  // Append custom note at the end
  if (details.customNote && !prompt.includes(details.customNote)) {
    prompt += ' ' + details.customNote;
  }

  return prompt;
}
