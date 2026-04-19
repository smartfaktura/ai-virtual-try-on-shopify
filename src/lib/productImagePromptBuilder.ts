import type { ProductImageScene, DetailSettings, ProductAnalysis, OutfitConfig, OutfitPiece } from '@/components/app/product-images/types';

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
  'warm-beige': 'warm beige (#F5F0EB)',
  'light-gray': 'soft neutral light gray (#E8E8E8)',
  'light-grey': 'soft neutral light gray (#E8E8E8)',
  'soft-white': 'soft warm white (#FAFAFA)',
  'cool-gray': 'cool mid-gray (#D0D4D8)',
  'off-white': 'off-white (#F8F8F5)',
  'black': 'deep matte black (#1A1A1A)',
  'gradient': 'subtle gradient',
  'colored': 'solid colored',
  'taupe': 'warm taupe (#C4B7A6)',
  'stone': 'natural stone gray (#B8B0A8)',
  // Swatch values from BackgroundSwatchSelector UI
  'sage': 'soft sage green (#E8EDE6)',
  'blush': 'soft blush pink (#F8ECE8)',
  'white': 'pure seamless white (#FFFFFF)',
  'warm-neutral': 'warm beige (#F5F0EB)',
  'cool-neutral': 'cool gray (#EDF0F4)',
  'ivory': 'warm ivory (#FFFFF0)',
  'charcoal': 'deep charcoal gray (#36454F)',
  'navy': 'deep navy (#2B3A4E)',
};

// ── Color world map (stored in backgroundTone) ──
const COLOR_WORLD_MAP: Record<string, string> = {
  'warm-neutral': 'warm neutral color palette with creamy beige and soft ivory tones',
  'cool-neutral': 'cool neutral color palette with soft gray and blue-white undertones',
  'monochrome': 'monochromatic color palette — single hue family with tonal variation',
  'brand-led': 'color palette guided by the brand identity colors',
  // Scene-specific backgroundTone chip values
  'white': 'clean white color palette with pure, bright tones',
  'light-gray': 'soft light-gray color palette with neutral, understated tones',
  'gradient': 'smooth gradient background fading from #FFFFFF to #123668',
  // Gradient presets (also used as backgroundTone values)
  'gradient-warm': 'warm gradient background fading from #984D1B to #FBEFE9',
  'gradient-cool': 'cool gradient background fading from #0F570F to #EAFBE9',
  'gradient-sunset': 'warm gradient background fading from #B62020 to #FBE9E9',
};

// ── Styling density map ──
const STYLING_DENSITY_MAP: Record<string, string> = {
  'minimal': 'Minimal styling — product alone or with 1-2 subtle props, clean negative space.',
  'moderate': 'Moderate styling — thoughtful arrangement with complementary contextual props.',
  'styled': 'Fully styled scene — rich arrangement with multiple props, textures, and lifestyle elements.',
};

// ── Environment map ──
const ENVIRONMENT_MAP: Record<string, string> = {
  'bathroom': 'Set in a modern, clean bathroom — white tiles or marble surfaces, soft ambient light, spa-like calm.',
  'kitchen': 'Set in a bright, contemporary kitchen — clean countertops, natural light, curated simplicity.',
  'living-room': 'Set in a styled living room — premium furniture, warm tones, editorial interior feel.',
  'desk': 'Set at a clean, organized workspace — minimal desk accessories, focused professional aesthetic.',
  'outdoor': 'Set in a natural outdoor environment — soft daylight, organic textures, open air.',
  'shelf': 'Set on a curated display shelf — clean lines, intentional arrangement, retail-quality presentation.',
  'bedroom': 'Set in a serene, styled bedroom — soft linens, warm ambient light, intimate editorial mood.',
  'cafe': 'Set in a contemporary café — warm wood tones, ambient light, curated lifestyle backdrop.',
  'studio': 'Set in a professional photography studio — controlled environment, clean backgrounds, focused lighting.',
  'garden': 'Set in a lush garden environment — natural greenery, soft diffused daylight, organic textures.',
};

