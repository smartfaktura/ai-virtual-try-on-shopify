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
export const BUILT_IN_PRESETS: Array<{ id: string; name: string; config: OutfitConfig }> = [
  {
    id: 'builtin-quiet-luxury',
    name: 'Quiet Luxury Neutral',
    config: {
      top: { garment: 'knit', subtype: 'crewneck', color: 'cream', material: 'cashmere' },
      bottom: { garment: 'trousers', subtype: 'tailored', color: 'beige', material: 'wool', fit: 'relaxed' },
      shoes: { garment: 'loafer', subtype: 'penny', color: 'brown', material: 'leather' },
      jewelry: { earrings: 'Small hoops', metal: 'Gold' },
    },
  },
  {
    id: 'builtin-streetwear',
    name: 'Streetwear Y2K',
    config: {
      top: { garment: 't-shirt', subtype: 'oversized', color: 'white', material: 'cotton' },
      bottom: { garment: 'jeans', subtype: 'baggy', color: 'mid wash', material: 'denim' },
      shoes: { garment: 'sneaker', subtype: 'chunky', color: 'white', material: 'leather' },
      bag: { garment: 'tote', subtype: 'oversized', color: 'black', material: 'canvas' },
      jewelry: { necklace: 'Layered chains', metal: 'Silver' },
    },
  },
  {
    id: 'builtin-editorial-black',
    name: 'Editorial Black',
    config: {
      top: { garment: 'knit', subtype: 'turtleneck', color: 'black', material: 'wool' },
      bottom: { garment: 'trousers', subtype: 'wide-leg', color: 'black', material: 'wool' },
      shoes: { garment: 'boot', subtype: 'chelsea', color: 'black', material: 'leather' },
      jewelry: { earrings: 'Studs', metal: 'Silver' },
    },
  },
  {
    id: 'builtin-beach-linen',
    name: 'Beach Linen',
    config: {
      top: { garment: 'shirt', subtype: 'linen', color: 'white', material: 'linen', fit: 'relaxed' },
      bottom: { garment: 'trousers', subtype: 'wide-leg', color: 'cream', material: 'linen' },
      shoes: { garment: 'sandal', subtype: 'flat', color: 'tan', material: 'leather' },
      hat: { garment: 'wide-brim', subtype: 'straw', color: 'natural', material: 'straw' },
    },
  },
];
