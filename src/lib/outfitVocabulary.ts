// ── ZARA-grade outfit vocabulary ──
// Single source of truth for garment types, sub-styles, colors, materials, and smart defaults.

import type { OutfitConfig } from '@/components/app/product-images/types';

export interface GarmentTypeOption {
  id: string;
  label: string;
  subtypes?: string[];
  materials?: string[];
}

// ── Color swatches (semantic, hex for UI rendering) ──
export const OUTFIT_COLORS: Array<{ hex: string; label: string }> = [
  { hex: '#FFFFFF', label: 'White' },
  { hex: '#000000', label: 'Black' },
  { hex: '#F5F1EA', label: 'Cream' },
  { hex: '#D9C8B4', label: 'Beige' },
  { hex: '#8B6F47', label: 'Camel' },
  { hex: '#5C4033', label: 'Chocolate' },
  { hex: '#9CA3AF', label: 'Grey' },
  { hex: '#374151', label: 'Charcoal' },
  { hex: '#1E3A5F', label: 'Navy' },
  { hex: '#3B82F6', label: 'Blue' },
  { hex: '#7C9A92', label: 'Sage' },
  { hex: '#3F4F3A', label: 'Olive' },
  { hex: '#7C2D12', label: 'Rust' },
  { hex: '#991B1B', label: 'Burgundy' },
  { hex: '#EC4899', label: 'Pink' },
  { hex: '#FBBF24', label: 'Mustard' },
];

// ── Top garments ──
export const TOP_TYPES: GarmentTypeOption[] = [
  { id: 't-shirt', label: 'T-shirt', subtypes: ['crew', 'v-neck', 'ribbed', 'baby-tee', 'oversized', 'henley'], materials: ['cotton', 'linen', 'jersey'] },
  { id: 'crop-top', label: 'Crop top', subtypes: ['ribbed', 'fitted', 'square-neck', 'halter', 'tube'], materials: ['cotton', 'jersey', 'silk'] },
  { id: 'shirt', label: 'Shirt', subtypes: ['poplin', 'oxford', 'linen', 'silk', 'oversized', 'cropped', 'sheer', 'striped'], materials: ['cotton', 'linen', 'silk'] },
  { id: 'blouse', label: 'Blouse', subtypes: ['silk', 'pussybow', 'puff-sleeve', 'sheer'], materials: ['silk', 'satin', 'chiffon'] },
  { id: 'knit', label: 'Knit', subtypes: ['crewneck', 'turtleneck', 'cardigan', 'vest', 'polo-knit'], materials: ['wool', 'cashmere', 'cotton', 'mohair'] },
  { id: 'hoodie', label: 'Hoodie', subtypes: ['pullover', 'zip-up', 'oversized', 'cropped'], materials: ['cotton', 'fleece'] },
  { id: 'tank', label: 'Tank', subtypes: ['ribbed', 'fitted', 'racerback'], materials: ['cotton', 'jersey'] },
  { id: 'bodysuit', label: 'Bodysuit', subtypes: ['scoop', 'square', 'turtleneck', 'long-sleeve'], materials: ['jersey', 'mesh'] },
];

// ── Bottom garments ──
export const BOTTOM_TYPES: GarmentTypeOption[] = [
  { id: 'trousers', label: 'Trousers', subtypes: ['wide-leg', 'tapered', 'straight', 'pleated', 'tailored', 'jogger', 'parachute', 'cargo'], materials: ['wool', 'cotton', 'linen', 'leather'] },
  { id: 'jeans', label: 'Jeans', subtypes: ['raw indigo', 'light wash', 'mid wash', 'dark wash', 'distressed', 'baggy', 'slim', 'bootcut', 'mom-fit', 'black', 'white'], materials: ['denim'] },
  { id: 'skirt', label: 'Skirt', subtypes: ['mini', 'midi', 'maxi', 'pencil', 'pleated', 'a-line', 'wrap', 'cargo'], materials: ['cotton', 'wool', 'denim', 'leather', 'silk'] },
  { id: 'shorts', label: 'Shorts', subtypes: ['tailored', 'denim', 'bermuda', 'micro', 'cargo'], materials: ['cotton', 'denim', 'linen'] },
  { id: 'leggings', label: 'Leggings', subtypes: ['high-waist', 'flared', 'cropped'], materials: ['lycra', 'cotton'] },
];

// ── Outerwear ──
export const OUTERWEAR_TYPES: GarmentTypeOption[] = [
  { id: 'jacket', label: 'Jacket', subtypes: ['denim', 'leather biker', 'bomber', 'varsity', 'suede', 'harrington', 'puffer'], materials: ['denim', 'leather', 'nylon', 'wool'] },
  { id: 'blazer', label: 'Blazer', subtypes: ['oversized', 'tailored', 'double-breasted', 'cropped'], materials: ['wool', 'linen', 'cotton'] },
  { id: 'coat', label: 'Coat', subtypes: ['trench', 'wool overcoat', 'puffer', 'parka', 'pea coat', 'duster'], materials: ['wool', 'cashmere', 'cotton', 'nylon'] },
  { id: 'cardigan', label: 'Cardigan', subtypes: ['cropped', 'long', 'chunky knit', 'fine knit'], materials: ['wool', 'cashmere', 'cotton'] },
];

// ── Dress (full-body) ──
export const DRESS_TYPES: GarmentTypeOption[] = [
  { id: 'dress', label: 'Dress', subtypes: ['mini', 'midi', 'maxi', 'slip', 'wrap', 'shirt-dress', 'knit', 'evening', 'tea'], materials: ['silk', 'cotton', 'linen', 'satin', 'knit'] },
  { id: 'jumpsuit', label: 'Jumpsuit', subtypes: ['wide-leg', 'tapered', 'cropped'], materials: ['cotton', 'linen', 'satin'] },
];

// ── Shoes ──
export const SHOE_TYPES: GarmentTypeOption[] = [
  { id: 'sneaker', label: 'Sneaker', subtypes: ['low-top', 'high-top', 'chunky', 'minimal', 'retro runner'], materials: ['leather', 'canvas', 'mesh'] },
  { id: 'loafer', label: 'Loafer', subtypes: ['penny', 'horsebit', 'tassel', 'chunky'], materials: ['leather', 'suede'] },
  { id: 'boot', label: 'Boot', subtypes: ['chelsea', 'combat', 'cowboy', 'knee-high', 'ankle'], materials: ['leather', 'suede'] },
  { id: 'heel', label: 'Heel', subtypes: ['kitten', 'stiletto', 'block', 'platform', 'mule'], materials: ['leather', 'satin', 'patent'] },
  { id: 'sandal', label: 'Sandal', subtypes: ['flat', 'thong', 'slide', 'gladiator', 'heeled'], materials: ['leather', 'suede'] },
  { id: 'mule', label: 'Mule', subtypes: ['flat', 'heeled', 'pointed'], materials: ['leather', 'suede'] },
];

