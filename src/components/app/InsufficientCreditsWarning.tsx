import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCredits } from '@/contexts/CreditContext';

interface InsufficientCreditsWarningProps {
  cost: number;
  balance: number;
}

export function InsufficientCreditsWarning({ cost, balance }: InsufficientCreditsWarningProps) {
  const { openBuyModal } = useCredits();
  const shortfall = cost - balance;

  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200">
      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
      <div className="flex-1 text-sm">
        <p className="font-medium">Not enough credits — you need {shortfall} more</p>
        <p className="text-xs mt-1 text-amber-300/80">
          <button onClick={() => openBuyModal('topup')} className="underline hover:text-amber-200 cursor-pointer">
            Buy credits
          </button>
          {' or '}
          <Button variant="outline" size="sm" className="h-6 px-2 text-xs border-amber-500/40 text-amber-300 hover:bg-amber-500/20 ml-1" onClick={() => openBuyModal('upgrade')}>
            Upgrade Plan
          </Button>
        </p>
      </div>
    </div>
  );
}
