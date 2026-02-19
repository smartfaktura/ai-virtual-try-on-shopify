import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useCredits } from '@/contexts/CreditContext';

export function LowCreditsBanner() {
  const { balance, isLow, isCritical, isEmpty, openBuyModal } = useCredits();
  const [dismissed, setDismissed] = useState(false);
  
  if (dismissed || (!isLow && !isCritical && !isEmpty)) {
    return null;
  }
  
  const title = isEmpty 
    ? "You're out of credits" 
    : isCritical 
      ? 'Almost out of credits'
      : 'Running low on credits';
  const message = isEmpty
    ? 'Top up to keep creating with VOVV.AI'
    : isCritical
      ? `Only ${balance} credits left — top up to avoid interruptions`
      : `You have ${balance} credits remaining. Top up to keep creating`;
  
  return (
    <div className="mb-4 bg-primary text-primary-foreground rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <Sparkles className="h-5 w-5 shrink-0 opacity-80" />
        <div className="min-w-0">
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-sm opacity-80">{message}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
        <button
          onClick={openBuyModal}
          className="bg-white text-primary hover:bg-white/90 rounded-lg px-4 py-2 text-sm font-semibold transition-colors w-full sm:w-auto"
        >
          Buy Credits
        </button>
        {!isEmpty && (
          <button onClick={() => setDismissed(true)} className="opacity-60 hover:opacity-100 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
