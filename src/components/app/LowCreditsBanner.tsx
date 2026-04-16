import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useCredits } from '@/contexts/CreditContext';

export function LowCreditsBanner() {
  const { balance, isEmpty, openBuyModal } = useCredits();
  const [dismissed, setDismissed] = useState(false);
  
  const shouldShow = isEmpty || balance < 4;
  
  if (dismissed || !shouldShow) {
    return null;
  }
  
  const title = isEmpty 
    ? "You're out of credits" 
    : 'Running low on credits';
  const message = isEmpty
    ? 'Keep creating premium, brand-ready visuals for your products in minutes'
    : `Only ${balance} credits left — top up to avoid interruptions`;
  
  return (
    <div className="mb-4 bg-primary/5 text-foreground border border-primary/20 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <Sparkles className="h-5 w-5 shrink-0 text-primary" />
        <div className="min-w-0">
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-sm opacity-80 sm:hidden">{isEmpty ? 'Keep creating in minutes' : message}</p>
          <p className="text-sm opacity-80 hidden sm:block">{message}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={openBuyModal}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap"
        >
          Get Credits
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
