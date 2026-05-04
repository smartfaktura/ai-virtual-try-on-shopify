/**
 * Category-aware product specification fields, guides, and placeholders.
 */

/**
 * Sanitize user input: strip control characters, limit length.
 */
export function sanitizeSpecInput(val: string, maxLen = 500): string {
  return val.replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, maxLen);
}

// ── Structured dimension guides per category ──

export interface DimensionGuide {
  label: string;       // e.g. "Width"
  placeholder: string; // e.g. "180"
  unit?: string;       // e.g. "cm"
}

export interface CategoryGuide {
  dimensions: DimensionGuide[];
  extras: string[];    // Hint chips the user can tap to append
}

const CATEGORY_GUIDES: Record<string, CategoryGuide> = {
  'furniture': {
    dimensions: [
      { label: 'Width', placeholder: '180', unit: 'cm' },
      { label: 'Depth', placeholder: '80', unit: 'cm' },
      { label: 'Height', placeholder: '75', unit: 'cm' },
    ],
    extras: ['Oak wood', 'Matte finish', 'Seats 4', 'Walnut', 'Metal legs'],
  },
  'garments': {
    dimensions: [
      { label: 'Size', placeholder: 'M' },
      { label: 'Length', placeholder: 'mid-thigh' },
    ],
    extras: ['Slim fit', 'Regular fit', 'Oversized', '100% cotton', 'Linen', 'Silk'],
  },
  'dresses': {
    dimensions: [
      { label: 'Size', placeholder: 'S' },
      { label: 'Length', placeholder: 'knee-length' },
    ],
    extras: ['A-line', 'Bodycon', 'Wrap', 'Silk fabric', 'Cotton blend'],
  },
  'hoodies': {
    dimensions: [
      { label: 'Size', placeholder: 'L' },
    ],
    extras: ['Oversized fit', 'Regular fit', 'Drop shoulders', 'Fleece lined', 'Zip-up'],
  },
  'jeans': {
    dimensions: [
      { label: 'Waist', placeholder: '32' },
      { label: 'Length', placeholder: '32' },
    ],
    extras: ['Slim fit', 'Straight', 'Wide-leg', 'Mid-rise', 'High-rise', 'Stretch denim'],
  },
  'jackets': {
    dimensions: [
      { label: 'Size', placeholder: 'M' },
      { label: 'Length', placeholder: 'cropped' },
    ],
    extras: ['Bomber', 'Blazer', 'Parka', 'Denim', 'Nylon shell', 'Leather'],
  },
  'activewear': {
    dimensions: [
      { label: 'Size', placeholder: 'S' },
    ],
    extras: ['Compression fit', 'Relaxed fit', 'High-waist', 'Moisture-wicking', 'Recycled fabric'],
  },
  'swimwear': {
    dimensions: [
      { label: 'Size', placeholder: 'M' },
    ],
    extras: ['High-cut', 'Classic cut', 'Adjustable straps', 'Underwire', 'Ribbed'],
  },
  'lingerie': {
    dimensions: [
      { label: 'Size', placeholder: '34B' },
    ],
    extras: ['Underwire', 'Bralette', 'Lace trim', 'Silk', 'Mesh panel'],
  },
  'kidswear': {
    dimensions: [
      { label: 'Age', placeholder: '4-5' },
    ],
    extras: ['Relaxed fit', 'Organic cotton', 'Stretchy', 'Snap buttons'],
  },
  'sneakers': {
    dimensions: [
      { label: 'EU Size', placeholder: '42' },
      { label: 'US Size', placeholder: '9' },
    ],
    extras: ['Chunky sole', 'Low-top', 'High-top', 'White/grey', 'Mesh upper', 'Leather upper'],
  },
  'shoes': {
    dimensions: [
      { label: 'EU Size', placeholder: '40' },
      { label: 'Heel', placeholder: '2cm' },
    ],
    extras: ['Leather upper', 'Suede', 'Pointed toe', 'Round toe', 'Loafer', 'Derby'],
  },
  'boots': {
    dimensions: [
      { label: 'EU Size', placeholder: '41' },
      { label: 'Shaft Height', placeholder: '20cm' },
      { label: 'Heel', placeholder: '5cm' },
    ],
    extras: ['Chelsea', 'Combat', 'Suede', 'Leather', 'Block heel', 'Lug sole'],
  },
  'high-heels': {
    dimensions: [
      { label: 'EU Size', placeholder: '38' },
      { label: 'Heel Height', placeholder: '10cm' },
    ],
    extras: ['Stiletto', 'Block heel', 'Patent leather', 'Satin', 'Pointed toe', 'Open toe'],
  },
  'bags-accessories': {
    dimensions: [
      { label: 'Width', placeholder: '30', unit: 'cm' },
      { label: 'Height', placeholder: '25', unit: 'cm' },
      { label: 'Depth', placeholder: '12', unit: 'cm' },
    ],
    extras: ['Leather', 'Canvas', 'Crossbody strap', 'Gold hardware', 'Silver hardware'],
  },
  'backpacks': {
    dimensions: [
      { label: 'Height', placeholder: '45', unit: 'cm' },
      { label: 'Width', placeholder: '30', unit: 'cm' },
      { label: 'Depth', placeholder: '15', unit: 'cm' },
    ],
    extras: ['25L capacity', 'Laptop compartment', 'Waterproof', 'Padded straps'],
  },
  'wallets-cardholders': {
    dimensions: [
      { label: 'Width', placeholder: '11', unit: 'cm' },
      { label: 'Height', placeholder: '8', unit: 'cm' },
    ],
    extras: ['Bifold', 'Trifold', '6 card slots', 'Pebbled leather', 'Smooth leather'],
  },
  'belts': {
    dimensions: [
      { label: 'Length', placeholder: '100', unit: 'cm' },
      { label: 'Width', placeholder: '3.5', unit: 'cm' },
    ],
    extras: ['Silver buckle', 'Gold buckle', 'Leather', 'Woven', 'Reversible'],
  },
  'scarves': {
    dimensions: [
      { label: 'Length', placeholder: '180', unit: 'cm' },
      { label: 'Width', placeholder: '70', unit: 'cm' },
    ],
    extras: ['Cashmere', 'Silk', 'Wool', 'Fringed edges', 'Printed'],
  },
  'hats-small': {
    dimensions: [
      { label: 'Brim', placeholder: '7', unit: 'cm' },
      { label: 'Crown', placeholder: '12', unit: 'cm' },
    ],
    extras: ['Wool felt', 'Straw', 'Cotton', 'Fedora', 'Bucket', 'Baseball cap'],
  },
  'watches': {
    dimensions: [
      { label: 'Case', placeholder: '40', unit: 'mm' },
      { label: 'Band Width', placeholder: '20', unit: 'mm' },
      { label: 'Thickness', placeholder: '12', unit: 'mm' },
    ],
    extras: ['Stainless steel', 'Titanium', 'Gold tone', 'Leather band', 'Mesh band'],
  },
  'jewellery-necklaces': {
    dimensions: [
      { label: 'Chain', placeholder: '45', unit: 'cm' },
      { label: 'Pendant', placeholder: '2×1.5', unit: 'cm' },
    ],
    extras: ['18k gold', 'Sterling silver', 'Rose gold', 'Diamond', 'Pearl'],
  },
  'jewellery-rings': {
    dimensions: [
      { label: 'Ring Size', placeholder: '7' },
      { label: 'Band Width', placeholder: '3', unit: 'mm' },
    ],
    extras: ['Gold', 'Silver', 'Rose gold', 'Solitaire', 'Pavé setting'],
  },
  'jewellery-bracelets': {
    dimensions: [
      { label: 'Length', placeholder: '18', unit: 'cm' },
      { label: 'Width', placeholder: '8', unit: 'mm' },
    ],
    extras: ['Sterling silver', 'Gold chain', 'Bangle', 'Cuff', 'Beaded'],
  },
  'jewellery-earrings': {
    dimensions: [
      { label: 'Drop', placeholder: '4', unit: 'cm' },
      { label: 'Width', placeholder: '1.5', unit: 'cm' },
    ],
    extras: ['Stud', 'Drop earring', 'Hoop', 'Crystal', 'Pearl', 'Gold'],
  },
  'eyewear': {
    dimensions: [
      { label: 'Lens', placeholder: '52', unit: 'mm' },
      { label: 'Bridge', placeholder: '18', unit: 'mm' },
      { label: 'Temple', placeholder: '140', unit: 'mm' },
    ],
    extras: ['Acetate frame', 'Metal frame', 'Tortoiseshell', 'Gradient lens', 'Polarized'],
  },
  'fragrance': {
    dimensions: [
      { label: 'Volume', placeholder: '50ml' },
      { label: 'Bottle Height', placeholder: '15', unit: 'cm' },
    ],
    extras: ['Rectangular bottle', 'Round bottle', 'Gold cap', 'Silver cap', 'Frosted glass'],
  },
  'beauty-skincare': {
    dimensions: [
      { label: 'Volume', placeholder: '30ml' },
    ],
    extras: ['Pump bottle', 'Dropper', 'Tube', 'Jar', 'Frosted glass', 'Matte plastic'],
  },
  'makeup-lipsticks': {
    dimensions: [
      { label: 'Weight', placeholder: '3.5g' },
    ],
    extras: ['Twist-up tube', 'Compact', 'Palette', 'Metallic packaging', 'Matte finish'],
  },
  'food': {
    dimensions: [
      { label: 'Weight', placeholder: '250g' },
      { label: 'Package', placeholder: '15×20cm' },
    ],
    extras: ['Kraft paper', 'Glass jar', 'Tin can', 'Cardboard box', 'Vacuum sealed'],
  },
  'beverages': {
    dimensions: [
      { label: 'Volume', placeholder: '330ml' },
    ],
    extras: ['Aluminum can', 'Glass bottle', 'Carton', 'PET bottle', 'Slim can'],
  },
  'home-decor': {
    dimensions: [
      { label: 'Width', placeholder: '30', unit: 'cm' },
      { label: 'Height', placeholder: '25', unit: 'cm' },
      { label: 'Depth', placeholder: '12', unit: 'cm' },
    ],
    extras: ['Ceramic', 'Wood', 'Metal', 'Glass', 'Matte glaze', 'Handmade'],
  },
  'tech-devices': {
    dimensions: [
      { label: 'Screen', placeholder: '6.1"' },
      { label: 'Body', placeholder: '14.6×7.1×0.8cm' },
      { label: 'Weight', placeholder: '174g' },
    ],
    extras: ['Aluminum body', 'Glass back', 'Matte finish', 'Glossy', 'USB-C'],
  },
  'supplements-wellness': {
    dimensions: [
      { label: 'Quantity', placeholder: '60 capsules' },
      { label: 'Container', placeholder: '12cm tall' },
    ],
    extras: ['Capsule', 'Powder', 'Liquid', 'White bottle', 'Amber bottle', 'Pouch'],
  },
};