// ── Prominence map ──
const PROMINENCE_MAP: Record<string, string> = {
  'hero': 'Product dominates the frame — fills 60-80% of composition, maximum visual impact.',
  'balanced': 'Product is clearly the hero but shares space with environment — fills 40-60% of frame.',
  'contextual': 'Product is identifiable but environment tells the story — product fills 20-40% of frame.',
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
const BASE_NEGATIVES = 'No watermarks, no artificial text overlays or watermark text, no chromatic aberration, no lens flare artifacts, no color banding, no over-saturation.';
const PERSON_NEGATIVES = 'No extra fingers, no distorted joints, no unnatural hand anatomy, no missing limbs, no fused fingers, no deformed nails, correct human proportions.';
const PRODUCT_NEGATIVES = 'No warped product edges, no melted or distorted labels, no duplicated products, no floating elements. No background from reference image, no original product photo environment. Preserve all original product branding, logos, and label text exactly as shown.';
const BG_COLOR_NEGATIVES = 'No warm tint on background, no yellow cast on background, no beige drift on background, no color contamination from product onto background, no background color variation, no uneven background tone.';

// PRODUCT_FIDELITY and REFERENCE_ISOLATION removed — covered by edge function CRITICAL REQUIREMENTS #2 and #7

// ── Body framing map by category + scene type ──
function resolveBodyFramingDirective(category?: string, sceneType?: string): string {
  const isOnModel = sceneType === 'portrait' || sceneType === 'editorial' || sceneType === 'lifestyle';
  if (!isOnModel) return '';

  switch (category) {
    case 'garments':
    case 'dresses':
    case 'hoodies':
    case 'streetwear':
    case 'jeans':
    case 'jackets':
      return 'Full-body shot — model visible from head to toe, feet fully inside frame, natural standing pose. Do NOT crop at the knees or waist.';
    case 'lingerie':
    case 'swimwear':
    case 'activewear':
    case 'kidswear':
      return 'Full-body shot — model visible from head to toe, feet fully inside frame. The product IS the outfit — show the full garment coverage clearly.';
    case 'shoes':
    case 'sneakers':
    case 'boots':
    case 'high-heels':
      return 'Three-quarter to full-body shot — model visible from head to below the knees, shoes clearly visible and in-frame.';
    case 'bags-accessories':
    case 'backpacks':
    case 'wallets-cardholders':
    case 'belts':
    case 'scarves':
    case 'hats-small':
      return 'Three-quarter shot — model visible from head to mid-thigh, bag and hands fully in-frame.';
    case 'jewellery-necklaces':
    case 'jewellery-earrings':
    case 'jewellery-bracelets':
    case 'jewellery-rings':
    case 'watches':
    case 'eyewear':
      return 'Close-up to upper-body shot — product clearly visible and in sharp focus, model provides context.';
    case 'beauty-skincare':
    case 'makeup-lipsticks':
      return 'Close-up beauty shot — shoulders and face, product interaction zone fully visible.';
    case 'fragrance':
      return 'Upper-body shot — head to waist, product clearly held and visible.';
    default:
      return 'Full-body shot — model visible from head to toe, natural standing pose.';
  }
}

// ── Category-aware defaults ──

function defaultBackground(category?: string): string {
  switch (category) {
    case 'garments':
    case 'dresses':
    case 'hoodies':
    case 'streetwear':
    case 'jeans':
    case 'jackets':
    case 'shoes':
    case 'sneakers':
    case 'boots':
    case 'high-heels':
    case 'bags-accessories':
    case 'backpacks':
    case 'wallets-cardholders':
    case 'belts':
    case 'scarves':
    case 'hats-small':
      return 'soft warm white seamless studio background — do NOT reproduce the background from the product reference photo';
    case 'lingerie':
    case 'swimwear':
    case 'activewear':
    case 'kidswear':
      return 'soft neutral seamless studio background with warm undertone — do NOT reproduce the background from the product reference photo';
    case 'fragrance':
    case 'beauty-skincare':
    case 'makeup-lipsticks':
    case 'jewellery-necklaces':
    case 'jewellery-earrings':
    case 'jewellery-bracelets':
    case 'jewellery-rings':
    case 'watches':
    case 'eyewear':
      return 'soft neutral light gray seamless background';
    case 'tech-devices':
      return 'clean matte white seamless background';
    case 'food':
    case 'beverages':
      return 'warm off-white background with natural warmth';
    case 'furniture':
      return 'styled interior room setting with architectural depth';
    case 'home-decor':
      return 'soft white studio background';
    default:
      return 'soft warm white seamless studio background';
  }
}

function defaultSurface(category?: string): string {
  switch (category) {
    case 'food':
    case 'beverages':
      return 'placed on a warm, natural wood surface with visible grain';
    case 'furniture':
      return 'positioned in a curated interior space on polished concrete or natural wood flooring';
    case 'home-decor':
      return 'placed on a premium styled surface with complementary texture';
    default:
      return 'placed on a clean, minimal studio surface with seamless backdrop';
  }
}

function defaultShadow(category?: string): string {
  switch (category) {
    case 'garments':
    case 'dresses':
    case 'hoodies':
    case 'streetwear':
    case 'jeans':
    case 'jackets':
    case 'shoes':
    case 'sneakers':
    case 'boots':
    case 'high-heels':
    case 'bags-accessories':
    case 'backpacks':
    case 'wallets-cardholders':
    case 'belts':
    case 'scarves':
    case 'hats-small':
      return 'Soft diffused shadow beneath the product for a refined, airy feel.';
    case 'lingerie':
    case 'swimwear':
    case 'activewear':
    case 'kidswear':
      return 'Soft diffused shadow beneath for a refined, beauty-oriented feel.';
    case 'fragrance':
    case 'beauty-skincare':
    case 'makeup-lipsticks':
    case 'jewellery-necklaces':
    case 'jewellery-earrings':
    case 'jewellery-bracelets':
    case 'jewellery-rings':
    case 'watches':
    case 'eyewear':
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
    case 'dresses':
    case 'hoodies':
    case 'streetwear':
    case 'jeans':
    case 'jackets':
      return 'Clean commercial styling — crisp, professional composition.';
    case 'lingerie':
    case 'swimwear':
    case 'activewear':
    case 'kidswear':
      return 'Beauty-editorial styling — soft, confident, body-positive composition with premium feel.';
    case 'fragrance':
    case 'beauty-skincare':
    case 'makeup-lipsticks':
    case 'jewellery-necklaces':
    case 'jewellery-earrings':
    case 'jewellery-bracelets':
    case 'jewellery-rings':
    case 'watches':
    case 'eyewear':
      return 'Beauty-clean styling — luminous, minimal composition with premium product focus.';
    case 'shoes':
    case 'sneakers':
    case 'boots':
    case 'high-heels':
    case 'bags-accessories':
    case 'backpacks':
    case 'wallets-cardholders':
    case 'belts':
    case 'scarves':
    case 'hats-small':
      return 'Minimal luxury styling — clean, restrained, premium composition.';
    case 'tech-devices':
      return 'Modern sleek styling — contemporary, geometric, sharp composition.';
    case 'food':
    case 'beverages':
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
    case 'jewellery-necklaces':
    case 'jewellery-earrings':
    case 'jewellery-bracelets':
    case 'jewellery-rings':
    case 'watches':
    case 'eyewear': return 'Soft overhead beauty lighting with precise specular highlights on metal and stone surfaces.';
    case 'lingerie':
    case 'swimwear':
    case 'activewear':
    case 'kidswear': return 'Soft diffused beauty lighting with warm undertone, even skin illumination, and gentle contouring.';
    case 'tech-devices': return 'Crisp controlled studio lighting with clean specular reflections.';
    case 'food':
    case 'beverages': return 'Warm natural diffused lighting with appetite-enhancing warmth.';
    case 'garments':
    case 'dresses':
    case 'hoodies':
    case 'streetwear':
    case 'jeans':
    case 'jackets': return 'Even soft studio lighting revealing fabric texture and true color.';
    case 'bags-accessories':
    case 'backpacks':
    case 'wallets-cardholders':
    case 'belts':
    case 'scarves':
    case 'hats-small':
    case 'shoes':
    case 'sneakers':
    case 'boots':
    case 'high-heels': return 'Controlled directional lighting revealing leather grain and material depth.';
    case 'furniture': return 'Warm directional interior lighting with natural window-light ambience revealing material textures and wood grain.';
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

// ── Default person directive when user leaves everything on auto but scene needs a person ──
function defaultPersonDirective(category?: string): string {
  switch (category) {
    case 'garments':
    case 'dresses':
    case 'hoodies':
    case 'streetwear':
    case 'jeans':
    case 'jackets':
      return 'Professional fashion model with natural, contemporary look — realistic skin texture, confident but relaxed posture, editorial presence.';
    case 'lingerie':
    case 'swimwear':
    case 'activewear':
      return 'Professional model with natural, confident posture — realistic skin texture, body-positive presence, soft editorial beauty lighting on skin.';
    case 'kidswear':
      return 'Child model with natural, age-appropriate expression — playful, joyful energy, realistic appearance, bright and wholesome presence.';
    case 'shoes':
    case 'sneakers':
    case 'boots':
    case 'high-heels':
    case 'bags-accessories':
    case 'backpacks':
    case 'wallets-cardholders':
    case 'belts':
    case 'scarves':
    case 'hats-small':
      return 'Stylish model with clean, modern look — natural skin, understated elegance, product is the focus.';
    case 'jewellery-necklaces':
    case 'jewellery-earrings':
    case 'jewellery-bracelets':
    case 'jewellery-rings':
    case 'watches':
    case 'eyewear':
      return 'Beauty model with clean, luminous skin — product worn naturally as the focal point, understated elegance, editorial beauty standard.';
    case 'beauty-skincare':
    case 'makeup-lipsticks':
      return 'Beauty model with flawless, luminous skin — close-up ready, soft natural expression, editorial beauty standard.';
    case 'fragrance':
      return 'Aspirational model with refined, photogenic features — natural skin texture, subtle confidence, luxury aesthetic.';
    default:
      return 'Professional model with natural, contemporary look — realistic skin texture, confident posture, clean aesthetic.';
  }
}

// ── Category-aware outfit defaults (per-piece) ──
interface OutfitPieces { top: string; bottom: string; shoes: string; accessories: string; }

function categoryOutfitDefaults(category?: string, gender?: string): OutfitPieces {
  const isMale = gender === 'male';
  switch (category) {
    case 'garments':
    case 'dresses':
    case 'hoodies':
    case 'streetwear':
    case 'jeans':
    case 'jackets':
      return isMale
        ? { top: 'plain white crew-neck tee', bottom: 'slim navy cotton chinos', shoes: 'white leather sneakers', accessories: 'none' }
        : { top: 'fitted white t-shirt', bottom: 'slim-fit light beige cotton trousers', shoes: 'minimal white sneakers', accessories: 'none' };
    case 'lingerie':
    case 'swimwear':
    case 'activewear':
    case 'kidswear':
      // Product IS the outfit — no support clothing
      return { top: '', bottom: '', shoes: '', accessories: 'none' };
    case 'bags-accessories':
    case 'backpacks':
    case 'wallets-cardholders':
    case 'belts':
    case 'scarves':
    case 'hats-small':
      return isMale
        ? { top: 'fitted black crew-neck sweater', bottom: 'slim dark navy trousers', shoes: 'black leather boots', accessories: 'none' }
        : { top: 'fitted black turtleneck', bottom: 'slim dark navy trousers', shoes: 'black ankle boots', accessories: 'none' };
    case 'shoes':
    case 'sneakers':
    case 'boots':
    case 'high-heels':
      return isMale
        ? { top: 'plain white tee', bottom: 'slim dark wash denim', shoes: '', accessories: 'none' }
        : { top: 'plain white tee', bottom: 'cropped slim dark denim', shoes: '', accessories: 'none' };
    case 'jewellery-necklaces':
    case 'jewellery-earrings':
    case 'jewellery-bracelets':
    case 'jewellery-rings':
    case 'watches':
    case 'eyewear':
    case 'fragrance':
    case 'beauty-skincare':
    case 'makeup-lipsticks':
      return isMale
        ? { top: 'minimal clean neckline', bottom: '', shoes: '', accessories: 'none' }
        : { top: 'minimal elegant neckline', bottom: '', shoes: '', accessories: 'none' };
    default:
      return { top: 'clean neutral top', bottom: 'understated trousers in neutral tones', shoes: 'minimal clean shoes', accessories: 'none' };
  }
}

// ── Slot nullification based on product garmentType ──
export type OutfitSlot = 'top' | 'bottom' | 'shoes';

/**
 * Resolve the effective garment type from analysis + product metadata.
 * Falls back through garmentType → productSubcategory → product_type → title.
 */
export function resolveGarmentType(
  analysis?: { garmentType?: string; productSubcategory?: string } | null,
  product?: { product_type?: string; title?: string } | null,
): string | undefined {
  const candidates = [
    analysis?.garmentType,
    analysis?.productSubcategory,
    product?.product_type,
    product?.title,
  ].filter(Boolean) as string[];

  // First pass: return the first candidate that actually matches a conflict keyword
  for (const c of candidates) {
    if (getConflictingSlots(c).size > 0) return c;
  }
  // Second pass: return first non-empty value (for display even if no slot match)
  return candidates[0] ?? undefined;
}

/** Returns outfit slots that conflict with the product's garmentType.
 *  These slots should be omitted from the outfit prompt so the product fills them. */
export function getConflictingSlots(garmentType?: string): Set<OutfitSlot> {
  if (!garmentType) return new Set();
  const gt = garmentType.toLowerCase();
  // Full-body garments — product IS top AND bottom
  if (['dress', 'jumpsuit', 'romper', 'bodysuit', 'one-piece', 'overalls', 'coverall', 'kimono', 'kaftan', 'saree', 'gown', 'maxi dress', 'mini dress', 'co-ord set', 'suit', 'onesie', 'dungaree'].some(k => gt.includes(k))) {
    return new Set(['top', 'bottom']);
  }
  // Bottom garments
  if (['skirt', 'shorts', 'trousers', 'pants', 'leggings', 'jeans', 'wide-leg', 'culottes', 'joggers', 'sweatpants', 'bermuda', 'chinos', 'cargo pants', 'palazzo', 'bottoms', 'denim'].some(k => gt.includes(k))) {
    return new Set(['bottom']);
  }
  // Top garments
  if (['crop top', 'blouse', 'shirt', 'hoodie', 'sweater', 'cardigan', 'tank top', 'vest', 'jacket', 'blazer', 'coat', 'parka', 'bomber', 'polo', 'tunic', 'cape', 'poncho', 'turtleneck', 'henley', 'pullover', 'windbreaker', 'anorak', 'gilet', 'knitwear', 'knit', 'outerwear', 'tops', 'sweatshirt', 't-shirt', 'tee', 'jersey', 'fleece', 'flannel'].some(k => gt.includes(k))) {
    return new Set(['top']);
  }
  // Footwear
  if (['sneaker', 'boot', 'heel', 'sandal', 'loafer', 'mule', 'slipper', 'clog', 'flat', 'oxford', 'derby', 'trainer', 'shoe', 'espadrille', 'wedge', 'pump', 'brogue', 'footwear'].some(k => gt.includes(k))) {
    return new Set(['shoes']);
  }
  return new Set();
}

// ── Build structured outfit string from OutfitConfig ──
export function buildStructuredOutfitString(config: OutfitConfig, skipSlots?: Set<OutfitSlot>): string {
  const describePiece = (piece?: OutfitPiece, fallbackGarment?: string): string => {
    if (!piece || !piece.garment) return '';
    const parts: string[] = [];
    if (piece.color) parts.push(piece.color);
    if (piece.material) parts.push(piece.material);
    if (piece.fit) parts.push(`${piece.fit}-fit`);
    if (piece.subtype) parts.push(piece.subtype);
    parts.push(piece.garment || fallbackGarment || '');
    return parts.filter(Boolean).join(' ').trim();
  };

  const segments: string[] = [];

  // Layering order: outerwear → top/dress → bottom → shoes
  const outerwear = describePiece(config.outerwear);
  if (outerwear) segments.push(`Outerwear: ${outerwear}`);

  if (config.dress?.garment) {
    const dress = describePiece(config.dress);
    if (dress) segments.push(`Dress: ${dress}`);
  } else {
    if (!skipSlots?.has('top')) {
      const top = describePiece(config.top);
      if (top) segments.push(`Top: ${top}`);
    }
    if (!skipSlots?.has('bottom')) {
      const bottom = describePiece(config.bottom);
      if (bottom) segments.push(`Bottom: ${bottom}`);
    }
  }

  if (!skipSlots?.has('shoes')) {
    const shoes = describePiece(config.shoes);
    if (shoes) segments.push(`Shoes: ${shoes}`);
  }

  // Cover-up (beach overlay for swimwear) — describe as a layer over the product
  const coverUp = describePiece(config.coverUp);
  if (coverUp) segments.push(`Cover-up layer: ${coverUp} worn loosely over the product`);

  // Accessories
  const accParts: string[] = [];
  const bag = describePiece(config.bag); if (bag) accParts.push(`bag (${bag})`);
  const hat = describePiece(config.hat); if (hat) accParts.push(`hat (${hat})`);
  const eyewear = describePiece(config.eyewear); if (eyewear) accParts.push(`eyewear (${eyewear})`);
  const belt = describePiece(config.belt); if (belt) accParts.push(`belt (${belt})`);
  const watch = describePiece(config.watch); if (watch) accParts.push(`watch (${watch})`);
  if (config.jewelry) {
    const j = config.jewelry;
    const jewelryBits: string[] = [];
    if (j.necklace) jewelryBits.push(j.necklace.toLowerCase() + ' necklace');
    if (j.earrings) jewelryBits.push(j.earrings.toLowerCase() + ' earrings');
    if (j.bracelet) jewelryBits.push(j.bracelet.toLowerCase() + ' bracelet');
    if (j.ring) jewelryBits.push(j.ring.toLowerCase() + ' ring');
    if (jewelryBits.length) {
      const metal = j.metal ? ` in ${j.metal.toLowerCase()}` : '';
      accParts.push(`jewelry (${jewelryBits.join(', ')}${metal})`);
    }
  }
  if (config.accessories && config.accessories !== 'none') accParts.push(config.accessories);

  if (segments.length === 0 && accParts.length === 0) return '';
  const outfitStr = segments.join('; ');
  const accStr = accParts.length ? ` Accessories: ${accParts.join(', ')}.` : '';
  return `OUTFIT LOCK — Wearing exactly: ${outfitStr}. CRITICAL: This exact outfit must appear identically in every on-model shot — same colors, same fit, same materials, same shoes. Clothing must NOT compete with the product.${accStr}`;
}

// ── Default outfit directive when user leaves everything on auto but scene needs outfit ──
function defaultOutfitDirective(category?: string, details?: DetailSettings, gender?: string, garmentType?: string): string {
  // For categories where the product IS the outfit, enforce no additional clothing
  // EXCEPTION: swimwear allows beach cover-ups + accessories from user's outfitConfig
  if (category === 'lingerie' || category === 'swimwear' || category === 'activewear' || category === 'kidswear') {
    // If user has configured a cover-up or accessories for swimwear, surface those instead of the hard lock
    if (category === 'swimwear' && details?.outfitConfig) {
      const cfg = details.outfitConfig;
      const hasCoverUpOrAcc = !!(cfg.coverUp?.garment || cfg.bag?.garment || cfg.hat?.garment || cfg.eyewear?.garment || cfg.jewelry);
      if (hasCoverUpOrAcc) {
        const structured = buildStructuredOutfitString(cfg, new Set(['top', 'bottom', 'shoes', 'dress'] as OutfitSlot[]));
        if (structured) return structured + ' The product itself remains the primary on-body garment — no additional t-shirt, trousers, or jacket beyond the cover-up specified.';
      }
    }
    return 'OUTFIT LOCK — The product IS the outfit. Model wears ONLY the product — no additional clothing, no layering, no cover-ups. Show the product as-is on the body. Do NOT add any t-shirt, trousers, jacket, or other garment over or under the product.';
  }

  // Compute which slots to skip based on the product's garment type
  const skipSlots = getConflictingSlots(garmentType);

  // Prefer structured config if available
  if (details?.outfitConfig) {
    const structured = buildStructuredOutfitString(details.outfitConfig, skipSlots);
    if (structured) return structured;
  }

  const defaults = categoryOutfitDefaults(category, gender);
  const top = skipSlots.has('top') ? '' : (details?.outfitTop || defaults.top);
  const bottom = skipSlots.has('bottom') ? '' : (details?.outfitBottom || defaults.bottom);
  const shoes = skipSlots.has('shoes') ? '' : (details?.outfitShoes || defaults.shoes);
  const acc = details?.outfitAccessories || defaults.accessories;

  const parts: string[] = [];
  if (top) parts.push(top);
  if (bottom) parts.push(bottom);
  if (shoes) parts.push(shoes);
  const outfitStr = parts.join(', ');
  const accStr = acc && acc !== 'none' ? ` Accessories: ${acc}.` : '';

  if (!outfitStr) return 'OUTFIT LOCK — Wearing minimal, elegant styling — nothing competing with the product. This exact look must repeat identically in every on-model shot.';
  return `OUTFIT LOCK — Wearing exactly: ${outfitStr}. CRITICAL: This exact outfit must appear identically in every on-model shot — same colors, same fit, same materials. Clothing must NOT compete with the product.${accStr}`;
}

// ── Person directive builder (skips auto values) ──
function buildPersonDirective(d: DetailSettings, category?: string, sceneNeedsPerson?: boolean, gender?: string, garmentType?: string, resolvedOutfitHint?: string): string {
  const parts: string[] = [];
  // When a specific model is selected, skip user-set person details (age, skin, expression etc.)
  // — those fields are hidden in the UI and shouldn't leak into the prompt
  if (!d.selectedModelId) {
    if (!isAuto(d.presentation)) parts.push(`${d.presentation} presentation`);
    if (!isAuto(d.ageRange)) parts.push(`age ${d.ageRange}`);
    if (!isAuto(d.skinTone)) parts.push(`${d.skinTone} skin tone`);
    if (!isAuto(d.expression)) parts.push(`${d.expression} expression`);
    if (!isAuto(d.hairVisibility)) parts.push(`${d.hairVisibility} hair visibility`);
    if (!isAuto(d.cropType)) parts.push(`${d.cropType} crop`);
  }

  if (parts.length === 0) {
    // No person details set — use smart defaults if scene requires a person
    if (sceneNeedsPerson) {
      let dir = defaultPersonDirective(category);
      if (!resolvedOutfitHint) {
        dir += ` ${defaultOutfitDirective(category, d, gender, garmentType)}`;
      }
      dir += ' Hyper-realistic skin texture with visible pores, natural anatomy, and correct proportions.';
      return dir;
    }
    return '';
  }

  let directive = `Model: ${parts.join(', ')}.`;

  // Append outfit using structured config or smart default for on-model scenes
  if (sceneNeedsPerson && !resolvedOutfitHint) {
    directive += ` ${defaultOutfitDirective(category, d, gender, garmentType)}`;
  }

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

// buildOutfitDirective removed — outfitConfig system replaces outfitStyle/outfitColorDirection

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
  const triggers = scene.triggerBlocks || [];
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
  if ((scene.triggerBlocks || []).includes('detailFocus')) return FOCUS_AREA_DEFAULTS['macro'];
  return 'key product details and construction quality';
}

// ── Negative prompt builder ──
function buildNegativePrompt(scene: ProductImageScene, hasSolidHexBg = false): string {
  const parts = [BASE_NEGATIVES, PRODUCT_NEGATIVES];
  const hasPerson = (scene.triggerBlocks || []).includes('personDetails') || (scene.triggerBlocks || []).includes('actionDetails');
  if (hasPerson) parts.push(PERSON_NEGATIVES);
  if (hasSolidHexBg) parts.push(BG_COLOR_NEGATIVES);
  return parts.join(' ');
}

// ── Detect if user has defined any outfit slot (used to allow override of scene hint) ──
function hasUserDefinedOutfit(details: DetailSettings): boolean {
  const cfg = details.outfitConfig;
  if (cfg) {
    if (cfg.top?.garment || cfg.bottom?.garment || cfg.shoes?.garment ||
        cfg.outerwear?.garment || cfg.dress?.garment || cfg.coverUp?.garment ||
        cfg.bag?.garment || cfg.hat?.garment || cfg.eyewear?.garment ||
        cfg.belt?.garment || cfg.watch?.garment ||
        (cfg.jewelry && Object.keys(cfg.jewelry).length > 0) ||
        (cfg.accessories && cfg.accessories.length > 0)) return true;
  }
  return !!(details.outfitTop || details.outfitBottom || details.outfitShoes || details.outfitAccessories);
}

// ── Shared outfit hint resolver ──
function resolveOutfitHintText(scene: ProductImageScene, details: DetailSettings, productName?: string): string | undefined {
  if (!scene.outfitHint) return undefined;
  // If user explicitly enabled outfit override AND has at least one slot defined → bypass scene hint
  if (details.outfitOverrideEnabled && hasUserDefinedOutfit(details)) return undefined;
  const hex = details.aestheticColorHex;
  const label = details.aestheticColorLabel;
  const colorDesc = hex && /^#[0-9A-Fa-f]{6}$/.test(hex) ? (label ? `${label} (${hex})` : hex) : 'coordinated';
  return scene.outfitHint
    .replace(/\{\{aestheticColor\}\}/gi, colorDesc)
    .replace(/\{\{productName\}\}/gi, productName || 'the product');
}

// ── Token resolution ──
interface TokenContext {
  productName: string;
  productType: string;
  productDescription?: string;
  productWeight?: string | null;
  productMaterials?: string | null;
  productColor?: string | null;
  analysis: ProductAnalysis | null;
  details: DetailSettings;
  selectedModelId?: string;
  modelGender?: string;
  scene: ProductImageScene;
}

function resolveToken(token: string, ctx: TokenContext): string {
  const { productName, productType, analysis, details, scene } = ctx;
  const cat = analysis?.category;

  switch (token) {
    case 'productName': return productName;
    case 'productType': return productType || cat || 'product';

    case 'background': {
      const bgFamily = details.negativeSpace;
      const colorWorld = details.backgroundTone;
      // Custom hex background
      if (colorWorld === 'custom' && details.backgroundCustomHex && /^#[0-9A-Fa-f]{6}$/.test(details.backgroundCustomHex)) {
        return `flat solid exact ${details.backgroundCustomHex} color background, uniform color, no texture, no pattern, no color variation across the background`;
      }
      // Custom gradient background
      if (colorWorld === 'gradient-custom' && details.backgroundCustomGradient) {
        const { from, to } = details.backgroundCustomGradient;
        if (/^#[0-9A-Fa-f]{6}$/.test(from) && /^#[0-9A-Fa-f]{6}$/.test(to)) {
          return `smooth gradient background from ${from} to ${to}, no texture, no pattern`;
        }
      }
      // Named gradient preset — direct background, not a modifier
      if (colorWorld && colorWorld.startsWith('gradient-') && COLOR_WORLD_MAP[colorWorld]) {
        return `${COLOR_WORLD_MAP[colorWorld]}, no texture, no pattern`;
      }
      if (colorWorld === 'gradient' && COLOR_WORLD_MAP['gradient']) {
        return `${COLOR_WORLD_MAP['gradient']}, no texture, no pattern`;
      }
      // Check if backgroundTone is a direct swatch value in BG_MAP (e.g. sage, blush, white)
      const swatchResolved = (!isAuto(colorWorld) && BG_MAP[colorWorld!]) ? BG_MAP[colorWorld!] : null;
      if (swatchResolved) {
        const hexMatch = swatchResolved.match(/#[0-9A-Fa-f]{6}/);
        if (hexMatch) {
          return `flat solid exact ${hexMatch[0]} color background, uniform color, no texture, no pattern, no color variation across the background`;
        }
        return `${swatchResolved} seamless studio background, no texture, no pattern`;
      }
      const bgResolved = (!isAuto(bgFamily) && BG_MAP[bgFamily!]) ? BG_MAP[bgFamily!] : (isAuto(bgFamily) ? defaultBackground(cat) : bgFamily!.replace(/-/g, ' '));
      const cwResolved = (!isAuto(colorWorld) && COLOR_WORLD_MAP[colorWorld!]) ? ` with ${COLOR_WORLD_MAP[colorWorld!]}` : '';
      return `${bgResolved}${cwResolved}`;
    }

    case 'lightingDirective': {
      if (isAuto(details.lightingStyle)) return defaultLighting(cat);
      return LIGHTING_MAP[details.lightingStyle!] || defaultLighting(cat);
    }

    case 'shadowDirective': {
      if (isAuto(details.shadowStyle)) return defaultShadow(cat);
      return SHADOW_MAP[details.shadowStyle!] || defaultShadow(cat);
    }

    case 'materialTexture': return defaultMaterial(analysis?.materialFamily, analysis?.finish, ctx.productDescription);

    case 'surfaceDirective': {
      if (isAuto(details.surfaceType)) return defaultSurface(cat);
      return SURFACE_MAP[details.surfaceType!] || `placed on a ${details.surfaceType!.replace(/-/g, ' ')} surface`;
    }

    case 'personDirective': {
      const needsPerson = (scene.triggerBlocks || []).includes('personDetails') || (scene.triggerBlocks || []).includes('actionDetails');
      const resolvedHint = resolveOutfitHintText(scene, details, ctx.productName);
      return buildPersonDirective(details, cat, needsPerson, ctx.modelGender, analysis?.garmentType, resolvedHint);
    }
    case 'handStyle': return buildHandDirective(details);
    case 'nailDirective': return resolveNailStyle(details.nails);
    case 'outfitDirective': {
      // Scene-controlled outfit: use outfit_hint if present
      const resolvedHint = resolveOutfitHintText(scene, details, ctx.productName);
      if (resolvedHint) {
        let hint = resolvedHint;
        if (details.customOutfitNote) hint += ` ${details.customOutfitNote}`;
        return `OUTFIT DIRECTION — ${hint}`;
      }
      const needsOutfit = (scene.triggerBlocks || []).includes('personDetails') || (scene.triggerBlocks || []).includes('actionDetails');
      return needsOutfit ? defaultOutfitDirective(cat, details, ctx.modelGender, analysis?.garmentType) : '';
    }
    case 'focusArea': return resolveFocusArea(details, scene);

    case 'accentDirective': {
      const ac = details.accentColor;
      const vis = details.brandingVisibility;
      if (vis === 'product-accent' && analysis?.accentColor && /^#[0-9A-Fa-f]{6}$/.test(analysis.accentColor)) {
        return `Accent tones: subtle accent color (${analysis.accentColor}) derived from the product's dominant color.`;
      }
      if (vis === 'custom' && ac && /^#[0-9A-Fa-f]{6}$/.test(ac)) {
        return `Accent tones: subtle accent color (${ac}) complementing the product palette.`;
      }
      if (vis === 'brand-accent' && ac && /^#[0-9A-Fa-f]{6}$/.test(ac)) {
        return `Brand accent color (${ac}) woven subtly into the composition.`;
      }
      if (!isAuto(vis) && vis !== 'none' && vis !== 'custom' && vis !== 'brand-accent' && vis !== 'product-accent') {
        return `Accent tones: subtle ${vis!.replace(/-/g, ' ')} accents complementing the product palette.`;
      }
      return '';
    }

    case 'accentColorDirective': {
      const hex = analysis?.accentColor;
      if (hex && /^#[0-9A-Fa-f]{6}$/.test(hex)) {
        return `smooth gradient background derived from the product's dominant color (${hex}), complementary and harmonious with the product`;
      }
      return 'smooth gradient background complementary to the product\'s dominant color tones';
    }

    case 'consistencyDirective': return CONSISTENCY_MAP[details.consistency || 'balanced'] || CONSISTENCY_MAP['balanced'];
    case 'productSize': return analysis?.sizeClass || 'medium';
    case 'colorFamily': return analysis?.colorFamily || 'neutral tones';

    case 'stylingDirective': {
      const sd = details.mood || details.stylingDirection;
      if (isAuto(sd)) return defaultStyling(cat);
      return STYLING_DIRECTION_MAP[sd!] || `${sd!.replace(/-/g, ' ')} styling direction with refined visual intention.`;
    }

    case 'moodDirective': return resolveToken('stylingDirective', ctx);

    case 'environmentDirective': {
      if (isAuto(details.environmentType)) return '';
      return ENVIRONMENT_MAP[details.environmentType!] || `Set in a ${details.environmentType!.replace(/-/g, ' ')} environment.`;
    }

    case 'brandingDirective': return '';

    case 'categoryPackshotDirective': {
      switch (cat) {
        case 'garments':
          return 'Ghost mannequin / invisible mannequin style OR flat-lay arrangement on clean surface.';
        case 'shoes':
          return 'Standard packshot with shoe angled 3/4 view showing both the upper and sole profile.';
        case 'bags-accessories':
          return 'Standard packshot with accessory propped upright showing front face and hardware details.';
        default:
          return '';
      }
    }

    case 'bodyFramingDirective': return resolveBodyFramingDirective(cat, scene.sceneType);

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
    case 'negativeSpaceDirective': return '';
    case 'productProminenceDirective': {
      if (isAuto(details.productProminence)) return '';
      return PROMINENCE_MAP[details.productProminence!] || `Product prominence: ${details.productProminence!.replace(/-/g, ' ')}.`;
    }
    case 'stylingDensityDirective': {
      if (isAuto(details.stylingDensity)) return '';
      return STYLING_DENSITY_MAP[details.stylingDensity!] || `${details.stylingDensity!.replace(/-/g, ' ')} styling density.`;
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

    // ── Global Visual tokens (from analysis) ──
    case 'productCategory': return analysis?.category || '';
    case 'productSubcategory': return analysis?.productSubcategory || '';
    case 'productForm': return analysis?.productForm || '';
    case 'productSilhouette': return analysis?.productSilhouette || '';
    case 'productMainHex': return analysis?.productMainHex || '';
    case 'productSecondaryHex': return analysis?.productSecondaryHex || '';
    case 'productAccentHex': return analysis?.productAccentHex || analysis?.accentColor || '';
    case 'backgroundBaseHex': return analysis?.backgroundBaseHex || '';
    case 'backgroundSecondaryHex': return analysis?.backgroundSecondaryHex || '';
    case 'shadowToneHex': return analysis?.shadowToneHex || '';
    case 'productFinishType': return analysis?.productFinishType || analysis?.finish || '';
    case 'materialPrimary': return analysis?.materialPrimary || analysis?.materialFamily || '';
    case 'materialSecondary': return analysis?.materialSecondary || '';
    case 'textureType': return analysis?.textureType || '';
    case 'transparencyType': return analysis?.transparencyType || '';
    case 'metalTone': return analysis?.metalTone || '';
    case 'heroFeature': return analysis?.heroFeature || '';
    case 'detailFocusAreas': return analysis?.detailFocusAreas || '';
    case 'scaleType': return analysis?.scaleType || '';
    case 'wearabilityMode': return analysis?.wearabilityMode || '';
    case 'bodyPlacementSuggested': return analysis?.bodyPlacementSuggested || '';

    // ── Global Semantic tokens ──
    case 'ingredientFamilyPrimary': return analysis?.ingredientFamilyPrimary || '';
    case 'ingredientFamilySecondary': return analysis?.ingredientFamilySecondary || '';
    case 'fruitsRelated': return analysis?.fruitsRelated || '';
    case 'flowersRelated': return analysis?.flowersRelated || '';
    case 'botanicalsRelated': return analysis?.botanicalsRelated || '';
    case 'woodsRelated': return analysis?.woodsRelated || '';
    case 'spicesRelated': return analysis?.spicesRelated || '';
    case 'greensRelated': return analysis?.greensRelated || '';
    case 'materialsRelated': return analysis?.materialsRelated || '';
    case 'regionRelated': return analysis?.regionRelated || '';
    case 'landscapeRelated': return analysis?.landscapeRelated || '';

    // ── Fashion & Apparel ──
    case 'garmentType': return analysis?.garmentType || '';
    case 'fitType': return analysis?.fitType || '';
    case 'fabricType': return analysis?.fabricType || '';
    case 'fabricWeight': return analysis?.fabricWeight || '';
    case 'drapeBehavior': return analysis?.drapeBehavior || '';

    // ── Beauty & Skincare ──
    case 'packagingType': return analysis?.packagingType || '';
    case 'formulaType': return analysis?.formulaType || '';
    case 'formulaTexture': return analysis?.formulaTexture || '';
    case 'applicationMode': return analysis?.applicationMode || '';
    case 'skinAreaSuggested': return analysis?.skinAreaSuggested || '';

    // ── Fragrances ──
    case 'fragranceFamily': return analysis?.fragranceFamily || '';
    case 'bottleType': return analysis?.bottleType || '';
    case 'capStyle': return analysis?.capStyle || '';
    case 'liquidColorHex': return analysis?.liquidColorHex || '';
    case 'glassTintType': return analysis?.glassTintType || '';
    case 'noteObjectsPrimary': return analysis?.noteObjectsPrimary || '';
    case 'noteObjectsSecondary': return analysis?.noteObjectsSecondary || '';
    case 'scentWorld': return analysis?.scentWorld || '';

    // ── Jewelry ──
    case 'jewelryType': return analysis?.jewelryType || '';
    case 'gemType': return analysis?.gemType || '';
    case 'gemColorHex': return analysis?.gemColorHex || '';
    case 'metalPrimary': return analysis?.metalPrimary || '';
    case 'metalFinish': return analysis?.metalFinish || '';
    case 'wearPlacement': return analysis?.wearPlacement || '';
    case 'sparkleLevel': return analysis?.sparkleLevel || '';

    // ── Accessories ──
    case 'accessoryType': return analysis?.accessoryType || '';
    case 'carryMode': return analysis?.carryMode || '';
    case 'strapType': return analysis?.strapType || '';
    case 'hardwareType': return analysis?.hardwareType || '';
    case 'hardwareFinish': return analysis?.hardwareFinish || '';
    case 'structureType': return analysis?.structureType || '';
    case 'signatureDetail': return analysis?.signatureDetail || '';

    // ── Home & Decor ──
    case 'decorType': return analysis?.decorType || '';
    case 'placementType': return analysis?.placementType || '';
    case 'objectScale': return analysis?.objectScale || '';
    case 'baseMaterial': return analysis?.baseMaterial || '';
    case 'surfaceFinish': return analysis?.surfaceFinish || '';
    case 'roomContextSuggested': return analysis?.roomContextSuggested || '';
    case 'stylingCompanions': return analysis?.stylingCompanions || '';

    // ── Food & Beverage ──
    case 'foodType': return analysis?.foodType || '';
    case 'servingMode': return analysis?.servingMode || '';
    case 'ingredientObjectsPrimary': return analysis?.ingredientObjectsPrimary || '';
    case 'ingredientObjectsSecondary': return analysis?.ingredientObjectsSecondary || '';
    case 'textureCue': return analysis?.textureCue || '';
    case 'temperatureCue': return analysis?.temperatureCue || '';
    case 'consumptionContext': return analysis?.consumptionContext || '';

    // ── Electronics ──
    case 'deviceType': return analysis?.deviceType || '';
    case 'interfaceType': return analysis?.interfaceType || '';
    case 'screenPresence': return analysis?.screenPresence || '';
    case 'screenStateSuggested': return analysis?.screenStateSuggested || '';
    case 'finishMaterialPrimary': return analysis?.finishMaterialPrimary || '';
    case 'industrialStyle': return analysis?.industrialStyle || '';
    case 'portDetail': return analysis?.portDetail || '';
    case 'buttonDetail': return analysis?.buttonDetail || '';

    // ── Sports & Fitness ──
    case 'sportType': return analysis?.sportType || '';
    case 'gearType': return analysis?.gearType || '';
    case 'performanceMaterial': return analysis?.performanceMaterial || '';
    case 'gripTexture': return analysis?.gripTexture || '';
    case 'motionCue': return analysis?.motionCue || '';
    case 'usageContext': return analysis?.usageContext || '';
    case 'surfaceContext': return analysis?.surfaceContext || '';

    // ── Health & Supplements ──
    case 'supplementType': return analysis?.supplementType || '';
    case 'dosageForm': return analysis?.dosageForm || '';
    case 'mixingMode': return analysis?.mixingMode || '';
    case 'wellnessIngredientObjects': return analysis?.wellnessIngredientObjects || '';
    case 'containerType': return analysis?.containerType || '';
    case 'clinicalCleanlinessLevel': return analysis?.clinicalCleanlinessLevel || '';
    case 'routineContext': return analysis?.routineContext || '';

    // ── Product metadata tokens (from product upload) ──
    case 'productWeight': return ctx.productWeight || '';
    case 'productMaterials': return ctx.productMaterials || '';
    case 'productColor': return ctx.productColor || '';

    // ── Brand Logo Text ──
    case 'brandLogoText': return details.brandLogoText || '';

    // ── Aesthetic Color (consistent color across scenes) ──
    case 'aestheticColor': {
      const hex = details.aestheticColorHex;
      const label = details.aestheticColorLabel;
      if (hex && /^#[0-9A-Fa-f]{6}$/.test(hex)) return label ? `${label} (${hex})` : hex;
      // Fallback: derive from product's dominant color
      const fallback = analysis?.productMainHex;
      if (fallback && /^#[0-9A-Fa-f]{6}$/.test(fallback)) return `complementary tone derived from the product's dominant color (${fallback})`;
      return 'a cohesive accent tone complementary to the product';
    }
    case 'aestheticColorDirective': {
      const hex = details.aestheticColorHex;
      const label = details.aestheticColorLabel;
      if (hex && /^#[0-9A-Fa-f]{6}$/.test(hex)) {
        const colorDesc = label ? `${label} (${hex})` : hex;
        return `The environment and props share a cohesive aesthetic color (${colorDesc}) — doors, chairs, surfaces, and backgrounds should reflect this tone for visual consistency across the series.`;
      }
      return '';
    }

    default: return '';
  }
}

// QUALITY_SUFFIX removed — covered by edge function CRITICAL REQUIREMENT #4

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
  product: { title: string; product_type?: string; description?: string; dimensions?: string | null; weight?: string | null; materials?: string | null; color?: string | null },
  analysis: ProductAnalysis | null,
  details: DetailSettings,
  modelGender?: string,
): string {
  const template = scene.promptTemplate;

  const ctx: TokenContext = {
    productName: product.title,
    productType: product.product_type || analysis?.category || '',
    productDescription: product.description,
    productWeight: product.weight,
    productMaterials: product.materials,
    productColor: product.color,
    analysis,
    details,
    selectedModelId: details.selectedModelId,
    modelGender,
    scene,
  };

  // Detect if background resolves to a solid hex (for preamble + negatives)
  const sceneHasBgTrigger = (scene.triggerBlocks || []).includes('background');
  const bgResolved = resolveToken('background', ctx);
  const bgHexForReinforcement = sceneHasBgTrigger
    ? bgResolved.match(/flat solid exact (#[0-9A-Fa-f]{6})/)?.[1] || null
    : null;

  if (!template) {
    // Fallback: old-style concatenation but enriched
    const parts: string[] = [];
    if (bgHexForReinforcement) parts.push(`CRITICAL: The background must be exactly ${bgHexForReinforcement} — no warmer, no cooler, no tint variation.`);
    parts.push(scene.description);
    parts.push(`Product: ${product.title}.`);
    if (analysis?.materialFamily) parts.push(`Material: ${defaultMaterial(analysis.materialFamily, analysis.finish, product.description)}.`);
    parts.push(`Background: ${bgResolved}.`);
    parts.push(resolveToken('lightingDirective', ctx));
    const styling = resolveToken('stylingDirective', ctx);
    if (styling) parts.push(styling);
    const env = resolveToken('environmentDirective', ctx);
    if (env) parts.push(env);
    if (!isAuto(details.surfaceType)) parts.push(resolveToken('surfaceDirective', ctx) + '.');
    const sceneNeedsPerson = scene.triggerBlocks?.some((b: string) => b === 'personDetails' || b === 'actionDetails');
    if (sceneNeedsPerson || !isAuto(details.presentation)) parts.push(resolveToken('personDirective', ctx));
    if (details.focusArea && !isAuto(details.focusArea)) parts.push(`Focus: ${details.focusArea}.`);
    if (details.customNote) parts.push(details.customNote);
    parts.push(resolveCameraDirective(scene));
    const negatives = buildNegativePrompt(scene, !!bgHexForReinforcement);
    parts.push(negatives);
    return cleanupPrompt(parts.filter(Boolean).join(' '));
  }

  // Resolve all {{token}} placeholders
  // Prepend preamble for solid hex backgrounds
  let prompt = '';
  if (bgHexForReinforcement) {
    prompt = `CRITICAL: The background must be exactly ${bgHexForReinforcement} — no warmer, no cooler, no tint variation. `;
  }
  prompt += template.replace(/\{\{(\w+)\}\}/g, (_, token) => resolveToken(token, ctx));

  // Auto-inject key directives if template didn't include their tokens
  // For category-collection scenes, skip aesthetic overrides — let their templates drive the look
  const isGlobalScene = !scene.categoryCollection;
  // Background is ALWAYS injected globally (user expects it to apply to all scenes)
  const bgTone = details.backgroundTone;
  const hasBgToken = (template || '').includes('{{background}}');
  if (!hasBgToken && !isAuto(bgTone) && sceneHasBgTrigger) {
    const bgResolved = resolveToken('background', ctx);
    if (bgResolved) {
      prompt += ` Background: ${bgResolved}.`;
    }
  }

  // Lighting, body framing, outfit, and person directives are now TEMPLATE-LED:
  // templates must include {{lightingDirective}}, {{bodyFramingDirective}}, etc.
  // explicitly where needed. No auto-injection — prevents conflicts with scene intent
  // (e.g. forcing full-body framing onto a close-up hand scene).

  // PRODUCT_FIDELITY + REFERENCE_ISOLATION removed — edge function handles these
  // QUALITY_SUFFIX removed — edge function handles this

  // Apply cleanup
  prompt = cleanupPrompt(prompt);

  // Append camera directive
  const camera = resolveCameraDirective(scene);
  if (camera && !prompt.includes('lens at')) {
    prompt += ' ' + camera;
  }

  // Auto-inject outfit directive if template forgot {{outfitDirective}}
  // Priority: scene.outfitHint > user-provided outfitConfig/legacy outfit fields
  // Position: insert EARLY (right after product anchor) so scene direction at the
  // end of the prompt keeps priority over wardrobe spec.
  // Phrasing: scene-subordinate wardrobe note, never a styling brief.
  if (!(template || '').includes('{{outfitDirective}}')) {
    const sceneNeedsPerson =
      (scene.triggerBlocks || []).includes('personDetails') ||
      (scene.triggerBlocks || []).includes('actionDetails') ||
      !!scene.outfitHint;

    if (sceneNeedsPerson) {
      let injectedNote = '';
      const resolvedHint = resolveOutfitHintText(scene, details, product.title);
      if (resolvedHint && !prompt.includes(resolvedHint)) {
        let hint = resolvedHint;
        if (details.customOutfitNote) hint += ` ${details.customOutfitNote}`;
        injectedNote = `WARDROBE NOTE (subordinate to scene direction — do NOT alter scene mood, lighting, pose, framing, or color palette): ${hint} Outfit colors are wardrobe accents only; the overall image color story, lighting, and composition are set by the scene direction.`;
      } else if (!resolvedHint) {
        // No scene hint — fall back to user-selected outfit (structured or legacy)
        const hasUserOutfit =
          !!details.outfitConfig ||
          !!details.outfitTop ||
          !!details.outfitBottom ||
          !!details.outfitShoes ||
          !!details.outfitAccessories;
        if (hasUserOutfit) {
          const directive = defaultOutfitDirective(
            analysis?.category,
            details,
            (details as any).modelGender,
            analysis?.garmentType
          );
          if (directive && !prompt.includes(directive)) {
            injectedNote = `WARDROBE NOTE (subordinate to scene direction — do NOT alter scene mood, lighting, pose, framing, or color palette): ${directive} Outfit colors are wardrobe accents only; the overall image color story, lighting, and composition are set by the scene direction below.`;
          }
        }
      }

      if (injectedNote) {
        // Insert RIGHT AFTER the product anchor block so scene direction keeps the last word.
        // Anchor: prefer end of [PRODUCT]…sentence, then {{personDirective}} marker, else after first sentence.
        const productAnchorMatch = prompt.match(/\[PRODUCT\][^.]*\.\s*/);
        if (productAnchorMatch && productAnchorMatch.index !== undefined) {
          const insertAt = productAnchorMatch.index + productAnchorMatch[0].length;
          prompt = prompt.slice(0, insertAt) + injectedNote + ' ' + prompt.slice(insertAt);
        } else {
          const firstSentenceEnd = prompt.indexOf('. ');
          if (firstSentenceEnd > 0 && firstSentenceEnd < 400) {
            prompt = prompt.slice(0, firstSentenceEnd + 2) + injectedNote + ' ' + prompt.slice(firstSentenceEnd + 2);
          } else {
            // Last-resort fallback: prepend so scene text still follows
            prompt = injectedNote + ' ' + prompt;
          }
        }
      }
    }
  }

  // Append negative prompt
  const negatives = buildNegativePrompt(scene, !!bgHexForReinforcement);
  prompt += ' ' + negatives;

  // Append brand logo text directive if present — skip if template already used {{brandLogoText}}
  if (details.brandLogoText && scene.triggerBlocks?.includes('brandLogoOverlay') && !(template || '').includes('{{brandLogoText}}')) {
    prompt += ` BRAND TEXT DIRECTIVE: Display the following brand text prominently and legibly in the scene: "${details.brandLogoText}". Render it with accurate typography matching luxury/premium brand standards.`;
  }

  // Scene reference directive — when active, instruct AI to replicate the reference composition
  if (scene.useSceneReference && scene.previewUrl) {
    prompt += ` SCENE REFERENCE — Replicate the exact composition, camera angle, lighting setup, and environment from the provided scene reference image. Replace only the product with ${product.title} (${analysis?.category || 'product'}). Maintain identical framing, perspective, and overall styling.`;
  }

  // Append custom note at the end
  if (details.customNote && !prompt.includes(details.customNote)) {
    prompt += ' ' + details.customNote;
  }

  return cleanupPrompt(prompt);
}
