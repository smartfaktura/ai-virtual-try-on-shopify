/**
 * Category-aware product specification fields.
 * Each category maps to a set of dimension/detail inputs shown in Step 3.
 * The "notes" free-text field is always appended automatically.
 */

export interface SpecField {
  key: string;          // unique within category group
  label: string;        // UI label
  placeholder: string;  // input placeholder
  type: 'text' | 'select';
  options?: string[];   // for select type
  unit?: string;        // e.g. "cm", "mm"
  half?: boolean;       // render at 50% width
}

export interface CategorySpecConfig {
  /** Human-readable group label */
  groupLabel: string;
  /** Fields specific to this category */
  fields: SpecField[];
}

// ── Field presets ──

const DIMENSION_LWH: SpecField[] = [
  { key: 'length', label: 'Length', placeholder: 'e.g. 180', type: 'text', unit: 'cm', half: true },
  { key: 'width',  label: 'Width',  placeholder: 'e.g. 80',  type: 'text', unit: 'cm', half: true },
  { key: 'height', label: 'Height', placeholder: 'e.g. 75',  type: 'text', unit: 'cm', half: true },
];

const DIMENSION_WHD: SpecField[] = [
  { key: 'width',  label: 'Width',  placeholder: 'e.g. 30', type: 'text', unit: 'cm', half: true },
  { key: 'height', label: 'Height', placeholder: 'e.g. 25', type: 'text', unit: 'cm', half: true },
  { key: 'depth',  label: 'Depth',  placeholder: 'e.g. 12', type: 'text', unit: 'cm', half: true },
];

// ── Category configs ──

const FURNITURE: CategorySpecConfig = {
  groupLabel: 'Furniture Dimensions',
  fields: [
    ...DIMENSION_LWH,
    { key: 'seating', label: 'Seating capacity', placeholder: 'e.g. 4', type: 'text', half: true },
  ],
};

