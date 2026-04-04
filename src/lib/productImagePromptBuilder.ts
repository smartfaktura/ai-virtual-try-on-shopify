import type { ProductImageScene, DetailSettings, ProductAnalysis } from '@/components/app/product-images/types';

// ── Utility: treat "auto", empty, and undefined as unset ──
function isAuto(val?: string): boolean {
  return !val || val === 'auto';
}

// ── Lighting sentence map (keys aligned to Refine UI chip values) ──
const LIGHTING_MAP: Record<string, string> = {
  // UI chip values (primary)
  'soft-diffused': 'Soft diffused studio lighting with even fill and no harsh shadows.',
  'warm-editorial': 'Warm editorial lighting with rich amber undertones and controlled directional highlights.',
  'crisp-studio': 'Crisp controlled studio lighting with clean specular reflections and sharp product definition.',
  'natural-daylight': 'Natural daylight with soft, warm, organic shadows and gentle falloff.',
  'side-lit': 'Directional side lighting creating gentle gradients, dramatic highlights, and controlled shadows.',
  // Legacy keys (backward compat)
  'soft-studio': 'Soft diffused studio lighting with even fill and no harsh shadows.',
  'directional-side': 'Directional side lighting creating gentle gradients, dramatic highlights, and controlled shadows.',
  'natural-window': 'Natural window light casting soft, warm, organic shadows with gentle falloff.',
  'dramatic-high-contrast': 'High-contrast dramatic lighting with deep blacks and crisp specular highlights.',
  'golden-hour': 'Warm golden-hour lighting with rich amber tones and long, elegant shadows.',
  'flat-commercial': 'Flat, even commercial lighting with minimal shadows for clean packshot clarity.',
  'rim-backlit': 'Rim lighting and backlighting creating a luminous product silhouette with a subtle halo.',
  'overhead-beauty': 'Overhead beauty lighting with a soft, even glow and minimal under-shadows.',
  // Scene-specific chip values
  'natural': 'Natural ambient lighting with organic warmth and gentle shadow transitions.',
  'studio': 'Professional controlled studio lighting with clean, even illumination.',
  'dramatic': 'Dramatic high-contrast lighting with deep shadows and bold highlights.',
};

// ── Shadow sentence map (keys aligned to Refine UI chip values) ──
const SHADOW_MAP: Record<string, string> = {
  'natural': 'Product grounded with a soft, natural contact shadow.',
  'none': 'No visible shadows — pure floating product on seamless background.',
  'soft': 'Gentle diffused shadow beneath the product for a refined, airy feel.',
  'defined': 'Product anchored with a crisp, well-defined cast shadow adding depth and dimension.',
  // Legacy keys
  'minimal': 'Product grounded with a barely-visible subtle shadow.',
  'dramatic': 'Product anchored with a strong, dramatic cast shadow adding depth.',
  'soft-diffused': 'Gentle diffused shadow beneath the product for a refined, airy feel.',
};

// ── Background sentence map ──
const BG_MAP: Record<string, string> = {
  'pure-white': 'pure seamless white (#FFFFFF)',
  'warm-beige': 'warm beige / cream',
  'light-gray': 'soft neutral light gray',
  'light-grey': 'soft neutral light gray',
  'soft-white': 'soft warm white',
  'cool-gray': 'cool mid-gray',
  'off-white': 'off-white / ivory',
  'black': 'deep matte black',
  'gradient': 'subtle gradient',
  'colored': 'solid colored',
  'taupe': 'warm taupe',
  'stone': 'natural stone gray',
};

// ── Color world map (stored in backgroundTone) ──
const COLOR_WORLD_MAP: Record<string, string> = {
  'warm-neutral': 'warm neutral color palette with creamy beige and soft ivory tones',
  'cool-neutral': 'cool neutral color palette with soft gray and blue-white undertones',
  'monochrome': 'monochromatic color palette — single hue family with tonal variation',
  'brand-led': 'color palette guided by the brand identity colors',
};

