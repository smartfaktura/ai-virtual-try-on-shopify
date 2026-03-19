// Credit cost calculation for Creative Drops

export interface WorkflowCostConfig {
  workflowId: string;
  workflowName: string;
  hasModel: boolean;
  hasCustomScene: boolean;
  formatCount?: number;
  imageCountOverride?: number;
  productCount?: number;
}

export interface CreditBreakdown {
  workflowId: string;
  workflowName: string;
  imageCount: number;
  costPerImage: number;
  subtotal: number;
  formatCount?: number;
  productCount?: number;
}

export interface DropCostEstimate {
  breakdown: CreditBreakdown[];
  totalCredits: number;
  totalImages: number;
  monthlyProjection: number;
}

function getCostPerImage(): number {
  return 6; // All workflows cost 6 credits per image
}

/**
 * Calculate drop credits with per-workflow image counts and product counts.
 * @param workflows - array of workflow configs, each can have its own imageCountOverride and productCount
 * @param defaultImagesPerDrop - fallback image count when imageCountOverride is not set
 * @param frequency - 'weekly' | 'biweekly' | 'monthly' | 'one-time'
 * @param defaultProductCount - fallback product count when workflow doesn't specify its own
 */
export function calculateDropCredits(
  workflows: WorkflowCostConfig[],
  defaultImagesPerDrop: number,
  frequency: string,
  defaultProductCount: number = 1
): DropCostEstimate {
  if (workflows.length === 0) {
    return { breakdown: [], totalCredits: 0, totalImages: 0, monthlyProjection: 0 };
  }

  const costPerImage = getCostPerImage();

  const breakdown: CreditBreakdown[] = workflows.map((wf) => {
    const effectiveProductCount = Math.max(wf.productCount ?? defaultProductCount, 1);
    const effectiveImageCount = wf.imageCountOverride ?? defaultImagesPerDrop;
    const formatCount = Math.max(wf.formatCount || 1, 1);
    const imageCount = effectiveImageCount * effectiveProductCount;
    return {
      workflowId: wf.workflowId,
      workflowName: wf.workflowName,
      imageCount,
      costPerImage,
      subtotal: imageCount * costPerImage * formatCount,
      formatCount,
      productCount: effectiveProductCount,
    };
  });

  const totalCredits = breakdown.reduce((sum, b) => sum + b.subtotal, 0);
  const totalImages = breakdown.reduce((sum, b) => sum + b.imageCount * (b.formatCount || 1), 0);

  const frequencyMultiplier: Record<string, number> = {
    weekly: 4,
    biweekly: 2,
    monthly: 1,
    'one-time': 0,
  };
  const monthlyProjection = totalCredits * (frequencyMultiplier[frequency] ?? 1);

  return { breakdown, totalCredits, totalImages, monthlyProjection };
}
