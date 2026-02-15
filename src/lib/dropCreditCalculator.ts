// Credit cost calculation for Creative Drops

export interface WorkflowCostConfig {
  workflowId: string;
  workflowName: string;
  hasModel: boolean;
  hasCustomScene: boolean;
}

export interface CreditBreakdown {
  workflowId: string;
  workflowName: string;
  imageCount: number;
  costPerImage: number;
  subtotal: number;
}

export interface DropCostEstimate {
  breakdown: CreditBreakdown[];
  totalCredits: number;
  totalImages: number;
  monthlyProjection: number;
}

// Known workflow IDs from the system
const MODEL_WORKFLOW_IDS = new Set([
  '021146a4-a037-4418-98f8-7910b36e91fe', // Virtual Try-On
  '3b54d43a-a03a-49a6-a64e-bf2dd999abc8', // Selfie / UGC Set
  '6ae70d95-78ec-4e3a-b62b-9c3f8d1e2a5b', // Mirror Selfie
]);

function getCostPerImage(workflowId: string, hasModel: boolean, hasCustomScene: boolean): number {
  if (hasModel && hasCustomScene) return 15;
  if (hasModel || MODEL_WORKFLOW_IDS.has(workflowId)) return 12;
  return 4; // Product Listing, Flat Lay
}

export function calculateDropCredits(
  workflows: WorkflowCostConfig[],
  imagesPerDrop: number,
  frequency: string
): DropCostEstimate {
  if (workflows.length === 0) {
    return { breakdown: [], totalCredits: 0, totalImages: 0, monthlyProjection: 0 };
  }

  const breakdown: CreditBreakdown[] = workflows.map((wf) => {
    const costPerImage = getCostPerImage(wf.workflowId, wf.hasModel, wf.hasCustomScene);
    return {
      workflowId: wf.workflowId,
      workflowName: wf.workflowName,
      imageCount: imagesPerDrop,
      costPerImage,
      subtotal: imagesPerDrop * costPerImage,
    };
  });

  const totalCredits = breakdown.reduce((sum, b) => sum + b.subtotal, 0);
  const totalImages = breakdown.reduce((sum, b) => sum + b.imageCount, 0);

  const frequencyMultiplier: Record<string, number> = {
    weekly: 4,
    biweekly: 2,
    monthly: 1,
    'one-time': 0,
  };
  const monthlyProjection = totalCredits * (frequencyMultiplier[frequency] ?? 1);

  return { breakdown, totalCredits, totalImages, monthlyProjection };
}
