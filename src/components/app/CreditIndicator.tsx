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
    <div className="p-3 rounded-xl bg-white/[0.06]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
            <Wallet className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] text-sidebar-foreground/40 font-medium uppercase tracking-wide">Credits</p>
            <p className={`text-sm font-bold ${getTextClass()}`}>{balance}</p>
          </div>
        </div>
        <button
          onClick={openBuyModal}
          className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors text-sidebar-foreground/40 hover:text-sidebar-foreground/70"
          title="Buy credits"
        >
          <PlusCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
