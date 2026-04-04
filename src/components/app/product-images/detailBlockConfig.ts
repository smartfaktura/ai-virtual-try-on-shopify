/** Maps trigger block keys to display metadata */
export interface DetailBlockDef {
  key: string;
  title: string;
  description: string;
}

export const DETAIL_BLOCKS: DetailBlockDef[] = [
  { key: 'background', title: 'Background & Composition', description: 'Control background tone, shadows, framing, and negative space.' },
  { key: 'visualDirection', title: 'Visual Direction', description: 'Set mood, scene intensity, lighting, and product prominence.' },
  { key: 'sceneEnvironment', title: 'Scene Environment', description: 'Define environment type, surface, styling density, and props.' },
  { key: 'personDetails', title: 'Visible Person Details', description: 'Configure presentation, age, skin tone, hand style, and more.' },
  { key: 'actionDetails', title: 'Action Details', description: 'Choose action type and intensity for product-in-use scenes.' },
  { key: 'detailFocus', title: 'Detail Focus', description: 'Set focus area, crop intensity, and detail style.' },
  { key: 'angleSelection', title: 'Angle Selection', description: 'Request specific views and number of angles.' },
  { key: 'packagingDetails', title: 'Packaging Details', description: 'Define packaging type, state, composition, and reference.' },
  { key: 'productSize', title: 'Product Size', description: 'Confirm or correct the detected product size for realistic scale.' },
  { key: 'branding', title: 'Branding Visibility', description: 'Control how prominently branding appears.' },
  { key: 'layout', title: 'Layout Space', description: 'Set the balance between product focus and negative space.' },
];

/** Get triggered blocks from a set of selected scene IDs */
export function getTriggeredBlocks(
  selectedSceneIds: Set<string>,
  allScenes: Array<{ id: string; triggerBlocks: string[] }>,
  productCount: number,
): string[] {
  const blocks = new Set<string>();
  for (const scene of allScenes) {
    if (selectedSceneIds.has(scene.id)) {
      for (const b of scene.triggerBlocks) blocks.add(b);
    }
  }
  // Always show custom note
  blocks.add('customNote');
  // Consistency only if multiple products
  if (productCount > 1) blocks.add('consistency');
  return Array.from(blocks);
}
