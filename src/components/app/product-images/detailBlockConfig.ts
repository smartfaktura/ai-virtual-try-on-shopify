import type { ProductImageScene } from './types';

/** Maps trigger block keys to display metadata */
export interface DetailBlockDef {
  key: string;
  title: string;
  description: string;
}

export const DETAIL_BLOCKS: DetailBlockDef[] = [
  { key: 'personDetails', title: 'Visible Person Details', description: 'Configure presentation, age, skin tone, hand style, and more.' },
  { key: 'actionDetails', title: 'Action Details', description: 'Choose action type and intensity for product-in-use scenes.' },
  { key: 'packagingDetails', title: 'Packaging Details', description: 'Define packaging type, state, composition, and reference.' },
];

/** Map detail block keys to the detail settings fields they own */
export const BLOCK_FIELD_MAP: Record<string, string[]> = {
  background: ['backgroundTone', 'shadowStyle', 'compositionFraming', 'negativeSpace'],
  visualDirection: ['mood', 'sceneIntensity', 'productProminence', 'lightingStyle'],
  sceneEnvironment: ['environmentType', 'surfaceType', 'stylingDensity', 'props'],
  personDetails: ['presentation', 'ageRange', 'skinTone', 'handStyle', 'nails', 'jewelryVisible', 'cropType', 'expression', 'hairVisibility'],
  actionDetails: ['actionType', 'actionIntensity'],
  detailFocus: ['focusArea', 'cropIntensity', 'detailStyle'],
  angleSelection: ['requestedViews', 'numberOfViews'],
  packagingDetails: ['packagingType', 'packagingState', 'packagingComposition', 'packagingFocus', 'referenceStrength'],
  productSize: ['productSize'],
  branding: ['brandingVisibility'],
  layout: ['layoutSpace'],
  consistency: ['consistency'],
};

/** Get triggered blocks from a set of selected scene IDs */
export function getTriggeredBlocks(
  selectedSceneIds: Set<string>,
  allScenes: Array<{ id: string; triggerBlocks?: string[] }>,
  productCount: number,
): string[] {
  const blocks = new Set<string>();
  for (const scene of allScenes) {
    if (selectedSceneIds.has(scene.id)) {
      for (const b of (scene.triggerBlocks || [])) blocks.add(b);
    }
  }
  // Always show custom note
  blocks.add('customNote');
  // Consistency only if multiple products
  if (productCount > 1) blocks.add('consistency');
  return Array.from(blocks);
}

/** Group triggered detail blocks by the scenes that caused them.
 *  Returns an array of { scene, blocks } where blocks are unique to that scene group.
 *  If multiple scenes trigger the same block, it appears under the first scene only. */
export interface SceneBlockGroup {
  sceneId: string;
  sceneTitle: string;
  blocks: string[];
  /** Other scene titles that also trigger these blocks */
  alsoUsedBy: string[];
}

export function getBlocksByScene(
  selectedSceneIds: Set<string>,
  allScenes: ProductImageScene[],
): SceneBlockGroup[] {
  const claimed = new Set<string>();
  const groups: SceneBlockGroup[] = [];

  // Track which block belongs to which scenes for "also used by"
  const blockToScenes = new Map<string, string[]>();
  const selectedScenes = allScenes.filter(s => selectedSceneIds.has(s.id));

  for (const scene of selectedScenes) {
    for (const block of (scene.triggerBlocks || [])) {
      if (!blockToScenes.has(block)) blockToScenes.set(block, []);
      blockToScenes.get(block)!.push(scene.title);
    }
  }

  for (const scene of selectedScenes) {
    const newBlocks = (scene.triggerBlocks || []).filter(b => !claimed.has(b));
    if (newBlocks.length === 0) continue;

    for (const b of newBlocks) claimed.add(b);

    const alsoUsedBy: string[] = [];
    for (const b of newBlocks) {
      const others = (blockToScenes.get(b) || []).filter(t => t !== scene.title);
      for (const o of others) {
        if (!alsoUsedBy.includes(o)) alsoUsedBy.push(o);
      }
    }

    groups.push({
      sceneId: scene.id,
      sceneTitle: scene.title,
      blocks: newBlocks,
      alsoUsedBy,
    });
  }

  return groups;
}
