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
    id: 'cream-knit-denim',
    label: 'Cream Knit & Denim',
    vibe: 'Soft cream knit + light wash jeans',
    phrase: 'wearing a soft cream knit sweater and light-wash straight-leg jeans, minimal silver jewelry',
  },
  {
    id: 'white-tee-tailored',
    label: 'White Tee & Tailored',
    vibe: 'Crisp white tee + beige tailored trousers',
    phrase: 'wearing a crisp white fitted t-shirt tucked into pleated beige tailored trousers, slim leather belt',
  },
  {
    id: 'linen-set',
    label: 'Linen Set',
    vibe: 'Relaxed cream linen co-ord',
    phrase: 'wearing a relaxed cream linen button-up shirt and matching wide-leg linen trousers, softly draped',
  },
  {
    id: 'black-slip-cardigan',
    label: 'Black Slip & Cardigan',
    vibe: 'Black slip dress, oat cardigan',
    phrase: 'wearing a simple black silk slip dress layered with an oversized oat-coloured fine-knit cardigan',
  },
  {
    id: 'oversized-blazer',
    label: 'Oversized Blazer Look',
    vibe: 'Black blazer, white tee, straight jeans',
    phrase: 'wearing an oversized black wool blazer over a plain white t-shirt and dark straight-leg jeans, sleeves slightly pushed up',
  },
  {
    id: 'athleisure-neutral',
    label: 'Athleisure Neutral',
    vibe: 'Beige hoodie + matching joggers',
    phrase: 'wearing a tonal beige cotton hoodie and matching tapered joggers, clean white minimal sneakers',
  },
  {
    id: 'trench-off-duty',
    label: 'Trench Off-Duty',
    vibe: 'Camel trench, white tee, jeans',
    phrase: 'wearing a long camel trench coat over a white t-shirt and mid-wash straight jeans, casual off-duty styling',
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
