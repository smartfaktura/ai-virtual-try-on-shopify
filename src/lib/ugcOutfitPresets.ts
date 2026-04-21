// Curated outfit presets for the Selfie/UGC workflow.
// Sent to the backend as `outfit_phrase` and injected into the OUTFIT STYLING block.

export interface UgcOutfitPreset {
  id: string;
  label: string;
  vibe: string;
  phrase: string; // empty string = no override (Auto)
  recommended?: boolean;
}

export const UGC_OUTFIT_PRESETS: UgcOutfitPreset[] = [
  {
    id: 'auto',
    label: 'Auto',
    vibe: 'Smart pick for the scene',
    phrase: '',
    recommended: true,
  },
  {
    id: 'bright-minimal-activewear',
    label: 'Bright Minimal Activewear',
    vibe: 'Crisp white sport set',
    phrase: 'wearing a fitted bright white minimal activewear set, clean lines, no visible logos',
  },
  {
    id: 'soft-beige-loungewear',
    label: 'Soft Beige Loungewear',
    vibe: 'Tonal beige knit set',
    phrase: 'wearing a tonal soft beige ribbed loungewear set, relaxed and quiet',
  },
  {
    id: 'crisp-white-shirt',
    label: 'Crisp White Shirt',
    vibe: 'White shirt, light denim',
    phrase: 'wearing a crisp oversized white cotton shirt with light-wash straight jeans',
  },
  {
    id: 'black-tee-tailored',
    label: 'Black Tee Tailored',
    vibe: 'Black tee, black trousers',
    phrase: 'wearing a fitted plain black t-shirt tucked into tailored black trousers',
  },
  {
    id: 'cream-linen-set',
    label: 'Cream Linen Set',
    vibe: 'Soft cream linen co-ord',
    phrase: 'wearing a soft cream linen shirt and matching wide-leg linen trousers',
  },
  {
    id: 'oversized-grey-knit',
    label: 'Oversized Grey Knit',
    vibe: 'Grey knit, light denim',
    phrase: 'wearing an oversized soft grey fine-knit sweater with light-wash straight jeans',
  },
  {
    id: 'camel-trench-minimal',
    label: 'Camel Trench Minimal',
    vibe: 'Camel coat, white tee',
    phrase: 'wearing a clean camel trench coat over a plain white t-shirt and slim dark jeans',
  },
];

/**
 * Resolve the outfit phrase to send to the backend.
 * Returns undefined when:
 *  - the user picked "auto" (let the scene-default styling apply)
 *  - the interaction is "wearing" (the product itself is the outfit — avoid conflict)
 */
export function resolveUgcOutfitPhrase(
  outfitId: string | undefined,
  interactionPhrase: string | undefined,
): string | undefined {
  if (!outfitId || outfitId === 'auto') return undefined;
  const interactionLower = (interactionPhrase || '').toLowerCase();
  if (interactionLower.includes('wearing') || interactionLower.includes('worn ')) return undefined;
  const preset = UGC_OUTFIT_PRESETS.find(p => p.id === outfitId);
  return preset?.phrase || undefined;
}

export function isOutfitLockedByInteraction(interactionPhrase: string | undefined): boolean {
  const interactionLower = (interactionPhrase || '').toLowerCase();
  return interactionLower.includes('wearing') || interactionLower.includes('worn ');
}