const GARMENTS: CategorySpecConfig = {
  groupLabel: 'Garment Details',
  fields: [
    { key: 'size', label: 'Size', placeholder: 'Select size', type: 'select', options: ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'], half: true },
    { key: 'fit', label: 'Fit', placeholder: 'Select fit', type: 'select', options: ['Slim', 'Regular', 'Relaxed', 'Oversized', 'Cropped'], half: true },
    { key: 'garmentLength', label: 'Length', placeholder: 'Select length', type: 'select', options: ['Cropped', 'Regular', 'Long', 'Maxi'], half: true },
  ],
};

const FOOTWEAR: CategorySpecConfig = {
  groupLabel: 'Shoe Details',
  fields: [
    { key: 'shoeSize', label: 'Size (EU)', placeholder: 'e.g. 42', type: 'text', half: true },
    { key: 'heelHeight', label: 'Heel height', placeholder: 'e.g. 3', type: 'text', unit: 'cm', half: true },
  ],
};

const BOOTS: CategorySpecConfig = {
  groupLabel: 'Boot Details',
  fields: [
    { key: 'shoeSize', label: 'Size (EU)', placeholder: 'e.g. 42', type: 'text', half: true },
    { key: 'heelHeight', label: 'Heel height', placeholder: 'e.g. 5', type: 'text', unit: 'cm', half: true },
    { key: 'shaftHeight', label: 'Shaft height', placeholder: 'e.g. 20', type: 'text', unit: 'cm', half: true },
  ],
};

const HIGH_HEELS: CategorySpecConfig = {
  groupLabel: 'Heel Details',
  fields: [
    { key: 'shoeSize', label: 'Size (EU)', placeholder: 'e.g. 38', type: 'text', half: true },
    { key: 'heelHeight', label: 'Heel height', placeholder: 'e.g. 10', type: 'text', unit: 'cm', half: true },
    { key: 'heelType', label: 'Heel type', placeholder: 'Select type', type: 'select', options: ['Stiletto', 'Block', 'Kitten', 'Wedge', 'Platform'], half: true },
  ],
};

const BAGS: CategorySpecConfig = {
  groupLabel: 'Bag Dimensions',
  fields: [
    ...DIMENSION_WHD,
    { key: 'strapLength', label: 'Strap length', placeholder: 'e.g. 60', type: 'text', unit: 'cm', half: true },
  ],
};

const WATCHES: CategorySpecConfig = {
  groupLabel: 'Watch Specifications',
  fields: [
    { key: 'caseDiameter', label: 'Case diameter', placeholder: 'e.g. 40', type: 'text', unit: 'mm', half: true },
    { key: 'bandWidth', label: 'Band width', placeholder: 'e.g. 20', type: 'text', unit: 'mm', half: true },
    { key: 'caseThickness', label: 'Case thickness', placeholder: 'e.g. 12', type: 'text', unit: 'mm', half: true },
  ],
};

const JEWELRY_NECKLACE: CategorySpecConfig = {
  groupLabel: 'Necklace Details',
  fields: [
    { key: 'chainLength', label: 'Chain length', placeholder: 'e.g. 45', type: 'text', unit: 'cm', half: true },
    { key: 'pendantSize', label: 'Pendant size', placeholder: 'e.g. 2x1.5', type: 'text', unit: 'cm', half: true },
  ],
};

const JEWELRY_RING: CategorySpecConfig = {
  groupLabel: 'Ring Details',
  fields: [
    { key: 'ringSize', label: 'Ring size', placeholder: 'e.g. 7 or 17mm', type: 'text', half: true },
    { key: 'stoneSize', label: 'Stone size', placeholder: 'e.g. 6', type: 'text', unit: 'mm', half: true },
    { key: 'bandWidth', label: 'Band width', placeholder: 'e.g. 3', type: 'text', unit: 'mm', half: true },
  ],
};

const JEWELRY_BRACELET: CategorySpecConfig = {
  groupLabel: 'Bracelet Details',
  fields: [
    { key: 'braceletLength', label: 'Length', placeholder: 'e.g. 18', type: 'text', unit: 'cm', half: true },
    { key: 'braceletWidth', label: 'Width', placeholder: 'e.g. 8', type: 'text', unit: 'mm', half: true },
  ],
};

const JEWELRY_EARRING: CategorySpecConfig = {
  groupLabel: 'Earring Details',
  fields: [
    { key: 'earringDrop', label: 'Drop length', placeholder: 'e.g. 4', type: 'text', unit: 'cm', half: true },
    { key: 'earringWidth', label: 'Width', placeholder: 'e.g. 1.5', type: 'text', unit: 'cm', half: true },
  ],
};

const EYEWEAR: CategorySpecConfig = {
  groupLabel: 'Eyewear Measurements',
  fields: [
    { key: 'lensWidth', label: 'Lens width', placeholder: 'e.g. 52', type: 'text', unit: 'mm', half: true },
    { key: 'bridgeWidth', label: 'Bridge width', placeholder: 'e.g. 18', type: 'text', unit: 'mm', half: true },
    { key: 'templeLength', label: 'Temple length', placeholder: 'e.g. 140', type: 'text', unit: 'mm', half: true },
  ],
};

const FRAGRANCE: CategorySpecConfig = {
  groupLabel: 'Bottle Specifications',
  fields: [
    { key: 'volume', label: 'Volume', placeholder: 'e.g. 50', type: 'text', unit: 'ml', half: true },
    { key: 'bottleHeight', label: 'Bottle height', placeholder: 'e.g. 15', type: 'text', unit: 'cm', half: true },
  ],
};

const BEAUTY: CategorySpecConfig = {
  groupLabel: 'Product Specifications',
  fields: [
    { key: 'volume', label: 'Volume/Weight', placeholder: 'e.g. 30ml or 50g', type: 'text', half: true },
    { key: 'containerType', label: 'Container type', placeholder: 'e.g. pump bottle', type: 'text', half: true },
  ],
};

const FOOD: CategorySpecConfig = {
  groupLabel: 'Package Specifications',
  fields: [
    { key: 'weightVolume', label: 'Weight/Volume', placeholder: 'e.g. 250g or 500ml', type: 'text', half: true },
    { key: 'packageWidth', label: 'Package width', placeholder: 'e.g. 15', type: 'text', unit: 'cm', half: true },
    { key: 'packageHeight', label: 'Package height', placeholder: 'e.g. 20', type: 'text', unit: 'cm', half: true },
  ],
};

const HOME_DECOR: CategorySpecConfig = {
  groupLabel: 'Dimensions',
  fields: DIMENSION_WHD,
};

const TECH: CategorySpecConfig = {
  groupLabel: 'Device Specifications',
  fields: [
    { key: 'screenSize', label: 'Screen size', placeholder: 'e.g. 6.1"', type: 'text', half: true },
    { key: 'width', label: 'Width', placeholder: 'e.g. 7.1', type: 'text', unit: 'cm', half: true },
    { key: 'height', label: 'Height', placeholder: 'e.g. 14.6', type: 'text', unit: 'cm', half: true },
    { key: 'depth', label: 'Depth', placeholder: 'e.g. 0.8', type: 'text', unit: 'cm', half: true },
    { key: 'weight', label: 'Weight', placeholder: 'e.g. 174', type: 'text', unit: 'g', half: true },
  ],
};

const SUPPLEMENTS: CategorySpecConfig = {
  groupLabel: 'Product Specifications',
  fields: [
    { key: 'volume', label: 'Container size', placeholder: 'e.g. 60 capsules', type: 'text', half: true },
    { key: 'containerHeight', label: 'Container height', placeholder: 'e.g. 12', type: 'text', unit: 'cm', half: true },
  ],
};

const HATS: CategorySpecConfig = {
  groupLabel: 'Hat Dimensions',
  fields: [
    { key: 'brimWidth', label: 'Brim width', placeholder: 'e.g. 7', type: 'text', unit: 'cm', half: true },
    { key: 'crownHeight', label: 'Crown height', placeholder: 'e.g. 12', type: 'text', unit: 'cm', half: true },
  ],
};

const DEFAULT_SPECS: CategorySpecConfig = {
  groupLabel: 'Product Dimensions',
  fields: DIMENSION_WHD,
};

// ── Category → Config mapping ──
// Uses the same TemplateCategory strings from categoryUtils.ts

const CATEGORY_SPEC_MAP: Record<string, CategorySpecConfig> = {
  // Furniture
  'furniture': FURNITURE,

  // Garments
  'garments': GARMENTS,
  'dresses': GARMENTS,
  'hoodies': GARMENTS,
  'jeans': GARMENTS,
  'jackets': GARMENTS,
  'activewear': GARMENTS,
  'swimwear': GARMENTS,
  'lingerie': GARMENTS,
  'kidswear': GARMENTS,

  // Footwear
  'sneakers': FOOTWEAR,
  'shoes': FOOTWEAR,
  'boots': BOOTS,
  'high-heels': HIGH_HEELS,

  // Bags & accessories
  'bags-accessories': BAGS,
  'backpacks': BAGS,
  'wallets-cardholders': { groupLabel: 'Wallet Dimensions', fields: DIMENSION_WHD.slice(0, 2) },
  'belts': { groupLabel: 'Belt Details', fields: [
    { key: 'beltLength', label: 'Length', placeholder: 'e.g. 100', type: 'text', unit: 'cm', half: true },
    { key: 'beltWidth', label: 'Width', placeholder: 'e.g. 3.5', type: 'text', unit: 'cm', half: true },
  ]},
  'scarves': { groupLabel: 'Scarf Dimensions', fields: [
    { key: 'scarfLength', label: 'Length', placeholder: 'e.g. 180', type: 'text', unit: 'cm', half: true },
    { key: 'scarfWidth', label: 'Width', placeholder: 'e.g. 70', type: 'text', unit: 'cm', half: true },
  ]},

  // Watches
  'watches': WATCHES,

  // Jewelry (sub-types)
  'jewellery-necklaces': JEWELRY_NECKLACE,
  'jewellery-rings': JEWELRY_RING,
  'jewellery-bracelets': JEWELRY_BRACELET,
  'jewellery-earrings': JEWELRY_EARRING,

  // Eyewear
  'eyewear': EYEWEAR,

  // Beauty & fragrance
  'fragrance': FRAGRANCE,
  'beauty-skincare': BEAUTY,
  'makeup-lipsticks': BEAUTY,

  // Food & drink
  'food': FOOD,
  'beverages': FOOD,

  // Home
  'home-decor': HOME_DECOR,

  // Tech
  'tech-devices': TECH,

  // Supplements
  'supplements-wellness': SUPPLEMENTS,

  // Hats (uncommon but mentioned)
  'hats-small': HATS,
};

/**
 * Get spec fields for a product's category.
 * Falls back to generic WHD if category unknown.
 */
export function getSpecFieldsForCategory(category: string | undefined | null): CategorySpecConfig {
  if (!category) return DEFAULT_SPECS;
  return CATEGORY_SPEC_MAP[category] || DEFAULT_SPECS;
}

/**
 * Build a human-readable dimensions string from spec values.
 * Used both for DB persistence and prompt injection.
 */
export function buildDimensionsString(
  specs: Record<string, string>,
  config: CategorySpecConfig,
): string {
  const parts: string[] = [];
  for (const field of config.fields) {
    const val = specs[field.key]?.trim();
    if (!val) continue;
    parts.push(`${field.label}: ${val}${field.unit ? field.unit : ''}`);
  }
  return parts.join(', ');
}

/**
 * Build a prompt-friendly specification line from specs + notes.
 */
export function buildSpecsPromptLine(
  specs: Record<string, string> | undefined,
  notes: string | undefined,
  config: CategorySpecConfig,
): string {
  const parts: string[] = [];
  if (specs) {
    const dimStr = buildDimensionsString(specs, config);
    if (dimStr) parts.push(dimStr);
  }
  if (notes?.trim()) parts.push(notes.trim());
  if (parts.length === 0) return '';
  return `Product specifications: ${parts.join('. ')}.`;
}
