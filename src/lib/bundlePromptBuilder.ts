/**
 * Bundle Visuals Prompt Builder
 *
 * Constructs generation prompts for multi-product bundle compositions (gift sets, kits, curated collections).
 * Enforces realistic relative scale between products and supports multiple arrangement styles.
 */

import type { ProductImageScene, ProductAnalysis } from '@/components/app/product-images/types';

// ── Size class system for realistic proportions ──
const SIZE_CLASS_RANGES: Record<string, { label: string; cmRange: string; examples: string }> = {
  'very-small': { label: 'Very Small', cmRange: '3-8cm', examples: 'jewelry, rings, earbuds, lip balm' },
  'small':      { label: 'Small', cmRange: '8-20cm', examples: 'perfume bottles, wallets, phones, skincare tubes' },
  'medium':     { label: 'Medium', cmRange: '20-40cm', examples: 'shoes, handbags, books, tablets' },
  'large':      { label: 'Large', cmRange: '40-80cm', examples: 'backpacks, guitars, laptops' },
  'extra-large':{ label: 'Extra Large', cmRange: '80cm+', examples: 'furniture, luggage, large electronics' },
};

// ── Category → default size class mapping ──
const CATEGORY_SIZE_MAP: Record<string, string> = {
  'jewelry': 'very-small', 'jewellery-rings': 'very-small', 'jewellery-earrings': 'very-small',
  'jewellery-necklaces': 'very-small', 'jewellery-bracelets': 'very-small',
  'lip-care': 'very-small', 'earbuds': 'very-small',
  'perfume': 'small', 'fragrance': 'small', 'skincare': 'small', 'cosmetics': 'small',
  'candle': 'small', 'wallet': 'small', 'phone-case': 'small', 'sunglasses': 'small',
  'eyewear': 'small', 'watch': 'small',
  'shoes': 'medium', 'sneakers': 'medium', 'boots': 'medium', 'handbag': 'medium',
  'bag': 'medium', 'book': 'medium', 'hat': 'medium', 'clothing': 'medium',
  'apparel-tops': 'medium', 'apparel-bottoms': 'medium', 'apparel-dresses': 'medium',
  'backpack': 'large', 'laptop': 'large', 'guitar': 'large',
  'furniture': 'extra-large', 'luggage': 'extra-large', 'chair': 'extra-large',
  'dining-table': 'extra-large',
};

function inferSizeClass(category?: string, dimensions?: string): string {
  if (dimensions) {
    const nums = dimensions.match(/(\d+)\s*(?:cm|mm|in)/gi);
    if (nums?.length) {
      const maxDim = Math.max(...nums.map(n => {
        const val = parseFloat(n);
        return n.toLowerCase().includes('mm') ? val / 10 : n.toLowerCase().includes('in') ? val * 2.54 : val;
      }));
      if (maxDim < 8) return 'very-small';
      if (maxDim < 20) return 'small';
      if (maxDim < 40) return 'medium';
      if (maxDim < 80) return 'large';
      return 'extra-large';
    }
  }
  if (category) {
    const normalized = category.toLowerCase().replace(/\s+/g, '-');
    if (CATEGORY_SIZE_MAP[normalized]) return CATEGORY_SIZE_MAP[normalized];
    for (const [key, val] of Object.entries(CATEGORY_SIZE_MAP)) {
      if (normalized.includes(key) || key.includes(normalized)) return val;
    }
  }
  return 'medium';
}

// ── Arrangement directives ──
export type ArrangementStyle = 'grid' | 'cascade' | 'nested' | 'radial' | 'natural';

const ARRANGEMENT_DIRECTIVES: Record<ArrangementStyle, string> = {
  grid: 'ARRANGEMENT: Place all products in a clean, evenly-spaced grid layout. The HERO product occupies the center cell and is rendered 15-20% larger than other products. Maintain equal gutters between items. Align to invisible grid lines for a structured, catalog-ready composition.',
  cascade: 'ARRANGEMENT: Arrange products in a diagonal cascade from upper-left to lower-right, largest to smallest. Each product overlaps the previous by 5-10% of its edge. The HERO product sits at the top of the cascade at full prominence. Create a flowing, editorial waterfall effect.',
  nested: 'ARRANGEMENT: Group all products tightly together as a curated collection. Products may gently touch or overlap edges by 3-5%. The HERO product is centered and most prominent. Create an intimate, gift-set composition that feels intentionally styled.',
  radial: 'ARRANGEMENT: Place the HERO product at the exact center of the composition. Arrange all other products in a semi-circle or arc around it at equal distances. Each satellite product faces slightly inward toward the hero. Create a spotlight-on-hero effect.',
  natural: 'ARRANGEMENT: Scatter products naturally as if someone just finished styling them for a photoshoot. The HERO product should be the most prominent and slightly forward. Other products are placed at casual angles with organic spacing. Avoid rigid alignment — aim for editorial lifestyle spontaneity.',
};

