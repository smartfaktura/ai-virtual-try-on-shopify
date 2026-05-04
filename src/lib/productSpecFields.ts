/**
 * Category-aware product specification fields with dropdown options.
 */

export function sanitizeSpecInput(val: string, maxLen = 500): string {
  return val.replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, maxLen);
}

// ── SpecField: each field is either a dropdown select or a text input ──

export interface SpecField {
  key: string;
  label: string;
  type: 'select' | 'input';
  options?: string[];
  placeholder?: string;
  unit?: string;
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
    { key: 'silhouette', label: 'Silhouette', type: 'select', options: ['A-line', 'Bodycon', 'Wrap', 'Shift', 'Fit & flare', 'Slip'] },
    { key: 'length', label: 'Length', type: 'select', options: ['Mini', 'Above knee', 'Knee', 'Midi', 'Maxi'] },
  ],
  'hoodies': [
    { key: 'size', label: 'Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { key: 'fit', label: 'Fit', type: 'select', options: ['Regular', 'Oversized', 'Cropped', 'Boxy'] },
    { key: 'style', label: 'Style', type: 'select', options: ['Pullover', 'Zip-up', 'Half-zip'] },
  ],
  'jeans': [
    { key: 'waist', label: 'Waist', type: 'input', placeholder: '32' },
    { key: 'length', label: 'Length', type: 'input', placeholder: '32' },
    { key: 'fit', label: 'Fit', type: 'select', options: ['Skinny', 'Slim', 'Straight', 'Regular', 'Wide-leg', 'Bootcut', 'Tapered'] },
    { key: 'rise', label: 'Rise', type: 'select', options: ['Low', 'Mid', 'High'] },
  ],
  'jackets': [
    { key: 'size', label: 'Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { key: 'style', label: 'Style', type: 'select', options: ['Bomber', 'Blazer', 'Parka', 'Denim', 'Biker', 'Trench', 'Puffer'] },
    { key: 'length', label: 'Length', type: 'select', options: ['Cropped', 'Hip', 'Mid-thigh', 'Knee'] },
    { key: 'material', label: 'Material', type: 'select', options: ['Leather', 'Nylon', 'Cotton', 'Denim', 'Wool', 'Synthetic'] },
  ],
  'activewear': [
    { key: 'size', label: 'Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { key: 'fit', label: 'Fit', type: 'select', options: ['Compression', 'Slim', 'Regular', 'Relaxed'] },
    { key: 'waist', label: 'Waist', type: 'select', options: ['Low', 'Mid', 'High'] },
  ],
  'swimwear': [
    { key: 'size', label: 'Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL'] },
    { key: 'cut', label: 'Cut', type: 'select', options: ['Classic', 'High-cut', 'Brazilian', 'Full coverage'] },
    { key: 'style', label: 'Style', type: 'select', options: ['Bikini', 'One-piece', 'Tankini', 'Monokini'] },
    { key: 'detail', label: 'Detail', type: 'select', options: ['Ribbed', 'Ruched', 'Underwire', 'Tie-front', 'Adjustable straps'] },
  ],
  'lingerie': [
    { key: 'size', label: 'Size', type: 'input', placeholder: '34B' },
    { key: 'style', label: 'Style', type: 'select', options: ['Underwire', 'Bralette', 'Push-up', 'Sports', 'Balconette'] },
    { key: 'material', label: 'Material', type: 'select', options: ['Lace', 'Silk', 'Satin', 'Cotton', 'Mesh'] },
  ],
  'kidswear': [
    { key: 'age', label: 'Age', type: 'select', options: ['0-3m', '3-6m', '6-12m', '1-2y', '2-3y', '3-4y', '4-5y', '5-6y', '7-8y', '9-10y', '11-12y'] },
    { key: 'fit', label: 'Fit', type: 'select', options: ['Regular', 'Relaxed', 'Slim'] },
  ],

  // ── Footwear ──
  'sneakers': [
    { key: 'euSize', label: 'EU Size', type: 'input', placeholder: '42' },
    { key: 'usSize', label: 'US Size', type: 'input', placeholder: '9' },
    { key: 'profile', label: 'Profile', type: 'select', options: ['Low-top', 'Mid-top', 'High-top'] },
    { key: 'sole', label: 'Sole', type: 'select', options: ['Flat', 'Chunky', 'Platform', 'Slim'] },
    { key: 'upper', label: 'Upper', type: 'select', options: ['Mesh', 'Leather', 'Suede', 'Canvas', 'Knit'] },
  ],
  'shoes': [
    { key: 'euSize', label: 'EU Size', type: 'input', placeholder: '40' },
    { key: 'heel', label: 'Heel', type: 'input', placeholder: '2', unit: 'cm' },
    { key: 'style', label: 'Style', type: 'select', options: ['Loafer', 'Derby', 'Oxford', 'Mule', 'Monk strap', 'Flat'] },
    { key: 'toe', label: 'Toe', type: 'select', options: ['Round', 'Pointed', 'Square', 'Almond'] },
    { key: 'material', label: 'Material', type: 'select', options: ['Leather', 'Suede', 'Patent', 'Canvas', 'Satin'] },
  ],
  'boots': [
    { key: 'euSize', label: 'EU Size', type: 'input', placeholder: '41' },
    { key: 'shaft', label: 'Shaft', type: 'select', options: ['Ankle', 'Mid-calf', 'Knee-high', 'Over-the-knee'] },
    { key: 'heelHeight', label: 'Heel', type: 'input', placeholder: '5', unit: 'cm' },
    { key: 'heelType', label: 'Heel Type', type: 'select', options: ['Flat', 'Block', 'Stiletto', 'Wedge', 'Lug sole'] },
    { key: 'material', label: 'Material', type: 'select', options: ['Leather', 'Suede', 'Synthetic', 'Rubber'] },
  ],
  'high-heels': [
    { key: 'euSize', label: 'EU Size', type: 'input', placeholder: '38' },
    { key: 'heelHeight', label: 'Heel Height', type: 'input', placeholder: '10', unit: 'cm' },
    { key: 'heelType', label: 'Heel Type', type: 'select', options: ['Stiletto', 'Block', 'Kitten', 'Wedge', 'Cone'] },
    { key: 'toe', label: 'Toe', type: 'select', options: ['Pointed', 'Open', 'Round', 'Peep-toe'] },
    { key: 'material', label: 'Material', type: 'select', options: ['Patent leather', 'Satin', 'Suede', 'Leather', 'Velvet'] },
  ],

  // ── Bags ──
  'bags-accessories': [
    { key: 'width', label: 'Width', type: 'input', placeholder: '30', unit: 'cm' },
    { key: 'height', label: 'Height', type: 'input', placeholder: '25', unit: 'cm' },
    { key: 'depth', label: 'Depth', type: 'input', placeholder: '12', unit: 'cm' },
    { key: 'material', label: 'Material', type: 'select', options: ['Leather', 'Canvas', 'Nylon', 'Vegan leather', 'Suede'] },
    { key: 'hardware', label: 'Hardware', type: 'select', options: ['Gold', 'Silver', 'Gunmetal', 'Rose gold', 'None'] },
  ],
  'backpacks': [
    { key: 'height', label: 'Height', type: 'input', placeholder: '45', unit: 'cm' },
    { key: 'width', label: 'Width', type: 'input', placeholder: '30', unit: 'cm' },
    { key: 'depth', label: 'Depth', type: 'input', placeholder: '15', unit: 'cm' },
    { key: 'volume', label: 'Volume', type: 'select', options: ['15L', '20L', '25L', '30L', '35L', '40L'] },
    { key: 'material', label: 'Material', type: 'select', options: ['Nylon', 'Canvas', 'Leather', 'Recycled polyester', 'Cordura'] },
  ],
  'wallets-cardholders': [
    { key: 'width', label: 'Width', type: 'input', placeholder: '11', unit: 'cm' },
    { key: 'height', label: 'Height', type: 'input', placeholder: '8', unit: 'cm' },
    { key: 'style', label: 'Style', type: 'select', options: ['Bifold', 'Trifold', 'Cardholder', 'Zip-around', 'Money clip'] },
    { key: 'material', label: 'Material', type: 'select', options: ['Smooth leather', 'Pebbled leather', 'Saffiano', 'Vegan leather', 'Canvas'] },
  ],

  // ── Accessories ──
  'belts': [
    { key: 'length', label: 'Length', type: 'input', placeholder: '100', unit: 'cm' },
    { key: 'width', label: 'Width', type: 'input', placeholder: '3.5', unit: 'cm' },
    { key: 'buckle', label: 'Buckle', type: 'select', options: ['Silver', 'Gold', 'Gunmetal', 'Rose gold', 'Matte black'] },
    { key: 'material', label: 'Material', type: 'select', options: ['Leather', 'Woven', 'Suede', 'Elastic', 'Reversible'] },
  ],
  'scarves': [
    { key: 'length', label: 'Length', type: 'input', placeholder: '180', unit: 'cm' },
    { key: 'width', label: 'Width', type: 'input', placeholder: '70', unit: 'cm' },
    { key: 'material', label: 'Material', type: 'select', options: ['Cashmere', 'Silk', 'Wool', 'Cotton', 'Linen', 'Modal'] },
    { key: 'edge', label: 'Edge', type: 'select', options: ['Fringed', 'Rolled', 'Raw edge', 'Hemmed'] },
  ],
  'hats-small': [
    { key: 'style', label: 'Style', type: 'select', options: ['Fedora', 'Bucket', 'Baseball cap', 'Beanie', 'Beret', 'Visor', 'Panama'] },
    { key: 'brim', label: 'Brim', type: 'input', placeholder: '7', unit: 'cm' },
    { key: 'material', label: 'Material', type: 'select', options: ['Wool felt', 'Straw', 'Cotton', 'Knit', 'Denim', 'Nylon'] },
  ],
  'eyewear': [
    { key: 'lens', label: 'Lens Width', type: 'input', placeholder: '52', unit: 'mm' },
    { key: 'bridge', label: 'Bridge', type: 'input', placeholder: '18', unit: 'mm' },
    { key: 'temple', label: 'Temple', type: 'input', placeholder: '140', unit: 'mm' },
    { key: 'frame', label: 'Frame', type: 'select', options: ['Acetate', 'Metal', 'Titanium', 'Wood', 'TR-90', 'Mixed'] },
    { key: 'lensType', label: 'Lens', type: 'select', options: ['Clear', 'Gradient', 'Polarized', 'Mirror', 'Tinted'] },
  ],

  // ── Watches ──
  'watches': [
    { key: 'case', label: 'Case', type: 'input', placeholder: '40', unit: 'mm' },
    { key: 'bandWidth', label: 'Band Width', type: 'input', placeholder: '20', unit: 'mm' },
    { key: 'thickness', label: 'Thickness', type: 'input', placeholder: '12', unit: 'mm' },
    { key: 'caseMaterial', label: 'Case Material', type: 'select', options: ['Stainless steel', 'Titanium', 'Gold', 'Ceramic', 'Rose gold'] },
    { key: 'band', label: 'Band', type: 'select', options: ['Leather', 'Metal mesh', 'Rubber', 'NATO', 'Bracelet'] },
  ],

  // ── Jewelry ──
  'jewellery-necklaces': [
    { key: 'chain', label: 'Chain Length', type: 'select', options: ['35cm (choker)', '40cm', '45cm', '50cm', '60cm', '70cm (opera)'] },
    { key: 'pendantSize', label: 'Pendant', type: 'input', placeholder: '2×1.5', unit: 'cm' },
    { key: 'metal', label: 'Metal', type: 'select', options: ['18k gold', 'Sterling silver', 'Rose gold', 'White gold', 'Platinum', 'Gold-plated'] },
    { key: 'stone', label: 'Stone', type: 'select', options: ['None', 'Diamond', 'Pearl', 'Crystal', 'Ruby', 'Sapphire', 'Emerald', 'Opal'] },
  ],
  'jewellery-rings': [
    { key: 'ringSize', label: 'Ring Size', type: 'input', placeholder: '7' },
    { key: 'bandWidth', label: 'Band Width', type: 'input', placeholder: '3', unit: 'mm' },
    { key: 'metal', label: 'Metal', type: 'select', options: ['Gold', 'Silver', 'Rose gold', 'White gold', 'Platinum'] },
    { key: 'setting', label: 'Setting', type: 'select', options: ['None', 'Solitaire', 'Pavé', 'Halo', 'Bezel', 'Channel'] },
    { key: 'stone', label: 'Stone', type: 'select', options: ['None', 'Diamond', 'Moissanite', 'Sapphire', 'Ruby', 'Emerald'] },
  ],
  'jewellery-bracelets': [
    { key: 'length', label: 'Length', type: 'select', options: ['16cm', '17cm', '18cm', '19cm', '20cm', '21cm'] },
    { key: 'width', label: 'Width', type: 'input', placeholder: '8', unit: 'mm' },
    { key: 'style', label: 'Style', type: 'select', options: ['Chain', 'Bangle', 'Cuff', 'Beaded', 'Tennis', 'Charm'] },
    { key: 'metal', label: 'Metal', type: 'select', options: ['Gold', 'Silver', 'Rose gold', 'Platinum', 'Mixed'] },
  ],
  'jewellery-earrings': [
    { key: 'drop', label: 'Drop Length', type: 'input', placeholder: '4', unit: 'cm' },
    { key: 'width', label: 'Width', type: 'input', placeholder: '1.5', unit: 'cm' },
    { key: 'style', label: 'Style', type: 'select', options: ['Stud', 'Drop', 'Hoop', 'Huggie', 'Chandelier', 'Climber'] },
    { key: 'metal', label: 'Metal', type: 'select', options: ['Gold', 'Silver', 'Rose gold', 'Platinum'] },
    { key: 'stone', label: 'Stone', type: 'select', options: ['None', 'Diamond', 'Pearl', 'Crystal', 'Gemstone'] },
  ],

  // ── Fragrance ──
  'fragrance': [
    { key: 'volume', label: 'Volume', type: 'select', options: ['5ml', '10ml', '30ml', '50ml', '75ml', '100ml', '150ml', '200ml'] },
    { key: 'bottleHeight', label: 'Bottle Height', type: 'input', placeholder: '15', unit: 'cm' },
    { key: 'bottleShape', label: 'Bottle Shape', type: 'select', options: ['Rectangular', 'Round', 'Oval', 'Square', 'Geometric', 'Sculptural'] },
    { key: 'cap', label: 'Cap Style', type: 'select', options: ['Gold', 'Silver', 'Rose gold', 'Matte black', 'Clear', 'Crystal'] },
    { key: 'glass', label: 'Glass', type: 'select', options: ['Clear', 'Frosted', 'Tinted', 'Opaque', 'Smoked'] },
  ],

  // ── Beauty ──
  'beauty-skincare': [
    { key: 'volume', label: 'Volume', type: 'select', options: ['5ml', '10ml', '15ml', '30ml', '50ml', '75ml', '100ml', '200ml'] },
    { key: 'container', label: 'Container', type: 'select', options: ['Pump bottle', 'Dropper', 'Tube', 'Jar', 'Spray', 'Roller', 'Stick'] },
    { key: 'material', label: 'Material', type: 'select', options: ['Glass', 'Frosted glass', 'Matte plastic', 'Aluminum', 'Ceramic'] },
  ],
  'makeup-lipsticks': [
    { key: 'weight', label: 'Weight', type: 'input', placeholder: '3.5', unit: 'g' },
    { key: 'packaging', label: 'Packaging', type: 'select', options: ['Twist-up tube', 'Click pen', 'Compact', 'Palette', 'Wand'] },
    { key: 'finish', label: 'Finish', type: 'select', options: ['Matte', 'Glossy', 'Satin', 'Metallic', 'Velvet'] },
    { key: 'packaging_material', label: 'Case', type: 'select', options: ['Metallic gold', 'Metallic silver', 'Matte black', 'Rose gold', 'Clear'] },
  ],

  // ── Food & Beverages ──
  'food': [
    { key: 'weight', label: 'Weight', type: 'input', placeholder: '250', unit: 'g' },
    { key: 'packageSize', label: 'Package Size', type: 'input', placeholder: '15×20cm' },
    { key: 'packaging', label: 'Packaging', type: 'select', options: ['Box', 'Bag', 'Jar', 'Can', 'Pouch', 'Wrap', 'Tray'] },
    { key: 'material', label: 'Material', type: 'select', options: ['Kraft paper', 'Cardboard', 'Glass', 'Tin', 'Plastic', 'Biodegradable'] },
  ],
  'beverages': [
    { key: 'volume', label: 'Volume', type: 'select', options: ['200ml', '250ml', '330ml', '350ml', '500ml', '750ml', '1L'] },
    { key: 'container', label: 'Container', type: 'select', options: ['Aluminum can', 'Glass bottle', 'PET bottle', 'Carton', 'Slim can', 'Flask'] },
  ],

  // ── Home & Decor ──
  'home-decor': [
    { key: 'width', label: 'Width', type: 'input', placeholder: '30', unit: 'cm' },
    { key: 'height', label: 'Height', type: 'input', placeholder: '25', unit: 'cm' },
    { key: 'depth', label: 'Depth', type: 'input', placeholder: '12', unit: 'cm' },
    { key: 'material', label: 'Material', type: 'select', options: ['Ceramic', 'Wood', 'Metal', 'Glass', 'Stone', 'Concrete', 'Rattan'] },
    { key: 'finish', label: 'Finish', type: 'select', options: ['Matte glaze', 'Glossy', 'Natural', 'Painted', 'Textured', 'Handmade'] },
  ],

  // ── Furniture ──
  'furniture': [
    { key: 'width', label: 'Width', type: 'input', placeholder: '180', unit: 'cm' },
    { key: 'depth', label: 'Depth', type: 'input', placeholder: '80', unit: 'cm' },
    { key: 'height', label: 'Height', type: 'input', placeholder: '75', unit: 'cm' },
    { key: 'material', label: 'Material', type: 'select', options: ['Oak', 'Walnut', 'Pine', 'Birch', 'Metal', 'MDF', 'Marble', 'Bamboo'] },
    { key: 'finish', label: 'Finish', type: 'select', options: ['Matte', 'Glossy', 'Natural', 'Painted', 'Stained', 'Lacquered'] },
  ],

  // ── Tech ──
  'tech-devices': [
    { key: 'screen', label: 'Screen', type: 'input', placeholder: '6.1"' },
    { key: 'dimensions', label: 'Dimensions', type: 'input', placeholder: '14.6×7.1×0.8cm' },
    { key: 'weight', label: 'Weight', type: 'input', placeholder: '174', unit: 'g' },
    { key: 'body', label: 'Body', type: 'select', options: ['Aluminum', 'Glass', 'Plastic', 'Carbon fiber', 'Ceramic', 'Stainless steel'] },
    { key: 'color', label: 'Color', type: 'input', placeholder: 'Space gray' },
  ],

  // ── Supplements ──
  'supplements-wellness': [
    { key: 'quantity', label: 'Quantity', type: 'input', placeholder: '60 capsules' },
    { key: 'containerHeight', label: 'Container Height', type: 'input', placeholder: '12', unit: 'cm' },
    { key: 'form', label: 'Form', type: 'select', options: ['Capsule', 'Tablet', 'Powder', 'Liquid', 'Gummy', 'Softgel'] },
    { key: 'container', label: 'Container', type: 'select', options: ['White bottle', 'Amber bottle', 'Clear bottle', 'Pouch', 'Jar'] },
  ],

  // ── Pet Accessories ──
  'pet-accessories': [
    { key: 'length', label: 'Length', type: 'input', placeholder: '150', unit: 'cm' },
    { key: 'width', label: 'Width', type: 'input', placeholder: '2', unit: 'cm' },
    { key: 'material', label: 'Material', type: 'select', options: ['Nylon', 'Leather', 'Rope', 'Neoprene', 'Polyester', 'Canvas', 'Silicone'] },
    { key: 'hardware', label: 'Hardware', type: 'select', options: ['Chrome', 'Gold', 'Matte black', 'Stainless steel', 'Brass', 'None'] },
    { key: 'style', label: 'Style', type: 'select', options: ['Leash', 'Collar', 'Harness', 'Bandana', 'Toy', 'Bed', 'Bowl', 'Carrier'] },
  ],
};

const DEFAULT_FIELDS: SpecField[] = [
  { key: 'width', label: 'Width', type: 'input', placeholder: '30', unit: 'cm' },
  { key: 'height', label: 'Height', type: 'input', placeholder: '20', unit: 'cm' },
  { key: 'depth', label: 'Depth', type: 'input', placeholder: '10', unit: 'cm' },
  { key: 'material', label: 'Material', type: 'select', options: ['Plastic', 'Metal', 'Wood', 'Glass', 'Fabric', 'Ceramic'] },
  { key: 'finish', label: 'Finish', type: 'select', options: ['Matte', 'Glossy', 'Textured', 'Natural'] },
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