// ── Accessories ──
export const BAG_TYPES: GarmentTypeOption[] = [
  { id: 'tote', label: 'Tote', subtypes: ['structured', 'slouchy', 'mini', 'oversized'], materials: ['leather', 'canvas', 'suede'] },
  { id: 'shoulder', label: 'Shoulder', subtypes: ['baguette', 'hobo', 'flap'], materials: ['leather', 'suede', 'patent'] },
  { id: 'crossbody', label: 'Crossbody', subtypes: ['camera', 'saddle', 'messenger'], materials: ['leather', 'nylon', 'canvas'] },
  { id: 'clutch', label: 'Clutch', subtypes: ['envelope', 'hard-case', 'oversized'], materials: ['leather', 'satin', 'patent'] },
  { id: 'bucket', label: 'Bucket', subtypes: ['drawstring', 'structured'], materials: ['leather', 'suede', 'canvas'] },
  { id: 'top-handle', label: 'Top-handle', subtypes: ['mini', 'medium', 'structured'], materials: ['leather', 'patent'] },
  { id: 'backpack', label: 'Backpack', subtypes: ['mini', 'utility', 'sleek'], materials: ['leather', 'nylon', 'canvas'] },
  { id: 'belt-bag', label: 'Belt bag', subtypes: ['fanny', 'sling'], materials: ['leather', 'nylon'] },
];

export const HAT_TYPES: GarmentTypeOption[] = [
  { id: 'cap', label: 'Cap', subtypes: ['trucker', 'dad', '5-panel', 'snapback'], materials: ['cotton', 'nylon', 'wool'] },
  { id: 'bucket', label: 'Bucket hat', subtypes: ['classic', 'fisherman', 'reversible'], materials: ['cotton', 'nylon', 'denim'] },
  { id: 'beanie', label: 'Beanie', subtypes: ['cuffed', 'slouchy', 'fisherman'], materials: ['wool', 'cashmere', 'cotton'] },
  { id: 'wide-brim', label: 'Wide-brim', subtypes: ['felt', 'straw', 'rancher'], materials: ['felt', 'straw', 'wool'] },
  { id: 'fedora', label: 'Fedora', materials: ['felt', 'straw'] },
  { id: 'beret', label: 'Beret', materials: ['wool', 'leather'] },
  { id: 'cowboy', label: 'Cowboy', materials: ['felt', 'straw', 'leather'] },
];

export const EYEWEAR_TYPES: GarmentTypeOption[] = [
  { id: 'sunglasses', label: 'Sunglasses', subtypes: ['aviator', 'wayfarer', 'cat-eye', 'round', 'oval', 'square', 'rimless', 'shield', 'oversized'] },
  { id: 'optical', label: 'Optical', subtypes: ['aviator', 'wayfarer', 'cat-eye', 'round', 'square', 'rimless'] },
];

export const EYEWEAR_LENS_TINTS = ['Black', 'Brown', 'Mirror', 'Gradient', 'Clear', 'Yellow', 'Blue'];

export const BELT_TYPES: GarmentTypeOption[] = [
  { id: 'classic', label: 'Classic dress', subtypes: ['minimal', 'logo plate', 'double-ring'], materials: ['leather', 'suede'] },
  { id: 'wide', label: 'Wide statement', subtypes: ['corset', 'sash'], materials: ['leather', 'fabric'] },
  { id: 'skinny', label: 'Skinny', subtypes: ['minimal', 'studded'], materials: ['leather'] },
  { id: 'chain', label: 'Chain', materials: ['metal'] },
  { id: 'western', label: 'Western', subtypes: ['tooled', 'turquoise'], materials: ['leather'] },
  { id: 'braided', label: 'Braided', materials: ['leather', 'suede'] },
];

// ── Beach cover-ups (swimwear context) ──
export const COVER_UP_TYPES: GarmentTypeOption[] = [
  { id: 'sarong', label: 'Sarong', subtypes: ['wrap', 'tied', 'long', 'short'], materials: ['cotton', 'linen', 'silk', 'chiffon'] },
  { id: 'kaftan', label: 'Kaftan', subtypes: ['flowy', 'embroidered', 'sheer', 'belted'], materials: ['cotton', 'linen', 'silk', 'chiffon'] },
  { id: 'kimono', label: 'Kimono', subtypes: ['short', 'long', 'sheer', 'fringed'], materials: ['silk', 'chiffon', 'cotton'] },
  { id: 'beach-shirt', label: 'Beach shirt', subtypes: ['oversized', 'cropped', 'linen', 'sheer'], materials: ['linen', 'cotton', 'gauze'] },
  { id: 'mesh-dress', label: 'Mesh dress', subtypes: ['mini', 'midi', 'crochet'], materials: ['mesh', 'crochet', 'knit'] },
  { id: 'pareo', label: 'Pareo', subtypes: ['printed', 'solid', 'fringed'], materials: ['cotton', 'silk', 'chiffon'] },
  { id: 'cover-up-dress', label: 'Cover-up dress', subtypes: ['terry', 'crochet', 'sheer'], materials: ['terry', 'cotton', 'crochet'] },
];

export const WATCH_TYPES: GarmentTypeOption[] = [
  { id: 'minimal', label: 'Minimal dress', subtypes: ['ultra-thin', 'roman numerals'], materials: ['leather strap', 'mesh', 'steel link'] },
  { id: 'sport', label: 'Sport / diver', subtypes: ['chronograph', 'GMT'], materials: ['rubber', 'steel link', 'NATO nylon'] },
  { id: 'vintage', label: 'Vintage', materials: ['leather strap', 'gold mesh'] },
  { id: 'smart', label: 'Smart', materials: ['silicone', 'metal mesh'] },
];

// ── Jewelry options ──
export const JEWELRY_NECKLACES = ['Layered chains', 'Pendant', 'Choker', 'Pearl strand', 'Statement'];
export const JEWELRY_EARRINGS = ['Small hoops', 'Medium hoops', 'Large hoops', 'Studs', 'Drops', 'Ear cuffs', 'Statement'];
export const JEWELRY_BRACELETS = ['Tennis', 'Bangle', 'Cuff', 'Beaded', 'Charm'];
export const JEWELRY_RINGS = ['Single statement', 'Stack', 'Signet', 'Band'];
export const JEWELRY_METALS = ['Gold', 'Silver', 'Rose-gold', 'Mixed metals'];