export interface BundleProduct {
  title: string;
  productType: string;
  description?: string;
  category?: string;
  dimensions?: string;
  analysis?: ProductAnalysis | null;
  isHero: boolean;
}

export interface BundleBuildOptions {
  products: BundleProduct[];
  scene: ProductImageScene;
  arrangement: ArrangementStyle;
  aspectRatio?: string;
  customNote?: string;
}

export function buildBundlePrompt(options: BundleBuildOptions): string {
  const { products, scene, arrangement, customNote } = options;
  const heroProduct = products.find(p => p.isHero) || products[0];
  const productCount = products.length;

  // ── Build scale calibration block ──
  const sizeLines = products.map((p, i) => {
    const sizeClass = inferSizeClass(p.analysis?.category || p.category || p.productType, p.dimensions);
    const sizeInfo = SIZE_CLASS_RANGES[sizeClass];
    const heroTag = p.isHero ? ' [HERO]' : '';
    return `  - Product ${i + 1}${heroTag}: "${p.title}" (${p.productType}) — ${sizeInfo.label} (${sizeInfo.cmRange})`;
  }).join('\n');

  const scaleBlock = `BUNDLE SCALE CALIBRATION (MANDATORY):
Each product has a real-world size class. Render each at its CORRECT relative scale.
Size classes:
  - Very Small (3-8cm): jewelry, rings, earbuds, lip balm
  - Small (8-20cm): perfume bottles, wallets, phones, skincare tubes
  - Medium (20-40cm): shoes, handbags, books, tablets
  - Large (40-80cm): backpacks, guitars, laptops
  - Extra Large (80cm+): furniture, luggage

Products in this bundle:
${sizeLines}

PROPORTIONAL RULE: A perfume bottle (Small) next to a handbag (Medium) must be ~3x smaller. A lipstick next to a laptop must be ~8x smaller. NEVER render products at equal sizes unless they actually are similar size classes.
SPATIAL ANCHORS: A4 paper = 21×30cm, standard dinner plate = 27cm diameter, doorframe = 210cm.`;

  // ── Product count enforcement ──
  const countBlock = `PRODUCT COUNT ENFORCEMENT (CRITICAL): This image MUST contain EXACTLY ${productCount} distinct, clearly identifiable products. Each product must be separately visible and occupy meaningful space. Missing any product is a generation failure. Do NOT merge, stack obscurely, or hide any product behind another.`;

  // ── Arrangement ──
  const arrangementBlock = ARRANGEMENT_DIRECTIVES[arrangement] || ARRANGEMENT_DIRECTIVES.natural;

  // ── Hero emphasis ──
  const heroBlock = `HERO PRODUCT EMPHASIS: "${heroProduct.title}" is the PRIMARY product. It must command 40-50% of visual attention through: (1) largest rendered size proportional to its real-world scale, (2) most prominent placement, (3) sharpest focus. Other products support the hero — they are clearly visible but secondary in visual weight.`;

  // ── Scene template ──
  const sceneInstruction = scene.promptTemplate || '';

  // ── Product list for AI reference ──
  const productList = products.map((p, i) => {
    const heroTag = p.isHero ? ' (PRIMARY — see [PRODUCT IMAGE 1])' : ` — see [PRODUCT IMAGE ${i + 1}]`;
    return `Product ${i + 1}: "${p.title}" (${p.productType})${p.description ? ` — ${p.description}` : ''}${heroTag}`;
  }).join('\n');

  const productBlock = `BUNDLE COMPOSITION — ${productCount} PRODUCTS:
${productList}`;

  // ── Assemble final prompt ──
  let prompt = [
    `Professional editorial product photography of a curated bundle featuring ${productCount} products.`,
    productBlock,
    sceneInstruction,
    scaleBlock,
    countBlock,
    arrangementBlock,
    heroBlock,
    'ANTI-HALLUCINATION: Do NOT add any products, objects, or items that are not listed above. Show ONLY the specified products plus the scene environment. No extra commercial items.',
    'NO TEXT OR LOGOS: Do not render any text, brand names, logos, watermarks, price tags, or labels anywhere in the image.',
    'PHOTOREALISTIC QUALITY: Shoot as a high-end editorial photograph. Shallow depth of field with products in sharp focus. Professional color grading. No AI artifacts, no plastic textures, no unnatural reflections.',
  ].filter(Boolean).join('\n\n');

  if (customNote) {
    prompt += `\n\nCUSTOM DIRECTION: ${customNote}`;
  }

  // ── Negative prompt ──
  prompt += '\n\nNEGATIVE: No text, no watermarks, no logos, no extra products, no humans unless scene requires it, no AI artifacts, no oversaturated colors, no plastic look, no unrealistic shadows, no lens flare, no sparkle effects.';

  return prompt;
}