const DEFAULT_GUIDE: CategoryGuide = {
  dimensions: [
    { label: 'Width', placeholder: '30', unit: 'cm' },
    { label: 'Height', placeholder: '20', unit: 'cm' },
    { label: 'Depth', placeholder: '10', unit: 'cm' },
  ],
  extras: ['Material', 'Finish', 'Shape', 'Color'],
};

/**
 * Get structured dimension guide for a category.
 */
export function getCategoryGuide(category: string | undefined | null): CategoryGuide {
  if (!category) return DEFAULT_GUIDE;
  return CATEGORY_GUIDES[category] || DEFAULT_GUIDE;
}

// ── Textarea placeholder (fallback for freeform notes) ──

const NOTES_PLACEHOLDER = 'Any additional details about your product…';

export function getNotesPlaceholder(): string {
  return NOTES_PLACEHOLDER;
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
};

export function getCategoryLabel(category: string | undefined | null): string {
  if (!category) return 'Product';
  return CATEGORY_LABELS[category] || 'Product';
}

// Keep legacy export for backward compatibility (used in prompt builder)
export function getCategoryPlaceholder(category: string | undefined | null): string {
  const guide = getCategoryGuide(category);
  const dimParts = guide.dimensions.map(d => `${d.label}: ${d.placeholder}${d.unit || ''}`);
  return dimParts.join(', ') + (guide.extras.length ? ` — ${guide.extras.slice(0, 2).join(', ')}` : '');
}

/**
 * Build a prompt-friendly specification line from the user's free-text specs.
 * Returns the raw content WITHOUT the "Product specifications:" prefix.
 */
export function buildSpecsPromptLine(specsText: string | undefined): string {
  if (!specsText) return '';
  return sanitizeSpecInput(specsText, 500);
}
