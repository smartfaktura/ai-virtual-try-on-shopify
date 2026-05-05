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
  type: 'select' | 'input' | 'comboInput';
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
    { key: 'waistHeight', label: 'Waist Rise', type: 'select', options: ['Low-rise', 'Mid-rise', 'High-rise'] },
    { key: 'hemLength', label: 'Hem Length', type: 'select', options: ['Cropped (ankle)', 'Regular', 'Full length', 'Extra long'] },
    { key: 'fit', label: 'Fit', type: 'select', options: ['Skinny', 'Slim', 'Straight', 'Regular', 'Wide-leg', 'Bootcut', 'Tapered'] },
  ],
  'jackets': [
    { key: 'size', label: 'Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { key: 'length', label: 'Length', type: 'select', options: ['Cropped', 'Hip', 'Mid-thigh', 'Knee'] },
  ],
  'activewear': [
    { key: 'style', label: 'Style', type: 'select', options: ['Leggings', 'Shorts', 'Sports bra', 'Tank top', 'Jacket', 'Set', 'Other'] },
    { key: 'fit', label: 'Fit', type: 'select', options: ['Compression', 'Slim', 'Regular', 'Loose'] },
  ],
  'swimwear': [
    { key: 'style', label: 'Style', type: 'select', options: ['Bikini', 'One-piece', 'Tankini', 'Swim trunks', 'Board shorts', 'Coverup', 'Rash guard'] },
    { key: 'coverage', label: 'Coverage', type: 'select', options: ['Minimal', 'Moderate', 'Full'] },
    { key: 'cut', label: 'Cut', type: 'select', options: ['High-cut', 'Classic', 'Brazilian', 'Boy-short', 'String'] },
  ],
  'lingerie': [
    { key: 'style', label: 'Style', type: 'select', options: ['Bra', 'Bralette', 'Bodysuit', 'Slip', 'Corset', 'Set', 'Robe'] },
    { key: 'coverage', label: 'Coverage', type: 'select', options: ['Sheer', 'Light', 'Full'] },
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
    { key: 'bagType', label: 'Type', type: 'select', options: ['Tote', 'Shoulder', 'Crossbody', 'Clutch', 'Duffel', 'Briefcase', 'Messenger', 'Hobo', 'Other'] },
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
    { key: 'material', label: 'Material', type: 'select', options: ['Silk', 'Cashmere', 'Wool', 'Cotton', 'Linen', 'Modal', 'Viscose', 'Chiffon', 'Satin', 'Polyester blend'] },
    { key: 'length', label: 'Length', type: 'input', placeholder: '180', placeholderImperial: '71', unit: 'cm' },
    { key: 'width', label: 'Width', type: 'input', placeholder: '70', placeholderImperial: '28', unit: 'cm' },
  ],
  'caps': [
    { key: 'style', label: 'Style', type: 'select', options: ['Baseball', 'Snapback', 'Trucker', 'Dad hat', '5-panel', 'Visor'] },
    { key: 'circumference', label: 'Circumference', type: 'input', placeholder: '58', placeholderImperial: '23', unit: 'cm' },
    { key: 'crownHeight', label: 'Crown Height', type: 'input', placeholder: '10', placeholderImperial: '4', unit: 'cm' },
    { key: 'brimLength', label: 'Brim Length', type: 'input', placeholder: '7', placeholderImperial: '2.8', unit: 'cm' },
    { key: 'brimType', label: 'Brim Type', type: 'select', options: ['Flat', 'Pre-curved', 'Slightly curved'] },
  ],
  'hats': [
    { key: 'style', label: 'Style', type: 'select', options: ['Fedora', 'Panama', 'Bucket', 'Wide brim', 'Cowboy', 'Boater', 'Sun hat'] },
    { key: 'circumference', label: 'Circumference', type: 'input', placeholder: '58', placeholderImperial: '23', unit: 'cm' },
    { key: 'crownHeight', label: 'Crown Height', type: 'input', placeholder: '12', placeholderImperial: '4.7', unit: 'cm' },
    { key: 'brimWidth', label: 'Brim Width', type: 'input', placeholder: '8', placeholderImperial: '3', unit: 'cm' },
    { key: 'brimType', label: 'Brim Type', type: 'select', options: ['Flat / Stiff', 'Slightly curved', 'Floppy / Soft', 'Upturned', 'Snap brim'] },
  ],
  'beanies': [
    { key: 'style', label: 'Style', type: 'select', options: ['Cuffed', 'Slouchy', 'Fisherman', 'Pom-pom', 'Ribbed'] },
    { key: 'circumference', label: 'Circumference', type: 'input', placeholder: '58', placeholderImperial: '23', unit: 'cm' },
    { key: 'height', label: 'Height', type: 'input', placeholder: '22', placeholderImperial: '8.5', unit: 'cm' },
    { key: 'foldCuff', label: 'Cuff', type: 'select', options: ['No cuff', 'Single fold', 'Double fold'] },
  ],
  'eyewear': [
    { key: 'lens', label: 'Lens Width', type: 'input', placeholder: '52', unit: 'mm' },
    { key: 'bridge', label: 'Bridge', type: 'input', placeholder: '18', unit: 'mm' },
    { key: 'temple', label: 'Temple', type: 'input', placeholder: '140', unit: 'mm' },
  ],

  // ── Watches ──
  'watches': [
    { key: 'case', label: 'Case Diameter', type: 'input', placeholder: '40', unit: 'mm' },
    { key: 'caseThickness', label: 'Case Thickness', type: 'input', placeholder: '11', unit: 'mm' },
    { key: 'bandWidth', label: 'Band Width', type: 'input', placeholder: '20', unit: 'mm' },
    { key: 'bandMaterial', label: 'Band Material', type: 'select', options: ['Leather', 'Metal', 'Silicone', 'Fabric', 'Rubber', 'Ceramic'] },
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
    { key: 'volume', label: 'Volume', type: 'comboInput', options: ['5ml', '10ml', '30ml', '50ml', '75ml', '100ml', '150ml', '200ml'], placeholder: '50ml' },
    { key: 'bottleHeight', label: 'Bottle Height', type: 'input', placeholder: '15', placeholderImperial: '6', unit: 'cm' },
  ],

  // ── Beauty ──
  'beauty-skincare': [
    { key: 'volume', label: 'Volume', type: 'comboInput', options: ['5ml', '10ml', '15ml', '30ml', '50ml', '75ml', '100ml', '200ml'], placeholder: '50ml' },
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
    { key: 'volume', label: 'Volume', type: 'comboInput', options: ['200ml', '250ml', '330ml', '350ml', '500ml', '750ml', '1L', '1.5L', '2L'], placeholder: '330ml' },
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
    { key: 'furnitureType', label: 'Type', type: 'select', options: ['Chair', 'Armchair', 'Sofa', 'Coffee Table', 'Dining Table', 'Side Table', 'Desk', 'Shelf', 'Cabinet', 'Bed', 'Bench', 'Stool', 'Other'] },
    { key: 'width', label: 'Width', type: 'input', placeholder: '180', placeholderImperial: '71', unit: 'cm' },
    { key: 'depth', label: 'Depth', type: 'input', placeholder: '80', placeholderImperial: '31', unit: 'cm' },
    { key: 'height', label: 'Height', type: 'input', placeholder: '75', placeholderImperial: '30', unit: 'cm' },
  ],

  // ── Tech ──
  'tech-devices': [
    { key: 'deviceType', label: 'Type', type: 'select', options: ['Phone', 'Laptop', 'Tablet', 'Headphones', 'Earbuds', 'Speaker', 'Smartwatch', 'Camera', 'Other'] },
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

// ── Conditional fields: extra fields injected based on a parent select value ──
// Key format: "category::parentFieldKey::parentValue"
// These fields are appended after the base fields when the parent value matches.

type ConditionalKey = `${string}::${string}::${string}`;

const CONDITIONAL_FIELDS: Record<ConditionalKey, SpecField[]> = {
  // ── Furniture conditionals on furnitureType ──
  'furniture::furnitureType::Sofa': [
    { key: 'sofaShape', label: 'Shape', type: 'select', options: ['Straight', 'L-shaped', 'U-shaped', 'Curved', 'Sectional'] },
    { key: 'seatingCapacity', label: 'Seating', type: 'select', options: ['2-seater', '3-seater', '4-seater', '5+ seater / Sectional'] },
    { key: 'seatHeight', label: 'Seat Height', type: 'input', placeholder: '45', placeholderImperial: '18', unit: 'cm' },
    { key: 'seatDepth', label: 'Seat Depth', type: 'input', placeholder: '55', placeholderImperial: '22', unit: 'cm' },
  ],
  'furniture::furnitureType::Armchair': [
    { key: 'seatHeight', label: 'Seat Height', type: 'input', placeholder: '45', placeholderImperial: '18', unit: 'cm' },
    { key: 'armHeight', label: 'Arm Height', type: 'input', placeholder: '60', placeholderImperial: '24', unit: 'cm' },
  ],
  'furniture::furnitureType::Chair': [
    { key: 'seatHeight', label: 'Seat Height', type: 'input', placeholder: '45', placeholderImperial: '18', unit: 'cm' },
  ],
  'furniture::furnitureType::Stool': [
    { key: 'seatHeight', label: 'Seat Height', type: 'input', placeholder: '65', placeholderImperial: '26', unit: 'cm' },
  ],
  'furniture::furnitureType::Bench': [
    { key: 'seatHeight', label: 'Seat Height', type: 'input', placeholder: '45', placeholderImperial: '18', unit: 'cm' },
  ],
  'furniture::furnitureType::Bed': [
    { key: 'bedSize', label: 'Bed Size', type: 'select', options: ['Single', 'Double', 'Queen', 'King', 'Super King'] },
    { key: 'headboardHeight', label: 'Headboard Height', type: 'input', placeholder: '120', placeholderImperial: '47', unit: 'cm' },
  ],
  'furniture::furnitureType::Shelf': [
    { key: 'shelves', label: 'Shelves', type: 'input', placeholder: '4' },
  ],
  'furniture::furnitureType::Cabinet': [
    { key: 'shelves', label: 'Shelves / Drawers', type: 'input', placeholder: '3' },
    { key: 'doorStyle', label: 'Doors', type: 'select', options: ['Open', 'Single door', 'Double door', 'Sliding', 'Glass'] },
  ],
  'furniture::furnitureType::Desk': [
    { key: 'legRoom', label: 'Leg Room Height', type: 'input', placeholder: '65', placeholderImperial: '26', unit: 'cm' },
  ],

  // ── Bag conditionals on bagType ──
  'bags-accessories::bagType::Clutch': [
    // Clutch is flat — remove depth, keep width+height only (base already has them)
  ],
  'bags-accessories::bagType::Duffel': [
    { key: 'strapDrop', label: 'Strap Drop', type: 'input', placeholder: '30', placeholderImperial: '12', unit: 'cm' },
  ],
  'bags-accessories::bagType::Tote': [
    { key: 'strapDrop', label: 'Strap Drop', type: 'input', placeholder: '25', placeholderImperial: '10', unit: 'cm' },
  ],
  'bags-accessories::bagType::Shoulder': [
    { key: 'strapDrop', label: 'Strap Drop', type: 'input', placeholder: '30', placeholderImperial: '12', unit: 'cm' },
  ],
  'bags-accessories::bagType::Crossbody': [
    { key: 'strapDrop', label: 'Strap Drop', type: 'input', placeholder: '55', placeholderImperial: '22', unit: 'cm' },
  ],

  // ── Hat conditionals on style ──
  'hats::style::Cowboy': [
    { key: 'crownCrease', label: 'Crown Crease', type: 'select', options: ['Cattleman', 'Pinch front', 'Gus', 'Open crown'] },
  ],

  // ── Tech conditionals on deviceType ──
  'tech-devices::deviceType::Headphones': [
    { key: 'headphoneType', label: 'Style', type: 'select', options: ['Over-ear', 'On-ear', 'In-ear'] },
  ],
  'tech-devices::deviceType::Earbuds': [
    { key: 'caseSize', label: 'Case Size', type: 'input', placeholder: '5×5×2.5cm', placeholderImperial: '2×2×1in' },
  ],
};

// Fields to HIDE when a specific conditional key is active
const CONDITIONAL_HIDE: Record<ConditionalKey, string[]> = {
  'bags-accessories::bagType::Clutch': ['depth'],
  'hats::style::Bucket': ['brimType'],
  'tech-devices::deviceType::Headphones': ['screen'],
  'tech-devices::deviceType::Earbuds': ['screen'],
  'tech-devices::deviceType::Speaker': ['screen'],
};

/**
 * Get category fields, optionally with conditional fields resolved.
 * Pass current field values to get dynamic sub-fields based on parent selects.
 */
export function getCategoryFields(category: string | undefined | null, fieldValues?: Record<string, string>): SpecField[] {
  if (!category) return DEFAULT_FIELDS;
  const base = CATEGORY_FIELDS[category] || DEFAULT_FIELDS;
  if (!fieldValues) return base;

  // Find which conditional keys match
  const extra: SpecField[] = [];
  const hideKeys = new Set<string>();

  for (const field of base) {
    if (field.type === 'select' && fieldValues[field.key]) {
      const condKey = `${category}::${field.key}::${fieldValues[field.key]}` as ConditionalKey;
      const condFields = CONDITIONAL_FIELDS[condKey];
      if (condFields) extra.push(...condFields);
      const condHide = CONDITIONAL_HIDE[condKey];
      if (condHide) condHide.forEach(k => hideKeys.add(k));
    }
  }

  const filtered = hideKeys.size > 0 ? base.filter(f => !hideKeys.has(f.key)) : base;
  if (extra.length === 0) return filtered;

  // Insert conditional fields right after the parent select
  const result = [...filtered];
  for (const ef of extra) {
    if (!result.some(f => f.key === ef.key)) {
      result.push(ef);
    }
  }
  return result;
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
  'caps': 'Cap', 'hats': 'Hat', 'beanies': 'Beanie', 'watches': 'Watch',
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
