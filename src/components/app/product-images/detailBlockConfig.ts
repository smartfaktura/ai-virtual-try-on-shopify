import type { ProductImageScene } from './types';

/** Maps trigger block keys to display metadata */
export interface DetailBlockDef {
  key: string;
  title: string;
  description: string;
}

/** Reference-image trigger definitions.
 *  When a scene has one of these in its triggerBlocks, the Setup step shows
 *  a dedicated upload card with the specified label & description. */
export interface ReferenceTriggerDef {
  key: string;
  label: string;
  description: string;
  /** Icon hint (not enforced — UI picks its own icon) */
  icon?: string;
  /** Prompt label injected alongside the reference image */
  promptLabel: string;
}

export const REFERENCE_TRIGGERS: Record<string, ReferenceTriggerDef> = {
  atomizerDetail: {
    key: 'atomizerDetail',
    label: 'Upload atomizer close-up',
    description: 'Upload a close-up photo of the atomizer/sprayer mechanism so the AI can accurately render it.',
    promptLabel: 'Atomizer/sprayer close-up reference — use this to accurately render the atomizer mechanism:',
  },
  openBottle: {
    key: 'openBottle',
    label: 'Upload open bottle photo',
    description: 'Upload a photo of the bottle with cap removed so the AI knows the exact opening and inner detail.',
    promptLabel: 'Open bottle reference — use this to accurately render the bottle without cap:',
  },
  capDetail: {
    key: 'capDetail',
    label: 'Upload cap/closure photo',
    description: 'Upload a close-up of the cap or closure mechanism for accurate rendering.',
    promptLabel: 'Cap/closure close-up reference — use this to accurately render the cap detail:',
  },
  interiorDetail: {
    key: 'interiorDetail',
    label: 'Upload interior photo',
    description: 'Upload a photo showing the inside of your bag — lining, pockets, compartments — so the AI can accurately render the interior layout and color.',
    promptLabel: 'Bag interior reference — use this to accurately render the lining, pockets, and internal layout:',
  },
  strapDetail: {
    key: 'strapDetail',
    label: 'Upload strap close-up',
    description: 'Upload a close-up of the strap showing hardware attachment, stitching, and adjustability so the AI can render it accurately.',
    promptLabel: 'Strap/handle close-up reference — use this to accurately render strap construction and hardware attachment:',
  },
  hardwareDetail: {
    key: 'hardwareDetail',
    label: 'Upload hardware close-up',
    description: 'Upload a close-up of the bag\'s metal hardware — zippers, clasps, buckles, rings — for accurate rendering.',
    promptLabel: 'Hardware close-up reference — use this to accurately render metal details, clasps, and zipper pulls:',
  },
  sideView: {
    key: 'sideView',
    label: 'Upload side view photo',
    description: 'Upload a side-view photo of your product for accurate profile rendering.',
    promptLabel: 'Side-view reference — use this to accurately render the product profile and side details:',
  },
  textureDetail: {
    key: 'textureDetail',
    label: 'Upload texture/swatch photo',
    description: 'Upload a photo showing the product texture — cream smear, serum drop, gel swatch — so the AI can accurately render consistency and transparency.',
    promptLabel: 'Product texture reference — use this to accurately render the cream/gel/serum consistency, color, and transparency:',
  },
  brandLogoOverlay: {
    key: 'brandLogoOverlay',
    label: 'Upload brand logo',
    description: 'Upload your brand logo or type the exact text/brand name to display in this shot. If skipped, the AI uses whatever branding is visible on the product.',
    promptLabel: 'Brand logo reference — use this to accurately render the brand logo in the scene:',
  },
  sleeveButtonDetail: {
    key: 'sleeveButtonDetail',
    label: 'Upload sleeve button close-up',
    description: 'Upload a close-up of the cuff buttons so the AI can accurately render button shape, thread, and placement.',
    promptLabel: 'Sleeve button close-up reference — use this to accurately render cuff button details, thread color, and stitching:',
  },
  innerLining: {
    key: 'innerLining',
    label: 'Upload inner lining photo',
    description: 'Upload a photo of the jacket interior — lining pattern, label placement, inner pockets — for accurate rendering.',
    promptLabel: 'Jacket inner lining reference — use this to accurately render the interior lining pattern, label, and inner pocket layout:',
  },
  cuffDetail: {
    key: 'cuffDetail',
    label: 'Upload cuff detail photo',
    description: 'Upload a detail shot of the cuff — stitching, fold, button loop — for editorial-quality cuff rendering.',
    promptLabel: 'Cuff detail reference — use this to accurately render cuff construction, fold, stitching, and button-loop detail:',
  },
  materialDetail: {
    key: 'materialDetail',
    label: 'Upload material/fabric photo',
    description: 'Upload a close-up of the material — wood grain, fabric weave, leather texture, marble veining — so the AI can accurately match the surface finish.',
    promptLabel: 'Material/fabric close-up reference — use this to accurately render the surface texture, grain, and finish of the furniture:',
  },
};

/** All trigger block keys including reference triggers */
export const ALL_TRIGGER_KEYS = [
  ...['background', 'visualDirection', 'sceneEnvironment', 'personDetails',
    'actionDetails', 'detailFocus', 'angleSelection', 'packagingDetails',
    'backView', 'productSize', 'branding', 'layout', 'aestheticColor', 'halfPortrait'],
  ...Object.keys(REFERENCE_TRIGGERS),
];

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
  aestheticColor: ['aestheticColorHex'],
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
