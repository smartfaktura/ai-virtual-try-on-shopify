import { Wallet, PlusCircle } from 'lucide-react';
import { useCredits } from '@/contexts/CreditContext';

export function CreditIndicator() {
  const { balance, isLow, isCritical, isEmpty, openBuyModal } = useCredits();
  
  const getTextClass = () => {
    if (isEmpty || isCritical) return 'text-destructive';
    if (isLow) return 'text-amber-400';
    return 'text-sidebar-foreground';
  };
  
  return (
    <div className="p-3 rounded-lg bg-white/[0.04]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-sidebar-foreground/40" />
          <div>
            <p className="text-[11px] text-sidebar-foreground/40 font-medium">Credits</p>
            <p className={`text-sm font-semibold ${getTextClass()}`}>{balance}</p>
          </div>
        </div>
        <button
          onClick={openBuyModal}
          className="p-1.5 rounded-md hover:bg-white/[0.06] transition-colors text-sidebar-foreground/40 hover:text-sidebar-foreground/70"
          title="Buy credits"
        >
          <PlusCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}