// ── Smart defaults — used when slot empty but scene needs an outfit ──
// Returns a plain-text description the prompt builder will render.
export function getSmartDefault(slot: 'top' | 'bottom' | 'shoes', productColorTone?: 'light' | 'dark' | 'neutral'): string {
  switch (slot) {
    case 'top':
      return productColorTone === 'dark' ? 'a simple white fitted t-shirt' : 'a simple black fitted t-shirt';
    case 'bottom':
      return 'straight-leg neutral trousers';
    case 'shoes':
      return 'clean white low-top sneakers';
  }
}

// ── Built-in starter presets (hard-coded so all users see them) ──
// `category` matches ProductCategory values (e.g. 'hoodies', 'dresses', 'jeans', 'jackets',
// 'garments', 'tops', 'sneakers', 'boots', 'high-heels', 'swimwear', 'activewear', 'lingerie').
// Looks tagged with multiple categories appear for any matching product. The 'universal'
// category always appears as a fallback.
// `recommended: true` flags entries that are eligible for auto-pick on Step 3 mount.
export interface BuiltInPreset {
  id: string;
  name: string;
  category: string[];
  recommended?: boolean;
  config: OutfitConfig;
}

export const BUILT_IN_PRESETS: BuiltInPreset[] = [
  // ─────── TOPS (tee / blouse / shirt / tank) ───────
  {
    id: 'builtin-tops-clean-denim',
    name: 'Clean Minimal Denim',
    category: ['tops', 'garments'],
    recommended: true,
    config: {
      top: { garment: 't-shirt', subtype: 'crew', color: 'white', material: 'cotton', fit: 'fitted' },
      bottom: { garment: 'jeans', subtype: 'straight', color: 'mid wash', material: 'denim' },
      shoes: { garment: 'sneaker', subtype: 'low-top', color: 'white', material: 'leather' },
      jewelry: { earrings: 'Studs', metal: 'Gold' },
    },
  },
  {
    id: 'builtin-tops-tucked-trouser',
    name: 'Tucked Trouser Polish',
    category: ['tops', 'garments'],
    recommended: true,
    config: {
      top: { garment: 'shirt', subtype: 'poplin', color: 'white', material: 'cotton', fit: 'tailored' },
      bottom: { garment: 'trousers', subtype: 'tailored', color: 'black', material: 'wool' },
      shoes: { garment: 'loafer', subtype: 'horsebit', color: 'black', material: 'leather' },
      belt: { garment: 'classic', subtype: 'minimal', color: 'black', material: 'leather' },
    },
  },
  {
    id: 'builtin-tops-quiet-luxury-knit',
    name: 'Quiet Luxury Knit',
    category: ['tops', 'knits', 'garments'],
    recommended: true,
    config: {
      top: { garment: 'knit', subtype: 'crewneck', color: 'cream', material: 'cashmere' },
      bottom: { garment: 'trousers', subtype: 'tailored', color: 'beige', material: 'wool', fit: 'relaxed' },
      shoes: { garment: 'loafer', subtype: 'penny', color: 'brown', material: 'leather' },
      jewelry: { earrings: 'Small hoops', metal: 'Gold' },
    },
  },
  {
    id: 'builtin-tops-office-siren',
    name: 'Office Siren',
    category: ['tops', 'garments'],
    config: {
      top: { garment: 'blouse', subtype: 'silk', color: 'black', material: 'silk', fit: 'fitted' },
      bottom: { garment: 'skirt', subtype: 'pencil', color: 'black', material: 'wool' },
      shoes: { garment: 'heel', subtype: 'stiletto', color: 'black', material: 'leather' },
      jewelry: { earrings: 'Drops', metal: 'Gold' },
    },
  },
  {
    id: 'builtin-tops-coastal-linen',
    name: 'Coastal Linen',
    category: ['tops', 'garments', 'shirts'],
    recommended: true,
    config: {
      top: { garment: 'shirt', subtype: 'linen', color: 'white', material: 'linen', fit: 'relaxed' },
      bottom: { garment: 'trousers', subtype: 'wide-leg', color: 'cream', material: 'linen' },
      shoes: { garment: 'sandal', subtype: 'flat', color: 'tan', material: 'leather' },
    },
  },
  {
    id: 'builtin-tops-y2k-baby-tee',
    name: 'Y2K Baby-Tee',
    category: ['tops', 'garments'],
    config: {
      top: { garment: 'crop-top', subtype: 'ribbed', color: 'white', material: 'cotton' },
      bottom: { garment: 'jeans', subtype: 'baggy', color: 'light wash', material: 'denim' },
      shoes: { garment: 'sneaker', subtype: 'chunky', color: 'white', material: 'leather' },
      jewelry: { necklace: 'Layered chains', metal: 'Silver' },
    },
  },

  // ─────── HOODIES / SWEATSHIRTS ───────
  {
    id: 'builtin-hoodie-off-duty',
    name: 'Off-Duty Layered',
    category: ['hoodies'],
    recommended: true,
    config: {
      top: { garment: 'hoodie', subtype: 'pullover', color: 'cream', material: 'cotton', fit: 'relaxed' },
      bottom: { garment: 'jeans', subtype: 'straight', color: 'mid wash', material: 'denim' },
      shoes: { garment: 'sneaker', subtype: 'low-top', color: 'white', material: 'leather' },
      hat: { garment: 'cap', subtype: 'dad', color: 'black', material: 'cotton' },
    },
  },
  {
    id: 'builtin-hoodie-athleisure-clean',
    name: 'Athleisure Clean',
    category: ['hoodies', 'activewear'],
    recommended: true,
    config: {
      top: { garment: 'hoodie', subtype: 'zip-up', color: 'grey', material: 'cotton' },
      bottom: { garment: 'leggings', subtype: 'high-waist', color: 'black', material: 'lycra' },
      shoes: { garment: 'sneaker', subtype: 'minimal', color: 'white', material: 'mesh' },
    },
  },
  {
    id: 'builtin-hoodie-streetwear-baggy',
    name: 'Streetwear Baggy',
    category: ['hoodies'],
    config: {
      top: { garment: 'hoodie', subtype: 'oversized', color: 'black', material: 'cotton', fit: 'oversized' },
      bottom: { garment: 'jeans', subtype: 'baggy', color: 'dark wash', material: 'denim' },
      shoes: { garment: 'sneaker', subtype: 'chunky', color: 'black', material: 'leather' },
      jewelry: { necklace: 'Layered chains', metal: 'Silver' },
    },
  },
  {
    id: 'builtin-hoodie-quiet-luxury',
    name: 'Quiet Luxury Hoodie',
    category: ['hoodies'],
    recommended: true,
    config: {
      top: { garment: 'hoodie', subtype: 'pullover', color: 'beige', material: 'cotton', fit: 'relaxed' },
      bottom: { garment: 'trousers', subtype: 'tailored', color: 'cream', material: 'wool' },
      shoes: { garment: 'sneaker', subtype: 'minimal', color: 'white', material: 'leather' },
    },
  },
  {
    id: 'builtin-hoodie-techwear-mono',
    name: 'Tech-wear Mono',
    category: ['hoodies'],
    config: {
      top: { garment: 'hoodie', subtype: 'zip-up', color: 'black', material: 'cotton' },
      bottom: { garment: 'trousers', subtype: 'cargo', color: 'black', material: 'cotton' },
      shoes: { garment: 'sneaker', subtype: 'chunky', color: 'black', material: 'mesh' },
    },
  },
  {
    id: 'builtin-hoodie-y2k-layered',
    name: 'Y2K Layered',
    category: ['hoodies'],
    config: {
      top: { garment: 'hoodie', subtype: 'cropped', color: 'pink', material: 'cotton' },
      bottom: { garment: 'jeans', subtype: 'baggy', color: 'light wash', material: 'denim' },
      shoes: { garment: 'sneaker', subtype: 'chunky', color: 'white', material: 'leather' },
      jewelry: { necklace: 'Choker', metal: 'Silver' },
    },
  },

  // ─────── KNITS / CARDIGANS ───────
  {
    id: 'builtin-knit-sandstone',
    name: 'Sandstone Layering',
    category: ['knits', 'tops', 'garments'],
    recommended: true,
    config: {
      top: { garment: 'knit', subtype: 'crewneck', color: 'beige', material: 'wool' },
      bottom: { garment: 'trousers', subtype: 'pleated', color: 'cream', material: 'wool' },
      shoes: { garment: 'loafer', subtype: 'penny', color: 'brown', material: 'leather' },
    },
  },
  {
    id: 'builtin-knit-heritage-cable',
    name: 'Heritage Cable',
    category: ['knits', 'tops'],
    config: {
      top: { garment: 'knit', subtype: 'cardigan', color: 'cream', material: 'wool' },
      bottom: { garment: 'jeans', subtype: 'straight', color: 'dark wash', material: 'denim' },
      shoes: { garment: 'boot', subtype: 'chelsea', color: 'brown', material: 'leather' },
    },
  },
  {
    id: 'builtin-knit-longline-slip',
    name: 'Long-line Cardi & Slip',
    category: ['knits', 'cardigans', 'dresses'],
    config: {
      outerwear: { garment: 'cardigan', subtype: 'long', color: 'cream', material: 'wool' },
      dress: { garment: 'dress', subtype: 'slip', color: 'beige', material: 'silk' },
      shoes: { garment: 'boot', subtype: 'ankle', color: 'brown', material: 'leather' },
    },
  },
  {
    id: 'builtin-knit-polo-prep',
    name: 'Polo-Knit Prep',
    category: ['knits', 'tops'],
    config: {
      top: { garment: 'knit', subtype: 'polo-knit', color: 'navy', material: 'cotton' },
      bottom: { garment: 'trousers', subtype: 'tailored', color: 'cream', material: 'cotton' },
      shoes: { garment: 'loafer', subtype: 'horsebit', color: 'brown', material: 'leather' },
    },
  },
  {
    id: 'builtin-knit-open-beach',
    name: 'Open-Knit Beach',
    category: ['knits', 'swimwear'],
    config: {
      top: { garment: 'knit', subtype: 'cardigan', color: 'white', material: 'cotton', fit: 'oversized' },
      bottom: { garment: 'shorts', subtype: 'denim', color: 'light wash', material: 'denim' },
      shoes: { garment: 'sandal', subtype: 'slide', color: 'tan', material: 'leather' },
      hat: { garment: 'wide-brim', subtype: 'straw', color: 'natural', material: 'straw' },
    },
  },

  // ─────── DRESSES ───────
  {
    id: 'builtin-dress-slip-minimal',
    name: 'Slip-Dress Minimal',
    category: ['dresses', 'garments'],
    recommended: true,
    config: {
      dress: { garment: 'dress', subtype: 'slip', color: 'beige', material: 'silk' },
      shoes: { garment: 'sandal', subtype: 'heeled', color: 'tan', material: 'leather' },
      jewelry: { earrings: 'Small hoops', metal: 'Gold' },
    },
  },
  {
    id: 'builtin-dress-garden-party',
    name: 'Garden Party Midi',
    category: ['dresses'],
    recommended: true,
    config: {
      dress: { garment: 'dress', subtype: 'midi', color: 'cream', material: 'cotton' },
      shoes: { garment: 'sandal', subtype: 'flat', color: 'tan', material: 'leather' },
      bag: { garment: 'bucket', subtype: 'drawstring', color: 'natural', material: 'canvas' },
    },
  },
  {
    id: 'builtin-dress-resort-eclectic',
    name: 'Resort Eclectic',
    category: ['dresses'],
    config: {
      dress: { garment: 'dress', subtype: 'maxi', color: 'cream', material: 'linen' },
      shoes: { garment: 'sandal', subtype: 'flat', color: 'tan', material: 'leather' },
      hat: { garment: 'wide-brim', subtype: 'straw', color: 'natural', material: 'straw' },
      jewelry: { necklace: 'Layered chains', earrings: 'Large hoops', metal: 'Gold' },
    },
  },
  {
    id: 'builtin-dress-blacktie-slip',
    name: 'Black-Tie Slip',
    category: ['dresses'],
    config: {
      dress: { garment: 'dress', subtype: 'evening', color: 'black', material: 'satin' },
      shoes: { garment: 'heel', subtype: 'stiletto', color: 'black', material: 'satin' },
      bag: { garment: 'clutch', subtype: 'envelope', color: 'black', material: 'satin' },
      jewelry: { earrings: 'Drops', metal: 'Silver' },
    },
  },
  {
    id: 'builtin-dress-sweater-over-slip',
    name: 'Sweater-over-Slip',
    category: ['dresses'],
    config: {
      outerwear: { garment: 'cardigan', subtype: 'cropped', color: 'cream', material: 'wool' },
      dress: { garment: 'dress', subtype: 'slip', color: 'beige', material: 'silk' },
      shoes: { garment: 'boot', subtype: 'ankle', color: 'brown', material: 'leather' },
    },
  },
  {
    id: 'builtin-dress-tea-boots',
    name: 'Tea-Dress Boots',
    category: ['dresses'],
    config: {
      dress: { garment: 'dress', subtype: 'tea', color: 'cream', material: 'cotton' },
      shoes: { garment: 'boot', subtype: 'ankle', color: 'brown', material: 'leather' },
      jewelry: { earrings: 'Small hoops', metal: 'Gold' },
    },
  },
  {
    id: 'builtin-dress-y2k-mini',
    name: 'Y2K Mini',
    category: ['dresses'],
    config: {
      dress: { garment: 'dress', subtype: 'mini', color: 'black', material: 'knit' },
      shoes: { garment: 'boot', subtype: 'knee-high', color: 'black', material: 'leather' },
      bag: { garment: 'shoulder', subtype: 'baguette', color: 'black', material: 'leather' },
    },
  },

  // ─────── JEANS / DENIM ───────
  {
    id: 'builtin-jeans-western-modern',
    name: 'Western Modern',
    category: ['jeans'],
    config: {
      top: { garment: 'shirt', subtype: 'oversized', color: 'cream', material: 'cotton' },
      bottom: { garment: 'jeans', subtype: 'bootcut', color: 'mid wash', material: 'denim' },
      shoes: { garment: 'boot', subtype: 'cowboy', color: 'brown', material: 'leather' },
      belt: { garment: 'western', subtype: 'tooled', color: 'brown', material: 'leather' },
    },
  },
  {
    id: 'builtin-jeans-cafe-loafer',
    name: 'Café Casual Loafer',
    category: ['jeans'],
    recommended: true,
    config: {
      top: { garment: 'knit', subtype: 'crewneck', color: 'cream', material: 'cashmere' },
      bottom: { garment: 'jeans', subtype: 'straight', color: 'dark wash', material: 'denim' },
      shoes: { garment: 'loafer', subtype: 'horsebit', color: 'brown', material: 'leather' },
    },
  },
  {
    id: 'builtin-jeans-quiet-luxury',
    name: 'Quiet Luxury Denim',
    category: ['jeans'],
    recommended: true,
    config: {
      top: { garment: 'knit', subtype: 'turtleneck', color: 'cream', material: 'cashmere' },
      bottom: { garment: 'jeans', subtype: 'straight', color: 'raw indigo', material: 'denim' },
      shoes: { garment: 'loafer', subtype: 'penny', color: 'black', material: 'leather' },
    },
  },
  {
    id: 'builtin-jeans-street-baggy',
    name: 'Street Editorial Baggy',
    category: ['jeans'],
    config: {
      top: { garment: 't-shirt', subtype: 'oversized', color: 'white', material: 'cotton' },
      bottom: { garment: 'jeans', subtype: 'baggy', color: 'dark wash', material: 'denim' },
      shoes: { garment: 'sneaker', subtype: 'chunky', color: 'white', material: 'leather' },
      jewelry: { necklace: 'Layered chains', metal: 'Silver' },
    },
  },
  {
    id: 'builtin-jeans-coastal-light',
    name: 'Coastal Light-Wash',
    category: ['jeans'],
    config: {
      top: { garment: 'shirt', subtype: 'linen', color: 'white', material: 'linen' },
      bottom: { garment: 'jeans', subtype: 'mom-fit', color: 'light wash', material: 'denim' },
      shoes: { garment: 'sandal', subtype: 'flat', color: 'tan', material: 'leather' },
    },
  },
  {
    id: 'builtin-jeans-y2k-lowrise',
    name: 'Y2K Low-Rise',
    category: ['jeans'],
    config: {
      top: { garment: 'crop-top', subtype: 'ribbed', color: 'white', material: 'cotton' },
      bottom: { garment: 'jeans', subtype: 'baggy', color: 'light wash', material: 'denim' },
      shoes: { garment: 'sneaker', subtype: 'chunky', color: 'white', material: 'leather' },
      belt: { garment: 'classic', subtype: 'logo plate', color: 'brown', material: 'leather' },
    },
  },

  // ─────── TROUSERS / TAILORING ───────
  {
    id: 'builtin-trousers-office-siren',
    name: 'Office Siren Tailoring',
    category: ['trousers', 'garments'],
    config: {
      top: { garment: 'blouse', subtype: 'silk', color: 'black', material: 'silk' },
      bottom: { garment: 'trousers', subtype: 'tailored', color: 'black', material: 'wool' },
      shoes: { garment: 'heel', subtype: 'stiletto', color: 'black', material: 'leather' },
    },
  },
  {
    id: 'builtin-trousers-tonal',
    name: 'Tonal Tailoring',
    category: ['trousers', 'garments'],
    recommended: true,
    config: {
      top: { garment: 'knit', subtype: 'crewneck', color: 'beige', material: 'cashmere' },
      bottom: { garment: 'trousers', subtype: 'pleated', color: 'beige', material: 'wool' },
      shoes: { garment: 'loafer', subtype: 'penny', color: 'brown', material: 'leather' },
    },
  },
  {
    id: 'builtin-trousers-wide-tank',
    name: 'Wide-Leg & Tank',
    category: ['trousers', 'garments'],
    recommended: true,
    config: {
      top: { garment: 'tank', subtype: 'ribbed', color: 'white', material: 'cotton' },
      bottom: { garment: 'trousers', subtype: 'wide-leg', color: 'black', material: 'wool' },
      shoes: { garment: 'mule', subtype: 'pointed', color: 'black', material: 'leather' },
    },
  },
  {
    id: 'builtin-trousers-pleated-heritage',
    name: 'Pleated Heritage',
    category: ['trousers', 'garments'],
    config: {
      top: { garment: 'shirt', subtype: 'oxford', color: 'white', material: 'cotton' },
      bottom: { garment: 'trousers', subtype: 'pleated', color: 'cream', material: 'wool' },
      shoes: { garment: 'loafer', subtype: 'tassel', color: 'brown', material: 'leather' },
      belt: { garment: 'classic', subtype: 'minimal', color: 'brown', material: 'leather' },
    },
  },
  {
    id: 'builtin-trousers-cargo-tech',
    name: 'Cargo Tech',
    category: ['trousers', 'garments'],
    config: {
      top: { garment: 't-shirt', subtype: 'crew', color: 'black', material: 'cotton' },
      bottom: { garment: 'trousers', subtype: 'cargo', color: 'olive', material: 'cotton' },
      shoes: { garment: 'sneaker', subtype: 'chunky', color: 'black', material: 'mesh' },
    },
  },

  // ─────── SKIRTS ───────
  {
    id: 'builtin-skirt-pencil-knit',
    name: 'Pencil & Knit',
    category: ['skirts', 'garments'],
    recommended: true,
    config: {
      top: { garment: 'knit', subtype: 'crewneck', color: 'cream', material: 'cashmere' },
      bottom: { garment: 'skirt', subtype: 'pencil', color: 'black', material: 'wool' },
      shoes: { garment: 'heel', subtype: 'kitten', color: 'black', material: 'leather' },
    },
  },
  {
    id: 'builtin-skirt-pleated-prep',
    name: 'Pleated Midi Prep',
    category: ['skirts', 'garments'],
    config: {
      top: { garment: 'shirt', subtype: 'poplin', color: 'white', material: 'cotton' },
      bottom: { garment: 'skirt', subtype: 'pleated', color: 'navy', material: 'wool' },
      shoes: { garment: 'loafer', subtype: 'penny', color: 'brown', material: 'leather' },
    },
  },
  {
    id: 'builtin-skirt-mini-boot',
    name: 'Mini & Boot',
    category: ['skirts', 'garments'],
    config: {
      top: { garment: 'knit', subtype: 'turtleneck', color: 'black', material: 'wool' },
      bottom: { garment: 'skirt', subtype: 'mini', color: 'black', material: 'leather' },
      shoes: { garment: 'boot', subtype: 'knee-high', color: 'black', material: 'leather' },
    },
  },
  {
    id: 'builtin-skirt-maxi-resort',
    name: 'Maxi Resort',
    category: ['skirts', 'garments'],
    config: {
      top: { garment: 'crop-top', subtype: 'halter', color: 'cream', material: 'silk' },
      bottom: { garment: 'skirt', subtype: 'maxi', color: 'cream', material: 'silk' },
      shoes: { garment: 'sandal', subtype: 'flat', color: 'tan', material: 'leather' },
    },
  },

  // ─────── SHORTS ───────
  {
    id: 'builtin-shorts-bermuda-tailored',
    name: 'Bermuda Tailored',
    category: ['shorts', 'garments'],
    recommended: true,
    config: {
      top: { garment: 'shirt', subtype: 'poplin', color: 'white', material: 'cotton' },
      bottom: { garment: 'shorts', subtype: 'bermuda', color: 'beige', material: 'cotton' },
      shoes: { garment: 'loafer', subtype: 'penny', color: 'brown', material: 'leather' },
    },
  },
  {
    id: 'builtin-shorts-denim-cafe',
    name: 'Denim Café',
    category: ['shorts', 'garments'],
    config: {
      top: { garment: 't-shirt', subtype: 'crew', color: 'white', material: 'cotton' },
      bottom: { garment: 'shorts', subtype: 'denim', color: 'mid wash', material: 'denim' },
      shoes: { garment: 'sneaker', subtype: 'low-top', color: 'white', material: 'canvas' },
    },
  },
  {
    id: 'builtin-shorts-cargo-tech',
    name: 'Cargo Tech Short',
    category: ['shorts', 'garments'],
    config: {
      top: { garment: 'tank', subtype: 'ribbed', color: 'black', material: 'cotton' },
      bottom: { garment: 'shorts', subtype: 'cargo', color: 'olive', material: 'cotton' },
      shoes: { garment: 'sneaker', subtype: 'chunky', color: 'black', material: 'mesh' },
    },
  },

  // ─────── JACKETS / BLAZERS / COATS ───────
  {
    id: 'builtin-jacket-biker',
    name: 'Biker Edge',
    category: ['jackets'],
    config: {
      outerwear: { garment: 'jacket', subtype: 'leather biker', color: 'black', material: 'leather' },
      top: { garment: 't-shirt', subtype: 'crew', color: 'white', material: 'cotton' },
      bottom: { garment: 'jeans', subtype: 'slim', color: 'black', material: 'denim' },
      shoes: { garment: 'boot', subtype: 'combat', color: 'black', material: 'leather' },
    },
  },
  {
    id: 'builtin-jacket-equestrian',
    name: 'Equestrian Heritage',
    category: ['jackets'],
    config: {
      outerwear: { garment: 'blazer', subtype: 'tailored', color: 'navy', material: 'wool' },
      top: { garment: 'shirt', subtype: 'oxford', color: 'white', material: 'cotton' },
      bottom: { garment: 'trousers', subtype: 'tailored', color: 'cream', material: 'cotton' },
      shoes: { garment: 'boot', subtype: 'ankle', color: 'brown', material: 'leather' },
    },
  },
  {
    id: 'builtin-jacket-tailored-weekend',
    name: 'Tailored Weekend',
    category: ['jackets'],
    recommended: true,
    config: {
      outerwear: { garment: 'blazer', subtype: 'oversized', color: 'beige', material: 'wool' },
      top: { garment: 't-shirt', subtype: 'crew', color: 'white', material: 'cotton' },
      bottom: { garment: 'jeans', subtype: 'straight', color: 'mid wash', material: 'denim' },
      shoes: { garment: 'loafer', subtype: 'penny', color: 'brown', material: 'leather' },
    },
  },
  {
    id: 'builtin-jacket-workwear-chore',
    name: 'Workwear Chore',
    category: ['jackets'],
    config: {
      outerwear: { garment: 'jacket', subtype: 'denim', color: 'mid wash', material: 'denim' },
      top: { garment: 't-shirt', subtype: 'crew', color: 'cream', material: 'cotton' },
      bottom: { garment: 'trousers', subtype: 'straight', color: 'beige', material: 'cotton' },
      shoes: { garment: 'boot', subtype: 'ankle', color: 'brown', material: 'leather' },
    },
  },
  {
    id: 'builtin-jacket-trench-quiet',
    name: 'Trench Quiet Luxury',
    category: ['jackets'],
    recommended: true,
    config: {
      outerwear: { garment: 'coat', subtype: 'trench', color: 'beige', material: 'cotton' },
      top: { garment: 'knit', subtype: 'turtleneck', color: 'cream', material: 'cashmere' },
      bottom: { garment: 'trousers', subtype: 'wide-leg', color: 'cream', material: 'wool' },
      shoes: { garment: 'loafer', subtype: 'penny', color: 'brown', material: 'leather' },
    },
  },
  {
    id: 'builtin-jacket-puffer-sport',
    name: 'Puffer Sport',
    category: ['jackets'],
    config: {
      outerwear: { garment: 'coat', subtype: 'puffer', color: 'black', material: 'nylon' },
      top: { garment: 'hoodie', subtype: 'pullover', color: 'grey', material: 'cotton' },
      bottom: { garment: 'trousers', subtype: 'jogger', color: 'black', material: 'cotton' },
      shoes: { garment: 'sneaker', subtype: 'chunky', color: 'white', material: 'leather' },
    },
  },

  // ─────── SWIMWEAR ───────
  {
    id: 'builtin-swim-beach-walk',
    name: 'Beach Walk Linen',
    category: ['swimwear'],
    recommended: true,
    config: {
      coverUp: { garment: 'beach-shirt', subtype: 'oversized', color: 'white', material: 'linen' },
      bottom: { garment: 'shorts', subtype: 'micro', color: 'cream', material: 'linen' },
      hat: { garment: 'wide-brim', subtype: 'straw', color: 'natural', material: 'straw' },
      shoes: { garment: 'sandal', subtype: 'slide', color: 'tan', material: 'leather' },
    },
  },
  {
    id: 'builtin-swim-resort-kaftan',
    name: 'Resort Pool Kaftan',
    category: ['swimwear'],
    config: {
      coverUp: { garment: 'kaftan', subtype: 'flowy', color: 'cream', material: 'silk' },
      shoes: { garment: 'sandal', subtype: 'flat', color: 'gold', material: 'leather' },
      jewelry: { necklace: 'Layered chains', metal: 'Gold' },
    },
  },
  {
    id: 'builtin-swim-sunset-coverup',
    name: 'Sunset Cover-Up',
    category: ['swimwear'],
    config: {
      coverUp: { garment: 'sarong', subtype: 'wrap', color: 'rust', material: 'cotton' },
      shoes: { garment: 'sandal', subtype: 'flat', color: 'tan', material: 'leather' },
    },
  },
  {
    id: 'builtin-swim-bare-hero',
    name: 'Bare Hero',
    category: ['swimwear'],
    config: {
      jewelry: { necklace: 'Pendant', metal: 'Gold' },
    },
  },

  // ─────── ACTIVEWEAR ───────
  {
    id: 'builtin-active-pilates',
    name: 'Studio Pilates',
    category: ['activewear'],
    recommended: true,
    config: {
      top: { garment: 'tank', subtype: 'ribbed', color: 'cream', material: 'cotton' },
      bottom: { garment: 'leggings', subtype: 'high-waist', color: 'beige', material: 'lycra' },
      shoes: { garment: 'sneaker', subtype: 'minimal', color: 'white', material: 'mesh' },
    },
  },
  {
    id: 'builtin-active-run-club',
    name: 'Run Club',
    category: ['activewear'],
    config: {
      top: { garment: 'tank', subtype: 'racerback', color: 'black', material: 'jersey' },
      bottom: { garment: 'shorts', subtype: 'micro', color: 'black', material: 'lycra' },
      shoes: { garment: 'sneaker', subtype: 'retro runner', color: 'white', material: 'mesh' },
    },
  },
  {
    id: 'builtin-active-yoga-flow',
    name: 'Yoga Flow',
    category: ['activewear'],
    config: {
      top: { garment: 'bodysuit', subtype: 'long-sleeve', color: 'black', material: 'jersey' },
      bottom: { garment: 'leggings', subtype: 'high-waist', color: 'black', material: 'lycra' },
    },
  },
  {
    id: 'builtin-active-sport-editorial',
    name: 'Sport Editorial',
    category: ['activewear'],
    config: {
      top: { garment: 'hoodie', subtype: 'cropped', color: 'grey', material: 'cotton' },
      bottom: { garment: 'leggings', subtype: 'high-waist', color: 'black', material: 'lycra' },
      shoes: { garment: 'sneaker', subtype: 'chunky', color: 'white', material: 'mesh' },
    },
  },

  // ─────── LINGERIE ───────
  {
    id: 'builtin-lingerie-editorial-bare',
    name: 'Editorial Bare',
    category: ['lingerie'],
    recommended: true,
    config: {
      jewelry: { necklace: 'Pendant', earrings: 'Studs', metal: 'Gold' },
    },
  },
  {
    id: 'builtin-lingerie-robe',
    name: 'Robe Layered',
    category: ['lingerie'],
    config: {
      outerwear: { garment: 'cardigan', subtype: 'long', color: 'cream', material: 'silk' },
      jewelry: { earrings: 'Drops', metal: 'Gold' },
    },
  },
  {
    id: 'builtin-lingerie-minimal-boudoir',
    name: 'Minimal Boudoir',
    category: ['lingerie'],
    config: {
      jewelry: { necklace: 'Choker', metal: 'Silver' },
    },
  },

  // ─────── SHOES (sneakers / boots / heels) ───────
  {
    id: 'builtin-shoes-sneaker-clean',
    name: 'Sneaker Clean',
    category: ['sneakers', 'shoes'],
    recommended: true,
    config: {
      top: { garment: 't-shirt', subtype: 'crew', color: 'white', material: 'cotton' },
      bottom: { garment: 'jeans', subtype: 'straight', color: 'mid wash', material: 'denim' },
    },
  },
  {
    id: 'builtin-shoes-boot-quiet',
    name: 'Boot Quiet Luxury',
    category: ['boots', 'shoes'],
    recommended: true,
    config: {
      top: { garment: 'knit', subtype: 'turtleneck', color: 'cream', material: 'cashmere' },
      bottom: { garment: 'trousers', subtype: 'tailored', color: 'beige', material: 'wool' },
    },
  },
  {
    id: 'builtin-shoes-heel-elegance',
    name: 'Heel Elegance',
    category: ['high-heels', 'shoes'],
    recommended: true,
    config: {
      dress: { garment: 'dress', subtype: 'midi', color: 'black', material: 'silk' },
    },
  },
  {
    id: 'builtin-shoes-loafer-prep',
    name: 'Loafer Prep',
    category: ['shoes'],
    config: {
      top: { garment: 'shirt', subtype: 'oxford', color: 'white', material: 'cotton' },
      bottom: { garment: 'trousers', subtype: 'pleated', color: 'cream', material: 'wool' },
    },
  },

  // ─────── UNIVERSAL FALLBACKS (always shown) ───────
  {
    id: 'builtin-universal-coastal-minimal',
    name: 'Coastal Minimal',
    category: ['universal'],
    recommended: true,
    config: {
      top: { garment: 'shirt', subtype: 'linen', color: 'white', material: 'linen', fit: 'relaxed' },
      bottom: { garment: 'trousers', subtype: 'wide-leg', color: 'cream', material: 'linen' },
      shoes: { garment: 'sandal', subtype: 'flat', color: 'tan', material: 'leather' },
    },
  },
  {
    id: 'builtin-universal-quiet-luxury',
    name: 'Quiet Luxury',
    category: ['universal'],
    recommended: true,
    config: {
      top: { garment: 'knit', subtype: 'crewneck', color: 'cream', material: 'cashmere' },
      bottom: { garment: 'trousers', subtype: 'tailored', color: 'beige', material: 'wool' },
      shoes: { garment: 'loafer', subtype: 'penny', color: 'brown', material: 'leather' },
      jewelry: { earrings: 'Small hoops', metal: 'Gold' },
    },
  },
  {
    id: 'builtin-universal-street-editorial',
    name: 'Street Editorial',
    category: ['universal'],
    config: {
      top: { garment: 't-shirt', subtype: 'oversized', color: 'white', material: 'cotton' },
      bottom: { garment: 'jeans', subtype: 'baggy', color: 'mid wash', material: 'denim' },
      shoes: { garment: 'sneaker', subtype: 'chunky', color: 'white', material: 'leather' },
    },
  },
  {
    id: 'builtin-universal-resort-eclectic',
    name: 'Resort Eclectic',
    category: ['universal'],
    config: {
      top: { garment: 'crop-top', subtype: 'halter', color: 'cream', material: 'silk' },
      bottom: { garment: 'skirt', subtype: 'maxi', color: 'cream', material: 'linen' },
      shoes: { garment: 'sandal', subtype: 'flat', color: 'tan', material: 'leather' },
      hat: { garment: 'wide-brim', subtype: 'straw', color: 'natural', material: 'straw' },
    },
  },
  {
    id: 'builtin-universal-sport-editorial',
    name: 'Sport Editorial',
    category: ['universal'],
    config: {
      top: { garment: 'hoodie', subtype: 'cropped', color: 'grey', material: 'cotton' },
      bottom: { garment: 'leggings', subtype: 'high-waist', color: 'black', material: 'lycra' },
      shoes: { garment: 'sneaker', subtype: 'chunky', color: 'white', material: 'mesh' },
    },
  },
  {
    id: 'builtin-universal-editorial-black',
    name: 'Editorial Black',
    category: ['universal'],
    config: {
      top: { garment: 'knit', subtype: 'turtleneck', color: 'black', material: 'wool' },
      bottom: { garment: 'trousers', subtype: 'wide-leg', color: 'black', material: 'wool' },
      shoes: { garment: 'boot', subtype: 'chelsea', color: 'black', material: 'leather' },
    },
  },
];