// ── Surface type map ──
const SURFACE_MAP: Record<string, string> = {
  'minimal-studio': 'placed on a clean, minimal studio surface with seamless backdrop',
  'stone-plaster': 'placed on a natural stone or raw plaster surface with subtle mineral texture',
  'warm-wood': 'placed on a warm, natural wood surface with visible grain pattern',
  'fabric': 'placed on a premium draped fabric surface with soft folds and texture',
  'glossy': 'placed on a glossy reflective surface creating mirror-like product reflections',
  'concrete': 'placed on a raw concrete surface with industrial texture',
  'marble': 'placed on polished marble with natural veining and luxurious feel',
  'terrazzo': 'placed on a terrazzo surface with colorful aggregate chips',
  // Scene-specific chip values
  'wood': 'placed on a natural wood surface with visible grain and organic warmth',
  'glass': 'placed on a transparent glass surface with subtle reflections and clean edges',
};

// ── Consistency sentence map ──
const CONSISTENCY_MAP: Record<string, string> = {
  'high': 'Maintain strong visual consistency with other shots in this series — same lighting direction, color temperature, and style language.',
  'balanced': 'Maintain balanced visual consistency with the series while allowing natural scene variation.',
  'loose': 'Allow creative variation while keeping the product recognizable.',
  // Scene-specific chip values
  'natural': 'Maintain natural visual flow across the series — same general tone with organic variation.',
  'strong': 'Maintain strong visual consistency with other shots — same lighting direction, color temperature, and style.',
  'strict': 'Maintain strict visual consistency — identical lighting, identical background, identical framing across all shots.',
};

// ── Hand style lookup (keys aligned to Refine UI chip values) ──
const HAND_STYLE_MAP: Record<string, string> = {
  'clean-studio': 'clean, well-groomed studio hand with smooth skin and elegant presentation',
  'natural-lifestyle': 'natural, casual hand with realistic skin texture and relaxed grip',
  'polished-beauty': 'elegant, well-groomed beauty hand with smooth skin and polished appearance',
  // Legacy keys
  'natural-casual': 'natural, casual hand with realistic skin texture and relaxed grip',
  'masculine-rugged': 'strong masculine hand with natural skin texture and confident grip',
  'manicured-luxury': 'immaculately manicured luxury hand with flawless skin and refined elegance',
  'editorial-minimal': 'minimal editorial hand with clean lines and understated elegance',
  'artistic-expressive': 'artistic, expressive hand with character and natural imperfections',
};

// ── Nail style lookup (keys aligned to Refine UI chip values) ──
const NAIL_MAP: Record<string, string> = {
  'natural': 'clean, natural nails with neat cuticles and healthy sheen',
  'polished': 'professional polished nails with glossy, chip-free finish',
  'minimal': 'bare, minimal nails with clean, trimmed appearance',
  // Legacy keys
  'natural-clean': 'clean, natural nails with neat cuticles and healthy sheen',
  'gel-polish': 'professional gel-polished nails with glossy, chip-free finish',
  'matte-polish': 'sophisticated matte-polished nails with velvety finish',
  'french-tip': 'classic French-tip manicure with precise white tips',
  'nude-neutral': 'subtle nude-tone polished nails blending naturally with skin',
  'bold-color': 'bold, statement-color nails adding visual contrast',
  'bare-minimal': 'bare, unpolished nails with clean, trimmed appearance',
};

// ── Camera directive by scene type ──
const CAMERA_MAP: Record<string, string> = {
  'macro': 'Shot with 100mm macro lens at f/2.8, extremely shallow depth of field isolating fine details.',
  'packshot': 'Shot with 50mm lens at f/8 for minimal distortion, edge-to-edge sharpness across the product.',
  'portrait': 'Shot with 85mm portrait lens at f/2, creamy bokeh background, flattering perspective.',
  'lifestyle': 'Shot with 35mm lens at f/4, natural perspective with environmental context in soft focus.',
  'editorial': 'Shot with 50mm lens at f/2.8, cinematic depth of field with intentional focal plane.',
  'flatlay': 'Shot from directly overhead with 35mm lens at f/5.6, even sharpness across the flat surface.',
};

