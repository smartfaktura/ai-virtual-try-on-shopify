/**
 * Category-aware product specification fields.
 * Each category maps to a set of dimension/detail inputs shown in Step 3.
 * The "notes" free-text field is always appended automatically.
 */

export type UnitSystem = 'metric' | 'imperial';

export interface SpecField {
  key: string;          // unique within category group
  label: string;        // UI label
  placeholder: string;  // input placeholder
  type: 'text' | 'select';
  options?: string[];   // for select type
  /** Metric unit (shown when metric selected) */
  unit?: string;
  /** Imperial equivalent unit */
  imperialUnit?: string;
  half?: boolean;       // render at 50% width
}

export interface CategorySpecConfig {
  /** Human-readable group label */
  groupLabel: string;
  /** Fields specific to this category */
  fields: SpecField[];
}

/**
 * Resolve the display unit for a field based on the selected unit system.
 */
export function getDisplayUnit(field: SpecField, system: UnitSystem): string | undefined {
  if (system === 'imperial' && field.imperialUnit) return field.imperialUnit;
  return field.unit;
}

/**
 * Sanitize user input: strip control characters, limit length.
 */
export function sanitizeSpecInput(val: string, maxLen = 200): string {
  return val.replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, maxLen);
}

// ── Field presets ──

const DIMENSION_LWH: SpecField[] = [
  { key: 'length', label: 'Length', placeholder: 'e.g. 180', type: 'text', unit: 'cm', imperialUnit: 'in', half: true },
  { key: 'width',  label: 'Width',  placeholder: 'e.g. 80',  type: 'text', unit: 'cm', imperialUnit: 'in', half: true },
  { key: 'height', label: 'Height', placeholder: 'e.g. 75',  type: 'text', unit: 'cm', imperialUnit: 'in', half: true },
];

const DIMENSION_WHD: SpecField[] = [
  { key: 'width',  label: 'Width',  placeholder: 'e.g. 30', type: 'text', unit: 'cm', imperialUnit: 'in', half: true },
  { key: 'height', label: 'Height', placeholder: 'e.g. 25', type: 'text', unit: 'cm', imperialUnit: 'in', half: true },
  { key: 'depth',  label: 'Depth',  placeholder: 'e.g. 12', type: 'text', unit: 'cm', imperialUnit: 'in', half: true },
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
    { key: 'heelHeight', label: 'Heel height', placeholder: 'e.g. 3', type: 'text', unit: 'cm', imperialUnit: 'in', half: true },
  ],
};

const BOOTS: CategorySpecConfig = {
  groupLabel: 'Boot Details',
  fields: [
    { key: 'shoeSize', label: 'Size (EU)', placeholder: 'e.g. 42', type: 'text', half: true },
    { key: 'heelHeight', label: 'Heel height', placeholder: 'e.g. 5', type: 'text', unit: 'cm', imperialUnit: 'in', half: true },
    { key: 'shaftHeight', label: 'Shaft height', placeholder: 'e.g. 20', type: 'text', unit: 'cm', imperialUnit: 'in', half: true },
  ],
};

const HIGH_HEELS: CategorySpecConfig = {
  groupLabel: 'Heel Details',
  fields: [
    { key: 'shoeSize', label: 'Size (EU)', placeholder: 'e.g. 38', type: 'text', half: true },
    { key: 'heelHeight', label: 'Heel height', placeholder: 'e.g. 10', type: 'text', unit: 'cm', imperialUnit: 'in', half: true },
    { key: 'heelType', label: 'Heel type', placeholder: 'Select type', type: 'select', options: ['Stiletto', 'Block', 'Kitten', 'Wedge', 'Platform'], half: true },
  ],
};

const BAGS: CategorySpecConfig = {
  groupLabel: 'Bag Dimensions',
  fields: [
    ...DIMENSION_WHD,
    { key: 'strapLength', label: 'Strap length', placeholder: 'e.g. 60', type: 'text', unit: 'cm', imperialUnit: 'in', half: true },
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
    { key: 'chainLength', label: 'Chain length', placeholder: 'e.g. 45', type: 'text', unit: 'cm', imperialUnit: 'in', half: true },
    { key: 'pendantSize', label: 'Pendant size', placeholder: 'e.g. 2x1.5', type: 'text', unit: 'cm', imperialUnit: 'in', half: true },
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
    { key: 'braceletLength', label: 'Length', placeholder: 'e.g. 18', type: 'text', unit: 'cm', imperialUnit: 'in', half: true },
    { key: 'braceletWidth', label: 'Width', placeholder: 'e.g. 8', type: 'text', unit: 'mm', half: true },
  ],
};