// ── Neutral palette check — used by auto-pick to prefer color-cohesive presets ──
const NEUTRAL_COLORS = new Set(['white', 'cream', 'beige', 'black', 'tan', 'brown', 'camel', 'grey', 'navy', 'natural']);
function isNeutralPreset(p: BuiltInPreset): boolean {
  const colors: string[] = [];
  const cfg = p.config as Record<string, unknown>;
  for (const key of Object.keys(cfg)) {
    const v = cfg[key] as { color?: string } | undefined;
    if (v && typeof v === 'object' && v.color) colors.push(v.color.toLowerCase());
  }
  if (colors.length === 0) return true;
  return colors.every(c => NEUTRAL_COLORS.has(c));
}

/** Filter built-in presets by union of product categories. Universal presets always included at the end. */
export function filterPresetsByCategories(categories: string[] | undefined): BuiltInPreset[] {
  const cats = new Set((categories || []).filter(Boolean));
  if (cats.size === 0) return BUILT_IN_PRESETS.filter(p => p.category.includes('universal'));
  const matched = BUILT_IN_PRESETS.filter(p =>
    p.category.some(c => cats.has(c)) && !p.category.includes('universal')
  );
  const universal = BUILT_IN_PRESETS.filter(p => p.category.includes('universal'));
  return [...matched, ...universal];
}

