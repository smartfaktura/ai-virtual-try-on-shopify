import React from 'react';
import { Coins } from 'lucide-react';
import { estimateCredits, type CreditEstimateParams } from '@/config/videoCreditPricing';

interface CreditEstimateBoxProps {
  params: CreditEstimateParams;
}

export const CreditEstimateBox = React.forwardRef<HTMLDivElement, CreditEstimateBoxProps>(
  ({ params }, ref) => {
    const credits = estimateCredits(params);

    return (
      <div ref={ref} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
        <Coins className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Estimated cost:</span>
        <span className="text-sm font-semibold text-foreground">{credits} credits</span>
      </div>
    );
  }
);

CreditEstimateBox.displayName = 'CreditEstimateBox';
