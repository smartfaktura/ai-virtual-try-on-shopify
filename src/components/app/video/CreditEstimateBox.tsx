import React from 'react';
import { estimateCredits, type CreditEstimateParams } from '@/config/videoCreditPricing';

interface CreditEstimateBoxProps {
  params: CreditEstimateParams;
}

export const CreditEstimateBox = React.forwardRef<HTMLDivElement, CreditEstimateBoxProps>(
  ({ params }, ref) => {
    const credits = estimateCredits(params);

    return (
      <div ref={ref} className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-muted/50 border border-border">
        <span className="text-sm text-muted-foreground">Cost:</span>
        <span className="text-sm font-semibold text-foreground">{credits} credits</span>
      </div>
    );
  }
);

CreditEstimateBox.displayName = 'CreditEstimateBox';