/** Pick the best default preset for the given product categories. Prefers `recommended` + neutral palette. */
export function pickDefaultPreset(categories: string[] | undefined): BuiltInPreset | null {
  const candidates = filterPresetsByCategories(categories);
  if (candidates.length === 0) return null;
  const recommended = candidates.filter(p => p.recommended);
  const pool = recommended.length > 0 ? recommended : candidates;
  const neutral = pool.find(isNeutralPreset);
  return neutral || pool[0];
}

// Stable string hash → non-negative int (used for deterministic per-product variety)
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Pick a curated preset for a single product, deterministically varied by `seed`.
 * Bumping `seed` (e.g. via the "Re-style" button) yields a different but still on-category pick.
 */
export function pickPresetForProduct(
  productId: string,
  categories: string[] | undefined,
  seed = 0,
): BuiltInPreset | null {
  const candidates = filterPresetsByCategories(categories);
  if (candidates.length === 0) return null;
  const recommended = candidates.filter(p => p.recommended);
  const pool = recommended.length > 0 ? recommended : candidates;
  const idx = hashString(`${productId}::${seed}`) % pool.length;
  return pool[idx];
}

/**
 * Pick a different curated preset per product. Each product gets a category-appropriate
 * look; the same productId+seed deterministically yields the same result so re-mounts are stable.
 * Tries to avoid duplicate preset names within a single batch when the pool is large enough.
 */
export function pickDefaultPresetPerProduct(
  products: Array<{ id: string; categories?: string[] }>,
  seed = 0,
): Record<string, BuiltInPreset> {
  const result: Record<string, BuiltInPreset> = {};
  const usedIds = new Set<string>();
  for (const p of products) {
    const cats = p.categories && p.categories.length > 0 ? p.categories : undefined;
    const candidates = filterPresetsByCategories(cats);
    if (candidates.length === 0) continue;
    const recommended = candidates.filter(c => c.recommended);
    const pool = recommended.length > 0 ? recommended : candidates;
    // Pick deterministically, then walk forward to dodge duplicates if pool allows it
    const start = hashString(`${p.id}::${seed}`) % pool.length;
    let pick = pool[start];
    if (pool.length > usedIds.size) {
      for (let i = 0; i < pool.length; i++) {
        const cand = pool[(start + i) % pool.length];
        if (!usedIds.has(cand.id)) { pick = cand; break; }
      }
    }
    usedIds.add(pick.id);
    result[p.id] = pick;
  }
  return result;
}