// ── Focus area defaults by scene type ──
const FOCUS_AREA_DEFAULTS: Record<string, string> = {
  'macro': 'fine construction details, material joints, and surface micro-texture',
  'packshot': 'overall product form, label clarity, and finish quality',
  'portrait': 'product placement and model interaction point',
  'lifestyle': 'product in its natural context with surrounding detail',
  'editorial': 'compositional hero element and textural contrast',
  'flatlay': 'arrangement geometry and individual item details',
  'formula': 'viscosity, translucency, bubble structure, and sheen',
  'hardware': 'clasp mechanism, zipper teeth, hinge, and metal finish',
  'label': 'printed text legibility, embossing, foil detail, and material texture',
  'sole': 'tread pattern, sole construction, material joints, and brand markings',
  'fabric': 'weave structure, thread count, seam construction, and fiber detail',
  'dose': 'granule texture, capsule seam, powder consistency, and serving format',
};

// ── Material keyword extraction from description ──
const MATERIAL_KEYWORDS: Record<string, string> = {
  'leather': 'visible leather grain, natural hide texture, and edge finishing',
  'glass': 'transparent glass clarity with refraction, surface reflections, and edge thickness',
  'metal': 'metallic surface with brushed or polished finish, visible machining detail',
  'aluminum': 'anodized aluminum surface with precise machining and controlled reflections',
  'ceramic': 'ceramic glaze with depth, subtle surface variation, and fired finish',
  'wood': 'natural wood grain pattern, growth rings, and organic surface variation',
  'plastic': 'molded plastic surface with clean parting lines and controlled sheen',
  'fabric': 'woven fabric texture with visible thread structure and natural drape',
  'suede': 'soft suede nap with directional pile and velvety surface texture',
  'silk': 'luxurious silk with natural sheen, fluid drape, and light-catching surface',
  'cotton': 'natural cotton weave with soft texture and breathable appearance',
  'rubber': 'matte rubber surface with grip texture and flexible material character',
  'stone': 'natural stone surface with mineral veining and organic texture',
  'marble': 'polished marble with natural veining, translucency, and smooth finish',
  'velvet': 'plush velvet pile with rich depth and light-absorbing texture',
  'canvas': 'sturdy canvas weave with visible thread structure and durable finish',
  'porcelain': 'refined porcelain with smooth glaze, translucent edges, and precise form',
  'titanium': 'lightweight titanium with brushed finish and aerospace-grade precision',
  'gold': 'gold surface with warm reflections and luxurious metallic depth',
  'silver': 'silver surface with cool reflections and polished brilliance',
};

// ── Styling direction map (stored in details.mood by the UI) ──
const STYLING_DIRECTION_MAP: Record<string, string> = {
  'minimal-luxury': 'Minimal luxury styling — clean, restrained composition with premium, intentional details.',
  'editorial-bold': 'Bold editorial styling — dramatic composition with high-fashion visual tension.',
  'organic-natural': 'Organic natural styling — relaxed, effortless composition with earthy, authentic feel.',
  'playful-vibrant': 'Playful vibrant styling — energetic composition with bold colors and dynamic arrangement.',
  'classic-timeless': 'Classic timeless styling — traditional, refined composition with enduring elegance.',
  'clean-commercial': 'Clean commercial styling — crisp, professional composition optimized for product clarity and conversion.',
  'fashion-editorial': 'Fashion editorial styling — elevated, magazine-quality composition with aspirational visual storytelling.',
  'beauty-clean': 'Beauty-clean styling — luminous, minimal composition with soft tones and premium product focus.',
  'modern-sleek': 'Modern sleek styling — contemporary, geometric composition with sharp lines and refined minimalism.',
};

// ── Negative prompt components ──
const BASE_NEGATIVES = 'No watermarks, no text overlays, no chromatic aberration, no lens flare artifacts, no color banding, no over-saturation.';
const PERSON_NEGATIVES = 'No extra fingers, no distorted joints, no unnatural hand anatomy, no missing limbs, no fused fingers, no deformed nails, correct human proportions.';
const PRODUCT_NEGATIVES = 'No warped product edges, no melted or distorted labels, no duplicated products, no floating elements.';

