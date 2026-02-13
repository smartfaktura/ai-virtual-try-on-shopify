import type { FramingOption } from '@/types';

export interface FramingOptionConfig {
  value: FramingOption;
  label: string;
  description: string;
  keywords: string[];
}

export const FRAMING_OPTIONS: FramingOptionConfig[] = [
  {
    value: 'full_body',
    label: 'Full Body',
    description: 'Head to toe, full outfit',
    keywords: ['dress', 'jumpsuit', 'romper', 'outfit', 'full body'],
  },
  {
    value: 'upper_body',
    label: 'Upper Body',
    description: 'Waist up, tops & social',
    keywords: ['top', 'shirt', 'blouse', 'hoodie', 'sweater', 'jacket'],
  },
  {
    value: 'close_up',
    label: 'Close-Up',
    description: 'Shoulders up, detail focus',
    keywords: ['scarf', 'scarves', 'glasses', 'sunglasses'],
  },
  {
    value: 'hand_wrist',
    label: 'Hand / Wrist',
    description: 'Watches, bracelets, rings',
    keywords: ['watch', 'bracelet', 'ring', 'bangle', 'wristband', 'cuff'],
  },
  {
    value: 'neck_shoulders',
    label: 'Neck / Shoulders',
    description: 'Necklaces, earrings, pendants',
    keywords: ['necklace', 'earring', 'earrings', 'pendant', 'choker', 'collar'],
  },
  {
    value: 'lower_body',
    label: 'Lower Body',
    description: 'Shoes, pants, skirts',
    keywords: ['shoes', 'sneakers', 'boots', 'heels', 'sandals', 'loafers', 'slides'],
  },
  {
    value: 'back_view',
    label: 'Back View',
    description: 'Backpacks, rear details',
    keywords: ['backpack', 'tote', 'rucksack'],
  },
];

/**
 * Auto-detect the best framing based on product type and tags
 */
export function detectDefaultFraming(productType: string, tags: string[] = []): FramingOption | null {
  const combined = `${productType} ${tags.join(' ')}`.toLowerCase();

  for (const option of FRAMING_OPTIONS) {
    // Skip full_body and upper_body — these are general defaults, not auto-detectable
    if (option.value === 'full_body' || option.value === 'upper_body') continue;
    if (option.keywords.some(kw => combined.includes(kw))) {
      return option.value;
    }
  }

  return null;
}

/**
 * Build prompt injection text for the selected framing
 */
export function buildFramingPrompt(framing: FramingOption, hasModel: boolean): string {
  const modelRef = hasModel
    ? ' The body area shown must match the exact skin tone, age, and body characteristics of the person in [MODEL IMAGE].'
    : '';

  switch (framing) {
    case 'full_body':
      return `FRAMING: Full body shot, head to toe. Show the complete outfit and full figure.${modelRef}`;
    case 'upper_body':
      return `FRAMING: Upper body shot, from the waist up. Focus on the torso and face area.${modelRef}`;
    case 'close_up':
      return `FRAMING: Close-up shot from the shoulders and chest upward. Emphasize fine details of the product.${modelRef}`;
    case 'hand_wrist':
      return `FRAMING: Show only the hand and wrist area. The product should be naturally worn on the wrist or hand. Do NOT include the face.${modelRef}`;
    case 'neck_shoulders':
      return `FRAMING: Jewelry display framing — product shown on the collarbone area of the model, cropped from just above the shoulders to below the collarbones. Professional product photography composition.${modelRef}`;
    case 'lower_body':
      return `FRAMING: Lower body shot from the hips to the feet. Focus on the legs and footwear area.${modelRef}`;
    case 'back_view':
      return `FRAMING: Back view showing the product from behind. The subject should be facing away from the camera.${modelRef}`;
    default:
      return '';
  }
}
