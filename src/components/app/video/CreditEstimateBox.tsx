import React from 'react';
import { estimateCredits, type CreditEstimateParams } from '@/config/videoCreditPricing';

interface CreditEstimateBoxProps {
  params: CreditEstimateParams;
}

export const CreditEstimateBox = React.forwardRef<HTMLDivElement, CreditEstimateBoxProps>(
  ({ params }, ref) => {
    const credits = estimateCredits(params);

    return (
      <div ref={ref} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 border border-border">
        <span className="text-xs text-muted-foreground">Cost</span>
        <span className="text-xs font-semibold text-foreground">{credits}</span>
      </div>
    );
  }
);

CreditEstimateBox.displayName = 'CreditEstimateBox';