// ── Category-aware defaults ──

function defaultBackground(category?: string): string {
  switch (category) {
    case 'garments':
    case 'shoes':
    case 'bags-accessories':
      return 'soft warm white seamless studio background';
    case 'fragrance':
    case 'beauty-skincare':
    case 'makeup-lipsticks':
      return 'soft neutral light gray seamless background';
    case 'tech-devices':
      return 'clean matte white seamless background';
    case 'food-beverage':
      return 'warm off-white background with natural warmth';
    case 'home-decor':
      return 'soft white studio background';
    default:
      return 'soft warm white seamless studio background';
  }
}

function defaultSurface(category?: string): string {
  switch (category) {
    case 'food-beverage':
      return 'placed on a warm, natural wood surface with visible grain';
    case 'home-decor':
      return 'placed on a premium styled surface with complementary texture';
    default:
      return 'placed on a clean, minimal studio surface with seamless backdrop';
  }
}

function defaultShadow(category?: string): string {
  switch (category) {
    case 'garments':
    case 'shoes':
    case 'bags-accessories':
      return 'Soft diffused shadow beneath the product for a refined, airy feel.';
    case 'fragrance':
    case 'beauty-skincare':
    case 'makeup-lipsticks':
      return 'Barely-visible contact shadow for floating elegance.';
    case 'tech-devices':
      return 'Crisp, well-defined shadow adding depth and dimension.';
    default:
      return 'Soft, natural contact shadow grounding the product.';
  }
}

function defaultStyling(category?: string): string {
  switch (category) {
    case 'garments':
      return 'Clean commercial styling — crisp, professional composition.';
    case 'fragrance':
    case 'beauty-skincare':
    case 'makeup-lipsticks':
      return 'Beauty-clean styling — luminous, minimal composition with premium product focus.';
    case 'shoes':
    case 'bags-accessories':
      return 'Minimal luxury styling — clean, restrained, premium composition.';
    case 'tech-devices':
      return 'Modern sleek styling — contemporary, geometric, sharp composition.';
    case 'food-beverage':
      return 'Organic natural styling — relaxed, authentic composition.';
    default:
      return 'Clean commercial styling — crisp, professional composition.';
  }
}

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

function extractMaterialFromDescription(description?: string): string | null {
  if (!description) return null;
  const lower = description.toLowerCase();
  for (const [keyword, phrase] of Object.entries(MATERIAL_KEYWORDS)) {
    if (lower.includes(keyword)) return phrase;
  }
  return null;
}

function defaultMaterial(materialFamily?: string, finish?: string, productDescription?: string): string {
  if (materialFamily && finish) return `visible ${materialFamily} texture, ${finish} finish`;
  if (materialFamily) return `visible ${materialFamily} texture and surface detail`;
  const extracted = extractMaterialFromDescription(productDescription);
  if (extracted) return extracted;
  return 'crisp surface detail with visible material grain, finish quality, and micro-texture';
}

// ── Person directive builder (skips auto values) ──
function buildPersonDirective(d: DetailSettings): string {
  const parts: string[] = [];
  if (!isAuto(d.presentation)) parts.push(`${d.presentation} presentation`);
  if (!isAuto(d.ageRange)) parts.push(`age ${d.ageRange}`);
  if (!isAuto(d.skinTone)) parts.push(`${d.skinTone} skin tone`);
  if (!isAuto(d.expression)) parts.push(`${d.expression} expression`);
  if (!isAuto(d.hairVisibility)) parts.push(`${d.hairVisibility} hair visibility`);
  if (!isAuto(d.cropType)) parts.push(`${d.cropType} crop`);
  if (parts.length === 0) return '';

  let directive = `Model: ${parts.join(', ')}.`;

  // Append outfit if present
  const outfitStr = buildOutfitDirective(d);
  if (outfitStr) directive += ` ${outfitStr}`;

  // Append model reference if present
  if (d.selectedModelId) directive += ' Use the specific model reference provided in the source image.';

  directive += ' Hyper-realistic skin texture with visible pores, natural anatomy, and correct proportions.';
  return directive;
}

