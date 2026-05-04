/**
 * Category-aware product specification fields with dropdown options.
 */

export function sanitizeSpecInput(val: string, maxLen = 500): string {
  return val.replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, maxLen);
}

// ── SpecField: each field is either a dropdown select or a text input ──

export type UnitSystem = 'metric' | 'imperial';

export interface SpecField {
  key: string;
  label: string;
  type: 'select' | 'input';
  options?: string[];
  optionsImperial?: string[];
  placeholder?: string;
  placeholderImperial?: string;
  unit?: string;
}

/** Map metric unit to imperial equivalent */
export function getDisplayUnit(metricUnit: string | undefined, system: UnitSystem): string | undefined {
  if (!metricUnit || system === 'metric') return metricUnit;
  if (metricUnit === 'cm') return 'in';
  return metricUnit; // mm, g, ml stay the same
}

// ── Category field definitions ──

const CATEGORY_FIELDS: Record<string, SpecField[]> = {
  // ── Apparel ──
  'garments': [
    { key: 'size', label: 'Size', type: 'select', options: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { key: 'fit', label: 'Fit', type: 'select', options: ['Slim', 'Regular', 'Relaxed', 'Oversized', 'Cropped'] },
    { key: 'length', label: 'Length', type: 'select', options: ['Cropped', 'Waist', 'Hip', 'Mid-thigh', 'Knee', 'Full'] },
  ],
  'dresses': [
    { key: 'size', label: 'Size', type: 'select', options: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { key: 'length', label: 'Length', type: 'select', options: ['Mini', 'Above knee', 'Knee', 'Midi', 'Maxi'] },
  ],
  'hoodies': [
    { key: 'size', label: 'Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { key: 'fit', label: 'Fit', type: 'select', options: ['Regular', 'Oversized', 'Cropped', 'Boxy'] },
  ],
  'jeans': [
    { key: 'waist', label: 'Waist', type: 'input', placeholder: '32' },
    { key: 'length', label: 'Length', type: 'input', placeholder: '32' },
    { key: 'fit', label: 'Fit', type: 'select', options: ['Skinny', 'Slim', 'Straight', 'Regular', 'Wide-leg', 'Bootcut', 'Tapered'] },
  ],
  'jackets': [
    { key: 'size', label: 'Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { key: 'length', label: 'Length', type: 'select', options: ['Cropped', 'Hip', 'Mid-thigh', 'Knee'] },
  ],
  'activewear': [
    { key: 'size', label: 'Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  ],
  'swimwear': [
    { key: 'size', label: 'Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL'] },
  ],
  'lingerie': [
    { key: 'size', label: 'Size', type: 'input', placeholder: '34B' },
  ],
  'kidswear': [
    { key: 'age', label: 'Age', type: 'select', options: ['0-3m', '3-6m', '6-12m', '1-2y', '2-3y', '3-4y', '4-5y', '5-6y', '7-8y', '9-10y', '11-12y'] },
  ],

  // ── Footwear ──
  'sneakers': [
    { key: 'height', label: 'Shoe Height', type: 'input', placeholder: '12', placeholderImperial: '5', unit: 'cm' },
    { key: 'widthProfile', label: 'Width', type: 'select', options: ['Narrow', 'Regular', 'Wide'] },
  ],
  'shoes': [
    { key: 'height', label: 'Shoe Height', type: 'input', placeholder: '8', placeholderImperial: '3', unit: 'cm' },
    { key: 'heel', label: 'Heel Height', type: 'input', placeholder: '2', placeholderImperial: '0.8', unit: 'cm' },
    { key: 'widthProfile', label: 'Width', type: 'select', options: ['Narrow', 'Regular', 'Wide'] },
  ],
  'boots': [
    { key: 'height', label: 'Boot Height', type: 'input', placeholder: '25', placeholderImperial: '10', unit: 'cm' },
    { key: 'shaft', label: 'Shaft', type: 'select', options: ['Ankle', 'Mid-calf', 'Knee-high', 'Over-the-knee'] },
    { key: 'heelHeight', label: 'Heel Height', type: 'input', placeholder: '5', placeholderImperial: '2', unit: 'cm' },
  ],
  'high-heels': [
    { key: 'height', label: 'Shoe Height', type: 'input', placeholder: '15', placeholderImperial: '6', unit: 'cm' },
    { key: 'heelHeight', label: 'Heel Height', type: 'input', placeholder: '10', placeholderImperial: '4', unit: 'cm' },
  ],

  // ── Bags ──
  'bags-accessories': [
    { key: 'width', label: 'Width', type: 'input', placeholder: '30', placeholderImperial: '12', unit: 'cm' },
    { key: 'height', label: 'Height', type: 'input', placeholder: '25', placeholderImperial: '10', unit: 'cm' },
    { key: 'depth', label: 'Depth', type: 'input', placeholder: '12', placeholderImperial: '5', unit: 'cm' },
  ],
  'backpacks': [
    { key: 'height', label: 'Height', type: 'input', placeholder: '45', placeholderImperial: '18', unit: 'cm' },
    { key: 'width', label: 'Width', type: 'input', placeholder: '30', placeholderImperial: '12', unit: 'cm' },
    { key: 'depth', label: 'Depth', type: 'input', placeholder: '15', placeholderImperial: '6', unit: 'cm' },
  ],
  'wallets-cardholders': [
    { key: 'width', label: 'Width', type: 'input', placeholder: '11', placeholderImperial: '4.3', unit: 'cm' },
    { key: 'height', label: 'Height', type: 'input', placeholder: '8', placeholderImperial: '3', unit: 'cm' },
  ],

  // ── Accessories ──
  'belts': [
    { key: 'length', label: 'Length', type: 'input', placeholder: '100', placeholderImperial: '40', unit: 'cm' },
    { key: 'width', label: 'Width', type: 'input', placeholder: '3.5', placeholderImperial: '1.4', unit: 'cm' },
  ],
  'scarves': [
    { key: 'length', label: 'Length', type: 'input', placeholder: '180', placeholderImperial: '71', unit: 'cm' },
    { key: 'width', label: 'Width', type: 'input', placeholder: '70', placeholderImperial: '28', unit: 'cm' },
  ],
  'hats-small': [
    { key: 'circumference', label: 'Circumference', type: 'input', placeholder: '58', placeholderImperial: '23', unit: 'cm' },
  ],
  'eyewear': [
    { key: 'lens', label: 'Lens Width', type: 'input', placeholder: '52', unit: 'mm' },
    { key: 'bridge', label: 'Bridge', type: 'input', placeholder: '18', unit: 'mm' },
    { key: 'temple', label: 'Temple', type: 'input', placeholder: '140', unit: 'mm' },
  ],

  // ── Watches ──
  'watches': [
    { key: 'case', label: 'Case Diameter', type: 'input', placeholder: '40', unit: 'mm' },
  ],

  // ── Jewelry ──
  'jewellery-necklaces': [
    { key: 'chain', label: 'Chain Length', type: 'input', placeholder: '45', placeholderImperial: '18', unit: 'cm' },
    { key: 'pendantSize', label: 'Pendant Size', type: 'input', placeholder: '2×1.5', placeholderImperial: '0.8×0.6', unit: 'cm' },
    { key: 'pendantThickness', label: 'Pendant Thickness', type: 'input', placeholder: '5', unit: 'mm' },
  ],
  'jewellery-rings': [
    { key: 'ringSize', label: 'Ring Size', type: 'input', placeholder: '7' },
    { key: 'bandWidth', label: 'Band Width', type: 'input', placeholder: '3', unit: 'mm' },
    { key: 'stoneSize', label: 'Stone Size', type: 'input', placeholder: '6', unit: 'mm' },
  ],
  'jewellery-bracelets': [
    { key: 'length', label: 'Length', type: 'input', placeholder: '18', placeholderImperial: '7', unit: 'cm' },
    { key: 'width', label: 'Width', type: 'input', placeholder: '8', unit: 'mm' },
  ],
  'jewellery-earrings': [
    { key: 'drop', label: 'Drop Length', type: 'input', placeholder: '4', placeholderImperial: '1.6', unit: 'cm' },
    { key: 'width', label: 'Width', type: 'input', placeholder: '1.5', placeholderImperial: '0.6', unit: 'cm' },
  ],

  // ── Fragrance ──
  'fragrance': [
    { key: 'volume', label: 'Volume', type: 'select', options: ['5ml', '10ml', '30ml', '50ml', '75ml', '100ml', '150ml', '200ml'] },
    { key: 'bottleHeight', label: 'Bottle Height', type: 'input', placeholder: '15', placeholderImperial: '6', unit: 'cm' },
  ],

  // ── Beauty ──
  'beauty-skincare': [
    { key: 'volume', label: 'Volume', type: 'select', options: ['5ml', '10ml', '15ml', '30ml', '50ml', '75ml', '100ml', '200ml'] },
    { key: 'height', label: 'Container Height', type: 'input', placeholder: '15', placeholderImperial: '6', unit: 'cm' },
  ],
  'makeup-lipsticks': [
    { key: 'height', label: 'Height', type: 'input', placeholder: '8', placeholderImperial: '3', unit: 'cm' },
  ],

  // ── Food & Beverages ──
  'food': [
    { key: 'weight', label: 'Weight', type: 'input', placeholder: '250', unit: 'g' },
    { key: 'packageSize', label: 'Package Size', type: 'input', placeholder: '15×20', placeholderImperial: '6×8', unit: 'cm' },
  ],
  'beverages': [
    { key: 'volume', label: 'Volume', type: 'select', options: ['200ml', '250ml', '330ml', '350ml', '500ml', '750ml', '1L'] },
    { key: 'height', label: 'Container Height', type: 'input', placeholder: '20', placeholderImperial: '8', unit: 'cm' },
  ],

  // ── Home & Decor ──
  'home-decor': [
    { key: 'width', label: 'Width', type: 'input', placeholder: '30', placeholderImperial: '12', unit: 'cm' },
    { key: 'height', label: 'Height', type: 'input', placeholder: '25', placeholderImperial: '10', unit: 'cm' },
    { key: 'depth', label: 'Depth', type: 'input', placeholder: '12', placeholderImperial: '5', unit: 'cm' },
  ],

  // ── Furniture ──
  'furniture': [
    { key: 'furnitureType', label: 'Type', type: 'select', options: ['Chair', 'Armchair', 'Sofa', 'Coffee Table', 'Dining Table', 'Desk', 'Shelf', 'Cabinet', 'Bed', 'Bench', 'Stool', 'Other'] },
    { key: 'width', label: 'Width', type: 'input', placeholder: '180', placeholderImperial: '71', unit: 'cm' },
    { key: 'depth', label: 'Depth', type: 'input', placeholder: '80', placeholderImperial: '31', unit: 'cm' },
    { key: 'height', label: 'Height', type: 'input', placeholder: '75', placeholderImperial: '30', unit: 'cm' },
  ],

  // ── Tech ──
  'tech-devices': [
    { key: 'dimensions', label: 'Dimensions', type: 'input', placeholder: '14.6×7.1×0.8cm', placeholderImperial: '5.7×2.8×0.3in' },
    { key: 'screen', label: 'Screen', type: 'input', placeholder: '6.1"' },
  ],

  // ── Supplements ──
  'supplements-wellness': [
    { key: 'containerHeight', label: 'Container Height', type: 'input', placeholder: '12', placeholderImperial: '5', unit: 'cm' },
    { key: 'quantity', label: 'Quantity', type: 'input', placeholder: '60 capsules' },
  ],

  // ── Pet Accessories ──
  'pet-accessories': [
    { key: 'length', label: 'Length', type: 'input', placeholder: '150', placeholderImperial: '60', unit: 'cm' },
    { key: 'width', label: 'Width', type: 'input', placeholder: '2', placeholderImperial: '0.8', unit: 'cm' },
  ],
};

const DEFAULT_FIELDS: SpecField[] = [
  { key: 'width', label: 'Width', type: 'input', placeholder: '30', placeholderImperial: '12', unit: 'cm' },
  { key: 'height', label: 'Height', type: 'input', placeholder: '20', placeholderImperial: '8', unit: 'cm' },
  { key: 'depth', label: 'Depth', type: 'input', placeholder: '10', placeholderImperial: '4', unit: 'cm' },
];

export function getCategoryFields(category: string | undefined | null): SpecField[] {
  if (!category) return DEFAULT_FIELDS;
  return CATEGORY_FIELDS[category] || DEFAULT_FIELDS;
}

const APPAREL_CATEGORIES = new Set([
  'garments', 'dresses', 'hoodies', 'jeans', 'jackets', 'activewear',
  'swimwear', 'lingerie', 'kidswear',
]);

export function isApparelCategory(category: string | undefined | null): boolean {
  return !!category && APPAREL_CATEGORIES.has(category);
}

// ── Category labels ──

const CATEGORY_LABELS: Record<string, string> = {
  'furniture': 'Furniture',
  'garments': 'Garment', 'dresses': 'Dress', 'hoodies': 'Hoodie',
  'jeans': 'Jeans', 'jackets': 'Jacket', 'activewear': 'Activewear',
  'swimwear': 'Swimwear', 'lingerie': 'Lingerie', 'kidswear': 'Kidswear',
  'sneakers': 'Sneakers', 'shoes': 'Shoes', 'boots': 'Boots', 'high-heels': 'Heels',
  'bags-accessories': 'Bag', 'backpacks': 'Backpack',
  'wallets-cardholders': 'Wallet', 'belts': 'Belt', 'scarves': 'Scarf',
  'hats-small': 'Hat', 'watches': 'Watch',
  'jewellery-necklaces': 'Necklace', 'jewellery-rings': 'Ring',
  'jewellery-bracelets': 'Bracelet', 'jewellery-earrings': 'Earring',
  'eyewear': 'Eyewear', 'fragrance': 'Fragrance',
  'beauty-skincare': 'Skincare', 'makeup-lipsticks': 'Makeup',
  'food': 'Food', 'beverages': 'Beverage',
  'home-decor': 'Home Décor', 'tech-devices': 'Tech Device',
  'supplements-wellness': 'Supplement',
  'pet-accessories': 'Pet Accessory',
  'other': 'Other',
};

/** All categories as sorted { value, label } pairs for dropdowns */
export const ALL_CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS)
  .map(([value, label]) => ({ value, label }))
  .sort((a, b) => a.label.localeCompare(b.label));

export function getCategoryLabel(category: string | undefined | null): string {
  if (!category) return 'Product';
  return CATEGORY_LABELS[category] || 'Product';
}

// Legacy exports kept for backward compatibility
export function getCategoryPlaceholder(category: string | undefined | null): string {
  const fields = getCategoryFields(category);
  return fields.map(f => f.label).join(', ');
}

export function getCategoryGuide(category: string | undefined | null) {
  return { dimensions: [], extras: [] };
}

export function getNotesPlaceholder(): string {
  return 'Any additional details about your product…';
}

export function buildSpecsPromptLine(specsText: string | undefined): string {
  if (!specsText) return '';
  return sanitizeSpecInput(specsText, 500);
}
