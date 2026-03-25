import { Coins } from 'lucide-react';
import { estimateCredits, type CreditEstimateParams } from '@/config/videoCreditPricing';

interface CreditEstimateBoxProps {
  params: CreditEstimateParams;
}

export function CreditEstimateBox({ params }: CreditEstimateBoxProps) {
  const credits = estimateCredits(params);

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
      <Coins className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Estimated cost:</span>
      <span className="text-sm font-semibold text-foreground">{credits} credits</span>
    </div>
  );
}