function resolveHandStyle(raw?: string): string {
  if (isAuto(raw)) return 'realistic human hand with natural skin texture and visible pores';
  return HAND_STYLE_MAP[raw!] || raw!.replace(/-/g, ' ');
}

function resolveNailStyle(raw?: string): string {
  if (isAuto(raw)) return 'natural, clean nails with neat cuticles';
  return NAIL_MAP[raw!] || `${raw!.replace(/-/g, ' ')} nails with clean manicure`;
}

function buildHandDirective(d: DetailSettings): string {
  const parts: string[] = [];
  parts.push(resolveHandStyle(d.handStyle));
  if (!isAuto(d.nails)) parts.push(resolveNailStyle(d.nails));
  if (!isAuto(d.jewelryVisible)) parts.push(`jewelry ${d.jewelryVisible}`);
  return parts.join(', ');
}

function buildOutfitDirective(d: DetailSettings): string {
  const style = isAuto(d.outfitStyle) ? undefined : d.outfitStyle;
  const color = isAuto(d.outfitColorDirection) ? undefined : d.outfitColorDirection;
  if (!style && !color) return '';
  const s = style ? `Wearing ${style.replace(/-/g, ' ')} outfit` : 'Outfit';
  const c = color ? ` in ${color.replace(/-/g, ' ')} tones` : '';
  return `${s}${c}.`;
}

// ── Packaging directive builder ──
function buildPackagingDirective(d: DetailSettings): string {
  const parts: string[] = [];
  if (!isAuto(d.packagingType)) parts.push(d.packagingType!);
  if (!isAuto(d.packagingState)) parts.push(d.packagingState!);
  if (!isAuto(d.packagingComposition)) parts.push(d.packagingComposition!);
  if (!isAuto(d.packagingFocus)) parts.push(`focus on ${d.packagingFocus}`);
  if (parts.length === 0) return 'Product shown alongside its packaging.';
  return `Packaging: ${parts.join(', ')}.`;
}

// ── Camera directive resolver ──
function resolveCameraDirective(scene: ProductImageScene): string {
  const st = scene.sceneType;
  if (st && CAMERA_MAP[st]) return CAMERA_MAP[st];

  // Infer from trigger blocks
  const triggers = scene.triggerBlocks;
  if (triggers.includes('detailFocus')) return CAMERA_MAP['macro'];
  if (triggers.includes('personDetails') && !triggers.includes('sceneEnvironment')) return CAMERA_MAP['portrait'];
  if (triggers.includes('sceneEnvironment') && triggers.includes('personDetails')) return CAMERA_MAP['lifestyle'];
  if (triggers.includes('sceneEnvironment')) return CAMERA_MAP['lifestyle'];
  if (triggers.includes('visualDirection')) return CAMERA_MAP['editorial'];

  return CAMERA_MAP['packshot'];
}

// ── Focus area resolver with scene-type-aware defaults ──
function resolveFocusArea(d: DetailSettings, scene: ProductImageScene): string {
  if (d.focusArea && !isAuto(d.focusArea)) return d.focusArea;

  const st = scene.sceneType;
  if (st && FOCUS_AREA_DEFAULTS[st]) return FOCUS_AREA_DEFAULTS[st];

  // Infer from scene ID patterns
  const id = scene.id;
  if (id.includes('texture') || id.includes('formula')) return FOCUS_AREA_DEFAULTS['formula'];
  if (id.includes('hardware') || id.includes('clasp') || id.includes('detail_macro')) return FOCUS_AREA_DEFAULTS['hardware'];
  if (id.includes('label') || id.includes('packaging_detail')) return FOCUS_AREA_DEFAULTS['label'];
  if (id.includes('sole')) return FOCUS_AREA_DEFAULTS['sole'];
  if (id.includes('fabric') || id.includes('stitch')) return FOCUS_AREA_DEFAULTS['fabric'];
  if (id.includes('dose') || id.includes('scoop')) return FOCUS_AREA_DEFAULTS['dose'];

  // Fall back based on trigger blocks
  if (scene.triggerBlocks.includes('detailFocus')) return FOCUS_AREA_DEFAULTS['macro'];
  return 'key product details and construction quality';
}