const JEWELRY_EARRING: CategorySpecConfig = {
  groupLabel: 'Earring Details',
  fields: [
    { key: 'earringDrop', label: 'Drop length', placeholder: 'e.g. 4', type: 'text', unit: 'cm', imperialUnit: 'in', half: true },
    { key: 'earringWidth', label: 'Width', placeholder: 'e.g. 1.5', type: 'text', unit: 'cm', imperialUnit: 'in', half: true },
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
    { key: 'volume', label: 'Volume', placeholder: 'e.g. 50', type: 'text', unit: 'ml', imperialUnit: 'fl oz', half: true },
    { key: 'bottleHeight', label: 'Bottle height', placeholder: 'e.g. 15', type: 'text', unit: 'cm', imperialUnit: 'in', half: true },
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
    { key: 'packageWidth', label: 'Package width', placeholder: 'e.g. 15', type: 'text', unit: 'cm', imperialUnit: 'in', half: true },
    { key: 'packageHeight', label: 'Package height', placeholder: 'e.g. 20', type: 'text', unit: 'cm', imperialUnit: 'in', half: true },
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
    { key: 'width', label: 'Width', placeholder: 'e.g. 7.1', type: 'text', unit: 'cm', imperialUnit: 'in', half: true },
    { key: 'height', label: 'Height', placeholder: 'e.g. 14.6', type: 'text', unit: 'cm', imperialUnit: 'in', half: true },
    { key: 'depth', label: 'Depth', placeholder: 'e.g. 0.8', type: 'text', unit: 'cm', imperialUnit: 'in', half: true },
    { key: 'weight', label: 'Weight', placeholder: 'e.g. 174', type: 'text', unit: 'g', imperialUnit: 'oz', half: true },
  ],
};

const SUPPLEMENTS: CategorySpecConfig = {
  groupLabel: 'Product Specifications',
  fields: [
    { key: 'volume', label: 'Container size', placeholder: 'e.g. 60 capsules', type: 'text', half: true },
    { key: 'containerHeight', label: 'Container height', placeholder: 'e.g. 12', type: 'text', unit: 'cm', imperialUnit: 'in', half: true },
  ],
};

const HATS: CategorySpecConfig = {
  groupLabel: 'Hat Dimensions',
  fields: [
    { key: 'brimWidth', label: 'Brim width', placeholder: 'e.g. 7', type: 'text', unit: 'cm', imperialUnit: 'in', half: true },
    { key: 'crownHeight', label: 'Crown height', placeholder: 'e.g. 12', type: 'text', unit: 'cm', imperialUnit: 'in', half: true },
  ],
};

const DEFAULT_SPECS: CategorySpecConfig = {
  groupLabel: 'Product Dimensions',
  fields: DIMENSION_WHD,
};

// ── Category → Config mapping ──

const CATEGORY_SPEC_MAP: Record<string, CategorySpecConfig> = {
  'furniture': FURNITURE,
  'garments': GARMENTS,
  'dresses': GARMENTS,
  'hoodies': GARMENTS,
  'jeans': GARMENTS,
  'jackets': GARMENTS,
  'activewear': GARMENTS,
  'swimwear': GARMENTS,
  'lingerie': GARMENTS,
  'kidswear': GARMENTS,
  'sneakers': FOOTWEAR,
  'shoes': FOOTWEAR,
  'boots': BOOTS,
  'high-heels': HIGH_HEELS,
  'bags-accessories': BAGS,
  'backpacks': BAGS,
  'wallets-cardholders': { groupLabel: 'Wallet Dimensions', fields: DIMENSION_WHD.slice(0, 2) },
  'belts': { groupLabel: 'Belt Details', fields: [
    { key: 'beltLength', label: 'Length', placeholder: 'e.g. 100', type: 'text', unit: 'cm', imperialUnit: 'in', half: true },
    { key: 'beltWidth', label: 'Width', placeholder: 'e.g. 3.5', type: 'text', unit: 'cm', imperialUnit: 'in', half: true },
  ]},
  'scarves': { groupLabel: 'Scarf Dimensions', fields: [
    { key: 'scarfLength', label: 'Length', placeholder: 'e.g. 180', type: 'text', unit: 'cm', imperialUnit: 'in', half: true },
    { key: 'scarfWidth', label: 'Width', placeholder: 'e.g. 70', type: 'text', unit: 'cm', imperialUnit: 'in', half: true },
  ]},
  'watches': WATCHES,
  'jewellery-necklaces': JEWELRY_NECKLACE,
  'jewellery-rings': JEWELRY_RING,
  'jewellery-bracelets': JEWELRY_BRACELET,
  'jewellery-earrings': JEWELRY_EARRING,
  'eyewear': EYEWEAR,
  'fragrance': FRAGRANCE,
  'beauty-skincare': BEAUTY,
  'makeup-lipsticks': BEAUTY,
  'food': FOOD,
  'beverages': FOOD,
  'home-decor': HOME_DECOR,
  'tech-devices': TECH,
  'supplements-wellness': SUPPLEMENTS,
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
  unitSystem: UnitSystem = 'metric',
): string {
  const parts: string[] = [];
  for (const field of config.fields) {
    const val = sanitizeSpecInput(specs[field.key] || '');
    if (!val) continue;
    const unit = getDisplayUnit(field, unitSystem);
    parts.push(`${field.label}: ${val}${unit ? unit : ''}`);
  }
  return parts.join(', ');
}

/**
 * Build a prompt-friendly specification line from specs + notes.
 * Returns the raw content WITHOUT the "Product specifications:" prefix
 * — the caller (prompt builder) adds its own prefix.
 */
export function buildSpecsPromptLine(
  specs: Record<string, string> | undefined,
  notes: string | undefined,
  config: CategorySpecConfig,
  unitSystem: UnitSystem = 'metric',
): string {
  const parts: string[] = [];
  if (specs) {
    const dimStr = buildDimensionsString(specs, config, unitSystem);
    if (dimStr) parts.push(dimStr);
  }
  const cleanNotes = sanitizeSpecInput(notes || '', 500);
  if (cleanNotes) parts.push(cleanNotes);
  if (parts.length === 0) return '';
  return parts.join('. ');
}