// ── Negative prompt builder ──
function buildNegativePrompt(scene: ProductImageScene): string {
  const parts = [BASE_NEGATIVES, PRODUCT_NEGATIVES];
  const hasPerson = scene.triggerBlocks.includes('personDetails') || scene.triggerBlocks.includes('actionDetails');
  if (hasPerson) parts.push(PERSON_NEGATIVES);
  return parts.join(' ');
}

// ── Token resolution ──
interface TokenContext {
  productName: string;
  productType: string;
  productDescription?: string;
  analysis: ProductAnalysis | null;
  details: DetailSettings;
  selectedModelId?: string;
  scene: ProductImageScene;
}

function resolveToken(token: string, ctx: TokenContext): string {
  const { productName, productType, analysis, details, scene } = ctx;
  const cat = analysis?.category;

  switch (token) {
    case 'productName': return productName;
    case 'productType': return productType || cat || 'product';

    // Bug 3 fix: background family is stored in negativeSpace by the UI
    // Bug 10 fix: color world is stored in backgroundTone — use as color modifier
    case 'background': {
      const bgFamily = details.negativeSpace; // background family selection from UI
      const colorWorld = details.backgroundTone; // color world selection from UI
      const bgResolved = (!isAuto(bgFamily) && BG_MAP[bgFamily!]) ? BG_MAP[bgFamily!] : (isAuto(bgFamily) ? defaultBackground(cat) : bgFamily!.replace(/-/g, ' '));
      const cwResolved = (!isAuto(colorWorld) && COLOR_WORLD_MAP[colorWorld!]) ? ` with ${COLOR_WORLD_MAP[colorWorld!]}` : '';
      return `${bgResolved}${cwResolved}`;
    }

    // Bug 1 fix: lighting now matches UI chip values via updated LIGHTING_MAP
    case 'lightingDirective': {
      if (isAuto(details.lightingStyle)) return defaultLighting(cat);
      return LIGHTING_MAP[details.lightingStyle!] || defaultLighting(cat);
    }

    // Bug 2 fix: shadow now matches UI chip values via updated SHADOW_MAP
    case 'shadowDirective': {
      if (isAuto(details.shadowStyle)) return defaultShadow(cat);
      return SHADOW_MAP[details.shadowStyle!] || defaultShadow(cat);
    }

    case 'materialTexture': return defaultMaterial(analysis?.materialFamily, analysis?.finish, ctx.productDescription);

    // Bug 9 fix: surface now uses SURFACE_MAP for rich descriptions
    case 'surfaceDirective': {
      if (isAuto(details.surfaceType)) return defaultSurface(cat);
      return SURFACE_MAP[details.surfaceType!] || `placed on a ${details.surfaceType!.replace(/-/g, ' ')} surface`;
    }

    case 'personDirective': return buildPersonDirective(details);
    case 'handStyle': return buildHandDirective(details);
    case 'nailDirective': return resolveNailStyle(details.nails);
    case 'outfitDirective': return buildOutfitDirective(details);
    case 'focusArea': return resolveFocusArea(details, scene);

    // Bug 6 fix: accent uses accentColor + brandingVisibility for accent only
    case 'accentDirective': {
      const ac = details.accentColor;
      const vis = details.brandingVisibility;
      if (vis === 'custom' && ac && /^#[0-9A-Fa-f]{6}$/.test(ac)) {
        return `Accent tones: subtle accent color (${ac}) complementing the product palette.`;
      }
      if (vis === 'brand-accent' && ac && /^#[0-9A-Fa-f]{6}$/.test(ac)) {
        return `Brand accent color (${ac}) woven subtly into the composition.`;
      }
      if (!isAuto(vis) && vis !== 'none' && vis !== 'custom' && vis !== 'brand-accent') {
        return `Accent tones: subtle ${vis!.replace(/-/g, ' ')} accents complementing the product palette.`;
      }
      return '';
    }

    case 'consistencyDirective': return CONSISTENCY_MAP[details.consistency || 'balanced'] || CONSISTENCY_MAP['balanced'];
    case 'productSize': return analysis?.sizeClass || 'medium';
    case 'colorFamily': return analysis?.colorFamily || 'neutral tones';

    // Bug 7 fix: UI stores "styling direction" in details.mood — route it correctly
    case 'stylingDirective': {
      const sd = details.mood || details.stylingDirection;
      if (isAuto(sd)) return defaultStyling(cat);
      return STYLING_DIRECTION_MAP[sd!] || `${sd!.replace(/-/g, ' ')} styling direction with refined visual intention.`;
    }

    // Bug 7 fix: moodDirective should be empty since "mood" field actually stores styling direction
    case 'moodDirective': return '';

    case 'environmentDirective': {
      if (isAuto(details.environmentType)) return '';
      return `Set in a ${details.environmentType!.replace(/-/g, ' ')} environment.`;
    }

    // Bug 6 fix: brandingDirective returns empty — no separate branding UI section exists
    case 'brandingDirective': return '';

    case 'customNote': return details.customNote || '';
    case 'modelDirective': return ctx.selectedModelId ? 'Use the specific model reference provided in the source image.' : '';
    case 'packagingDirective': return buildPackagingDirective(details);
    case 'cropDirective': {
      if (isAuto(details.cropIntensity)) return '';
      return `Crop intensity: ${details.cropIntensity!.replace(/-/g, ' ')}.`;
    }
    case 'actionDirective': {
      const parts: string[] = [];
      if (!isAuto(details.actionType)) parts.push(details.actionType!.replace(/-/g, ' '));
      if (!isAuto(details.actionIntensity)) parts.push(`intensity: ${details.actionIntensity!.replace(/-/g, ' ')}`);
      return parts.length ? `Action: ${parts.join(', ')}.` : '';
    }
    case 'compositionDirective': {
      if (isAuto(details.compositionFraming)) return '';
      const COMP_MAP: Record<string, string> = {
        'tight': 'Tight composition — product fills the frame with minimal surrounding space.',
        'balanced': 'Balanced composition — product centered with comfortable breathing room.',
        'generous': 'Generous composition — ample negative space around the product for editorial feel.',
      };
      return COMP_MAP[details.compositionFraming!] || `${details.compositionFraming!.replace(/-/g, ' ')} composition.`;
    }
    // negativeSpaceDirective should now be empty since negativeSpace stores background family (Bug 3)
    case 'negativeSpaceDirective': return '';
    case 'productProminenceDirective': {
      if (isAuto(details.productProminence)) return '';
      return `Product prominence: ${details.productProminence!.replace(/-/g, ' ')}.`;
    }
    case 'sceneIntensityDirective': {
      if (isAuto(details.sceneIntensity)) return '';
      const SCENE_MOOD_MAP: Record<string, string> = {
        'clean': 'Clean, modern aesthetic — crisp lines, minimal distraction, contemporary feel.',
        'warm': 'Warm, inviting atmosphere — rich amber undertones, cozy tactile quality.',
        'dramatic': 'Dramatic, high-impact visual — bold contrasts, cinematic depth, editorial tension.',
        'editorial': 'Editorial storytelling — magazine-quality composition with narrative visual intent.',
        'natural': 'Natural, organic feel — soft, authentic, unforced visual language.',
      };
      return SCENE_MOOD_MAP[details.sceneIntensity!] || `${details.sceneIntensity!.replace(/-/g, ' ')} scene mood.`;
    }
    case 'cameraDirective': return resolveCameraDirective(scene);
    default: return '';
  }
}

const QUALITY_SUFFIX = 'Professional product photography, ultra-sharp focus, hyper-realistic textures and materials, accurate white balance, true-to-life color reproduction, 8K commercial quality, photorealistic rendering.';

// ── Post-resolution cleanup ──
function cleanupPrompt(raw: string): string {
  let s = raw;
  // Remove orphaned punctuation patterns from empty tokens
  s = s.replace(/,\s*,/g, ',');           // double commas
  s = s.replace(/,\s*\./g, '.');          // comma before period
  s = s.replace(/\.\s*\./g, '.');         // double periods
  s = s.replace(/—\s*,/g, '—');           // dash then comma
  s = s.replace(/—\s*\./g, '.');          // dash then period
  s = s.replace(/:\s*\./g, '.');          // colon then period
  s = s.replace(/:\s*,/g, ':');           // colon then comma
  s = s.replace(/\s+—\s+\./g, '.');      // spaced dash then period
  // Remove sentences that are just whitespace between periods
  s = s.replace(/\.\s+\./g, '.');
  // Collapse multiple spaces
  s = s.replace(/\s{2,}/g, ' ');
  // Remove leading/trailing spaces around periods
  s = s.replace(/\s+\./g, '.');
  s = s.replace(/\.\s{2,}/g, '. ');
  return s.trim();
}

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
    productDescription: product.description,
    analysis,
    details,
    selectedModelId: details.selectedModelId,
    scene,
  };

  if (!template) {
    // Fallback: old-style concatenation but enriched
    const parts: string[] = [scene.description];
    parts.push(`Product: ${product.title}.`);
    if (analysis?.materialFamily) parts.push(`Material: ${defaultMaterial(analysis.materialFamily, analysis.finish, product.description)}.`);
    parts.push(`Background: ${resolveToken('background', ctx)}.`);
    parts.push(resolveToken('lightingDirective', ctx));
    const styling = resolveToken('stylingDirective', ctx);
    if (styling) parts.push(styling);
    const env = resolveToken('environmentDirective', ctx);
    if (env) parts.push(env);
    if (!isAuto(details.surfaceType)) parts.push(resolveToken('surfaceDirective', ctx) + '.');
    if (!isAuto(details.presentation)) parts.push(resolveToken('personDirective', ctx));
    if (details.focusArea && !isAuto(details.focusArea)) parts.push(`Focus: ${details.focusArea}.`);
    if (details.customNote) parts.push(details.customNote);
    parts.push(resolveCameraDirective(scene));
    parts.push(QUALITY_SUFFIX);
    const negatives = buildNegativePrompt(scene);
    parts.push(negatives);
    return cleanupPrompt(parts.filter(Boolean).join(' '));
  }

  // Resolve all {{token}} placeholders
  let prompt = template.replace(/\{\{(\w+)\}\}/g, (_, token) => resolveToken(token, ctx));

  // Auto-inject key directives if template didn't include their tokens
  const injectIfMissing = (keyword: string, tokenName: string) => {
    const resolved = resolveToken(tokenName, ctx);
    if (resolved && !prompt.toLowerCase().includes(keyword)) {
      prompt += ` ${resolved}`;
    }
  };
  injectIfMissing('background', 'background');
  injectIfMissing('shadow', 'shadowDirective');
  injectIfMissing('surface', 'surfaceDirective');
  injectIfMissing('styling', 'stylingDirective');
  injectIfMissing('lighting', 'lightingDirective');

  // Apply cleanup
  prompt = cleanupPrompt(prompt);

  // Append quality suffix if not already present
  if (!prompt.includes('8K commercial quality')) {
    prompt += ' ' + QUALITY_SUFFIX;
  }

  // Append camera directive
  const camera = resolveCameraDirective(scene);
  if (camera && !prompt.includes('lens at')) {
    prompt += ' ' + camera;
  }

  // Append negative prompt
  const negatives = buildNegativePrompt(scene);
  prompt += ' ' + negatives;

  // Append custom note at the end
  if (details.customNote && !prompt.includes(details.customNote)) {
    prompt += ' ' + details.customNote;
  }

  return cleanupPrompt(prompt);
}
